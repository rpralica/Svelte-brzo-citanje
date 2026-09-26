<script>
	/* global Swal */

	// --- Countdown timer ---
	let minutesInput = $state(1);
	let secondsInput = $state(0);
	let remaining = $state(60);
	let countdownRunning = $state(false);
	let countdownIntervalId = null;
	let hasStarted = $state(false); // false = jos nije pokrenut, prikaz prati inpute uzivo

	let {
		marginDebljina = $bindable(),
		changeColor = $bindable(),
		pacerColor = $bindable(),
		paceChunkSize = $bindable()
	} = $props();

	async function resetMargin() {
		const result = await Swal.fire({
			title: 'Resetovati margine?',
			text: 'Vratiti debljinu i boju na podrazumijevane vrijednosti?',
			icon: 'question',
			showCancelButton: true,
			confirmButtonText: 'Da, resetuj',
			cancelButtonText: 'Otkazi'
		});

		if (result.isConfirmed) {
			marginDebljina = 1;
			changeColor = '#46b2e0';

			Swal.fire({
				title: 'Resetovano!',
				icon: 'success',
				timer: 1000,
				showConfirmButton: false
			});
		}
	}

	async function resetPacer() {
		const result = await Swal.fire({
			title: 'Resetovati boju pacera ?',
			text: 'Vratiti  boju na default ?',
			icon: 'question',
			showCancelButton: true,
			confirmButtonText: 'Da, resetuj',
			cancelButtonText: 'Otkazi'
		});

		if (result.isConfirmed) {
			pacerColor = '#0dcaf0';
			paceChunkSize = 2;
			Swal.fire({
				title: 'Resetovano!',
				icon: 'success',
				timer: 1000,
				showConfirmButton: false
			});
		}
	}

	function formatTime(totalSeconds) {
		const m = Math.floor(totalSeconds / 60);
		const s = totalSeconds % 60;
		const mStr = m < 10 ? '0' + m : '' + m;
		const sStr = s < 10 ? '0' + s : '' + s;
		return mStr + ':' + sStr;
	}

	let countdownDisplay = $derived(formatTime(remaining));

	function readCountdownInputs() {
		let m = Number(minutesInput);
		let s = Number(secondsInput);
		if (isNaN(m) || m < 0) m = 1;
		if (isNaN(s) || s < 0) s = 0;
		if (s > 59) s = 59;
		return m * 60 + s;
	}

	// Dok tajmer JOS NIJE pokrenut, prati promjene inputa i azuriraj prikaz odmah.
	// Nakon prvog starta (hasStarted=true) ovo se vise ne aktivira, pa Pauza ne
	// prepisuje "remaining" nazad na vrijednost iz inputa.
	$effect(() => {
		if (!hasStarted) {
			remaining = readCountdownInputs();
		}
	});

	function countdownStart() {
		if (countdownRunning) return;

		// Svjeza vrijednost iz inputa samo ako pokrecemo prvi put ili je isteklo,
		// inace nastavljamo (resume) od tamo gdje je pauzirano.
		if (!hasStarted || remaining <= 0) {
			remaining = readCountdownInputs();
		}
		hasStarted = true;
		countdownRunning = true;
		countdownIntervalId = setInterval(() => {
			if (remaining <= 0) {
				countdownPause();
				Swal.fire('Vrijeme je isteklo!', '', 'info');
				return;
			}
			remaining = remaining - 1;
		}, 1000);
	}

	function countdownPause() {
		countdownRunning = false;
		if (countdownIntervalId !== null) {
			clearInterval(countdownIntervalId);
			countdownIntervalId = null;
		}
	}

	function countdownReset() {
		countdownPause();
		hasStarted = false; // effect ce ponovo sinhronizovati prikaz sa inputima
		remaining = readCountdownInputs();
	}

	// --- Stopwatch ---
	let elapsed = $state(0);
	let stopwatchRunning = $state(false);
	let stopwatchIntervalId = null;

	let stopwatchDisplay = $derived(formatTime(elapsed));

	function stopwatchStart() {
		if (stopwatchRunning) return;
		stopwatchRunning = true;
		stopwatchIntervalId = setInterval(() => {
			elapsed = elapsed + 1;
		}, 1000);
	}

	function stopwatchPause() {
		stopwatchRunning = false;
		if (stopwatchIntervalId !== null) {
			clearInterval(stopwatchIntervalId);
			stopwatchIntervalId = null;
		}
	}

	function stopwatchReset() {
		stopwatchPause();
		elapsed = 0;
	}
