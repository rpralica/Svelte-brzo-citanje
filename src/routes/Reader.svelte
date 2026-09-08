<script>
	import { onMount } from 'svelte';
	import Timeri from './Timeri.svelte';

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

	// --- Tekst / rijeci ---
	// words je niz stringova - trenutni sadrzaj za prikaz (cijeli .txt ili trenutna PDF stranica)
	let words = $state([]);

	function splitToWords(text) {
		const trimmed = text.trim();
		if (trimmed.length === 0) return [];
		return trimmed.split(/\s+/);
	}

	// Uklanja HTML tagove iz teksta (ako je .txt fajl slucajno pokupio html markup)
	function stripHtml(text) {
		return text.replace(/<[^>]*>/g, ' ');
	}

	// --- Fajl info / tip ---
	let currentFileName = $state('');
	let currentFileType = $state(''); // 'txt' | 'pdf'
	let pdfDoc = null; // pdf.js dokument (nije reaktivan, cuvamo van state-a)
	let currentPage = $state(1);
	let totalPages = $state(1);

	// --- Markeri i pozicija ---
	let posIndex = $state(null); // dokle sam stao (indeks rijeci)
	let startIndex = $state(null); // marker pocetak
	let endIndex = $state(null); // marker kraj

	let markerWordCount = $derived(
		startIndex !== null && endIndex !== null ? Math.abs(endIndex - startIndex) + 1 : 0
	);

	function wordClick(idx) {
		// klik na rijec briše "trenutnu poziciju" oznaku (kao u starom kodu - dodirom nastavljas)
		posIndex = idx;
	}

	function setMarkerStart() {
		if (posIndex === null) {
			alert('Prvo klikni na rijec da postavis pocetnu tacku.');
			return;
		}
		startIndex = posIndex;
	}

	function setMarkerEnd() {
		if (posIndex === null) {
			alert('Prvo klikni na rijec da postavis krajnju tacku.');
			return;
		}
		if (startIndex === null) {
			alert('Prvo postavi Marker Pocetak.');
			return;
		}
		endIndex = posIndex;
	}

	function clearMarkers() {
		startIndex = null;
		endIndex = null;
	}

	// --- LocalStorage pozicija ---
	function positionKey() {
		if (currentFileType === 'pdf') {
			return 'pdf_stranica_' + currentFileName;
		}
		return 'pozicija_' + currentFileName;
	}

	let previousPositionLabel = $state('');

	async function savePosition() {
		if (!currentFileName) {
			Swal.fire('Greska', 'Prvo ucitaj fajl.', 'warning');
			return;
		}
		if (currentFileType !== 'pdf' && posIndex === null) {
			Swal.fire('Greska', 'Prvo klikni na rijec da oznacis poziciju.', 'warning');
			return;
		}

		const newValue = currentFileType === 'pdf' ? currentPage : posIndex;
		const existing = localStorage.getItem(positionKey());
		const existingText =
			existing === null
				? 'Nema prethodno sacuvane pozicije.'
				: currentFileType === 'pdf'
					? 'Prethodno sacuvana stranica: ' + existing
					: 'Prethodno sacuvana rijec: ' + existing;

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
				previousPositionLabel =
					currentFileType === 'pdf'
						? 'Prethodna pozicija: stranica ' + existing
						: 'Prethodna pozicija: rijec ' + existing;
			}
			localStorage.setItem(positionKey(), String(newValue));
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
			alert('Prvo ucitaj fajl.');
			return;
		}
		const saved = localStorage.getItem(positionKey());
		if (saved === null) {
			alert('Nema sacuvane pozicije za ovaj fajl.');
			return;
		}
		if (currentFileType === 'pdf') {
			currentPage = parseInt(saved, 10);
			await renderPdfPage(currentPage);
		} else {
			posIndex = parseInt(saved, 10);
		}
	}

	// --- Ucitavanje .txt ---
	function loadTxtFile(file) {
		const reader = new FileReader();
		reader.onload = (e) => {
			const cleaned = stripHtml(e.target.result);
			words = splitToWords(cleaned);
			currentFileName = file.name;
			currentFileType = 'txt';
			posIndex = null;
			startIndex = null;
			endIndex = null;

			const saved = localStorage.getItem('pozicija_' + currentFileName);
			if (saved !== null) {
				infoMessage =
					'Nadjena sacuvana pozicija (rijec ' + saved + "). Klikni 'Idi na sacuvanu poziciju'.";
			} else {
				infoMessage = '';
			}
		};
		reader.readAsText(file, 'UTF-8');
	}

	// --- Ucitavanje .pdf (pdf.js), pristup 1: stranica po stranica ---
	let pdfjsLib = null;

	async function ensurePdfJs() {
		if (pdfjsLib) return pdfjsLib;
		// pdfjs-dist mora biti instaliran: npm install pdfjs-dist
		pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');
		pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
			'pdfjs-dist/build/pdf.worker.mjs',
			import.meta.url
		).toString();
		return pdfjsLib;
	}

	async function loadPdfFile(file) {
		const lib = await ensurePdfJs();
		const arrayBuffer = await file.arrayBuffer();
		pdfDoc = await lib.getDocument({ data: arrayBuffer }).promise;
		totalPages = pdfDoc.numPages;
		currentFileName = file.name;
		currentFileType = 'pdf';
		currentPage = 1;
		posIndex = null;
		startIndex = null;
		endIndex = null;

		const saved = localStorage.getItem('pdf_stranica_' + currentFileName);
		if (saved !== null) {
			infoMessage = 'Nadjena sacuvana stranica (' + saved + "). Klikni 'Idi na sacuvanu poziciju'.";
		} else {
			infoMessage = '';
		}

		await renderPdfPage(currentPage);
	}

	async function renderPdfPage(pageNum) {
		if (!pdfDoc) return;
		if (pageNum < 1) pageNum = 1;
		if (pageNum > totalPages) pageNum = totalPages;
		currentPage = pageNum;

		const page = await pdfDoc.getPage(pageNum);
		const textContent = await page.getTextContent();
		const rawText = textContent.items.map((item) => item.str).join(' ');
		// pdf.js ekstrakcija zna ostaviti visestruke razmake - ocistimo
		const cleaned = rawText.replace(/\s+/g, ' ').trim();

		words = splitToWords(cleaned);
		posIndex = null;
		startIndex = null;
		endIndex = null;
	}

	function pdfNext() {
		if (currentPage < totalPages) {
			renderPdfPage(currentPage + 1);
		}
	}

	function pdfPrev() {
		if (currentPage > 1) {
			renderPdfPage(currentPage - 1);
		}
	}

	// --- Generalni file handler ---
	let infoMessage = $state('');

	function onFileSelected(event) {
		const file = event.target.files[0];
		if (!file) return;

		const lower = file.name.toLowerCase();
		if (lower.endsWith('.pdf')) {
			loadPdfFile(file);
		} else if (lower.endsWith('.txt')) {
			loadTxtFile(file);
		} else {
			alert('Podrzani formati su .txt i .pdf');
		}
	}

	let wordCountLabel = $derived('Rijeci: ' + words.length);
