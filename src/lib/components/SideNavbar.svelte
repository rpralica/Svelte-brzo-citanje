<script>
    // --- Countdown timer ---
    let minutesInput = $state(1);
    let secondsInput = $state(0);
    let remaining = $state(60);
    let countdownRunning = $state(false);
    let countdownIntervalId = null;

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

    function countdownStart() {
        if (countdownRunning) return;
        if (remaining <= 0) {
            remaining = readCountdownInputs();
        }
        countdownRunning = true;
        countdownIntervalId = setInterval(() => {
            if (remaining <= 0) {
                countdownPause();
                alert('Vrijeme je isteklo!');
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

<button
    class="btn btn-primary"
    type="button"
    data-bs-toggle="offcanvas"
    data-bs-target="#offcanvasScrolling"
    aria-controls="offcanvasScrolling">Tajmeri</button
>

<div
    class="offcanvas offcanvas-start"
    data-bs-scroll="true"
    data-bs-backdrop="false"
    tabindex="-1"
    id="offcanvasScrolling"
    aria-labelledby="offcanvasScrollingLabel"
>
    <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="offcanvasScrollingLabel">Tajmeri</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body container">
        <fieldset class="border p-3 rounded">
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
                            <input type="number" min="0" max="59" class="form-control" bind:value={secondsInput} />
                        </div>
                    </div>
                </div>
            </div>

            <div class="row mt-3">
                <span class="h3 text-center">{countdownDisplay}</span>
            </div>

            <div class="row mt-2">
                <div class="col d-flex justify-content-center gap-2">
                    <button class="btn btn-success" type="button" onclick={countdownStart}>Start</button>
                    <button class="btn btn-warning" type="button" onclick={countdownPause}>Pauza</button>
                    <button class="btn btn-secondary" type="button" onclick={countdownReset}>Reset</button>
                </div>
            </div>
        </fieldset>

        <fieldset class="border p-3 mt-4 rounded">
            <legend class="px-2 fw-bold text-primary text-center">Štoperica</legend>
            <div class="row">
                <span class="h3 text-center">{stopwatchDisplay}</span>
            </div>

            <div class="row mt-2">
                <div class="col d-flex justify-content-center gap-2">
                    <button class="btn btn-success" type="button" onclick={stopwatchStart}>Start</button>
                    <button class="btn btn-warning" type="button" onclick={stopwatchPause}>Pauza</button>
                    <button class="btn btn-secondary" type="button" onclick={stopwatchReset}>Reset</button>
                </div>
            </div>
        </fieldset>

        <!-- WPM racunanje - dodaces sam kasnije -->
    </div>
</div>