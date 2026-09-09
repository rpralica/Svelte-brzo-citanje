<script>
	import { onMount } from 'svelte';

function  clearTa() {
	 pastedText =''
};
	// --- Font / zoom ---
	let fontSize = $state(25);
	const FONT_MIN = 12;
	const FONT_MAX = 60;

	function changeFont(delta) {
		fontSize = Math.min(FONT_MAX, Math.max(FONT_MIN, fontSize + delta));
	}
	function resetFont() {
		fontSize = 25;
	}

	// --- Sirina reader-content diva (Smanji / Povecaj) - pamti se u localStorage ---
	const WIDTH_STORAGE_KEY = 'reader_sirina';
	let readerWidthPercent = $state(
		typeof localStorage !== 'undefined' && localStorage.getItem(WIDTH_STORAGE_KEY) !== null
			? parseInt(localStorage.getItem(WIDTH_STORAGE_KEY), 10)
			: 100
	);
	const WIDTH_MIN = 30;
	const WIDTH_MAX = 100;
	const WIDTH_STEP = 10;

	function changeWidth(delta) {
		readerWidthPercent = Math.min(WIDTH_MAX, Math.max(WIDTH_MIN, readerWidthPercent + delta));
		localStorage.setItem(WIDTH_STORAGE_KEY, String(readerWidthPercent));
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
	let pdfDoc = null; // pdf.js dokument (nije reaktivan)
	let currentPage = $state(1);
	let totalPages = $state(1);

	// --- Markeri i pozicija ---
	let posIndex = $state(null); // dokle sam stao (indeks rijeci na trenutnoj stranici)
	let startIndex = $state(null); // marker pocetak
	let endIndex = $state(null); // marker kraj

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

	// --- LocalStorage pozicija (broj stranice) ---
	function positionKey() {
		return 'pdf_stranica_' + currentFileName;
	}

	let previousPositionLabel = $state('');

	async function savePosition() {
		if (!currentFileName) {
			Swal.fire('Greska', 'Prvo ucitaj PDF fajl.', 'warning');
			return;
		}

		const existing = localStorage.getItem(positionKey());
		const existingText =
			existing === null
				? 'Nema prethodno sacuvane pozicije.'
				: 'Prethodno sacuvana stranica: ' + existing;

		const result = await Swal.fire({
			title: 'Sacuvati poziciju?',
			text: existingText + ' Da li sigurno zelis sacuvati novu poziciju?',
			icon: 'question',
			showCancelButton: true,
			confirmButtonText: 'Da, sacuvaj',
			cancelButtonText: 'Otkazi'
		});

		if (result.isConfirmed) {
			if (existing !== null) {
				previousPositionLabel = 'Prethodna pozicija: stranica ' + existing;
			}
			localStorage.setItem(positionKey(), String(currentPage));
			Swal.fire({
				title: 'Sacuvano!',
				icon: 'success',
				timer: 1200,
				showConfirmButton: false
			});
		}
	}

	async function goToSavedPosition() {
		if (!currentFileName) {
			Swal.fire('Greska', 'Prvo ucitaj PDF fajl.', 'warning');
			return;
		}
		const saved = localStorage.getItem(positionKey());
		if (saved === null) {
			Swal.fire('Info', 'Nema sacuvane pozicije za ovaj fajl.', 'info');
			return;
		}
		await renderPdfPage(parseInt(saved, 10));
	}

	// --- Ucitavanje .pdf (pdf.js), pristup 1: stranica po stranica ---
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

	// Kesirane rijeci po stranicama - koristi se za brzu navigaciju i za pretragu
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

		const saved = localStorage.getItem('pdf_stranica_' + currentFileName);
		if (saved !== null) {
			infoMessage = 'Nadjena sacuvana stranica (' + saved + "). Klikni 'Idi na sacuvanu poziciju'.";
		} else {
			infoMessage = '';
		}

		await renderPdfPage(currentPage);

		// U pozadini izvuci tekst svih stranica radi pretrage (ne blokira citanje prve stranice)
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

	function pdfNext() {
		if (currentPage < totalPages) {
			renderPdfPage(currentPage + 1).then(scrollToReaderTop);
		}
	}

	function pdfPrev() {
		if (currentPage > 1) {
			renderPdfPage(currentPage - 1).then(scrollToReaderTop);
		}
	}

	let readerContentEl;
	function scrollToReaderTop() {
		if (readerContentEl) {
			readerContentEl.scrollIntoView({ behavior: 'instant', block: 'start' });
		}
	}

	// --- Pretraga kroz cijeli dokument ---
	let searchQuery = $state('');
	let searchResults = $state([]); // { page, wordIndex, context }

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

	// --- Generalni file handler - samo PDF dozvoljen ---
	let infoMessage = $state('');

	function onFileSelected(event) {
		const file = event.target.files[0];
		if (!file) return;

		const lower = file.name.toLowerCase();
		if (!lower.endsWith('.pdf')) {
			Swal.fire({
				title: 'Nepodrzan format',
				text: 'Ova aplikacija trenutno podrzava samo PDF fajlove.',
				icon: 'warning'
			});
			event.target.value = '';
			return;
		}
		loadPdfFile(file);
	}

	let wordCountLabel = $derived('Rijeci na stranici: ' + words.length);

	// --- Paste tekst - samo za brojanje rijeci ---
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
<div class="container ">
<div class="container-fluid reader-page">
	<!-- 1. TOOLBAR: ucitavanje, font, sirina -->
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
						<button class="btn btn-outline-secondary" type="button" onclick={() => changeFont(-1)}
							>A-</button
						>
						<span class="btn btn-light disabled">{fontSize}</span>
						<button class="btn btn-outline-secondary" type="button" onclick={() => changeFont(1)}
							>A+</button
						>
						<button class="btn btn-outline-secondary" type="button" onclick={resetFont}
							>Reset</button
						>
					</div>
				</div>

				<div class="toolbar-group d-flex align-items-center gap-2">
					<span class="fw-bold small">Širina</span>
					<div class="btn-group btn-group-sm" role="group">
						<button class="btn btn-outline-info" type="button" onclick={() => changeWidth(-WIDTH_STEP)}
							>−</button
						>
						<span class="btn btn-light disabled">{readerWidthPercent}%</span>
						<button class="btn btn-outline-info" type="button" onclick={() => changeWidth(WIDTH_STEP)}
							>+</button
						>
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

	<!-- PASTE TEKST - samo brojanje rijeci (sakriveno kad je PDF ucitan) -->
	{#if !currentFileName}
	<div class="card mb-3">
		<div class="card-body py-2">
			<div class="d-flex justify-content-between align-items-center mb-1">
				<span class="fw-bold small">Zalijepi tekst (brojanje rijeci)</span>
				<span class="info">Rijeci: {pastedWordCount} &nbsp;|&nbsp; Selektovano rijeci: {selectedWordCount}</span>
			</div>
			<textarea
				class="form-control"
				rows="4"
				placeholder="Zalijepi tekst ovdje..."
				bind:value={pastedText}
				
				onselect={onPastedSelect}
				onmouseup={onPastedSelect}
				onkeyup={onPastedSelect}
			></textarea>

			<button style="width: 7rem;justify-content: center;"  onclick={clearTa}  class="btn btn-danger mt-4 d-flex  ms-auto ">Clear</button>
		</div>
	</div>
	{/if}

	{#if currentFileName}
		<!-- 2. STATUS + PRETRAGA -->
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
						placeholder="Pretrazi cijeli dokument..."
						bind:value={searchQuery}
						onkeydown={(e) => e.key === 'Enter' && runSearch()}
					/>
					<button class="btn btn-primary" type="button" onclick={runSearch} disabled={!searchReady}
						>Pretraga</button
					>
				</div>
				{#if !searchReady && !preparingSearch}
					<div class="info mt-1">Pretraga jos nije spremna.</div>
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

		<!-- 3. PDF NAVIGACIJA -->
		<div class="d-flex justify-content-center mb-2">
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
					disabled={currentPage >= totalPages}>Sljedeca »</button
				>
			</div>
		</div>
	{/if}

	<!-- 4. GLAVNI CITAC -->
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
					disabled={currentPage >= totalPages}>Sljedeca »</button
				>
			</div>
		</div>
	{/if}

	{#if currentFileName}
		<!-- 5. POZICIJA -->
		<div class="card mb-3">
			<div class="card-body py-2">
				<div class="d-flex flex-wrap justify-content-center align-items-center gap-2">
					<button class="btn btn-secondary btn-sm" type="button" onclick={savePosition}
						>Sacuvaj poziciju</button
					>
					<button class="btn btn-secondary btn-sm" type="button" onclick={goToSavedPosition}
						>Idi na sacuvanu poziciju</button
					>
					{#if previousPositionLabel}
						<span class="info ms-2">{previousPositionLabel}</span>
					{/if}
				</div>
			</div>
		</div>

		<!-- 6. MARKERI -->
		<div class="card mb-3">
			<div class="card-body py-2">
				<div class="d-flex flex-wrap justify-content-center align-items-center gap-2">
					<button class="btn btn-outline-success btn-sm" type="button" onclick={setMarkerStart}
						>Marker Pocetak</button
					>
					<button class="btn btn-outline-danger btn-sm" type="button" onclick={setMarkerEnd}
						>Marker Kraj</button
					>
					<button class="btn btn-outline-secondary btn-sm" type="button" onclick={clearMarkers}
						>Obrisi markere</button
					>
					{#if markerWordCount > 0}
						<span class="info ms-2">Procitano: {markerWordCount} rijeci</span>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
</div>
<style>
	.reader-page {
		max-width: 1100px;
	}
	.reader-content {
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
	.info {
		font-size: 15px;
		color: #333;
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