</script>

<div class="row">
	<div class="col-8">
		<div class="reader-wrap">
			<div class="row mb-2">
				<div class="col-auto">
					<input
						type="file"
						accept=".txt,.pdf,text/plain,application/pdf"
						class="form-control"
						onchange={onFileSelected}
					/>
				</div>
				<div class="col-auto">
					<span class="fw-bold">Font:</span>
					<button
						class="btn btn-sm btn-outline-secondary"
						type="button"
						onclick={() => changeFont(-1)}>A-</button
					>
					<span class="mx-1">{fontSize}</span>
					<button
						class="btn btn-sm btn-outline-secondary"
						type="button"
						onclick={() => changeFont(1)}>A+</button
					>
					<button class="btn btn-sm btn-outline-secondary" type="button" onclick={resetFont}
						>Reset</button
					>
				</div>
			</div>

			{#if infoMessage}
				<div class="alert alert-info py-1 px-2">{infoMessage}</div>
			{/if}

			<div class="row mb-2">
				<div class="col-auto info">{wordCountLabel}</div>
				{#if currentFileType === 'pdf'}
					<div class="col-auto info">Stranica: {currentPage} / {totalPages}</div>
				{/if}
			</div>
			<!-- Gornja dugmad prethodna - sljedeća -->

			<div class="">
				{#if currentFileType === 'pdf'}
					<div class="row mt-2">
						<div class="col-auto">
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
			</div>
		</div>
	</div>

	<div class="col-4">
		<div class="row">
			<div class="col-6">
				<button class="btn btn-info" type="button" onclick={() => changeWidth(-WIDTH_STEP)}
					>Smanji</button
				>
			</div>
			<div class="col-6">
				<button class="btn btn-info" type="button" onclick={() => changeWidth(WIDTH_STEP)}
					>Povećaj</button
				>
			</div>
		</div>
	</div>

	<div class="row mt-1">
		<Timeri></Timeri>
	</div>

	<div
		class="reader-content border rounded p-3"
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
<div class="row d-flex  justify-content-end offset-3">
	{#if currentFileType === 'pdf'}
		<div class="row mt-2">
			<div class="col-auto">
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

	<div class="row mt-3">
		<div class="col-auto d-flex gap-2">
			<button class="btn btn-secondary" type="button" onclick={savePosition}
				>Sacuvaj poziciju</button
			>
			<button class="btn btn-secondary" type="button" onclick={goToSavedPosition}
				>Idi na sacuvanu poziciju</button
			>
		</div>
		{#if previousPositionLabel}
			<div class="col-12 info mt-1">{previousPositionLabel}</div>
		{/if}
	</div>

	<div class="row mt-3">
		<div class="col-auto d-flex gap-2 align-items-center">
			<button class="btn btn-outline-success" type="button" onclick={setMarkerStart}
				>Marker Pocetak</button
			>
			<button class="btn btn-outline-danger" type="button" onclick={setMarkerEnd}
				>Marker Kraj</button
			>
			<button class="btn btn-outline-secondary" type="button" onclick={clearMarkers}
				>Obrisi markere</button
			>
			{#if markerWordCount > 0}
				<span class="info">Procitano: {markerWordCount} rijeci</span>
			{/if}
            </div>
		</div>
	</div>
</div>

<style>
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
</style>