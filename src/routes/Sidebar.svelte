<script>
	import {
		podesavanja,
		changeMarginLeft,
		changeMarginRight,
		changeWidth,
		setPaceChunkSize,
		setMarginDebljina,
		setMarginBoja,
		setPacerColor,
		changeFont,
		resetFont,
		MARGIN_STEP,
		WIDTH_STEP,
		resetPacer,
		resetMargin,
		setReaderBack,
		setLineSpacing,
		resetReader,
		setFontFamily
	} from '$lib/functionsHelper/settings.svelte.js';

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

	function izaberiFont(f) {
		setFontFamily(f.vrednost); // Poziva funkciju iz tvog store-a koja upisuje i u localStorage
		otvoren = false;
	}

	// Izvlačimo lepo ime trenutnog fonta za prikaz na dugmetu
	let trenutniNaziv = $derived(
		fontovi.find((f) => f.vrednost === podesavanja.fontFamily)?.naziv || 'Izaberi font'
	);
</script>

<!-- 1. Offcanvas meni (sadržaj podešavanja) -->
<div
	class="offcanvas offcanvas-start"
	data-bs-scroll="true"
	data-bs-backdrop="false"
	tabindex="-1"
	id="offcanvasScrolling"
	aria-labelledby="offcanvasScrollingLabel"
