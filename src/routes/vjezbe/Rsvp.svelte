<script>
	import { localStore } from '$lib/functionsHelper/myFunctions.svelte';
	import { CRVENKAPICA } from '$lib/tekst_primjeri';
	// --- RSVP vjezba - rijeci (ili grupe rijeci) se smjenjuju na sredini ekrana ---
	let inputText = $state(CRVENKAPICA);
	let words = $derived.by(() => {
		const trimmed = inputText.trim();
		if (trimmed.length === 0) return [];
		return trimmed.split(/\s+/);
	});

	let fontColor = localStore('fontColor', '#000000');
	// let fontColor=$state('#000000');
	let fontSize = localStore('fontSize', 16);
	let bg = localStore('bg', '#FFFFFF');
	let wpm = $state(300);
	let chunkSize = $state(1); // 1 = klasican RSVP (rijec po rijec), vise = grupe rijeci

	let running = $state(false);
	let currentIndex = $state(0); // indeks trenutne grupe (chunk)
	let currentDisplay = $state('');
	let intervalId = null;
	let finished = $state(false);
	function resetFont() {
		bg.value = '#FFFFFF';
		fontSize.value = 16;
		fontColor.value = '#000000';
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

<fieldset class="border p-3 rounded mt-3">
	<legend class="text-center text-success fw-bold fst-italic"
		>RSVP - brzo prepoznavanje rijeci</legend
	>

	{#if !running}
		<div class="mb-3">
			<label class="form-label small fw-bold">Tekst za vjezbu</label>
			<textarea
				class="form-control"
				rows="4"
				placeholder="Zalijepi tekst ovdje..."
				bind:value={inputText}></textarea>
			<div class="row">
				<div class="small text-muted mt-1 col">Rijeci: {words.length}</div>
				<div class="col-1">
					<button onclick={() => (inputText = '')} class="btn btn-sm btn-outline-danger mt-2">🎯Clear</button>
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
					class="form-control fw-bold"
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
			<fieldset class="border rounded border border-primary">
				<div class="input-group input-group-sm" style="width: auto;">
					<span class="input-group-text fw-bold">Color</span>
					<input
						bind:value={fontColor.value}
						style="width: 3rem;"
						type="color"
						class="form-control"
					/>

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
						<input bind:value={bg.value} style="width: 4rem;" type="color" class="form-control" />
					</div>

					<div class="input-group input-group-sm col-2 ms-1" style="width: auto;">
						<span class="input-group-text fw-bold">Reset</span>
						<button onclick={resetFont} class="btn btn-primary">Reset</button>
					</div>
				</div>
			</fieldset>

			<!-- Boja fonta RSVP -->
		</div>
	{:else}
		<div class="text-center mb-2">
			<button class="btn btn-danger btn-sm" type="button" onclick={stop}>⏹ Stop</button>
		</div>
		<div class="text-center info mb-2">
			Chunk {currentIndex + 1} / {totalChunks()} — {wpm} wpm, grupa: {chunkSize}
		</div>
	{/if}

	{#if finished}
		<div class="alert alert-success text-center py-2 mb-3">✅ Zavrseno!</div>
		<div class="text-center mb-2">
			<button class="btn btn-outline-secondary btn-sm" type="button" onclick={reset}>Reset</button>
		</div>
	{/if}

	<div class="rsvp-screen">
		<span
			style="color:{fontColor.value};font-size:{fontSize.value}px;background-color:{bg.value}"
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
	.info {
		font-size: 14px;
		color: #555;
	}
</style>
