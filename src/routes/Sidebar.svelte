<script>
	/* global Swal */
import { podesavanja, changeMarginLeft, changeMarginRight,changeWidth,setPaceChunkSize,setMarginDebljina,setMarginBoja,setPacerColor,changeFont,resetFont, MARGIN_STEP,WIDTH_STEP,resetPacer,resetMargin } from '$lib/functionsHelper/settings.svelte.js';

	// let { pacerColor = $bindable(), paceChunkSize = $bindable() } = $props();

	

	// Dok tajmer JOS NIJE pokrenut, prati promjene inputa i azuriraj prikaz odmah.
	// Nakon prvog starta (hasStarted=true) ovo se vise ne aktivira, pa Pauza ne
	// prepisuje "remaining" nazad na vrijednost iz inputa.
</script>

<!-- Uski fiksni sidebar - uvijek vidljiv, brzi pristup tajmerima -->

<!-- Offcanvas - samo za podesavanje pocetnog vremena countdown-a -->
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
        <h5 class="offcanvas-title" id="offcanvasScrollingLabel">Podesavanja</h5>
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
                            onclick={() => setMarginDebljina(Math.max(1, podesavanja.marginDebljina - 1))}>−</button
                        >
                        <span class="btn btn-light disabled px-2 fw-bolder mb-0">{podesavanja.marginDebljina}</span>
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
                    <span class="fw-bold small">Font</span>
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-success" type="button" onclick={() => changeFont(-1)}>A-</button>
                        <span class="btn btn-light disabled px-2">{podesavanja.fontSize}</span>
                        <button class="btn btn-outline-success" type="button" onclick={() => changeFont(1)}>A+</button>
                        <button class="btn btn-outline-success" type="button" onclick={resetFont}>Reset</button>
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
            </div>
        </fieldset>

    </div>
</div>



<style>
	/* Fiksiramo kontejner na dno ekrana (ili možeš prilagoditi poziciju ako imaš sidebar) */
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
		.qt-settings:hover {
			transform: rotate(90deg);
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
