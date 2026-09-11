
<script>
/* global Swal */
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
                // Kada se korisnik uloguje, povuci njegova podešavanja
                await loadUserSettings();
            }
        });
        return unsubscribe;
    });


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
    // Koristimo hash fajla ili ime prilagođeno za Firestore ključ (Firestore ne voli specijalne znakove u nazivima polja, pa ime fajla stavljamo unutar objekta)
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
        
        // Uzmi trenutno stanje iz baze da provjerimo staru poziciju
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

        // Provjeri u Firebase-u da li postoji sačuvana stranica
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
        raceActive = false;
        if (raceStats.length === 0) {
            Swal.fire('Race završen', 'Nije zabilježena nijedna završena stranica.', 'info');
            return;
        }
    }

    function pdfNext() {
        if (currentPage < totalPages) {
            recordPageIfRacing();
            renderPdfPage(currentPage + 1).then(scrollToReaderTop);
        }
    }

    function pdfPrev() {
        if (currentPage > 1) {
            if (raceActive) raceLastTime = Date.now(); 
            renderPdfPage(currentPage - 1).then(scrollToReaderTop);
        }
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

<div class="container-fluid  ">
   
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

                <div class="toolbar-group d-flex align-items-center gap-2">
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

        <div class="d-flex justify-content-center mb-2">
            <div class="btn-group">
                <button class="btn btn-outline-primary" type="button" onclick={pdfPrev} disabled={currentPage <= 1}>« Prethodna</button>
                <button class="btn btn-outline-primary" type="button" onclick={pdfNext} disabled={currentPage >= totalPages}>Sljedeća »</button>
            </div>
        </div>

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
    {/if}

    <div
        bind:this={readerContentEl}
        class="reader-content border rounded p-3 mb-3"
        style="font-size: {fontSize}px; width: {readerWidthPercent}%; margin: 0 auto;"
    >
        {#each words as word, i}
            <span
                class="word"
                class:pos-mark={posIndex === i}
                class:start-mark={startIndex === i}
                class:end-mark={endIndex === i}
                onclick={() => wordClick(i)}>{word}</span
            >{' '}
        {/each}
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
    .reader-content { font-family: 'Lexend', sans-serif; line-height: 1.6; white-space: normal; }
    .word { cursor: pointer; }
    .word:hover { background: #eee; }
    .pos-mark { background: #ffe066; border-radius: 2px; }
    .start-name { background: #a5d8ff; border-radius: 2px; }
    .end-mark { background: #b2f2bb; border-radius: 2px; }
    .info { font-size: 15px; color: #333; }
    .search-results { max-height: 250px; overflow-y: auto; }
    .search-result-item { padding: 4px 2px; cursor: pointer; border-bottom: 1px solid #eee; }
    .search-result-item:hover { background: #f0f0f0; }
</style>