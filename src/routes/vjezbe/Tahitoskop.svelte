<script>
    /* global Swal */
    let mode = $state('text'); // 'text' | 'numbers' | 'mix'

    let defaultWords =
        'kuća auto stablo plavo vjetar olovka torba staza grad sunce knjiga lampa vrata prozor trag slovo krug put mrak zid';
    let customWordsInput = $state(defaultWords);

    let defaultNumbers = '482 915 370 624 831 105 793 426 589 214 673 358 901 247 536';
    let customNumbersInput = $state(defaultNumbers);

    let displayTime = $state(300); // Vrijeme prikaza u ms
    let wordsCount = $state(1);    // Broj riječi/brojeva u jednom bljesku
    let progressiveMode = $state(false); // Progresivno ubrzavanje
    let randomWait = $state(false);      // Random pauza prije pojave riječi

    let sequenceArray = $state([]);
    let currentIndex = $state(0);
    let currentItem = $state('');
    let targetItem = '';
    let isRunning = $state(false);
    let isPractice = $state(false); // Da li je pokrenut Practice mod

    let userInput = $state('');
    let waitingForInput = $state(false);
    let feedbackResult = $state(null); // 'correct' | 'incorrect' | null
    let inputElement = $state(null);

    // Statistika (samo za takmičarski mod)
    let totalAttempts = $state(0);
    let correctAttempts = $state(0);
    let sessionFinished = $state(false);

    let timerId = null;
    let waitTimerId = null;

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
            let w = customWordsInput.trim().split(/[\s,]+/).filter(Boolean);
            let n = customNumbersInput.trim().split(/[\s,]+/).filter(Boolean);
            let combined = [...w, ...n];
            baseItems = shuffleArray(combined);
        }

        if (baseItems.length === 0) baseItems = ['test', '123', 'abc', '789'];

        let groupedItems = [];
        if (wordsCount <= 1) {
            return baseItems;
        }

        for (let i = 0; i < baseItems.length; i += wordsCount) {
            let chunk = baseItems.slice(i, i + wordsCount);
            groupedItems.push(chunk.join(' '));
        }

        return groupedItems.length > 0 ? groupedItems : baseItems;
    }

    // Pokretanje Takmičarskog moda
    function startTachistoscope() {
        isPractice = false;
        sequenceArray = generateSequence();
        if (sequenceArray.length === 0) return;

        isRunning = true;
        sessionFinished = false;
        totalAttempts = 0;
        correctAttempts = 0;
        currentIndex = 0;
        feedbackResult = null;
        nextFlash();
    }

    // Pokretanje Practice moda
    function startPracticeMode() {
        isPractice = true;
        sequenceArray = generateSequence();
        if (sequenceArray.length === 0) return;

        isRunning = true;
        sessionFinished = false;
        currentIndex = 0;
        feedbackResult = null;
        nextFlash();
    }

    // Glavna logika za flešovanje
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
        currentItem = '';

        let delayBeforeShow = 0;
        if (randomWait) {
            delayBeforeShow = Math.floor(Math.random() * 1100) + 400;
        }

        waitTimerId = setTimeout(() => {
            if (!isRunning) return;
            
            targetItem = sequenceArray[currentIndex];
            currentItem = targetItem;

            timerId = setTimeout(() => {
                currentItem = '';
                waitingForInput = true;

                if (!isPractice) {
                    setTimeout(() => {
                        if (inputElement) inputElement.focus();
                    }, 50);
                }
            }, displayTime);
        }, delayBeforeShow);
    }

    function checkAnswer() {
        if (!waitingForInput) return;

        // Ako je Practice mod, klik na Next prebacuje na iduću stavku
        if (isPractice) {
            waitingForInput = false;
            currentIndex++;
            if (isRunning) {
                nextFlash();
            }
            return;
        }

        // Takmičarski mod provjerava unos
        const cleanTarget = targetItem.toString().trim().toLowerCase();
        const cleanInput = userInput.toString().trim().toLowerCase();

        let isCorrect = (cleanInput === cleanTarget);

        totalAttempts++;
        if (isCorrect) correctAttempts++;
        feedbackResult = isCorrect ? 'correct' : 'incorrect';

        if (isCorrect && progressiveMode) {
            displayTime = Math.max(50, displayTime - 10);
        }

        waitingForInput = false;
        currentIndex++;

        setTimeout(() => {
            if (isRunning) {
                nextFlash();
            }
        }, 1200);
    }

    function repeatCurrent() {
        // Ponovo flešuje TRENUTNU riječ na isti brzinski način (displayTime)
        if (!isPractice || !targetItem || !waitingForInput) return;

        clearTimeout(timerId);
        currentItem = targetItem;

        timerId = setTimeout(() => {
            currentItem = '';
            waitingForInput = true;
        }, displayTime);
    }

    function handleKeydown(e) {
        if (e.key === 'Enter') {
            if (waitingForInput) {
                checkAnswer();
            }
        }
    }

    function stopTachistoscope() {
        isRunning = false;
        sessionFinished = true;
        waitingForInput = false;
        clearTimeout(timerId);
        clearTimeout(waitTimerId);
        currentItem = '';
        userInput = '';
        feedbackResult = null;
    }
