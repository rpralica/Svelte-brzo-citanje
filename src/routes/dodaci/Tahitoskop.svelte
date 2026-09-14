<script>
    // --- TACHISTOSCOPE (RANDOM / CUSTOM / NUMBERS / MIX) ---
    let mode = $state('text'); // 'text' | 'numbers' | 'mix'

    let defaultWords =
        'kuća auto stablo plavo vjetar olovka torba staza grad sunce knjiga lampa vrata prozor trag slovo krug put mrak zid';
    let customWordsInput = $state(defaultWords);

    let defaultNumbers = '482 915 370 624 831 105 793 426 589 214 673 358 901 247 536';
    let customNumbersInput = $state(defaultNumbers);

    let displayTime = $state(300); // Vrijeme prikaza u ms
    let wordsCount = $state(1);    // Broj riječi/brojeva u jednom bljesku (1 do 5)

    let sequenceArray = $state([]);
    let currentIndex = $state(0);
    let currentItem = $state('');
    let targetItem = '';
    let isRunning = $state(false);

    let userInput = $state('');
    let waitingForInput = $state(false);
    let feedbackResult = $state(null); // 'correct' | 'incorrect' | null
    let inputElement = $state(null);

    // Statistika i ponavljanje
    let totalAttempts = $state(0);
    let correctAttempts = $state(0);
    let sessionFinished = $state(false);
    let isRepeating = $state(false);

    let timerId = null;

    function shuffleArray(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function generateSequence() {
        let baseItems = [];
        if (mode === 'text') {
            let raw = customWordsInput.trim().split(/[\s,]+/);
            baseItems = shuffleArray(raw).filter(Boolean);
        } else if (mode === 'numbers') {
            let raw = customNumbersInput.trim().split(/[\s,]+/);
            baseItems = shuffleArray(raw).filter(Boolean);
        } else if (mode === 'mix') {
            let w = customWordsInput
                .trim()
                .split(/[\s,]+/)
                .filter(Boolean);
            let n = customNumbersInput
                .trim()
                .split(/[\s,]+/)
                .filter(Boolean);
            let combined = [...w, ...n];
            baseItems = shuffleArray(combined);
        }

        if (baseItems.length === 0) baseItems = ['test', '123', 'abc', '789'];

        // Ako je izabrano da se prikazuje više riječi odjednom, pakujemo ih u grupe (blokove)
        let groupedItems = [];
        if (wordsCount <= 1) {
            return baseItems;
        }

        for (let i = 0; i < baseItems.length; i += wordsCount) {
            let chunk = baseItems.slice(i, i + wordsCount);
            // Spajamo ih razmakom u jednu metu
            groupedItems.push(chunk.join(' '));
        }

        return groupedItems.length > 0 ? groupedItems : baseItems;
    }

    function startTachistoscope() {
        sequenceArray = generateSequence();
        if (sequenceArray.length === 0) return;

        isRunning = true;
        sessionFinished = false;
        totalAttempts = 0;
        correctAttempts = 0;
        currentIndex = 0;
        feedbackResult = null;
        isRepeating = false;
        nextFlash();
    }

    function nextFlash() {
        if (currentIndex >= sequenceArray.length) {
            isRunning = false;
            sessionFinished = true;
            currentItem = '';
            waitingForInput = false;
            return;
        }

        feedbackResult = null;
        userInput = '';
        waitingForInput = false;
        isRepeating = false;

        targetItem = sequenceArray[currentIndex];
        currentItem = targetItem;

        timerId = setTimeout(() => {
            currentItem = '';
            waitingForInput = true;

            setTimeout(() => {
                if (inputElement) inputElement.focus();
            }, 50);
        }, displayTime);
    }

    function checkAnswer() {
        if (!waitingForInput && !isRepeating) return;

        const cleanTarget = targetItem.toString().trim().toLowerCase();
        const cleanInput = userInput.toString().trim().toLowerCase();

        if (!isRepeating) {
            totalAttempts++;
            if (cleanInput === cleanTarget) {
                correctAttempts++;
                feedbackResult = 'correct';
            } else {
                feedbackResult = 'incorrect';
            }
        } else {
            if (cleanInput === cleanTarget) {
                feedbackResult = 'correct';
            } else {
                feedbackResult = 'incorrect';
            }
        }

        waitingForInput = false;
        isRepeating = false;
        currentIndex++;

        setTimeout(() => {
            if (isRunning) {
                nextFlash();
            }
        }, 1200);
    }

    function repeatWord() {
        if (!targetItem) return;
        
        isRepeating = true;
        waitingForInput = false;
        feedbackResult = null;
        userInput = '';
        currentItem = targetItem;

        clearTimeout(timerId);
        timerId = setTimeout(() => {
            currentItem = '';
            waitingForInput = true;

            setTimeout(() => {
                if (inputElement) inputElement.focus();
            }, 50);
        }, displayTime);
    }

    function handleKeydown(e) {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    }

    function stopTachistoscope() {
        isRunning = false;
        sessionFinished = true;
        waitingForInput = false;
        clearTimeout(timerId);
        currentItem = '';
        userInput = '';
        feedbackResult = null;
    }
</script>

<h1 class="text-center mb-3">Tachistoscope</h1>

<div class="tachistoscope-wrap p-3 border rounded bg-light">
    <!-- Izbor moda -->
    {#if !isRunning && !sessionFinished}
        <div class="mb-3 d-flex justify-content-around bg-white p-2 border rounded">
            <div class="form-check">
                <input
                    class="form-check-input"
                    type="radio"
                    name="tMode"
                    id="modeText"
                    value="text"
                    bind:group={mode}
                />
                <label class="form-check-label fw-bold" for="modeText">Tekst</label>
            </div>
            <div class="form-check">
                <input
                    class="form-check-input"
                    type="radio"
                    name="tMode"
                    id="modeNumbers"
                    value="numbers"
                    bind:group={mode}
                />
                <label class="form-check-label fw-bold" for="modeNumbers">Brojevi</label>
            </div>
            <div class="form-check">
                <input
                    class="form-check-input"
                    type="radio"
                    name="tMode"
                    id="modeMix"
                    value="mix"
                    bind:group={mode}
                />
                <label class="form-check-label fw-bold" for="modeMix">Mix</label>
            </div>
        </div>

        {#if mode === 'text' || mode === 'mix'}
            <div class="mb-2">
                <label for="custom-words" class="form-label small fw-bold mb-1">Tvoje riječi:</label>
                <textarea
                    id="custom-words"
                    class="form-control form-control-sm"
                    rows="2"
                    bind:value={customWordsInput}></textarea>
            </div>
        {/if}

        {#if mode === 'numbers' || mode === 'mix'}
            <div class="mb-2">
                <label for="custom-numbers" class="form-label small fw-bold mb-1">Tvoji brojevi:</label>
                <textarea
                    id="custom-numbers"
                    class="form-control form-control-sm"
                    rows="2"
                    bind:value={customNumbersInput}></textarea>
            </div>
        {/if}

        <!-- Slider za brzinu prikaza -->
        <div class="mb-2">
            <label class="form-label small mb-1"
                >Brzina prikaza (ms): <strong>{displayTime}</strong></label
            >
            <input
                type="range"
                class="form-range"
                min="100"
                max="600"
                step="25"
                bind:value={displayTime}
            />
        </div>

        <!-- Slider za broj riječi/brojeva u jednom bljesku -->
        <div class="mb-3">
            <label class="form-label small mb-1"
                >Broj riječi po prikazu: <strong>{wordsCount}</strong></label
            >
            <input
                type="range"
                class="form-range"
                min="1"
                max="5"
                step="1"
                bind:value={wordsCount}
            />
        </div>
    {:else if isRunning}
        <div class="alert alert-secondary py-2 text-center small mb-3">
            Vježba u toku... Režim: <strong>{mode.toUpperCase()}</strong> | Brzina:
            <strong>{displayTime}ms</strong> | Riječi po prikazu: <strong>{wordsCount}</strong> | Blok: {currentIndex + 1} / {sequenceArray.length}
        </div>
    {/if}

    {#if sessionFinished && totalAttempts > 0}
        <div class="alert alert-success text-center py-3 mb-3">
            <h5 class="fw-bold mb-1">🎯 Vježba završena!</h5>
            <p class="mb-1">Tačnost: <strong class="fs-4 text-success">{Math.round((correctAttempts / totalAttempts) * 100)}%</strong></p>
            <small class="text-muted">Tačno {correctAttempts} od {totalAttempts} pokušaja.</small>
        </div>
    {/if}

    <!-- Ekran za flešovanje -->
    <div
        class="flash-screen mb-3 d-flex align-items-center justify-content-center text-center p-3 border bg-white rounded shadow-sm position-relative"
    >
        <span class="flash-word">
            {currentItem ||
                (isRunning && !waitingForInput
                    ? '...'
                    : waitingForInput
                        ? 'Upiši viđeno ispod ↓'
                        : 'Spremno...')}
        </span>

        {#if feedbackResult === 'correct'}
            <div
                class="position-absolute w-100 h-100 d-flex align-items-center justify-content-center bg-success bg-opacity-75 text-white rounded fs-1 fw-bold animate-fade"
            >
                ✅ Tačno!
            </div>
        {:else if feedbackResult === 'incorrect'}
            <div
                class="position-absolute w-100 h-100 d-flex align-items-center justify-content-center bg-danger bg-opacity-75 text-white rounded fs-6 fw-bold animate-fade px-2 text-center"
            >
                ❌ Netačno! <span class="ms-1">(Bilo je: {targetItem})</span>
            </div>
        {/if}
    </div>

    <!-- Input polje, Check i Repeat -->
    <div class="input-group mb-3">
        <input
            bind:this={inputElement}
            type="text"
            class="form-control"
            placeholder={waitingForInput || isRepeating ? 'Upiši sve riječi sa razmakom...' : 'Pokreni vježbu...'}
            bind:value={userInput}
            disabled={!waitingForInput && !isRepeating}
            autocomplete="off"
            onkeydown={handleKeydown}
        />
        <button
            class="btn btn-outline-secondary fw-bold px-3"
            type="button"
            onclick={repeatWord}
            disabled={!isRunning || !targetItem}
            title="Prikaži ponovo istu riječ"
        >
            🔄 Repeat
        </button>
        <button
            class="btn btn-outline-success fw-bold px-4"
            type="button"
            onclick={checkAnswer}
            disabled={!waitingForInput && !isRepeating}
        >
            Check
        </button>
    </div>

    <!-- Kontrole -->
    <div class="d-flex gap-2 justify-content-center">
        {#if !isRunning}
            <button class="btn btn-primary w-100" onclick={startTachistoscope}>
                {sessionFinished ? 'Pokreni ponovo' : 'Start Vježbe'}
            </button>
        {:else}
            <button class="btn btn-danger w-100" onclick={stopTachistoscope}>Završi Vježbu</button>
        {/if}
    </div>
</div>

<style>
    .flash-screen {
        height: 100px;
        background: #ffffff;
        overflow: hidden;
    }
    .flash-word {
        font-size: 1.5rem;
        font-weight: bold;
        color: #212529;
        letter-spacing: 1px;
    }
</style>