>
	<div class="offcanvas-header">
		<h5 class="offcanvas-title" id="offcanvasScrollingLabel">Podešavanja</h5>
		<button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
	</div>
	<div class="offcanvas-body container">
		<!-- MARGINE -->
		<fieldset class="border border-success p-3 rounded mt-2">
			<legend class="text-center fw-bold text-danger">Margine</legend>

			<div class="d-flex flex-column gap-3">
				<!-- Debljina -->
				<div class="d-flex align-items-center justify-content-between">
					<span class="fw-bold small">Debljina</span>
					<div class="btn-group btn-group-sm" role="group">
						<button
							class="btn btn-outline-danger"
							type="button"
							onclick={() => setMarginDebljina(Math.max(1, podesavanja.marginDebljina - 1))}
							>−</button
						>
						<span class="btn btn-light disabled px-2 fw-bolder mb-0"
							>{podesavanja.marginDebljina}</span
						>
						<button
							class="btn btn-outline-danger"
							type="button"
							onclick={() => setMarginDebljina((podesavanja.marginDebljina += 1))}>+</button
						>
					</div>
				</div>

				<!-- Boja -->
				<div class="d-flex align-items-center justify-content-between">
					<span class="fw-bold small">Color</span>
					<input
						value={podesavanja.marginBoja}
						oninput={(e) => setMarginBoja(e.target.value)}
						type="color"
						class="form-control form-control-color w-50"
					/>
				</div>

				<!-- Širina unutar Margina -->
				<fieldset class="border border-danger p-3 rounded m-0">
					<legend class="h6 fw-bold text-center mb-3">Širina</legend>
					<div class="d-flex flex-column gap-3">
						<!-- Lijeva -->
						<div class="d-flex align-items-center justify-content-between">
							<span class="fw-bold small">Lijeva</span>
							<div class="btn-group btn-group-sm" role="group">
								<button
									class="btn btn-outline-danger"
									type="button"
									onclick={() => changeMarginLeft(-MARGIN_STEP)}>−</button
								>
								<span class="btn btn-light disabled px-2">{podesavanja.marginLeft}%</span>
								<button
									class="btn btn-outline-danger"
									type="button"
									onclick={() => changeMarginLeft(MARGIN_STEP)}>+</button
								>
							</div>
						</div>

						<!-- Desna -->
						<div class="d-flex align-items-center justify-content-between">
							<span class="fw-bold small">Desna</span>
							<div class="btn-group btn-group-sm" role="group">
								<button
									class="btn btn-outline-danger"
									type="button"
									onclick={() => changeMarginRight(-MARGIN_STEP)}>−</button
								>
								<span class="btn btn-light disabled px-2">{podesavanja.marginRight}%</span>
								<button
									class="btn btn-outline-danger"
									type="button"
									onclick={() => changeMarginRight(MARGIN_STEP)}>+</button
								>
							</div>
						</div>
					</div>
				</fieldset>

				<div class="d-flex justify-content-center">
					<button onclick={resetMargin} class="btn btn-sm btn-outline-danger">Reset</button>
				</div>
			</div>
		</fieldset>

		<!-- PACER -->
		<fieldset class="border border-danger p-3 rounded mt-3">
			<legend class="text-center fw-bold h6 text-info-emphasis">Pacer</legend>

			<div class="d-flex flex-column gap-3">
				<!-- Color -->
				<div class="d-flex align-items-center justify-content-between">
					<span class="fw-bold small">Color</span>
					<input
						oninput={(e) => setPacerColor(e.target.value)}
						value={podesavanja.pacerColor}
						type="color"
						class="form-control form-control-color w-50"
					/>
				</div>

				<!-- Chunk -->
				<div class="d-flex align-items-center justify-content-between">
					<span class="fw-bold small">Chunk</span>
					<input
						type="number"
						id="username"
						min="1"
						class="form-control form-control-sm w-50 fw-bold"
						value={podesavanja.paceChunkSize ?? 2}
						onchange={(e) => setPaceChunkSize(Number(e.target.value))}
					/>
				</div>

				<div class="d-flex justify-content-center">
					<button onclick={resetPacer} class="btn btn-sm btn-outline-danger">Reset</button>
				</div>
			</div>
		</fieldset>

		<!-- READER -->
		<fieldset class="border border-primary p-3 rounded mt-3">
			<legend class="text-center h6 fw-bold">Reader</legend>

			<div class="d-flex flex-column gap-3">
				<!-- Font -->
				<div class="d-flex align-items-center justify-content-between">
					<span class="fw-bold small">Font Size</span>
					<div class="btn-group btn-group-sm" role="group">
						<button class="btn btn-outline-success" type="button" onclick={() => changeFont(-1)}
							>A-</button
						>
						<span class="btn btn-light disabled px-2">{podesavanja.fontSize}</span>
						<button class="btn btn-outline-success" type="button" onclick={() => changeFont(1)}
							>A+</button
						>
						<button class="btn btn-outline-success" type="button" onclick={resetFont}>Reset</button>
					</div>
				</div>

				<!-- FONT FAMILLY -->

				<div class="d-flex align-items-center justify-content-between">
					<span class="fw-bold small">Font Family</span>
					<div class="btn-group btn-group-sm" role="group">
						<div class="font-picker">
							<!-- "Dugme" koje glumi input i otvara meni -->
							<button
								type="button"
								class="btn btn-outline-info picker-btn"
								onclick={() => (otvoren = !otvoren)}
								style="font-family: {podesavanja.fontFamily};"
							>
								<span>{trenutniNaziv}</span>
								<span class="strelica">▼</span>
							</button>

							<!-- Padajuća lista sa živim prikazom fontova -->
							{#if otvoren}
								<div class="dropdown-lista">
									{#each fontovi as f, i (i)}
										<div
											class="font-opcija {podesavanja.fontFamily === f.vrednost ? 'aktivan' : ''}"
											style="font-family: {f.vrednost};"
											onclick={() => izaberiFont(f)}
										>
											{f.naziv}
										</div>
									{/each}
								</div>
							{/if}
						</div>
					</div>
				</div>

				<!-- Širina -->
				<div class="d-flex align-items-center justify-content-between">
					<span class="fw-bold small">Širina</span>
					<div class="btn-group btn-group-sm" role="group">
						<button
							class="btn btn-outline-info"
							type="button"
							onclick={() => changeWidth(-WIDTH_STEP)}>−</button
						>
						<span class="btn btn-light disabled px-2">{podesavanja.readerWidthPercent}%</span>
						<button
							class="btn btn-outline-info"
							type="button"
							onclick={() => changeWidth(WIDTH_STEP)}>+</button
						>
					</div>
				</div>

				<div class="d-flex align-items-center justify-content-between">
					<span class="fw-bold small">Line Spacing</span>

					<input
						onchange={(e) => setLineSpacing(Number(e.target.value))}
						value={podesavanja.lineSpacing}
						type="number"
						min="1.2"
						max="2.5"
						step="0.1"
						class="form-control w-25 ms-auto"
					/>
				</div>





				<div class="d-flex align-items-center justify-content-between">
					<span class="fw-bold small">Background</span>
					<div class="btn-group btn-group-sm" role="group">
						<input
							oninput={(e) => setReaderBack(e.target.value)}
							value={podesavanja.readerBack}
							type="color"
							style="width:10rem"
							class="form-control form-control-sm fw-bold"
						/>
					</div>
				</div>

				<div class="d-flex justify-content-center">
					<button class="btn btn-sm btn-outline-danger" type="button" onclick={resetReader}
						>Reset</button
					>
				</div>
			</div>
		</fieldset>
	</div>
</div>
<div class="settings-container-bottom">
    <button
        class="qt-btn qt-settings btn btn-link text-decoration-none p-0 shadow-none"
        type="button"
        title="Podešavanja"
        data-bs-toggle="offcanvas"
        data-bs-target="#offcanvasScrolling"
        aria-controls="offcanvasScrolling">
        <span class="gear-icon">⚙</span>
    </button>
</div>

<style>
	/* Fiksiramo kontejner na dno ekrana (ili možeš prilagoditi poziciju ako imaš sidebar) */

	.settings-container-bottom {
		/* position: fixed; */
		bottom: 20px;
		left: 10px;
		z-index: 1000;
	}

	.qt-settings {
        background: none;
        border: none;
        cursor: pointer;
        display: inline-flex; /* Lakše centriranje sadržaja */
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        padding: 0;
    }

    /* Rotiramo samo unutrašnji span/ikonicu, a ne cijelo dugme! */
    .qt-settings .gear-icon {
        display: inline-block;
        font-size: 3rem;
        transition: transform 0.4s ease;
		margin-left: 2rem;
    }

    .qt-settings:hover .gear-icon {
        transform: rotate(90deg);
    }

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

	.qt-btn {
		width: 36px;
		height: 32px;

		border-radius: 4px;
		cursor: pointer;
		font-size: 15px;
		line-height: 0.2;
		
	}
	
	.qt-settings {
		margin-top: auto;
		width: 40px;
		height: 40px;
		font-size: 38px;
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
