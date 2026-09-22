<script>
    // --- Vjezba zagrijavanja - tacka ide sredina -> lijevo -> sredina -> desno -> sredina ---
    let position = $state(0); // -1 = krajnje lijevo, 0 = sredina, 1 = krajnje desno
    let running = $state(false);
    let brzinaMs = $state(1500); // koliko traje jedan pokret (npr. sredina->lijevo)
    let pauzaMs = $state(300); // kratka pauza na svakoj tacki prije sljedeceg pokreta
    let amplituda = $state(50); // koliko daleko ide lijevo/desno (% od sredine)
    let brojPonavljanja = $state('10'); // string zbog select-a (i "beskonacno" opcije)

    let trenutniCiklus = $state(0);

    let sequenceId = 0; // koristimo da prekinemo "stari" ciklus kad se klikne Stop

    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function runCycle(myId) {
        // Jedan puni krug: sredina -> lijevo -> sredina -> desno -> sredina
        const steps = [-1, 0, 1, 0];
        for (const step of steps) {
            if (sequenceId !== myId) return;
            position = step;
            await delay(brzinaMs);
            if (sequenceId !== myId) return;
            await delay(pauzaMs);
        }
    }

    async function start() {
        if (running) return;
        running = true;
        trenutniCiklus = 0;
        sequenceId += 1;
        const myId = sequenceId;

        const limit = brojPonavljanja === 'beskonacno' ? Infinity : parseInt(brojPonavljanja, 10);

        while (running && sequenceId === myId && trenutniCiklus < limit) {
            await runCycle(myId);
            if (sequenceId !== myId) return;
            trenutniCiklus += 1;
        }

        if (sequenceId === myId) {
            // Zavrsilo se samo od sebe (dostignut broj ponavljanja)
            running = false;
            position = 0;
        }
    }

    function stop() {
        running = false;
        sequenceId += 1; // ponisti trenutni ciklus
        position = 0;
    }
</script>

<fieldset class="border p-3 rounded mt-3">
    <legend class="text-center text-success fw-bold fst-italic">Zagrijavanje - pokreti oka</legend>

    <div class="d-flex justify-content-center align-items-center gap-2 mb-3 flex-wrap">
        <div class="input-group input-group-sm" style="width: auto;">
            <span class="input-group-text">Brzina (ms)</span>
            <input
                type="number"
                min="200"
                step="100"
                class="form-control"
                style="width: 80px;"
                bind:value={brzinaMs}
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
                bind:value={pauzaMs}
                disabled={running}
            />
        </div>
        <div class="input-group input-group-sm" style="width: auto;">
            <span class="input-group-text">Dokle ide</span>
            <select class="form-select" style="width: 90px;" bind:value={amplituda} disabled={running}>
                <option value={20}>20%</option>
                <option value={30}>30%</option>
                <option value={40}>40%</option>
                <option value={50}>50%</option>
                
               
            </select>
        </div>
        <div class="input-group input-group-sm" style="width: auto;">
            <span class="input-group-text">Ponavljanja</span>
            <select class="form-select" style="width: 100px;" bind:value={brojPonavljanja} disabled={running}>
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
            Ciklus: {trenutniCiklus + 1}{brojPonavljanja !== 'beskonacno' ? ' / ' + brojPonavljanja : ''}
        </div>
    {/if}

    <div class="eye-track">
        <div class="eye-line"></div>
          <div class="fixation-point"></div>
        <div
            class="eye-dot"
            style="left: calc(50% + {position * amplituda}% - 15px); transition-duration: {brzinaMs}ms;"
        ></div>
    </div>
</fieldset>

<style>
    .eye-track {
    position: relative;
    height: 60px;
    width: 100%;
    overflow: hidden;
}
    .eye-line {
        position: absolute;
        top: 50%;
        left: 5%;
        right: 5%;
        height: 2px;
        background: #ddd;
        transform: translateY(-50%);
    }
    .eye-dot {
        position: absolute;
        top: 50%;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: #46b2e0;
        transform: translateY(-50%);
        transition-property: left;
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
        background: #110e0b;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        z-index: 1;
    }
</style>