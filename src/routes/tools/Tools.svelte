<script>
    // --- SCHULTE TABLE LOGIK ---
    let size = $state(5);
    const SIZES = [5, 7, 9];

    function centerIndex(n) {
        const mid = Math.floor(n / 2);
        return mid * n + mid;
    }

    function shuffleArray(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function buildGrid(n) {
        const total = n * n;
        const mid = centerIndex(n);

        const rest = [];
        for (let num = 2; num <= total; num++) rest.push(num);
        const shuffled = shuffleArray(rest);

        const grid = new Array(total);
        let ri = 0;
        for (let i = 0; i < total; i++) {
            if (i === mid) {
                grid[i] = 1;
            } else {
                grid[i] = shuffled[ri];
                ri++;
            }
        }
        return grid;
    }

    let grid = $state(buildGrid(size));

    function changeSize(n) {
        size = n;
        grid = buildGrid(size);
    }

    function shuffle() {
        grid = buildGrid(size);
    }

    // --- TACHISTOSCOPE (RANDOM / CUSTOM / NUMBERS / MIX) ---
    let mode = $state("text"); // 'text' | 'numbers' | 'mix'
    
    let defaultWords = "kuća auto stablo plavo vjetar olovka torba staza grad sunce knjiga lampa vrata prozor trag slovo krug put mrak zid";
    let customWordsInput = $state(defaultWords);

    let defaultNumbers = "482 915 370 624 831 105 793 426 589 214 673 358 901 247 536";
    let customNumbersInput = $state(defaultNumbers);

    let displayTime = $state(300); // Vrijeme prikaza u ms

    let sequenceArray = $state([]);
    let currentIndex = $state(0);
    let currentItem = $state("");
    let targetItem = "";
    let isRunning = $state(false);
    
    let userInput = $state("");
    let waitingForInput = $state(false);
    let feedbackResult = $state(null); // 'correct' | 'incorrect' | null
    let inputElement = $state(null);

    let timerId = null;

    function generateSequence() {
        let items = [];
        if (mode === 'text') {
            let raw = customWordsInput.trim().split(/[\s,]+/);
            items = shuffleArray(raw).filter(Boolean);
        } else if (mode === 'numbers') {
            let raw = customNumbersInput.trim().split(/[\s,]+/);
            items = shuffleArray(raw).filter(Boolean);
        } else if (mode === 'mix') {
            let w = customWordsInput.trim().split(/[\s,]+/).filter(Boolean);
            let n = customNumbersInput.trim().split(/[\s,]+/).filter(Boolean);
            let combined = [...w, ...n];
            items = shuffleArray(combined);
        }
        return items.length > 0 ? items : ["test", "123", "abc", "789"];
    }

    function startTachistoscope() {
        sequenceArray = generateSequence();
        if (sequenceArray.length === 0) return;
        
        isRunning = true;
        currentIndex = 0;
        feedbackResult = null;
        nextFlash();
    }

    function nextFlash() {
        if (currentIndex >= sequenceArray.length) {
            sequenceArray = shuffleArray(sequenceArray);
            currentIndex = 0;
        }

        feedbackResult = null;
        userInput = "";
        waitingForInput = false;

        targetItem = sequenceArray[currentIndex];
        currentItem = targetItem; 

        timerId = setTimeout(() => {
            currentItem = ""; 
            waitingForInput = true;
            
            setTimeout(() => {
                if (inputElement) inputElement.focus();
            }, 50);

        }, displayTime);
    }

    function checkAnswer() {
        if (!waitingForInput) return;

        const cleanTarget = targetItem.toString().trim().toLowerCase();
        const cleanInput = userInput.toString().trim().toLowerCase();

        if (cleanInput === cleanTarget) {
            feedbackResult = 'correct';
        } else {
            feedbackResult = 'incorrect';
        }

        waitingForInput = false;
        currentIndex++;

        setTimeout(() => {
            if (isRunning) {
                nextFlash();
            }
        }, 1200);
    }

    function handleKeydown(e) {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    }

    function stopTachistoscope() {
        isRunning = false;
        waitingForInput = false;
        clearTimeout(timerId);
        currentItem = "";
        userInput = "";
        feedbackResult = null;
        currentIndex = 0;
    }
</script>

<div class="container my-4">
    <div class="row">
        <div class="container">
            <div class="row">
                <!-- LIJEVA KOLONA: Schulte tabele -->
                <div class="col-7">
                    <h1 class="text-center mb-3">Shulte table</h1>

                    <div class="schulte-wrap">
                        <div class="row mb-3">
                            <div class="col-auto">
                                <div class="btn-group" role="group">
                                    {#each SIZES as s, i (i)}
                                        <button
                                            class="btn {size === s ? 'btn-primary' : 'btn-outline-primary'}"
                                            type="button"
                                            onclick={() => changeSize(s)}>{s}x{s}</button
                                        >
                                    {/each}
                                </div>
                            </div>
                            <div class="col-auto">
                                <button class="btn btn-success" type="button" onclick={shuffle}>Promiješaj</button>
                            </div>
                        </div>

                        <div
                            class="schulte-grid"
                            style="grid-template-columns: repeat({size}, 1fr); max-width: {size * 70}px;"
                        >
                            {#each grid as num, i (i)}
                                <div class="schulte-cell {num === 1 ? 'schulte-center' : ''}">{num}</div>
                            {/each}
                        </div>
                    </div>
                </div>

                <!-- DESNA KOLONA: Tachistoscope -->
                <div class="col-5">
                    <h1 class="text-center mb-3">Tachistoscope</h1>

                    <div class="tachistoscope-wrap p-3 border rounded bg-light">
                        
                        <!-- Izbor moda (Samo kad test NIJE pokrenut) -->
                        {#if !isRunning}
                            <div class="mb-3 d-flex justify-content-around bg-white p-2 border rounded">
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="tMode" id="modeText" value="text" bind:group={mode}>
                                    <label class="form-check-label fw-bold" for="modeText">Tekst</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="tMode" id="modeNumbers" value="numbers" bind:group={mode}>
                                    <label class="form-check-label fw-bold" for="modeNumbers">Brojevi</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="tMode" id="modeMix" value="mix" bind:group={mode}>
                                    <label class="form-check-label fw-bold" for="modeMix">Mix</label>
                                </div>
                            </div>

                            <!-- Custom unosi (Samo kad test NIJE pokrenut) -->
                            {#if mode === 'text' || mode === 'mix'}
                                <div class="mb-2">
                                    <label for="custom-words" class="form-label small fw-bold mb-1">Tvoje riječi:</label>
                                    <textarea id="custom-words" class="form-control form-control-sm" rows="2" bind:value={customWordsInput}></textarea>
                                </div>
                            {/if}

                            {#if mode === 'numbers' || mode === 'mix'}
                                <div class="mb-2">
                                    <label for="custom-numbers" class="form-label small fw-bold mb-1">Tvoji brojevi:</label>
                                    <textarea id="custom-numbers" class="form-control form-control-sm" rows="2" bind:value={customNumbersInput}></textarea>
                                </div>
                            {/if}

                            <div class="mb-3">
                                <label class="form-label small mb-1">Brzina prikaza (ms): <strong>{displayTime}</strong></label>
                                <input type="range" class="form-range" min="100" max="600" step="25" bind:value={displayTime}>
                            </div>
                        {:else}
                            <!-- Info dok je test aktivan -->
                            <div class="alert alert-secondary py-2 text-center small mb-3">
                                Vježba u toku... Režim: <strong>{mode.toUpperCase()}</strong> | Brzina: <strong>{displayTime}ms</strong>
                            </div>
                        {/if}

                        <!-- Ekran za flešovanje -->
                        <div class="flash-screen mb-3 d-flex align-items-center justify-content-center text-center p-3 border bg-white rounded shadow-sm position-relative">
                            <span class="flash-word">
                                {currentItem || (isRunning && !waitingForInput ? "..." : (waitingForInput ? "Upiši viđeno ispod ↓" : "Spremno..."))}
                            </span>

                            {#if feedbackResult === 'correct'}
                                <div class="position-absolute w-100 h-100 d-flex align-items-center justify-content-center bg-success bg-opacity-75 text-white rounded fs-1 fw-bold animate-fade">
                                    ✅ Tačno!
                                </div>
                            {:else if feedbackResult === 'incorrect'}
                                <div class="position-absolute w-100 h-100 d-flex align-items-center justify-content-center bg-danger bg-opacity-75 text-white rounded fs-1 fw-bold animate-fade">
                                    ❌ Netačno! <span class="fs-6 ms-2">(Bilo je: {targetItem})</span>
                                </div>
                            {/if}
                        </div>

                        <!-- Input polje i Check dugme -->
                        <div class="input-group mb-3">
                            <input 
                                bind:this={inputElement}
                                type="text" 
                                class="form-control" 
                                placeholder={waitingForInput ? "Upiši ovdje..." : "Pokreni vježbu..."} 
                                bind:value={userInput}
                                disabled={!waitingForInput}
                                autocomplete="off"
                                onkeydown={handleKeydown}
                            >
                            <button 
                                class="btn btn-outline-success fw-bold" 
                                type="button" 
                                onclick={checkAnswer}
                                disabled={!waitingForInput}
                            >
                                Check
                            </button>
                        </div>

                        <!-- Kontrole -->
                        <div class="d-flex gap-2 justify-content-center">
                            {#if !isRunning}
                                <button class="btn btn-primary w-100" onclick={startTachistoscope}>Start Vježbe</button>
                            {:else}
                                <button class="btn btn-danger w-100" onclick={stopTachistoscope}>Završi Vježbu</button>
                            {/if}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</div>

<style>
    .schulte-grid {
        display: grid;
        gap: 4px;
    }
    .schulte-cell {
        aspect-ratio: 1 / 1;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1.4rem;
        font-weight: bold;
        background: #f8f9fa;
        user-select: none;
    }
    .schulte-center {
        background: #ffe066;
        border-color: #f5c518;
    }

    .flash-screen {
        height: 100px;
        background: #ffffff;
        overflow: hidden;
    }
    .flash-word {
        font-size: 1.8rem;
        font-weight: bold;
        color: #212529;
        letter-spacing: 1px;
    }
</style>