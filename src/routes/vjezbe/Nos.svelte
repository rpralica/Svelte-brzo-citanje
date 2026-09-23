<script>

import {localStore} from '$lib/functionsHelper/myFunctions.svelte'

    // --- Vjezba konvergencije - tacka se "priblizava" (raste) pa "udaljava" (smanjuje se) ---
    let velicina = $state(10); // trenutna velicina tacke u px
    let running = $state(false);
    const brzinaMs = localStore('brzinaMs', 2000);
	const pauzaMs = localStore('pauzaMs', 300);
	const brojPonavljanja = localStore('brojPonavljanja', 5);
	let minVelicina = $state(10);
	const maxVelicina = localStore('maxVelicina', 60);

    let trenutniCiklus = $state(0);
    let sequenceId = 0;

    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

   async function runCycle(myId) {
    const steps = [maxVelicina.value, minVelicina];
    for (const step of steps) {
        if (sequenceId !== myId) return;
        velicina = step;
        await delay(brzinaMs.value);   // ✅
        if (sequenceId !== myId) return;
        await delay(pauzaMs.value);    // ✅
    }
}

    async function start() {
        if (running) return;
        running = true;
        trenutniCiklus = 0;
        sequenceId += 1;
        const myId = sequenceId;
        velicina = minVelicina;

        const limit = brojPonavljanja === 'beskonacno' ? Infinity : parseInt(brojPonavljanja.value, 10);

        while (running && sequenceId === myId && trenutniCiklus < limit) {
            await runCycle(myId);
            if (sequenceId !== myId) return;
            trenutniCiklus += 1;
        }

        if (sequenceId === myId) {
            running = false;
            velicina = minVelicina;
        }
    }

    function stop() {
        running = false;
        sequenceId += 1;
        velicina = minVelicina;
    }
</script>

<fieldset class="border p-3 rounded mt-3">
    <legend class="text-center text-success fw-bold fst-italic">Konvergencija - priblizavanje tacke</legend>

    <div class="d-flex justify-content-center align-items-center gap-2 mb-3 flex-wrap">
        <div class="input-group input-group-sm" style="width: auto;">
            <span class="input-group-text">Brzina (ms)</span>
            <input
                type="number"
                min="200"
                step="100"
                class="form-control"
                style="width: 80px;"
                bind:value={brzinaMs.value}
                disabled={running}
            />
        </div>
        <div class="input-group input-group-sm" style="width: auto;">
            <span class="input-group-text">Pauza (ms)</span>
            <input
                type="number"
                min="0"
                step="100"
                class="form-control"
                style="width: 80px;"
                bind:value={pauzaMs.value}
                disabled={running}
            />
        </div>
        <div class="input-group input-group-sm" style="width: auto;">
            <span class="input-group-text">Max velicina (px)</span>
            <select class="form-select" style="width: 90px;" bind:value={maxVelicina.value} disabled={running}>
                <option value={60}>60</option>
                <option value={90}>90</option>
                <option value={120}>120</option>
                <option value={150}>150</option>
                <option value={180}>180</option>
            </select>
        </div>
        <div class="input-group input-group-sm" style="width: auto;">
            <span class="input-group-text">Ponavljanja</span>
            <select class="form-select" style="width: 100px;" bind:value={brojPonavljanja.value} disabled={running}>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="beskonacno">Beskonacno</option>
            </select>
        </div>

        {#if !running}
            <button class="btn btn-warning btn-sm" type="button" onclick={start}>▶ Start</button>
        {:else}
            <button class="btn btn-danger btn-sm" type="button" onclick={stop}>⏹ Stop</button>
        {/if}
    </div>

    {#if running}
        <div class="text-center info mb-2">
            Ciklus: {trenutniCiklus + 1}{brojPonavljanja !== 'beskonacno' ? ' / ' + brojPonavljanja.value : ''}
        </div>
    {/if}

    <div class="converge-track">
        <div
            class="converge-dot"
            style="width: {velicina}px; height: {velicina}px; margin-left: -{velicina / 2}px; margin-top: -{velicina / 2}px; transition-duration: {brzinaMs.value}ms;"
        ></div>
    </div>
</fieldset>

<style>
    .converge-track {
        position: relative;
        height: 220px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }
    .converge-dot {
        position: absolute;
        top: 50%;
        left: 50%;
        border-radius: 50%;
        background: #e0466b;
        transition-property: width, height, margin-left, margin-top;
        transition-timing-function: ease-in-out;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
    }
    .info {
        font-size: 14px;
        color: #555;
    }
</style>