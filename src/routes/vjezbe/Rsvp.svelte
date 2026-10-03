<script>
	import { localStore, readTxtFile } from '$lib/functionsHelper/myFunctions.svelte';
	import { CRVENKAPICA } from '$lib/tekst_primjeri';
	import { podesavanja, changeFont,setFontFamily } from '$lib/functionsHelper/settings.svelte'; // Prilagodi putanju do tvoje funkcije

	// --- RSVP vjezba - rijeci (ili grupe rijeci) se smjenjuju na sredini ekrana ---
	let inputText = $state(CRVENKAPICA);
	
	let words = $derived.by(() => {
		const trimmed = inputText.trim();
		if (trimmed.length === 0) return [];
		return trimmed.split(/\s+/);
	});



	//FONT FAMILY
let otvoren = $state(false);
const fontovi = [
		{ naziv: 'Arial', vrednost: 'Arial, sans-serif' },
		{ naziv: 'Verdana', vrednost: 'Verdana, sans-serif' },
		{ naziv: 'Century Gothic', vrednost: 'Century Gothic, sans-serif' },
		{ naziv: 'Tahoma', vrednost: 'Tahoma, sans-serif' },
		{ naziv: 'Lexend', vrednost: 'Lexend, sans-serif' },
		{ naziv: 'Ubuntu', vrednost: 'Ubuntu, Outfit' },
		{ naziv: 'Quicksand', vrednost: 'Quicksand, sans-serif' },
		{ naziv: 'Outfit', vrednost: 'Outfit, sans-serif' }
	];
	let trenutniNaziv = $derived(
		fontovi.find((f) => f.vrednost === podesavanja.fontFamily)?.naziv || 'Izaberi font'
	);
function izaberiFont(f) {
		setFontFamily(f.vrednost); // Poziva funkciju iz tvog store-a koja upisuje i u localStorage
		otvoren = false;
	}

	let fontColor = localStore('fontColor', '#000000');
	let fontSize = localStore('fontSize', 25);
	let bg = localStore('bg', '#f4ecd8');
	let wpm = $state(300);
	let chunkSize = $state(1); // 1 = klasican RSVP (rijec po rijec), vise = grupe rijeci

	let running = $state(false);
	let currentIndex = $state(0); // indeks trenutne grupe (chunk)
	let currentDisplay = $state('');
	let intervalId = null;
	let finished = $state(false);

	function resetFont() {
		bg.value = '#f4ecd8';
		fontSize.value = 25;
		fontColor.value = '#000000';
		podesavanja.fontFamily='Lexend';
	}

	// Funkcija za učitavanje TXT fajla i prepisivanje preko starog teksta
	async function handleFileSelect(event) {
		const file = event.target.files[0];
		if (!file) return;

		try {
			// Čitamo fajl pomoću tvoje pomoćne funkcije (briše se sve staro i postavlja novi tekst)
			const fileContent = await readTxtFile(file);
			inputText = fileContent;

			// Opciono: resetujemo input fajla da može isti fajl ponovo da se izabere ako zatreba
			event.target.value = '';
		} catch (error) {
			alert(error.message);
		}
	}

	function totalChunks() {
		return Math.ceil(words.length / chunkSize);
	}

	function chunkText(chunkIdx) {
		const start = chunkIdx * chunkSize;
		const end = Math.min(words.length, start + chunkSize);
		return words.slice(start, end).join(' ');
	}

	function intervalMs() {
		const w = Math.max(50, Number(wpm) || 300);
		return (60000 / w) * chunkSize;
	}

	function tick() {
		currentIndex = currentIndex + 1;
		if (currentIndex >= totalChunks()) {
			stop();
			finished = true;
			return;
		}
		currentDisplay = chunkText(currentIndex);
	}

	function start() {
		if (words.length === 0) return;
		running = true;
		finished = false;
		currentIndex = 0;
		currentDisplay = chunkText(0);
		if (intervalId !== null) clearInterval(intervalId);
		intervalId = setInterval(tick, intervalMs());
	}

	function stop() {
		running = false;
		if (intervalId !== null) {
			clearInterval(intervalId);
			intervalId = null;
		}
	}

	function reset() {
		stop();
		currentIndex = 0;
		currentDisplay = '';
		finished = false;
		
	}
</script>

