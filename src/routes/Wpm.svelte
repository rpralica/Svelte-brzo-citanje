<script>
    // --- Izvori (State) ---
    let rijeci = $state(30000);
    let wpm = $state(300);

    // --- Izvedene vrijednosti (Derived) ---
    // Ukupno minuta se automatski racuna iz rijeci i wpm-a
    let ukupnoMinuta = $derived(wpm > 0 ? rijeci / wpm : 0);

    // Rastavljamo na ciste minute i sekunde za prikaz
    let min = $derived(Math.floor(ukupnoMinuta));
    let sek = $derived(Math.round((ukupnoMinuta - min) * 60));

    // --- Funkcije za izmjene (mijenjaju iskljucivo izvore) ---
    function rijeciCh(e) {
        rijeci = Number(e.target.value) || 0;
    }

    function wpmCh(e) {
        wpm = Number(e.target.value) || 1; // da sprijecimo dijeljenje s nulom
    }

    // min i sek su $derived (izracunati), pa NE mogu imati bind:value -
    // umjesto toga, kad korisnik promijeni min/sek, preracunamo wpm iz njih.
    function minCh(e) {
        let unijeteMinute = Number(e.target.value) || 0;
        let trenutneSekunde = sek;
        let totalMin = unijeteMinute + trenutneSekunde / 60;
        if (totalMin > 0) {
            wpm = Math.round(rijeci / totalMin);
        }
    }

    function sekCh(e) {
        let unijeteSekunde = Number(e.target.value) || 0;
        let totalMin = min + unijeteSekunde / 60;
        if (totalMin > 0) {
            wpm = Math.round(rijeci / totalMin);
        }
    }

    let rezMinuta = $derived.by(() => {
        let minuta = min % 60;
        return Math.round(minuta)+ ' m';
    });

    let rezSati = $derived.by(() => {
        if (min < 60) {
            return 0;
        }
        let sati = Math.floor(min / 60);
        return sati + ' h';
    });
</script>

<fieldset class="border p-3 rounded mt-3">
    <legend class="text-center text-success fw-bold fst-italic">Words per minut</legend>

    <div class="container">
        <div class="row">
            <div class="col-3">
                <label class=" fw-bold text-info" for="">Riječi</label>
                <label class=" fw-bold mt-4 text-info" for="">Min</label> <br />
                <label class="fw-bold mt-4 text-info" for="">Sek</label>
                <label class="fw-bold mt-4 text-info" for="">Wpm</label>
                <label for="" class="fw-bold mt-4 text-info">Vrijeme:</label>
            </div>
            <div class="col-9">
                <input
                    bind:value={rijeci}
                    oninput={rijeciCh}
                    onchange={rijeciCh}
                    type="number"
                    class="form-control w-50 mb-2 fw-bold"
                />
                <input
                    value={min}
                    oninput={minCh}
                    onchange={minCh}
                    type="number"
                    class="form-control w-50 fw-bold"
                />
                <input
                    value={sek}
                    oninput={sekCh}
                    onchange={sekCh}
                    type="number"
                    class="form-control w-50 mt-2 fw-bold"
                />
                <input
                    bind:value={wpm}
                    oninput={wpmCh}
                    onchange={wpmCh}
                    type="number"
                    class="form-control w-50 fw-bold mt-2"
                />

                <div class="row">
                    <input
                        value={rezSati}
                        placeholder="Sati"
                        readonly
                        type="text"
                        class="form-control w-25 fw-bold mt-2 ms-2"
                    />
                    <input
                        value={rezMinuta}
                        type="text"
                        placeholder="Minuta"
                        readonly
                        class="form-control w-25 fw-bold mt-2 ms-1"
                    />
                </div>
            </div>
        </div>
    </div>
</fieldset>