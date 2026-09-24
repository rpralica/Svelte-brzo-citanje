10<script>
  let { rijeci = $bindable(), wpm = $bindable() } = $props();

  // Računamo ukupne minute kao decimalni broj, pa ih dijelimo na cijele minute i sekunde
  let ukupnoMinuta = $derived(
    (Number(rijeci) || 0) / (Number(wpm) || 1)
  );

  let minute = $derived(
    Math.floor(ukupnoMinuta)
  );

  let sekunde = $derived(
    Math.round((ukupnoMinuta - minute) * 60)
  );
</script>

<div class="container mt-3">
    <div class="row">
        <div class="col-3">
            <label class="row fw-bold mt-4 text-info" for="">Riječi</label>  
            <label class="row fw-bold mt-4 text-info" for="">Wpm</label> 
            <label for="" class="row fw-bold mt-5 text-info">Vrijeme:</label>
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
                bind:value={wpm}
                type="number"
                min="0"
                step="10"
                class="form-control w-100 fw-bold mt-2 bg-light"
            />
            
            <hr class="w-100 bg-dark border border-1 border-dark">

            <div class="row g-2 align-items-center">
               
                    <div class="input-group w-50">
                        <input
                            value={minute}
                            readonly
                            type="number"
                            class="form-control fw-bold"
                        />
                        <span class="input-group-text">min</span>
                    </div>
             
                
                    <div class="input-group w-50">
                        <input
                            value={sekunde}
                            readonly
                            type="number"
                            class="form-control fw-bold"
                        />
                        <span class="input-group-text">sec</span>
                    </div>
                
            </div>
        </div>
    </div>
</div>