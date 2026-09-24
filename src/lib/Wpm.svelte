<script>
  let {  rijeci = $bindable(), min = $bindable(), sec = $bindable() } = $props();

  let wpm = $derived(
    Math.round((Number(rijeci) || 0) / ((Number(min) || 0) + (Number(sec) || 0) / 60))
  );
    

</script>

<!-- Prikazujemo formu samo ako je izabran 'wpm' (ili prilagodi uslov po želji) -->

 <div class="container mt-3">
        <div class="row">
            <div class="col-3">
                <label class="row fw-bold mt-4 text-info" for="">Riječi</label>  
                <label class="row fw-bold mt-4 text-info" for="">Min</label> 
                <label class="row fw-bold mt-4 text-info" for="">Sek</label>
                <label for="" class="row fw-bold mt-4 text-info">Wpm:</label>
            </div>
            <div class="col-9">
                <input
                    bind:value={rijeci}
                    type="number"
                    min="0"
                    step="10"
                    class="form-control w-100 fw-bold mt-2 mb-2"
                />
                <input
                    bind:value={min}
                    min="0"
                    type="number"
                    class="form-control w-100 fw-bold"
                />
                <input
                   bind:value={sec}
                    min="0"
                    max="59"
                    type="number"
                    class="form-control w-100 mt-2 fw-bold"
                />
               
                <hr class="w-100 bg-dark border border-1 border-dark">
               
                <input
                    value={wpm}
                    readonly
                    type="number"
                    class="form-control w-100 fw-bold mt-2 bg-light"
                />
            </div>
        </div>
    </div>
