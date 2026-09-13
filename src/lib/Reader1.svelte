<script>
    import { onMount } from 'svelte';
    import { auth, db } from '$lib/firebase'; // Prilagodi putanju do svog firebase.js fajla
    import { 
        signInWithPopup, 
        GoogleAuthProvider, 
        signOut, 
        onAuthStateChanged 
    } from 'firebase/auth';
    import { 
        doc, 
        getDoc, 
        setDoc 
    } from 'firebase/firestore';

    // --- Korisnik / Auth ---
    let currentUser = $state(null);

    onMount(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            currentUser = user;
            if (user) {
                await loadUserSettings();
            }
        });
        return unsubscribe;
    });

    async function loginWithGoogle() {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            Swal.fire({ title: 'Uspješan login!', icon: 'success', timer: 1000, showConfirmButton: false });
        } catch (error) {
            Swal.fire('Greška', error.message, 'error');
        }
    }

    async function logout() {
        await signOut(auth);
        currentUser = null;
        currentFileName = '';
        words = [];
        Swal.fire({ title: 'Odjavljeni ste', icon: 'info', timer: 1000, showConfirmButton: false });
    }

    // --- Firebase sinhronizacija podešavanja i pozicija ---
    async function saveSettingToFirebase(key, value) {
        if (!currentUser) return;
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await setDoc(userRef, { [key]: value }, { merge: true });
        } catch (e) {
            console.error('Greška pri čuvanju u Firestore:', e);
        }
    }

    async function loadUserSettings() {
        if (!currentUser) return;
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const snap = await getDoc(userRef);
            if (snap.exists()) {
                const data = snap.data();
                if (data.reader_font) fontSize = data.reader_font;
                if (data.reader_sirina) readerWidthPercent = data.reader_sirina;
                if (data.pace_wpm) paceWpm = data.pace_wpm;
                if (data.margin_left !== undefined) marginLeftPercent = data.margin_left;
                if (data.margin_right !== undefined) marginRightPercent = data.margin_right;
                if (data.margin_lines_enabled !== undefined) marginLinesEnabled = data.margin_lines_enabled;
            }
        } catch (e) {
            console.error('Greška pri učitavanju iz Firestore:', e);
        }
    }

    // --- Font / zoom ---
    let fontSize = $state(25);
    const FONT_MIN = 12;
    const FONT_MAX = 60;

    function clearTa() {
        pastedText = '';
    }

    let raceAverageWpm = $derived.by(() => {
        if (raceStats.length === 0) return 0;
        const totalWords = raceStats.reduce((s, x) => s + x.words, 0);
        const totalSeconds = raceStats.reduce((s, x) => s + x.seconds, 0);
        const totalMinutes = totalSeconds / 60;
        return totalMinutes > 0 ? Math.floor(totalWords / totalMinutes) : 0;
    });

    function changeFont(delta) {
        fontSize = Math.min(FONT_MAX, Math.max(FONT_MIN, fontSize + delta));
        saveSettingToFirebase('reader_font', fontSize);
    }
    function resetFont() {
        fontSize = 25;
        saveSettingToFirebase('reader_font', fontSize);
    }

    // --- Sirina reader-content diva ---
    let readerWidthPercent = $state(100);
    const WIDTH_MIN = 30;
    const WIDTH_MAX = 100;
    const WIDTH_STEP = 10;

    function changeWidth(delta) {
        readerWidthPercent = Math.min(WIDTH_MAX, Math.max(WIDTH_MIN, readerWidthPercent + delta));
        saveSettingToFirebase('reader_sirina', readerWidthPercent);
    }

    // --- Vodilice (margine) - tanke uspravne linije, grubo pomjerljive ---
    let marginLinesEnabled = $state(false);
    let marginLeftPercent = $state(10);
    let marginRightPercent = $state(10);
    const MARGIN_MIN = 0;
    const MARGIN_MAX = 40;
    const MARGIN_STEP = 2;

    function toggleMarginLines() {
        marginLinesEnabled = !marginLinesEnabled;
        saveSettingToFirebase('margin_lines_enabled', marginLinesEnabled);
    }

    function changeMarginLeft(delta) {
        marginLeftPercent = Math.min(MARGIN_MAX, Math.max(MARGIN_MIN, marginLeftPercent + delta));
        saveSettingToFirebase('margin_left', marginLeftPercent);
    }

    function changeMarginRight(delta) {
        marginRightPercent = Math.min(MARGIN_MAX, Math.max(MARGIN_MIN, marginRightPercent + delta));
        saveSettingToFirebase('margin_right', marginRightPercent);
    }

    // --- Tekst / rijeci (trenutna PDF stranica) ---
    let words = $state([]);

    function splitToWords(text) {
        const trimmed = text.trim();
        if (trimmed.length === 0) return [];
        return trimmed.split(/\s+/);
    }

    // --- Fajl info ---
    let currentFileName = $state('');
    let pdfDoc = null; 
    let currentPage = $state(1);
    let totalPages = $state(1);

    // --- Markeri i pozicija ---
    let posIndex = $state(null); 
    let startIndex = $state(null); 
    let endIndex = $state(null); 

    let markerWordCount = $derived(
        startIndex !== null && endIndex !== null ? Math.abs(endIndex - startIndex) + 1 : 0
    );

    function wordClick(idx) {
        posIndex = idx;
    }

    function setMarkerStart() {
        if (posIndex === null) {
            Swal.fire('Info', 'Prvo klikni na rijec da postavis pocetnu tacku.', 'info');
            return;
        }
        startIndex = posIndex;
    }

    function setMarkerEnd() {
        if (posIndex === null) {
            Swal.fire('Info', 'Prvo klikni na rijec da postavis krajnju tacku.', 'info');
            return;
        }
        if (startIndex === null) {
            Swal.fire('Info', 'Prvo postavi Marker Pocetak.', 'info');
            return;
        }
        endIndex = posIndex;
    }

    function clearMarkers() {
        startIndex = null;
        endIndex = null;
    }

    // --- Firebase pozicija (broj stranice po fajlu) ---
    function sanitizeKey(name) {
        return name.replace(/[.#$[\]]/g, '_');
    }

    let previousPositionLabel = $state('');

    async function savePosition() {
        if (!currentUser || !currentFileName) {
            Swal.fire('Greška', 'Morate biti prijavljeni i učitati PDF fajl.', 'warning');
            return;
        }

        const safeKey = sanitizeKey(currentFileName);
        const userRef = doc(db, 'users', currentUser.uid);

        const snap = await getDoc(userRef);
        const data = snap.exists() ? snap.data() : {};
        const existingPages = data.pdf_stranice || {};
        const existing = existingPages[safeKey] || null;

        const existingText =
            existing === null
                ? 'Nema prethodno sačuvane pozicije.'
                : 'Prethodno sačuvana stranica: ' + existing;

        const result = await Swal.fire({
            title: 'Sačuvati poziciju?',
            text: existingText + ' Da li sigurno želiš sačuvati novu poziciju?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Da, sačuvaj',
            cancelButtonText: 'Otkaži'
        });

        if (result.isConfirmed) {
            if (existing !== null) {
                previousPositionLabel = 'Prethodna pozicija: stranica ' + existing;
            }

            existingPages[safeKey] = currentPage;
            await setDoc(userRef, { pdf_stranice: existingPages }, { merge: true });

            Swal.fire({
                title: 'Sačuvano u Firebase!',
                icon: 'success',
                timer: 1200,
                showConfirmButton: false
            });
        }
    }

    async function goToSavedPosition() {
        if (!currentUser || !currentFileName) {
            Swal.fire('Greška', 'Morate biti prijavljeni i učitati PDF fajl.', 'warning');
            return;
        }

        const safeKey = sanitizeKey(currentFileName);
        const userRef = doc(db, 'users', currentUser.uid);
        const snap = await getDoc(userRef);

        if (!snap.exists() || !snap.data().pdf_stranice || !snap.data().pdf_stranice[safeKey]) {
            Swal.fire('Info', 'Nema sačuvane pozicije za ovaj fajl.', 'info');
            return;
        }

        const saved = snap.data().pdf_stranice[safeKey];
        await renderPdfPage(parseInt(saved, 10));
    }

    // --- Učitavanje .pdf ---
    let pdfjsLib = null;

    async function ensurePdfJs() {
        if (pdfjsLib) return pdfjsLib;
        pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/build/pdf.worker.mjs',
            import.meta.url
        ).toString();
        return pdfjsLib;
    }

    let pagesWordsCache = [];
    let searchReady = $state(false);
    let preparingSearch = $state(false);

    async function loadPdfFile(file) {
        const lib = await ensurePdfJs();
        const arrayBuffer = await file.arrayBuffer();
        pdfDoc = await lib.getDocument({ data: arrayBuffer }).promise;
        totalPages = pdfDoc.numPages;
        currentFileName = file.name;
        currentPage = 1;
        posIndex = null;
        startIndex = null;
        endIndex = null;
        pagesWordsCache = [];
        searchReady = false;
        searchResults = [];
        searchQuery = '';
        raceActive = false;
        raceStats = [];
        stopPacer();
        isPaused = false;

        if (currentUser) {
            const safeKey = sanitizeKey(currentFileName);
            const userRef = doc(db, 'users', currentUser.uid);
            const snap = await getDoc(userRef);
            if (snap.exists() && snap.data().pdf_stranice && snap.data().pdf_stranice[safeKey]) {
                const saved = snap.data().pdf_stranice[safeKey];
                infoMessage = 'Nađena sačuvana stranica (' + saved + "). Klikni 'Idi na sačuvanu poziciju'.";
            } else {
                infoMessage = '';
            }
        }

        await renderPdfPage(currentPage);

        preparingSearch = true;
        extractAllPages().then(() => {
            preparingSearch = false;
            searchReady = true;
        });
    }

    async function extractAllPages() {
        for (let p = 1; p <= totalPages; p++) {
            if (pagesWordsCache[p - 1]) continue;
            const page = await pdfDoc.getPage(p);
            const textContent = await page.getTextContent();
            const rawText = textContent.items.map((item) => item.str).join(' ');
            const cleaned = rawText.replace(/\s+/g, ' ').trim();
            pagesWordsCache[p - 1] = splitToWords(cleaned);
        }
    }

    async function renderPdfPage(pageNum) {
        if (!pdfDoc) return;
        if (pageNum < 1) pageNum = 1;
        if (pageNum > totalPages) pageNum = totalPages;
        currentPage = pageNum;

        if (pagesWordsCache[pageNum - 1]) {
            words = pagesWordsCache[pageNum - 1];
        } else {
            const page = await pdfDoc.getPage(pageNum);
            const textContent = await page.getTextContent();
            const rawText = textContent.items.map((item) => item.str).join(' ');
            const cleaned = rawText.replace(/\s+/g, ' ').trim();
            words = splitToWords(cleaned);
            pagesWordsCache[pageNum - 1] = words;
        }
        posIndex = null;
        startIndex = null;
        endIndex = null;
    }

    // --- Race ---
    let raceActive = $state(false);
    let raceStats = $state([]);
    let raceLastTime = 0;

    function startRace() {
        if (!currentFileName) {
            Swal.fire('Info', 'Prvo učitaj PDF fajl.', 'info');
            return;
        }
        raceActive = true;
        raceStats = [];
        raceLastTime = Date.now();
        isPaused = false;
    }

    function recordPageIfRacing() {
        if (!raceActive) return;
        const now = Date.now();
        const seconds = (now - raceLastTime) / 1000;
        const wordsOnPage = words.length;
        const minutes = seconds / 60;
        const wpm = minutes > 0 ? Math.round(wordsOnPage / minutes) : 0;
        raceStats = [...raceStats, { page: currentPage, words: wordsOnPage, seconds, wpm }];
        raceLastTime = now;
    }

    function stopRace() {
        // Ako PDF ima samo jednu stranicu, nema "Sljedeca" koja bi zabiljezila
        // citanje - zato Stop Race ovdje racuna tu jedinu stranicu kao zavrsenu.
        if (raceActive && totalPages === 1 && raceStats.length === 0) {
            recordPageIfRacing();
        }
        raceActive = false;
        isPaused = false;
        if (raceStats.length === 0) {
            Swal.fire('Race završen', 'Nije zabilježena nijedna završena stranica.', 'info');
            return;
        }
    }

    // --- Pacer - highlight koji se sam pomjera zadatim tempom (WPM), u grupama rijeci ---
    let paceWpm = $state(300);
    let paceChunkSize = $state(3); // koliko rijeci se highlight-uje odjednom
    let paceActive = $state(false); // pacer ukljucen za trenutnu sesiju
    let paceIndex = $state(0);
    let paceIntervalId = null;

    function paceChunk() {
        return Math.max(1, Number(paceChunkSize) || 1);
    }

    function paceIntervalMs() {
        const wpm = Math.max(50, Number(paceWpm) || 300);
        return (60000 / wpm) * paceChunk();
    }

    function paceTotalChunks() {
        return Math.ceil(words.length / paceChunk());
    }

    function paceChunkRange(idx) {
        const chunk = paceChunk();
        const start = idx * chunk;
        const end = Math.min(words.length, start + chunk);
        return [start, end];
    }

    function isInPaceChunk(i) {
        if (!paceActive) return false;
        const [s, e] = paceChunkRange(paceIndex);
        return i >= s && i < e;
    }

    function scrollPaceIntoViewIfNeeded() {
        if (typeof document === 'undefined') return;
        const el = document.querySelector('.pace-mark');
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const viewH = window.innerHeight || document.documentElement.clientHeight;
        if (rect.top < 0 || rect.bottom > viewH) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    $effect(() => {
        paceIndex; // prati promjenu
        if (paceActive) {
            scrollPaceIntoViewIfNeeded();
        }
    });

    function paceTick() {
        paceIndex = paceIndex + 1;
        if (paceIndex >= paceTotalChunks()) {
            if (paceIntervalId !== null) {
                clearInterval(paceIntervalId);
                paceIntervalId = null;
            }
        }
    }

    function startPaceIntervalInternal() {
        if (paceIntervalId !== null) {
            clearInterval(paceIntervalId);
            paceIntervalId = null;
        }
        paceIntervalId = setInterval(paceTick, paceIntervalMs());
    }

    function startPacer() {
        if (!currentFileName) {
            Swal.fire('Info', 'Prvo učitaj PDF fajl.', 'info');
            return;
        }
        saveSettingToFirebase('pace_wpm', paceWpm);
        paceActive = true;
        paceIndex = 0;
        isPaused = false;
        startPaceIntervalInternal();
    }

    function stopPacer() {
        if (paceIntervalId !== null) {
            clearInterval(paceIntervalId);
            paceIntervalId = null;
        }
        paceActive = false;
        paceIndex = 0;
    }

    // --- Jedinstvena Pauza/Nastavi za Race I Pacer zajedno ---
    let isPaused = $state(false);
    let racePausedAt = 0;

    function pauseSession() {
        if (isPaused) return;
        if (!raceActive && !paceActive) return;
        isPaused = true;
        if (raceActive) {
            racePausedAt = Date.now();
        }
        if (paceActive && paceIntervalId !== null) {
            clearInterval(paceIntervalId);
            paceIntervalId = null;
        }
    }

    function resumeSession() {
        if (!isPaused) return;
        isPaused = false;
        if (raceActive) {
            const pausedMs = Date.now() - racePausedAt;
            raceLastTime += pausedMs;
        }
        if (paceActive && paceIndex < paceTotalChunks()) {
            startPaceIntervalInternal();
        }
    }

    function pdfNext() {
        if (currentPage < totalPages) {
            if (isPaused) {
                Swal.fire('Info', 'Klikni "Nastavi" prije prelaska na sljedeću stranicu.', 'info');
                return;
            }
            recordPageIfRacing();
            renderPdfPage(currentPage + 1).then(() => {
                scrollToReaderTop();
                if (paceActive) {
                    paceIndex = 0;
                    startPaceIntervalInternal();
                }
            });
        }
    }

    function pdfPrev() {
        if (currentPage > 1) {
            if (raceActive) raceLastTime = Date.now();
            renderPdfPage(currentPage - 1).then(() => {
                scrollToReaderTop();
                if (paceActive) {
                    paceIndex = 0;
                    startPaceIntervalInternal();
                }
            });
        }
    }

    // --- Idi direktno na stranicu ---
    let goToPageInput = $state(1);

    function goToPage() {
        let target = parseInt(goToPageInput, 10);
        if (isNaN(target)) {
            Swal.fire('Info', 'Unesi ispravan broj stranice.', 'info');
            return;
        }
        if (target < 1) target = 1;
        if (target > totalPages) target = totalPages;

        if (isPaused) {
            Swal.fire('Info', 'Klikni "Nastavi" prije skoka na drugu stranicu.', 'info');
            return;
        }
        if (raceActive) raceLastTime = Date.now(); // skok se ne racuna kao zavrsena stranica

        renderPdfPage(target).then(() => {
            scrollToReaderTop();
            if (paceActive) {
                paceIndex = 0;
                startPaceIntervalInternal();
            }
        });
    }

    let readerContentEl;
    function scrollToReaderTop() {
        if (readerContentEl) {
            readerContentEl.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
    }

    // --- Pretraga ---
    let searchQuery = $state('');
    let searchResults = $state([]);

    function runSearch() {
        const q = searchQuery.trim().toLowerCase();
        if (!q) {
            searchResults = [];
            return;
        }
        const results = [];
        for (let p = 0; p < pagesWordsCache.length; p++) {
            const pw = pagesWordsCache[p];
            if (!pw) continue;
            for (let i = 0; i < pw.length; i++) {
                if (pw[i].toLowerCase().includes(q)) {
                    const start = Math.max(0, i - 4);
                    const end = Math.min(pw.length, i + 5);
                    const context = pw.slice(start, end).join(' ');
                    results.push({ page: p + 1, wordIndex: i, context });
                    if (results.length >= 200) break;
                }
            }
            if (results.length >= 200) break;
        }
        searchResults = results;
    }

    async function goToResult(r) {
        await renderPdfPage(r.page);
        posIndex = r.wordIndex;
    }

    let infoMessage = $state('');

    function onFileSelected(event) {
        const file = event.target.files[0];
        if (!file) return;

        const lower = file.name.toLowerCase();
        if (!lower.endsWith('.pdf')) {
            Swal.fire({
                title: 'Nepodržan format',
                text: 'Ova aplikacija trenutno podržava samo PDF fajlove.',
                icon: 'warning'
            });
            event.target.value = '';
            return;
        }
        loadPdfFile(file);
    }

    let wordCountLabel = $derived('Riječi na stranici: ' + words.length);

    let pastedText = $state('');
    let pastedWordCount = $derived(splitToWords(pastedText).length);
    let selectedWordCount = $state(0);

    // --- Start/Stop mjerenje WPM za zalijepljeni tekst ---
    let taRaceActive = $state(false);
    let taStartTime = 0;

    function startTaRace() {
        if (!pastedText.trim()) {
            Swal.fire('Info', 'Nema teksta za mjerenje.', 'info');
            return;
        }
        taRaceActive = true;
        taStartTime = Date.now();
    }

    function stopTaRace() {
        if (!taRaceActive) return;
        const seconds = (Date.now() - taStartTime) / 1000;
        const minutes = seconds / 60;
        const wpm = minutes > 0 ? Math.round(pastedWordCount / minutes) : 0;
        taRaceActive = false;
        Swal.fire({
            title: 'Rezultat',
            html:
                'Riječi: ' +
                pastedWordCount +
                '<br>Vrijeme: ' +
                seconds.toFixed(1) +
                's<br><b>WPM: ' +
                wpm +
                '</b>',
            icon: 'success'
        });
    }

    // --- Vracanje na paste-text prikaz bez refresh-a stranice ---
    function closePdf() {
        currentFileName = '';
        words = [];
        pdfDoc = null;
        currentPage = 1;
        totalPages = 1;
        pagesWordsCache = [];
        searchReady = false;
        searchResults = [];
        searchQuery = '';
        raceActive = false;
        raceStats = [];
        stopPacer();
        isPaused = false;
        infoMessage = '';
    }

    function onPastedSelect(event) {
        const ta = event.target;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        if (end > start) {
            const selected = ta.value.substring(start, end);
            selectedWordCount = splitToWords(selected).length;
        } else {
            selectedWordCount = 0;
        }
    }
</script>

<div class="container ">

    <!-- 1. TOOLBAR -->
    <div class="card mb-3">
        <div class="card-body py-2">
            <div class="d-flex flex-wrap align-items-center gap-4">
                <div class="toolbar-group">
                    <input
                        type="file"
                        accept=".pdf,application/pdf"
                        class="form-control form-control-sm"
                        onchange={onFileSelected}
                    />
                </div>

                <div class="toolbar-group d-flex align-items-center gap-2 r">
                    <span class="fw-bold small">Font</span>
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-secondary" type="button" onclick={() => changeFont(-1)}>A-</button>
                        <span class="btn btn-light disabled">{fontSize}</span>
                        <button class="btn btn-outline-secondary" type="button" onclick={() => changeFont(1)}>A+</button>
                        <button class="btn btn-outline-secondary" type="button" onclick={resetFont}>Reset</button>
                    </div>
                </div>

                <div class="toolbar-group d-flex align-items-center gap-2">
                    <span class="fw-bold small">Širina</span>
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-info" type="button" onclick={() => changeWidth(-WIDTH_STEP)}>−</button>
                        <span class="btn btn-light disabled">{readerWidthPercent}%</span>
                        <button class="btn btn-outline-info" type="button" onclick={() => changeWidth(WIDTH_STEP)}>+</button>
                    </div>
                </div>

                <div class="toolbar-group d-flex align-items-center gap-2">
                    <div class="form-check form-switch mb-0">
                        <input
                            class="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="marginLinesToggle"
                            checked={marginLinesEnabled}
                            onchange={toggleMarginLines}
                        />
                        <label class="form-check-label small" for="marginLinesToggle">Margine</label>
                    </div>
                </div>

                <div class="toolbar-group d-flex align-items-center gap-2">
                    <span class="fw-bold small">Margina L</span>
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-secondary" type="button" onclick={() => changeMarginLeft(-MARGIN_STEP)}>−</button>
                        <span class="btn btn-light disabled">{marginLeftPercent}%</span>
                        <button class="btn btn-outline-secondary" type="button" onclick={() => changeMarginLeft(MARGIN_STEP)}>+</button>
                    </div>
                </div>

                <div class="toolbar-group d-flex align-items-center gap-2">
                    <span class="fw-bold small">Margina D</span>
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-secondary" type="button" onclick={() => changeMarginRight(-MARGIN_STEP)}>−</button>
                        <span class="btn btn-light disabled">{marginRightPercent}%</span>
                        <button class="btn btn-outline-secondary" type="button" onclick={() => changeMarginRight(MARGIN_STEP)}>+</button>
                    </div>
                </div>

                {#if currentFileName}
                    <div class="toolbar-group">
                        <button class="btn btn-outline-dark btn-sm" type="button" onclick={closePdf}
                            >✕ Zatvori PDF (novi tekst)</button
                        >
                    </div>
                {/if}
            </div>
        </div>
    </div>

    {#if infoMessage}
        <div class="alert alert-info py-1 px-2">{infoMessage}</div>
    {/if}
    {#if preparingSearch}
        <div class="alert alert-secondary py-1 px-2">Priprema teksta za pretragu...</div>
    {/if}

    {#if !currentFileName}
        <div class="card mb-3">
            <div class="card-body py-2">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="fw-bold small">Zalijepi tekst (brojanje riječi)</span>
                    <span class="info">Riječi: {pastedWordCount} &nbsp;|&nbsp; Selektovano riječi: {selectedWordCount}</span>
                </div>
                <textarea
                    class="form-control"
                    rows="4"
                    placeholder="Zalijepi tekst ovdje..."
                    bind:value={pastedText}
                    onselect={onPastedSelect}
                    onmouseup={onPastedSelect}
                    onkeyup={onPastedSelect}></textarea>
                <div class="d-flex gap-2 mt-2">
                    {#if !taRaceActive}
                        <button class="btn btn-warning btn-sm" type="button" onclick={startTaRace}
                            >🏁 Start</button
                        >
                    {:else}
                        <button class="btn btn-danger btn-sm" type="button" onclick={stopTaRace}
                            >⏹ Stop</button
                        >
                    {/if}
                </div>
            </div>
            <button onclick={clearTa} style="width: 7rem;" class="btn btn-danger ms-auto mb-2 me-2">Clear</button>
        </div>
    {/if}

    {#if currentFileName}
        <div class="card mb-3">
            <div class="card-body py-2">
                <div class="d-flex flex-wrap align-items-center gap-3 mb-2">
                    <span class="info">{wordCountLabel}</span>
                    <span class="info">Stranica: {currentPage} / {totalPages}</span>
                </div>

                <div class="input-group input-group-sm">
                    <input
                        type="text"
                        class="form-control"
                        placeholder="Pretraži cijeli dokument..."
                        bind:value={searchQuery}
                        onkeydown={(e) => e.key === 'Enter' && runSearch()}
                    />
                    <button class="btn btn-primary" type="button" onclick={runSearch} disabled={!searchReady}>Pretraga</button>
                </div>
                {#if !searchReady && !preparingSearch}
                    <div class="info mt-1">Pretraga još nije spremna.</div>
                {/if}

                {#if searchResults.length > 0}
                    <div class="search-results border rounded p-2 mt-2">
                        <div class="info mb-1">Rezultata: {searchResults.length}</div>
                        {#each searchResults as r}
                            <div class="search-result-item" onclick={() => goToResult(r)}>
                                <span class="badge bg-secondary me-2">str. {r.page}</span>{r.context}
                            </div>
                        {/each}
                    </div>
                {:else if searchQuery.trim().length > 0}
                    <div class="info mt-2">Nema rezultata.</div>
                {/if}
            </div>
        </div>

        <div class="d-flex justify-content-center align-items-center gap-2 mb-2 flex-wrap">
            <div class="btn-group">
                <button class="btn btn-outline-primary" type="button" onclick={pdfPrev} disabled={currentPage <= 1}>« Prethodna</button>
                <button class="btn btn-outline-primary" type="button" onclick={pdfNext} disabled={currentPage >= totalPages}>Sljedeća »</button>
            </div>
            <div class="input-group input-group-sm" style="width: auto;">
                <span class="input-group-text">Idi na str.</span>
                <input
                    type="number"
                    min="1"
                    max={totalPages}
                    class="form-control"
                    style="width: 70px;"
                    bind:value={goToPageInput}
                    onkeydown={(e) => e.key === 'Enter' && goToPage()}
                />
                <button class="btn btn-info" type="button" onclick={goToPage}>Idi</button>
            </div>
        </div>

        <!-- JEDINSTVENA PAUZA/NASTAVI - pauzira i Race i Pacer zajedno -->
        {#if raceActive || paceActive}
            <div class="d-flex justify-content-center mb-2">
                {#if isPaused}
                    <button class="btn btn-success btn-sm" type="button" onclick={resumeSession}>▶ Nastavi</button>
                {:else}
                    <button class="btn btn-outline-secondary btn-sm" type="button" onclick={pauseSession}>⏸ Pauza</button>
                {/if}
            </div>
        {/if}

        <!-- RACE -->
        <div class="card mb-3">
            <div class="card-body py-2 text-center">
                {#if !raceActive}
                    <button class="btn btn-warning btn-sm" type="button" onclick={startRace}>🏁 Start Race</button>
                {:else}
                    <button class="btn btn-danger btn-sm" type="button" onclick={stopRace}>⏹ Stop Race</button>
                {/if}

                {#if raceStats.length > 0}
                    <div class="race-stats mt-2">
                        {#each raceStats as s}
                            <div class="info">
                                Str. {s.page}: <strong>{s.wpm} wpm</strong> ({s.words} riječi, {s.seconds.toFixed(1)} s)
                            </div>
                        {/each}
                        {#if !raceActive}
                            <hr class="my-1" />
                            <div class="info text-info fw-bold">
                                Prosjek:<strong class="text-danger"> {raceAverageWpm}</strong>
                            </div>
                        {/if}
                    </div>
                {/if}
            </div>
        </div>

        <!-- PACER -->
        <div class="card mb-3">
            <div class="card-body py-2 text-center">
                {#if !paceActive}
                    <div class="d-flex justify-content-center align-items-center gap-2 flex-wrap">
                        <div class="input-group input-group-sm" style="width: auto;">
                            <span class="input-group-text">WPM</span>
                            <input
                                type="number"
                                min="50"
                                step="10"
                                class="form-control"
                                style="width: 70px;"
                                bind:value={paceWpm}
                            />
                        </div>
                        <div class="input-group input-group-sm" style="width: auto;">
                            <span class="input-group-text">Grupa riječi</span>
                            <select class="form-select" style="width: 65px;" bind:value={paceChunkSize}>
                                {#each Array.from({ length: 10 }, (_, k) => k + 1) as n}
                                    <option value={n}>{n}</option>
                                {/each}
                            </select>
                        </div>
                        <button class="btn btn-primary btn-sm" type="button" onclick={startPacer}>🎯 Start Pacer</button>
                    </div>
                {:else}
                    <div class="d-flex justify-content-center align-items-center gap-2 flex-wrap">
                        <button class="btn btn-danger btn-sm" type="button" onclick={stopPacer}>⏹ Stop Pacer</button>
                        <span class="info">Tempo: {paceWpm} wpm, grupa: {paceChunkSize}</span>
                    </div>
                {/if}
            </div>
        </div>
    {/if}

    <div class="reader-content-wrap" style="width: {readerWidthPercent}%; margin: 0 auto;">
        {#if marginLinesEnabled}
            <div class="margin-line" style="left: {marginLeftPercent}%;"></div>
            <div class="margin-line" style="right: {marginRightPercent}%;"></div>
        {/if}
        <div
            bind:this={readerContentEl}
            class="reader-content border rounded p-3 mb-3"
            style="font-size: {fontSize}px;"
        >
            {#each words as word, i}
                <span
                    class="word"
                    class:pos-mark={posIndex === i}
                    class:start-mark={startIndex === i}
                    class:end-mark={endIndex === i}
                    class:pace-mark={isInPaceChunk(i)}
                    onclick={() => wordClick(i)}>{word}</span
                >{' '}
            {/each}
        </div>
    </div>

    {#if currentFileName}
        <div class="d-flex justify-content-center mb-3">
            <div class="btn-group">
                <button class="btn btn-outline-primary" type="button" onclick={pdfPrev} disabled={currentPage <= 1}>« Prethodna</button>
                <button class="btn btn-outline-primary" type="button" onclick={pdfNext} disabled={currentPage >= totalPages}>Sljedeća »</button>
            </div>
        </div>
    {/if}

    {#if currentFileName}
        <div class="card mb-3">
            <div class="card-body py-2">
                <div class="d-flex flex-wrap justify-content-center align-items-center gap-2">
                    <button class="btn btn-secondary btn-sm" type="button" onclick={savePosition}>Sačuvaj poziciju</button>
                    <button class="btn btn-secondary btn-sm" type="button" onclick={goToSavedPosition}>Idi na sačuvanu poziciju</button>
                    {#if previousPositionLabel}
                        <span class="info ms-2">{previousPositionLabel}</span>
                    {/if}
                </div>
            </div>
        </div>

        <div class="card-body py-2">
            <div class="card mb-3">
                <div class="card-body py-2">
                    <div class="d-flex flex-wrap justify-content-center align-items-center gap-2">
                        <button class="btn btn-outline-success btn-sm" type="button" onclick={setMarkerStart}>Marker Početak</button>
                        <button class="btn btn-outline-danger btn-sm" type="button" onclick={setMarkerEnd}>Marker Kraj</button>
                        <button class="btn btn-outline-secondary btn-sm" type="button" onclick={clearMarkers}>Obriši markere</button>
                        {#if markerWordCount > 0}
                            <span class="info ms-2">Pročitano: {markerWordCount} riječi</span>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .reader-page { max-width: 1100px; }
    .reader-content-wrap {
        position: relative;
    }
    .margin-line {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 2px;
        background: #6068e0d5;
        opacity: 0.6;
        pointer-events: none;
        z-index: 2;
    }
    .reader-content { font-family: 'Lexend', sans-serif; line-height: 1.6; white-space: normal; }
    .word { cursor: pointer; }
    .word:hover { background: #eee; }
    .pos-mark { background: #ffe066; border-radius: 2px; }
    .start-mark { background: #a5d8ff; border-radius: 2px; }
    .end-mark { background: #b2f2bb; border-radius: 2px; }
    .pace-mark { background: var(--pace-mark-color, #ffa8a8); border-radius: 2px; }
    .info { font-size: 15px; color: #333; }
    .search-results { max-height: 250px; overflow-y: auto; }
    .search-result-item { padding: 4px 2px; cursor: pointer; border-bottom: 1px solid #eee; }
    .search-result-item:hover { background: #f0f0f0; }
</style>