</script>

<!-- Uski fiksni sidebar - uvijek vidljiv, brzi pristup tajmerima -->
<div class="quick-timer-strip">
	<div class="qt-block border border-primary">
		<div class="qt-label">Countdown</div>
		<div class="qt-display">{countdownDisplay}</div>
		<div class="qt-buttons">
			<button class="qt-btn" type="button" title="Start" onclick={countdownStart}>▶</button>
			<button class="qt-btn" type="button" title="Pauza" onclick={countdownPause}>⏸</button>
			<button class="qt-btn" type="button" title="Reset" onclick={countdownReset}>↺</button>
		</div>
	</div>

	<div class="qt-block">
		<div class="qt-label">Stoperica</div>
		<div class="qt-display">{stopwatchDisplay}</div>
		<div class="qt-buttons">
			<button class="qt-btn" type="button" title="Start" onclick={stopwatchStart}>▶</button>
			<button class="qt-btn" type="button" title="Pauza" onclick={stopwatchPause}>⏸</button>
			<button class="qt-btn" type="button" title="Reset" onclick={stopwatchReset}>↺</button>
		</div>
	</div>

	<button
		class="qt-btn qt-settings"
		type="button"
		title="Podesavanja"
		data-bs-toggle="offcanvas"
		data-bs-target="#offcanvasScrolling"
		aria-controls="offcanvasScrolling">⚙</button
	>
</div>

<!-- Offcanvas - samo za podesavanje pocetnog vremena countdown-a -->
<div
	class="offcanvas offcanvas-start"
	data-bs-scroll="true"
	data-bs-backdrop="false"
	tabindex="-1"
	id="offcanvasScrolling"
	aria-labelledby="offcanvasScrollingLabel"
