<script>
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

    // Dok tajmer ne radi, prati promjene inputa i azuriraj remaining odmah
    $effect(() => {
        if (!countdownRunning) {
            remaining = readCountdownInputs();
        }
    });

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

<div class="container">
    <!-- d-flex i align-items-stretch osiguravaju da su stupci u redu uvijek jednake visine -->
    <div class="row align-items-stretch">
        
        <!-- COUNTDOWN -->
        <div class="col-6 mb-3">
            <!-- h-100 rasteže fieldset na punu visinu stupca -->
            <fieldset class="border p-3 rounded h-100">
                <legend class="px-2 fw-bold text-primary text-center">Countdown</legend>
                <div class="row">
                    <div class="col-6">
                        <div class="row align-items-center">
                            <div class="col-5">
                                <label class="form-label mb-0">Minuta</label>
                            </div>
                            <div class="col-7">
                                <input type="number" min="0" class="form-control" bind:value={minutesInput} />
                            </div>
                        </div>
                    </div>

                    <div class="col-6">
                        <div class="row align-items-center">
                            <div class="col-5">
                                <label class="form-label mb-0">Sekundi</label>
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
        </div>

        <!-- ŠTOPERICA -->
        <div class="col-6 mb-3">
            <!-- Uklonjen style="height:26rem" i mt-4, dodana klasa h-100 -->
            <fieldset class="border p-3 rounded h-100 d-flex flex-column justify-content-between">
                <legend class="px-2 fw-bold text-primary text-center">Štoperica</legend>
                
                <!-- Ovaj dio drži prikaz vremena centriranim unutar preostalog prostora -->
                <div class="row my-auto">
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
        </div>

    </div>
</div>



        