</script>

<h1 class="text-center mb-3 shadow-lg rounded">Tachistoscope</h1>
<div class="d-flex justify-content-center ">
<div  class="tachistoscope-wrap p-3 border rounded bg-light overflow-hidden shadow-lg">
    <!-- Podešavanja (prikazuje se kad vježba ne traje) -->
    {#if !isRunning}
        <div class="mb-3 d-flex justify-content-around bg-white p-2 border rounded flex-wrap gap-2 shadow-lg">
            <div class="form-check">
                <input class="form-check-input" type="radio" name="tMode" id="modeText" value="text" bind:group={mode} />
                <label class="form-check-label fw-bold" for="modeText">Tekst</label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="radio" name="tMode" id="modeNumbers" value="numbers" bind:group={mode} />
                <label class="form-check-label fw-bold" for="modeNumbers">Brojevi</label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="radio" name="tMode" id="modeMix" value="mix" bind:group={mode} />
                <label class="form-check-label fw-bold" for="modeMix">Mix</label>
            </div>
        </div>

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

        <!-- Checkboxevi za Random čekanje i Progresivno -->
        <div class="mb-3 d-flex flex-column gap-2 bg-white p-2 border rounded">
            <div class="form-check">
                <input class="form-check-input ms-1" type="checkbox" id="randomWaitCheck" bind:checked={randomWait} />
                <label class="form-check-label small fw-bold ms-2" for="randomWaitCheck">🎲 Random vrijeme iščekivanja (nasumična pauza)</label>
            </div>
            <div class="form-check">
                <input class="form-check-input ms-1" type="checkbox" id="progressiveCheck" bind:checked={progressiveMode} />
                <label class="form-check-label small fw-bold ms-2 text-dark" for="progressiveCheck">⚡ Progresivno ubrzavanje (samo za takmičarski mod)</label>
            </div>
        </div>

        <!-- Slider za brzinu prikaza -->
        <div class="mb-2">
            <label class="form-label small mb-1">Brzina prikaza (ms): <strong>{displayTime}</strong></label>
            <input type="range" class="form-range" min="50" max="600" step="25" bind:value={displayTime} />
        </div>

        <!-- Slider za broj riječi/brojeva -->
        <div class="mb-3">
            <label class="form-label small mb-1">Broj riječi po prikazu: <strong>{wordsCount}</strong></label>
            <input type="range" class="form-range" min="1" max="5" step="1" bind:value={wordsCount} />
        </div>
    {:else}
        <div class="alert alert-secondary py-2 text-center small mb-3">
            Režim: <strong>{isPractice ? '🟢 Practice Mod' : (progressiveMode ? '⚡ Takmičarski (Normalno + Progresivno)' : '🚀 Takmičarski (Normalno)')}</strong> | 
            Tip: <strong>{mode.toUpperCase()}</strong> | Brzina: <strong>{displayTime}ms</strong> | Stavka: {currentIndex + 1} / {sequenceArray.length}
        </div>
    {/if}

    {#if sessionFinished && !isPractice && totalAttempts > 0}
        <div class="alert alert-success text-center py-3 mb-3">
            <h5 class="fw-bold mb-1">🎯 Vježba završena!</h5>
            <p class="mb-1">Tačnost: <strong class="fs-4 text-success">{Math.round((correctAttempts / totalAttempts) * 100)}%</strong></p>
            <small class="text-muted">Tačno {correctAttempts} od {totalAttempts} pokušaja.</small>
        </div>
    {:else if sessionFinished && isPractice}
        <div class="alert alert-info text-center py-3 mb-3">
            <h5 class="fw-bold mb-1">🏁 Practice završen!</h5>
            <small class="text-muted">Uspješno prošao cijeli niz.</small>
        </div>
    {/if}

    <!-- Ekran za flešovanje -->
    <div class="flash-screen mb-3 d-flex flex-column align-items-center justify-content-center text-center p-3 border bg-white rounded shadow-sm position-relative">
        <span class="flash-word">
            {currentItem ||
                (isRunning && !waitingForInput
                    ? '...'
                    : waitingForInput
                        ? (isPractice ? 'Pritisni Next ili Repeat →' : 'Upiši viđeno ispod ↓')
                        : 'Spremno...')}
        </span>

        {#if feedbackResult === 'correct'}
            <div class="position-absolute w-100 h-100 d-flex align-items-center justify-content-center bg-success bg-opacity-75 text-white rounded fs-1 fw-bold animate-fade">
                ✅ Tačno!
            </div>
        {:else if feedbackResult === 'incorrect'}
            <div class="position-absolute w-100 h-100 d-flex align-items-center justify-content-center bg-danger bg-opacity-75 text-white rounded fs-6 fw-bold animate-fade px-2 text-center">
                ❌ Netačno! <span class="ms-1">(Bilo je: {targetItem})</span>
            </div>
        {/if}
    </div>

    <!-- Kontrole za unos ili navigaciju -->
    <div class="input-group mb-3">
        {#if !isPractice}
            <!-- Takmičarski mod ima polje za unos -->
            <input
                bind:this={inputElement}
                type="text"
                class="form-control"
                placeholder={waitingForInput ? 'Upiši viđeno...' : 'Pokreni vježbu...'}
                bind:value={userInput}
                disabled={!waitingForInput}
                autocomplete="off"
                onkeydown={handleKeydown}
            />
        {/if}
        
        <!-- Repeat dugme se prikazuje ISKLJUČIVO u Practice modu i ponavlja trenutnu riječ brzo -->
        {#if isPractice}
            <button
                class="btn btn-outline-secondary fw-bold px-3"
                type="button"
                onclick={repeatCurrent}
                disabled={!waitingForInput}
                title="Ponavljaj trenutačni fleš iste brzine"
            >
                🔄 Repeat
            </button>
        {/if}

        <button
            class="btn {isPractice ? 'btn-primary flex-fill' : 'btn-outline-success'} fw-bold px-4"
            type="button"
            onclick={checkAnswer}
            disabled={!waitingForInput}
        >
            {isPractice ? 'Next →' : 'Check'}
        </button>
    </div>

    <!-- Dugmad za Start / Stop -->
    <div class="d-flex gap-2 justify-content-center flex-wrap">
        {#if !isRunning}
            <button class="btn btn-outline-info text-dark flex-fill py-2 fw-bold" onclick={startTachistoscope}>
                {sessionFinished ? '🚀 Nova igra (Takmičarski)' : '🚀 Start (Takmičarski)'}
            </button>
            <button class="btn btn-outline-warning text-dark flex-fill py-2 fw-bold" onclick={startPracticeMode}>
                {sessionFinished ? '🟢 Nova igra (Practice)' : '🟢 Practice Start'}
            </button>
        {:else}
            <button class="btn btn-danger w-100" onclick={stopTachistoscope}>Završi Vježbu</button>
        {/if}
    </div>
</div>
</div>
<style>
    .flash-screen {
        min-height: 110px;
        background: #ffffff;
        overflow: hidden;
        max-width: 600px;
         margin: 0 auto;
    }
    .flash-word {
        font-size: 1.5rem;
        font-weight: bold;
        color: #212529;
        letter-spacing: 1px;
        word-break: break-word;
        max-width: 600px; 
        margin: 0 auto;
    }
    .tachistoscope-wrap {
    max-width: 1000px;
    width: 100%;
    margin: 0 auto;
}
</style>