<fieldset class="border border-primary border-4  p-3 rounded mt-3">
	<legend class="text-center text-success fw-bold fst-italic"
		>RSVP - brzo prepoznavanje rijeci</legend
	>

	{#if !running}
		<div class="mb-3">
			<div class="d-flex justify-content-between align-items-center mb-2">
				<label class="form-label small fw-bold mb-0">Tekst za vjezbu</label>
				<!-- Ovdje ubacujemo file input da učita TXT i pregazi sve -->
				<div class="input-group input-group-sm me-auto ms-2" style="width: auto;">
					<span class="input-group-text bg-light text-success fw-bold">Učitaj .txt</span>
					<input
						type="file"
						accept=".txt"
						class="form-control form-control-sm"
						onchange={handleFileSelect}
					/>
				</div>

				

			


			</div>

			<textarea
				style="font-size:18px;font-Family:Lexend"
				class="form-control border border-3 border-danger"
				rows="4"
				placeholder="Zalijepi tekst ovdje ili učitaj fajl..."
				bind:value={inputText}></textarea>
			<div class="row">
				<div class="small  mt-1 col">Rijeci: {words.length}</div>
				<div class="col d-flex justify-content-end">
					<button onclick={() => (inputText = '')} class="btn btn-sm btn-outline-danger mt-2  " 
						>🎯Clear</button
					>
				</div>
			</div>
		</div>

		<div class="d-flex justify-content-center align-items-center gap-2 mb-3 flex-wrap">
			<div class="input-group input-group-sm" style="width: auto;">
				<span class="input-group-text fw-bold">WPM</span>
				<input
					type="number"
					min="50"
					step="10"
					class="form-control fw-bold "
					style="width: 80px;"
					bind:value={wpm}
				/>
			</div>
			<div class="input-group input-group-sm" style="width: auto;">
				<span class="input-group-text fw-bold">Grupa rijeci</span>
				<select class="form-select fw-bold" style="width: 65px;" bind:value={chunkSize}>
					{#each Array.from({ length: 10 }, (_, k) => k + 1) as n}
						<option value={n}>{n}</option>
					{/each}
				</select>
			</div>
			<button
				class="btn btn-warning btn-sm"
				type="button"
				onclick={start}
				disabled={words.length === 0}>▶ Start</button
			>
			<fieldset class="border rounded border border-primary p-2">
    <div class="input-group input-group-sm align-items-center flex-nowrap" style="width: auto;">
        <span class="input-group-text fw-bold">Color</span>
        <input
            bind:value={fontColor.value}
            style="width: 4rem; height: 2.2rem;"
            type="color"
            class="form-control"
        />

        <!-- FONT PICKER SEKCIJA -->
        <div class="d-flex align-items-center ms-2 me-1">
            <span class="fw-bold small me-1">Font</span>
            <div class="font-picker">
                <button
                    type="button"
                    class="btn btn-outline-info btn-sm"
                    onclick={() => (otvoren = !otvoren)}
                    style="font-family: {podesavanja.fontFamily};"
                >
                    <span>{trenutniNaziv}</span>
                    <span class="strelica">▼</span>
                </button>

                {#if otvoren}
                    <div class="dropdown-lista">
                        {#each fontovi as f, i (i)}
                            <div
                                class="font-opcija {podesavanja.fontFamily === f.vrednost ? 'aktivan' : ''}"
                                style="font-family: {f.vrednost};"
                                onclick={() => {
                                    izaberiFont(f);
                                    otvoren = false; /* Zatvara listu nakon izbora */
                                }}
                            >
                                {f.naziv}
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>
        <!-- KRAJ FONT PICKERA -->

        <div class="input-group input-group-sm col-2 ms-1" style="width: auto;">
            <span class="input-group-text fw-bold">FS</span>
            <input
                bind:value={fontSize.value}
                style="width: 4rem;"
                type="number"
                min="10"
                class="form-control fw-bold"
            />
        </div>

        <div class="input-group input-group-sm col-2 ms-1" style="width: auto;">
            <span class="input-group-text fw-bold">BG</span>
            <input bind:value={bg.value} style="width: 4rem; height: 2.2rem;" type="color" class="form-control" />
        </div>

        <div class="input-group input-group-sm col-2 ms-1" style="width: auto;">
            <span class="input-group-text fw-bold">Reset</span>
            <button onclick={resetFont} class="btn btn-primary btn-sm">Reset</button>
        </div>
    </div>
</fieldset>
		</div>
	{:else}
		<div class="text-center mb-2 ">
			<button class="btn btn-danger btn-sm" type="button" onclick={stop}>⏹ Stop</button>
		</div>
		<div class="text-center text-danger mb-2">
			Chunk {currentIndex + 1} / {totalChunks()} — {wpm} wpm, grupa: {chunkSize}
		</div>
	{/if}

	{#if finished}
		<div class="alert alert-success text-center py-2 mb-3">✅ Zavrseno!</div>
		<div class="text-center mb-2">
			<button class="btn btn-outline-secondary btn-sm" type="button" onclick={reset}>Reset</button>
		</div>
	{/if}

	<div class="rsvp-screen border border-3 border-info" style="background-color:{bg.value}">
		<span
			style="color:{fontColor.value};font-size:{fontSize.value}px;font-Family:{podesavanja.fontFamily}"
			class="rsvp-word">{currentDisplay || (running ? '' : '...')}</span
		>
	</div>
</fieldset>

<style>
	.rsvp-screen {
		height: 100px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid #ddd;
		border-radius: 6px;
		background: #fff;
	}
	.rsvp-word {
		font-size: 2rem;
		font-weight: bold;
		color: #212529;
	}
	.font-picker {
        position: relative; 
        display: inline-block;
    }

    /* Padajuća lista prilagođena za sve teme */
    .dropdown-lista {
        position: absolute;
        top: 100%;
        left: 0;
        z-index: 1050;
        background-color: var(--bs-body-bg, #fff); /* Automatski prati Bootstrap pozadinu (crna/bijela) */
        color: var(--bs-body-color, #212529);     /* Automatski prati boju teksta */
        border: 1px solid var(--bs-border-color, #ccc);
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        max-height: 200px;
        overflow-y: auto;
        min-width: 140px;
        margin-top: 4px;
    }

    .font-opcija {
        padding: 8px 12px;
        cursor: pointer;
        white-space: nowrap;
        background-color: transparent;
    }

    /* Hover efekt koji radi i u light i u dark mode-u */
    .font-opcija:hover {
        background-color: var(--bs-tertiary-bg, #e9ecef);
        color: var(--bs-emphasis-color, #000);
    }

    .font-opcija.aktivan {
        background-color: var(--bs-primary, #0d6efd);
        color: #fff !important; /* Kada je aktivan, tekst je obavezno bijel da se vidi */
        font-weight: bold;
    }
	
</style>