>
	<div class="offcanvas-header">
		<h5 class="offcanvas-title" id="offcanvasScrollingLabel">Podesavanja</h5>
		<button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
	</div>
	<div class="offcanvas-body container">
		<fieldset class="border p-3 rounded border border-primary">
			<legend class="px-2 fw-bold text-primary text-center">Countdown</legend>
			<div class="row">
				<div class="col-6">
					<div class="row">
						<div class="col-5">
							<label class="form-label">Minuta</label>
						</div>
						<div class="col-7">
							<input type="number" min="0" class="form-control" bind:value={minutesInput} />
						</div>
					</div>
				</div>

				<div class="col-6">
					<div class="row">
						<div class="col-5">
							<label class="form-label">Sekundi</label>
						</div>
						<div class="col-7">
							<input
								type="number"
								min="0"
								max="59"
								class="form-control"
								bind:value={secondsInput}
							/>
						</div>
					</div>
				</div>
			</div>

			<div class="row mt-3">
				<span class="h3 text-center">{countdownDisplay}</span>
			</div>
		</fieldset>

		<fieldset class="border border-success p-3 rounded mt-2">
			<legend class="text-center fw-bold text-danger">Margine</legend>

			<div class="toolbar-group d-flex align-items-center gap-2">
				<span class="fw-bold small ms-3">Debljina</span>
				<div class="btn-group btn-group-sm" role="group">
					<button
						class="btn btn-outline-danger"
						type="button"
						onclick={() => (marginDebljina = Math.max(1, marginDebljina - 1))}>−</button
					>
					<p class="btn btn-light disabled px-2 fw-bolder">{marginDebljina}</p>
					<button class="btn btn-outline-danger" type="button" onclick={() => (marginDebljina += 1)}
						>+</button
					>
				</div>
			</div>

			<div class="container-fluid">
				<div class="row mt-2">
					<div class="col-2">
						<label class="fw-bold" for="">Color</label>
					</div>
					<div class="col-10">
						<input bind:value={changeColor} type="color" class="w-25 form-control" />
					</div>
				</div>
			</div>
			<div class="container d-flex justify-content-center">
				<button onclick={resetMargin} class="btn btn-sm btn-outline-danger mt-3">Reset</button>
			</div>
		</fieldset>

		<!-- PACER -->

		<fieldset class="border border-danger p-3 rounded mt-2">
			<legend class="text-center fw-bold text-info-emphasis">Pacer</legend>

			<div class="container-fluid">
				<div class="row mt-2">
					<div class="col-2">
						<label class="fw-bold" for="">Color</label>
					</div>
					<div class="col-10">
						<input bind:value={pacerColor} type="color" class="w-25 form-control" />
					</div>
				</div>
				<div class="row">
					<div class="col-2">
						<label for="username" class="form-label fw-bold mt-3">Chunk</label>
					</div>
					<!-- Label vezan preko 'for' atributa za ID inputa -->

					<div class="col-10">
						<input
							type="number"
							id="username"
							min="1"
							class="form-control w-25 fw-bold mt-2"
							bind:value={paceChunkSize}
						/>
					</div>
					<!-- Input sa bindovanim stanjem -->
				</div>
			</div>
			<div class="container d-flex justify-content-center">
				<button onclick={resetPacer} class="btn btn-sm btn-outline-danger mt-3">Reset</button>
			</div>
		</fieldset>
	</div>
</div>

<style>
	.quick-timer-strip {
		position: fixed;
		left: 0;
		top: 70px;
		bottom: 0;
		width: 78px;
		background: #f8f9fa;
		border-right: 1px solid #ddd;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 10px 4px;
		gap: 16px;
		z-index: 1030;
		overflow-y: auto;
	}
	.qt-block {
		width: 100%;
		text-align: center;
	}
	.qt-label {
		font-size: 11px;
		font-weight: bold;
		color: #555;
		margin-bottom: 2px;
	}
	.qt-display {
		font-size: 15px;
		font-weight: bold;
		margin-bottom: 4px;
	}
	.qt-buttons {
		display: flex;
		flex-direction: column;
		gap: 4px;
		align-items: center;
	}
	.qt-btn {
		width: 36px;
		height: 32px;
		border: 1px solid #999;
		border-radius: 4px;
		background: #fff;
		cursor: pointer;
		font-size: 15px;
		line-height: 1;
	}
	.qt-btn:active {
		background: #e0e0e0;
	}
	.qt-settings {
		margin-top: auto;
		width: 40px;
		height: 40px;
		font-size: 18px;
	}

	/* Na malim ekranima (telefon/uski tablet) - traka ide na dno, vodoravno */
	@media (max-width: 768px) {
		.quick-timer-strip {
			left: 0;
			right: 0;
			top: auto;
			bottom: 0;
			width: 100%;
			height: 68px;
			flex-direction: row;
			justify-content: space-evenly;
			align-items: center;
			padding: 4px 6px;
			gap: 10px;
			border-right: none;
			border-top: 1px solid #ddd;
			overflow-x: auto;
			overflow-y: hidden;
		}
		.qt-block {
			width: auto;
		}
		.qt-buttons {
			flex-direction: row;
		}
		.qt-btn {
			width: 32px;
			height: 28px;
			font-size: 13px;
		}
		.qt-settings {
			margin-top: 0;
			width: 36px;
			height: 36px;
			font-size: 16px;
		}
	}
</style>
