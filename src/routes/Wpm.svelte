<script>
	// let rijeci = $state(0);
	// let min = $state(0);
	// let sek = $state(0);
	// let rez = $derived.by(() => {
	// 	let mints = (min * 60 + sek) / 60;

	// 	if (!rijeci || mints <= 0) {
	// 		return 0;
	// 	}

	// 	return Math.floor(rijeci / mints);
	// });

// --- Izvori (State) ---
    let rijeci = $state(30000);
    let wpm = $state(300);

    // --- Izvedene vrijednosti (Derived) ---
    // Ukupno minuta se automatski računa iz riječi i wpm-a
    let ukupnoMinuta = $derived(wpm > 0 ? rijeci / wpm : 0);
    
    // Rastavljamo na čiste minute i sekunde za prikaz
    let min = $derived(Math.floor(ukupnoMinuta));
    let sek = $derived(Math.round((ukupnoMinuta - min) * 60));

    // --- Funkcije za izmjene (mijenjaju isključivo izvore) ---
    function rijeciCh(e) {
        rijeci = Number(e.target.value) || 0;
    }

    function wpmCh(e) {
        wpm = Number(e.target.value) || 1; // da spriječimo dijeljenje s nulom
    }

    // Ako želiš da korisnik može direktno mijenjati i minute/sekunde pa da se WPM prilagodi:
    function minCh(e) {
        let unijeteMinute = Number(e.target.value) || 0;
        let trenutneSekunde = sek;
        let totalMin = unijeteMinute + (trenutneSekunde / 60);
        if (totalMin > 0) {
            wpm = Math.round(rijeci / totalMin);
        }
    }
  







</script>
<fieldset class="border p-3 rounded mt-3">
<legend class="text-center text-success fw-bold fst-italic">Words per minut</legend>


<div class="container">
	<div class="row">
		<div class="col-2">
			<label class=" fw-bold text-info" for="">Riječi</label>
			<label class=" fw-bold mt-4 text-info" for="">Min</label>
			<label class="fw-bold mt-4 text-info" for="">Sek</label>
			<label class="fw-bold mt-4 text-info" for="">Wpm</label>
		</div>
		<div class="col-10">
			<input bind:value={rijeci} oninput={rijeciCh} onchange={rijeciCh} type="number" class="form-control w-50 mb-2 fw-bold" />
			<input bind:value={min} oninput={minCh} onchange={minCh}  type="number" class="form-control w-50 fw-bold" />
			<input bind:value={sek}  type="number" class="form-control w-50 mt-2 fw-bold" />
			<input bind:value={wpm} oninput={wpmCh} onchange={wpmCh}  type="number" class="form-control w-50 fw-bold mt-2" />
		</div>
		
	</div>
</div>
</fieldset>