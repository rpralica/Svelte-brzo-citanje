<script>
	/* global Swal*/
	import { onMount } from 'svelte';
	import JSZip from 'jszip';
	import { podesavanja, setPaceChunkSize } from '$lib/functionsHelper/settings.svelte.js';
	import { localStore } from '$lib/functionsHelper/myFunctions.svelte';
	//Podešavanje

	let marginClipEnabled = $state(false);
	// let paceAutoNext = $state(true);
	let paceAutoNextTimeoutId = null;
	let pastedText = $state('');
	let paceAutoNext = localStore('paceAutoNext', true);
	//WPM
	let paceWpm = localStore('paceWpm', 300);
	// --- Generalni localStorage helperi (zamjena za Firebase) ---
	function saveSetting(key, value) {
		if (typeof localStorage === 'undefined') return;
		try {
			localStorage.setItem(key, JSON.stringify(value));
		} catch (e) {
			console.error('Greška pri čuvanju u localStorage:', e);
		}
	}

	function toggleBold() {
		podesavanja.bold = !podesavanja.bold;
		// sacuvaj(); // Ako automatski snimaš u store-u
	}

	function loadSetting(key) {
		if (typeof localStorage === 'undefined') return undefined;
		try {
			const raw = localStorage.getItem(key);
			return raw !== null ? JSON.parse(raw) : undefined;
		} catch (e) {
			return undefined;
		}
	}



	onMount(() => {
		// Slušalica za automatsko čuvanje pozicije pri izlasku iz taba / pretraživača
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'hidden') {
				savePositionQuietly();
			}
		};

		// Esc = pauza/nastavi (toggle) za Race i Pacer
		function handleGlobalKeydown(e) {
			if (e.key === 'Escape') {
				if (isPaused) {
					resumeSession();
				} else if (paceActive || raceActive) {
					pauseSession();
				}
			}
		}

		window.addEventListener('visibilitychange', handleVisibilityChange);
		window.addEventListener('beforeunload', savePositionQuietly);
		window.addEventListener('keydown', handleGlobalKeydown);

		return () => {
			window.removeEventListener('visibilitychange', handleVisibilityChange);
			window.removeEventListener('beforeunload', savePositionQuietly);
			window.removeEventListener('keydown', handleGlobalKeydown);
		};
	});

	// --- Font / zoom ---

	let raceAverageWpm = $derived.by(() => {
		if (raceStats.length === 0) return 0;
		const totalWords = raceStats.reduce((s, x) => s + x.words, 0);
		const totalSeconds = raceStats.reduce((s, x) => s + x.seconds, 0);
		const totalMinutes = totalSeconds / 60;
		return totalMinutes > 0 ? Math.floor(totalWords / totalMinutes) : 0;
	});

	// --- Vodilice (margine) ---
	let marginLinesEnabled = $state(false);

	function toggleMarginClip() {
		marginClipEnabled = !marginClipEnabled;
		saveSetting('margin_clip_enabled', marginClipEnabled);
	}

	function toggleMarginLines() {
		marginLinesEnabled = !marginLinesEnabled;
		saveSetting('margin_lines_enabled', marginLinesEnabled);
	}

	// --- Tekst / rijeci (trenutna stranica) ---
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

	// --- Ukupan broj rijeci u cijelom dokumentu ---
	let totalWordsInDoc = $state(0);

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

	// --- Pozicija po fajlu (localStorage, jedan JSON objekat) ---
	function sanitizeKey(name) {
		return name.replace(/[.#$[\]]/g, '_');
	}

	function getSavedPositions() {
		return loadSetting('pdf_stranice') || {};
	}

	let previousPositionLabel = $state('');

	// Tiho čuvanje pozicije u pozadini (za auto-save pri izlasku)
	function savePositionQuietly() {
		if (!currentFileName) return;
		const safeKey = sanitizeKey(currentFileName);
		const positions = getSavedPositions();
		positions[safeKey] = currentPage;
		saveSetting('pdf_stranice', positions);
	}

	async function savePosition() {
		if (!currentFileName) {
			Swal.fire('Greška', 'Prvo učitaj fajl.', 'warning');
			return;
		}

		const safeKey = sanitizeKey(currentFileName);
		const positions = getSavedPositions();
		const existing = positions[safeKey] !== undefined ? positions[safeKey] : null;

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

			positions[safeKey] = currentPage;
			saveSetting('pdf_stranice', positions);

			Swal.fire({
				title: 'Sačuvano!',
				icon: 'success',
				timer: 1200,
				showConfirmButton: false
			});
		}
	}

	async function goToSavedPosition() {
		if (!currentFileName) {
			Swal.fire('Greška', 'Prvo učitaj fajl.', 'warning');
			return;
		}

		const safeKey = sanitizeKey(currentFileName);
		const positions = getSavedPositions();

		if (positions[safeKey] === undefined) {
			Swal.fire('Info', 'Nema sačuvane pozicije za ovaj fajl.', 'info');
			return;
		}

		await renderPdfPage(parseInt(positions[safeKey], 10));
		infoMessage = '';
	}

	// --- Reset stanja pri učitavanju novog fajla (zajedničko za PDF, EPUB i TXT) ---
	function resetDocumentState() {
		currentPage = 1;
		posIndex = null;
		startIndex = null;
		endIndex = null;
		pagesWordsCache = [];
		searchReady = false;
		searchResults = [];
		searchQuery = '';
		totalWordsInDoc = 0;
		raceActive = false;
		raceStats = [];
		raceCheckpoints = [];
		stopPacer();
		isPaused = false;
	}

	// --- Učitavanje .pdf ---
	// --- Učitavanje .pdf sa robusnom greškom ---
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
		try {
			const lib = await ensurePdfJs();
			const arrayBuffer = await file.arrayBuffer();
			pdfDoc = await lib.getDocument({ data: arrayBuffer }).promise;
			totalPages = pdfDoc.numPages;
			currentFileName = file.name;
			resetDocumentState();

			let targetPage = 1;
			const safeKey = sanitizeKey(currentFileName);
			const positions = getSavedPositions();
			if (positions[safeKey] !== undefined) {
				targetPage = parseInt(positions[safeKey], 10);
			}

			await renderPdfPage(targetPage);

			preparingSearch = true;
			extractAllPages()
				.then(() => {
					preparingSearch = false;
					searchReady = true;
					totalWordsInDoc = pagesWordsCache.reduce((sum, arr) => sum + (arr ? arr.length : 0), 0);
				})
				.catch((err) => {
					preparingSearch = false;
					console.error('Greška pri pozadinskoj ekstrakciji stranica:', err);
				});
		} catch (e) {
			console.error('Greška pri učitavanju PDF-a:', e);
			Swal.fire(
				'Greška',
				'Neuspješno učitavanje PDF fajla. Fajl je možda oštećen ili neispravnog formata.',
				'error'
			);
			closePdf();
		}
	}

	// --- Učitavanje .epub i .txt ---
	// Oba formata se sijeku na stranice od po 300 riječi. PDF ostaje onako kako idu njegove stranice.
	const WORDS_PER_PAGE = 300;

	// Tekst -> niz stranica, gdje je svaka stranica niz riječi
	function splitIntoPages(text) {
		const allWords = splitToWords(text);
		const pages = [];
		for (let i = 0; i < allWords.length; i += WORDS_PER_PAGE) {
			pages.push(allWords.slice(i, i + WORDS_PER_PAGE));
		}
		return pages;
	}

	async function loadTxt(file) {
		return splitIntoPages(await file.text());
	}

	// EPUB je ZIP sa XHTML fajlovima. Svako poglavlje se siječe posebno,
	// pa stranica nikad ne prelazi granicu poglavlja.
	async function loadEpub(file) {
		const zip = await JSZip.loadAsync(file);
		const parser = new DOMParser();

		async function readDoc(path, type) {
			const entry = zip.file(path);
			if (!entry) return null;
			return parser.parseFromString(await entry.async('string'), type);
		}

		// 1. container.xml kaže gdje je .opf fajl
		const container = await readDoc('META-INF/container.xml', 'application/xml');
		const opfPath = container.querySelector('rootfile').getAttribute('full-path');
		const opfDir = opfPath.includes('/') ? opfPath.slice(0, opfPath.lastIndexOf('/') + 1) : '';

		// 2. .opf: manifest (id -> href) i spine (redoslijed poglavlja)
		const opf = await readDoc(opfPath, 'application/xml');
		const manifest = {};
		opf.querySelectorAll('manifest > item').forEach((item) => {
			manifest[item.getAttribute('id')] = item.getAttribute('href');
		});
		const hrefs = [...opf.querySelectorAll('spine > itemref')]
			.map((ref) => manifest[ref.getAttribute('idref')])
			.filter(Boolean);

		// 3. za svako poglavlje izvuci tekst i isijeci ga na stranice
		const pages = [];
		for (const href of hrefs) {
			// riješi relativne putanje i %20 itd.
			const path = decodeURIComponent(new URL(href, 'http://x/' + opfDir).pathname.slice(1));
			const doc = await readDoc(path, 'text/html');
			if (!doc || !doc.body) continue;

			doc.querySelectorAll('script, style').forEach((el) => el.remove());
			// razmak poslije blok elemenata, da se riječi iz različitih paragrafa ne slijepe
			doc.querySelectorAll('p, div, br, h1, h2, h3, h4, h5, h6, li, tr').forEach((el) => {
				el.insertAdjacentText('afterend', ' ');
			});

			pages.push(...splitIntoPages(doc.body.textContent));
		}
		return pages;
	}

	async function loadTextFile(file) {
		try {
			const ext = file.name.split('.').pop().toLowerCase();
			const pages = ext === 'epub' ? await loadEpub(file) : await loadTxt(file);

			if (pages.length === 0) {
				Swal.fire('Greška', 'U fajlu nije pronađen nikakav tekst.', 'error');
				return;
			}

			pdfDoc = null; // nema PDF dokumenta, sve stranice su već spremne u kešu
			totalPages = pages.length;
			currentFileName = file.name;
			resetDocumentState();

			pagesWordsCache = pages;
			searchReady = true; // pretraga radi odmah, nema pozadinske ekstrakcije
			totalWordsInDoc = pages.reduce((sum, p) => sum + p.length, 0);

			let targetPage = 1;
			const safeKey = sanitizeKey(currentFileName);
			const positions = getSavedPositions();
			if (positions[safeKey] !== undefined) {
				targetPage = parseInt(positions[safeKey], 10);
			}

			await renderPdfPage(targetPage);
		} catch (e) {
			console.error('Greška pri učitavanju fajla:', e);
			Swal.fire(
				'Greška',
				'Neuspješno učitavanje fajla. Fajl je možda oštećen ili neispravnog formata.',
				'error'
			);
		}
	}

	async function extractAllPages() {
		try {
			for (let p = 1; p <= totalPages; p++) {
				if (pagesWordsCache[p - 1]) continue;
				const page = await pdfDoc.getPage(p);
				const textContent = await page.getTextContent();
				const rawText = textContent.items.map((item) => item.str).join(' ');
				const cleaned = rawText.replace(/\s+/g, ' ').trim();
				pagesWordsCache[p - 1] = splitToWords(cleaned);
			}
		} catch (e) {
			console.error('Greška pri ekstrakciji stranica u pozadini:', e);
		}
	}

	async function renderPdfPage(pageNum) {
		try {
			if (!currentFileName) return;
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

			// Auto-save pozicije pri svakom okretanju stranice
			savePositionQuietly();
		} catch (e) {
			console.error('Greška pri renderovanju stranice:', e);
			Swal.fire('Greška', 'Došlo je do problema pri čitanju ove stranice.', 'error');
		}
	}
	// --- Race ---
	let raceActive = $state(false);
	let raceStats = $state([]);
	let raceLastTime = 0;

	function startRace() {
		if (!currentFileName) {
			Swal.fire('Info', 'Prvo učitaj fajl.', 'info');
			return;
		}
		raceActive = true;
		raceStats = [];
		raceCheckpoints = [];
		raceLastTime = Date.now();
		isPaused = false;

		// Automatski skroluj na vrh teksta da ne moraš ručno da tražiš početak
		document.getElementById('reader-content-wrap')?.scrollIntoView({ behavior: 'smooth' });
	}

	function stopRace() {
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

	let raceCheckpoints = $state([]);
	const CHECKPOINT_THRESHOLDS = [
		{ atMinutes: 1, seconds: 60 },
		{ atMinutes: 5, seconds: 300 },
		{ atMinutes: 10, seconds: 600 }
	];

	let raceCheckpointAverage = $derived.by(() => {
		if (raceCheckpoints.length === 0) return 0;
		const sum = raceCheckpoints.reduce((s, c) => s + c.wpm, 0);
		return Math.round(sum / raceCheckpoints.length);
	});

	function recordPageIfRacing() {
		if (!raceActive) return;
		const now = Date.now();
		const seconds = (now - raceLastTime) / 1000;
		const wordsOnPage = words.length;
		const minutes = seconds / 60;
		const wpm = minutes > 0 ? Math.round(wordsOnPage / minutes) : 0;
		raceStats = [...raceStats, { page: currentPage, words: wordsOnPage, seconds, wpm }];
		raceLastTime = now;

		const cumWords = raceStats.reduce((s, x) => s + x.words, 0);
		const cumSeconds = raceStats.reduce((s, x) => s + x.seconds, 0);
		for (const t of CHECKPOINT_THRESHOLDS) {
			const already = raceCheckpoints.some((c) => c.atMinutes === t.atMinutes);
			if (!already && cumSeconds >= t.seconds) {
				const cumWpm = Math.round(cumWords / (cumSeconds / 60));
				raceCheckpoints = [
					...raceCheckpoints,
					{ atMinutes: t.atMinutes, wpm: cumWpm, words: cumWords, seconds: cumSeconds }
				];
			}
		}
	}

	// --- Pacer ---

	let paceActive = $state(false);
	let paceIndex = $state(0);
	let paceIntervalId = null;

	function paceChunk() {
		return Math.max(1, Number(podesavanja.paceChunkSize) || 1);
	}

	function paceIntervalMs() {
		const wpm = Math.max(50, Number(paceWpm.value) || 300);
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
		paceIndex;
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
			if (paceAutoNext.value && currentPage < totalPages) {
				paceAutoNextTimeoutId = setTimeout(() => {
					paceAutoNextTimeoutId = null;
					if (paceActive && !isPaused && currentPage < totalPages) {
						if (raceActive) raceLastTime += 5000;
						pdfNext();
					}
				}, 5000);
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
			Swal.fire('Info', 'Prvo učitaj fajl.', 'info');
			return;
		}

		// Čuvanje WPM-a (ako koristiš ovu funkciju negdje)
		if (typeof saveSetting === 'function') {
			saveSetting('pace_wpm', paceWpm.value);
		}

		// Pacer PALI I RACE u isto vrijeme, po našem dogovoru!
		paceActive = true;
		raceActive = true;
		raceStats = [];
		raceCheckpoints = [];
		raceLastTime = Date.now();

		paceIndex = 0;
		isPaused = false;
		startPaceIntervalInternal();

		// Automatski skroluj na vrh teksta i za pacer
		document.getElementById('reader-content-wrap')?.scrollIntoView({ behavior: 'smooth' });
	}

	function stopPacer() {
		if (paceIntervalId !== null) {
			clearInterval(paceIntervalId);
			paceIntervalId = null;
		}
		if (paceAutoNextTimeoutId !== null) {
			clearTimeout(paceAutoNextTimeoutId);
			paceAutoNextTimeoutId = null;
		}
		paceActive = false;
		paceIndex = 0;

		// Kada gašenje pacera ugasi i race (ili ostaje race? Možeš ostaviti da se i race zaustavi ili ostane aktivan – po želji, ali obično ide stop oboje)
		raceActive = false;
	}

	// --- Pauza/Nastavi ---
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
		if (paceAutoNextTimeoutId !== null) {
			clearTimeout(paceAutoNextTimeoutId);
			paceAutoNextTimeoutId = null;
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
		if (raceActive) raceLastTime = Date.now();

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
		const qWords = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
		if (qWords.length === 0) {
			searchResults = [];
			return;
		}
		const results = [];
		for (let p = 0; p < pagesWordsCache.length; p++) {
			const pw = pagesWordsCache[p];
			if (!pw) continue;
			for (let i = 0; i <= pw.length - qWords.length; i++) {
				let match = true;
				for (let k = 0; k < qWords.length; k++) {
					if (!pw[i + k].toLowerCase().includes(qWords[k])) {
						match = false;
						break;
					}
				}
				if (match) {
					const start = Math.max(0, i - 4);
					const end = Math.min(pw.length, i + qWords.length + 4);
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

		const ext = file.name.split('.').pop().toLowerCase();
		if (ext === 'pdf') {
			loadPdfFile(file);
		} else if (ext === 'epub' || ext === 'txt') {
			loadTextFile(file);
		} else {
			Swal.fire({
				title: 'Nepodržan format',
				text: 'Podržani formati su PDF, EPUB i TXT.',
				icon: 'warning'
			});
			event.target.value = '';
		}
	}

	let wordCountLabel = $derived('Riječi na stranici: ' + words.length);

	let pastedWordCount = $derived(splitToWords(pastedText).length);
	let selectedWordCount = $state(0);

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

	function closePdf() {
		savePositionQuietly();
		currentFileName = '';
		words = [];
		pdfDoc = null;
		currentPage = 1;
		totalPages = 1;
		pagesWordsCache = [];
		searchReady = false;
		searchResults = [];
		searchQuery = '';
		totalWordsInDoc = 0;
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

	// Funkcija koja se okida na tap/klik po PDF kontejneru
	function handlePdfTap() {
		if (!paceActive && !raceActive) return;
		if (isPaused) resumeSession();
		else pauseSession();
	}
</script>

<div class="container-fluid">
	<!-- 1. TOOLBAR -->
	<div class="card mb-3 w-100 shadow-lg">
		<div class="card-body py-2">
			<div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
				<!-- Fajl input i Zatvori PDF (grupisano da stoji logično) -->
				<div class="d-flex align-items-center flex-grow-1 gap-2" style="min-width: 250px;">
					<input
						type="file"
						accept=".pdf,.epub,.txt,application/pdf,application/epub+zip,text/plain"
						class="form-control form-control-sm flex-grow-1"
						onchange={onFileSelected}
					/>
					{#if currentFileName}
						<button
							class="btn btn-outline-danger btn-sm text-nowrap"
							type="button"
							onclick={closePdf}
						>
							✕ Zatvori
						</button>
					{/if}
				</div>

				<!-- Kontrole za Font, Širinu i Margine -->
				<div class="d-flex flex-wrap align-items-center gap-3">
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
						<div class="form-check form-switch mb-0">
							<input
								class="form-check-input"
								type="checkbox"
								role="switch"
								id="marginClipToggle"
								checked={marginClipEnabled}
								onchange={toggleMarginClip}
								disabled={!marginLinesEnabled}
							/>
							<label class="form-check-label small" for="marginClipToggle">Odsijeci</label>
						</div>
					</div>

					<!-- Margin Lijeva  -->

					<!-- Kraj margine širine -->
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
		<div class="card mb-3 shadow-lg">
			<div class="card-body py-2">
				<div class="d-flex justify-content-between align-items-center mb-1">
					<span class="fw-bold small">Zalijepi tekst (brojanje riječi)</span>
					<span class="info"
						>Riječi: {pastedWordCount} &nbsp;|&nbsp; Selektovano riječi: {selectedWordCount}</span
					>
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
						<button class="btn btn-danger btn-sm" type="button" onclick={stopTaRace}>⏹ Stop</button>
					{/if}
					<button class="btn btn-info btn-sm" type="button" onclick={() => (pastedText = '')}
						>🎯 Clear</button
					>
				</div>
			</div>
		</div>
	{/if}

	{#if currentFileName}
		<div class="card mb-3">
			<div class="card-body py-2">
				<div class="d-flex flex-wrap align-items-center gap-3 mb-2">
					<span class="info">
						Ukupno riječi:
						{#if preparingSearch}
							<span class="text-white">(računa se...)</span>
						{:else}
							<strong>{totalWordsInDoc}</strong>
						{/if}
					</span>
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
					<button class="btn btn-primary" type="button" onclick={runSearch} disabled={!searchReady}
						>Pretraga</button
					>
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
				<button
					class="btn btn-outline-primary"
					type="button"
					onclick={pdfPrev}
					disabled={currentPage <= 1}>« Prethodna</button
				>
				<button
					class="btn btn-outline-primary"
					type="button"
					onclick={pdfNext}
					disabled={currentPage >= totalPages}>Sljedeća »</button
				>
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
					<button class="btn btn-success btn-sm" type="button" onclick={resumeSession}
						>▶ Nastavi</button
					>
				{:else}
					<button class="btn btn-outline-secondary btn-sm" type="button" onclick={pauseSession}
						>⏸ Pauza</button
					>
				{/if}
			</div>
		{/if}

		<!-- RACE -->
		<div class="card mb-3">
			<div class="card-body py-2 text-center">
				{#if !raceActive}
					<button class="btn btn-warning btn-sm" type="button" onclick={startRace}
						>🏁 Start Race</button
					>
				{:else}
					<button class="btn btn-danger btn-sm" type="button" onclick={stopRace}>⏹ Stop Race</button
					>
				{/if}

				{#if raceStats.length > 0}
					<div class="race-stats mt-2">
						{#each raceStats as s}
							<div class="text-primary h6">
								Str. {s.page}: <strong>{s.wpm} wpm</strong> ({s.words} riječi, {s.seconds.toFixed(
									1
								)} s)
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

				{#if raceCheckpoints.length > 0}
					<div class="race-checkpoints mt-2">
						<div class="info fw-bold">Provjere (kumulativno):</div>
						{#each raceCheckpoints as c}
							<div class="info">{c.atMinutes}. min: <strong>{c.wpm} wpm</strong></div>
						{/each}
						<hr class="my-1" />
						<div class="info text-info fw-bold">
							Prosjek provjera:<strong class="text-danger"> {raceCheckpointAverage}</strong>
						</div>
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
								bind:value={paceWpm.value}
							/>
						</div>
						<div class="input-group input-group-sm" style="width: auto;">
							<span class="input-group-text">Chunks</span>
							<!-- <label class="fw-bold m-1" for="">{podesavanja.paceChunkSize}</label> -->
							<input
								type="number"
								min="1"
								step="1"
								class="form-control"
								style="width: 70px;"
								onchange={(e) => setPaceChunkSize(Number(e.target.value))}
								value={podesavanja.paceChunkSize}
							/>
						</div>

						<!-- BOLD SWITCH -->

						<div class="btn-group" role="group">
							<input
								type="checkbox"
								class="btn-check"
								id="btnBoldToggle"
								autocomplete="off"
								checked={podesavanja.bold}
								onchange={toggleBold}
							/>
							<label class="btn btn-outline-success fw-bold" for="btnBoldToggle"> B </label>
						</div>

						<button class="btn btn-outline-primary btn-sm" type="button" onclick={startPacer}
							>🎯 Pacer + 🏁 Race</button
						>
						<div class="form-check form-switch">
							<input
								class="form-check-input"
								type="checkbox"
								role="switch"
								id="paceAutoNextToggle"
								bind:checked={paceAutoNext.value}
								onchange={togglePaceAutoNext}
							
							/>
							<label class="form-check-label small" for="paceAutoNextToggle">Autonext</label>
						</div>
					</div>
				{:else}
					<div class="d-flex justify-content-center align-items-center gap-2 flex-wrap">
						<button class="btn btn-danger btn-sm" type="button" onclick={stopPacer}
							>⏹ Stop Pacer</button
						>
						<span class="info fw-bold"
							>Tempo: {paceWpm.value} wpm, Riječi: {podesavanja.paceChunkSize}</span
						>
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<div
		class="reader-content-wrap shadow-lg"
		id="reader-content-wrap"
		onclick={handlePdfTap}
		style="width: {podesavanja.readerWidthPercent}%; margin: 0 auto; clip-path: {marginLinesEnabled &&
		marginClipEnabled
			? `inset(0 ${podesavanja.marginRight}% 0 ${podesavanja.marginLeft}%)`
			: 'none'};"
	>
		{#if marginLinesEnabled}
			<div
				class="margin-line"
				style=" left: {podesavanja.marginLeft}%;background:{podesavanja.marginBoja};width:{podesavanja.marginDebljina}px;"
			></div>
			<div
				class="margin-line"
				style=" right: {podesavanja.marginRight}%;background:{podesavanja.marginBoja};width:{podesavanja.marginDebljina}px;"
			></div>
		{/if}

		{#if currentFileName}
			<div
				bind:this={readerContentEl}
				class="reader-content border rounded p-3 mb-3 border border-3 border-info"
				style="font-size: {podesavanja.fontSize}px;background-color:{podesavanja.readerBack} !important;font-Family:{podesavanja.fontFamily};font-weight: {podesavanja.bold
					? 'bold'
					: 'normal'}; line-height:{podesavanja.lineSpacing}"
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
		{/if}
	</div>

	{#if currentFileName}
		<div class="d-flex justify-content-center mb-3">
			<div class="btn-group">
				<button
					class="btn btn-outline-primary"
					type="button"
					onclick={pdfPrev}
					disabled={currentPage <= 1}>« Prethodna</button
				>
				<button
					class="btn btn-outline-primary"
					type="button"
					onclick={pdfNext}
					disabled={currentPage >= totalPages}>Sljedeća »</button
				>
			</div>
		</div>
	{/if}

	{#if currentFileName}
		<div class="card mb-3">
			<div class="card-body py-2">
				<div class="d-flex flex-wrap justify-content-center align-items-center gap-2">
					<button class="btn btn-secondary btn-sm" type="button" onclick={savePosition}
						>Sačuvaj poziciju</button
					>
					<button class="btn btn-secondary btn-sm" type="button" onclick={goToSavedPosition}
						>Idi na sačuvanu poziciju</button
					>
					{#if previousPositionLabel}
						<span class="info ms-2">{previousPositionLabel}</span>
					{/if}
				</div>
			</div>
		</div>

		<div class="card mb-3">
			<div class="card-body py-2">
				<div class="d-flex flex-wrap justify-content-center align-items-center gap-2">
					<button class="btn btn-outline-success btn-sm" type="button" onclick={setMarkerStart}
						>Marker Početak</button
					>
					<button class="btn btn-outline-danger btn-sm" type="button" onclick={setMarkerEnd}
						>Marker Kraj</button
					>
					<button class="btn btn-outline-secondary btn-sm" type="button" onclick={clearMarkers}
						>Obriši markere</button
					>
					{#if markerWordCount > 0}
						<span class="info ms-2">Pročitano: {markerWordCount} riječi</span>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.settings-container-bottom {
		position: fixed;
		bottom: 20px;
		left: 10px;
		z-index: 1000;
	}

	.qt-settings {
		background: none;
		border: none;
		font-size: 2rem;
		cursor: pointer;
		display: inline-block;
		transition: transform 0.4s ease;
	}

	.qt-settings:hover {
		transform: rotate(90deg);
	}

	.qt-settings {
		background: none;
		border: none;
		font-size: 2rem;
		cursor: pointer;
		display: inline-block;
		transition: transform 0.4s ease;
	}

	/* Rotacija na hover */
	.qt-settings:hover {
		transform: rotate(90deg);
	}

	nav {
		background-color: #f8f8f8;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
		padding: 15px 25px;
	}
	.reader-page {
		max-width: 1100px;
	}
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
	.reader-content {
		font-family: 'Lexend', sans-serif;
		line-height: 1.6;
		white-space: normal;
	}

	.word {
		cursor: pointer;
	}
	.word:hover {
		background: #eee;
	}
	.pos-mark {
		background: #ffe066;
		border-radius: 2px;
	}
	.start-mark {
		background: #a5d8ff;
		border-radius: 2px;
	}
	.end-mark {
		background: #b2f2bb;
		border-radius: 2px;
	}
	.pace-mark {
		background: var(--pace-mark-color, #ffa8a8);
		border-radius: 2px;
	}
	.info {
		font-size: 16px;
		color: #fb0909;
	}
	.search-results {
		max-height: 250px;
		overflow-y: auto;
	}
	.search-result-item {
		padding: 4px 2px;
		cursor: pointer;
		border-bottom: 1px solid #eee;
	}
	.search-result-item:hover {
		background: #f0f0f0;
	}
</style>
