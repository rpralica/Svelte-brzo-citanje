<script>

import {localStore} from '$lib/functionsHelper/myFunctions.svelte'
    // --- Vjezba zagrijavanja - tacka ide sredina -> gore -> sredina -> dolje -> sredina ---
    let position = $state(0); // -1 = gore, 0 = sredina, 1 = dolje
    let running = $state(false);
    const brzinaMs = localStore('brzinaMs', 1500);
	const pauzaMs = localStore('pauzaMs', 300);
	const amplituda = localStore('amplituda', 50);
	const brojPonavljanja = localStore('brojPonavljanja', 5);
      const bojaKrugaVert = localStore('bojaKrugaVert', '#46b2e0');
      const bojaTackeVert = localStore('bojaTackeVert', '#000000');
let scrCenter=$state(null);

    let trenutniCiklus = $state(0);
    let sequenceId = 0;

    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function runCycle(myId) {
        const steps = [-1, 0, 1, 0];
        for (const step of steps) {
            if (sequenceId !== myId) return;
            position = step;
            await delay(brzinaMs.value);
            if (sequenceId !== myId) return;
            await delay(pauzaMs.value);
        }
    }

    async function start() {
        window.scrollTo(0, document.body.scrollHeight);
       
        if (running) return;
        running = true;
        trenutniCiklus = 0;
        sequenceId += 1;
        const myId = sequenceId;

        const limit = brojPonavljanja === 'beskonacno' ? Infinity : parseInt(brojPonavljanja.value, 10);

        while (running && sequenceId === myId && trenutniCiklus < limit) {
            await runCycle(myId);
            if (sequenceId !== myId) return;
            trenutniCiklus += 1;
        }

        if (sequenceId === myId) {
            running = false;
            position = 0;
        }
    }

    function stop() {
        running = false;
        sequenceId += 1;
        position = 0;
    }
</script>

<fieldset  bind:this={scrCenter} class="border p-3 rounded mt-3 shadow-lg">
    <legend class="text-center text-success fw-bold fst-italic">Zagrijavanje - pokreti oka (vertikalno)</legend>

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
            <span class="input-group-text">Dokle ide</span>
            <select class="form-select" style="width: 90px;" bind:value={amplituda.value} disabled={running}>
                <option value={20}>20%</option>
                <option value={30}>30%</option>
                <option value={40}>40%</option>
                <option value={50}>50%</option>
               
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

<div class="input-group input-group-sm" style="width: auto;">
 <span   class="input-group-text">Boja kruga</span>
    <input style="width: 3rem;height: 1.9rem;" type="color" bind:value={bojaKrugaVert.value} class="form-control">
</div>
<div class="input-group input-group-sm" style="width: auto;">
 <span  class="input-group-text">Boja tačke</span>
    <input style="width: 3rem;height: 1.9rem;" bind:value={bojaTackeVert.value}  type="color" class="form-control">
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

    <div class="eye-track-v">
        <div class="eye-line-v"></div>
        <div style="background: {bojaTackeVert.value};" class="fixation-point"></div>
        <div
            class="eye-dot-v"
            style="top: calc(50% + {position * amplituda.value}% - 15px); transition-duration: {brzinaMs.value}ms;background: {bojaKrugaVert.value}"
        ></div>
    </div>
</fieldset>

<style>
    .eye-track-v {
        position: relative;
        height: 520px;
        width: 100%;
    }
    .eye-line-v {
        position: absolute;
        left: 50%;
        top: 1%;
        bottom: 1%;
        width: 2px;
        background: #ddd;
        transform: translateX(-50%);
    }
    .eye-dot-v {
        position: absolute;
        left: 50%;
        width: 30px;
        height: 30px;
        border-radius: 50%;
       
        transform: translateX(-50%);
        transition-property: top;
        transition-timing-function: ease-in-out;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
    }
    .info {
        font-size: 14px;
        color: #555;
    }
    .fixation-point {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 10px;
    height: 10px;
    border-radius: 50%;
  
    transform: translate(-50%, -50%);
    z-index: 1;
}
</style>