<script>
	let rijeci = $state(0);
	let min = $state(0);
	let sek = $state(0);
	let rez = $derived.by(() => {
		let mints = (min * 60 + sek) / 60;

		if (!rijeci || mints <= 0) {
			return 0;
		}

		return Math.floor(rijeci / mints);
	});
</script>
<fieldset class="border p-3 rounded mt-3">
<legend class="text-center text-success fw-bold">Words per minut</legend>


<div class="container">
	<div class="row">
		<div class="col-2">
			<label class=" fw-bold" for="">Riječi</label>
			<label class=" fw-bold mt-4" for="">Min</label>
			<label class="fw-bold mt-4" for="">Sek</label>
		</div>
		<div class="col-10">
			<input bind:value={rijeci} type="number" class="form-control w-50 mb-2 fw-bold" />
			<input bind:value={min} type="number" class="form-control w-50 fw-bold" />
			<input bind:value={sek} type="number" class="form-control w-50 mt-2 fw-bold" />
		</div>
		<p class="mt-4"><strong>Rezultat:</strong><span class="fw-bold offset-1">{rez}</span></p>
	</div>
</div>
</fieldset>