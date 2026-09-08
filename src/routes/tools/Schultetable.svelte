<script>
    let size = $state(5);
    const SIZES = [5, 7, 9];
let rijeci=$state(50);
let min=$state(2);
let sek=$state(0);
let rez=$derived.by(()=>{
    let mints=(min*60 + sek)/60;

if(!rijeci || !min){
    return  0;

}

   return  Math.floor(rijeci/mints);
   });



    function centerIndex(n) {
        // sredina grida u linearnom nizu (0-based)
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

        // brojevi 2..total idu na sva polja osim centra, 1 fiksiran u centru
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
</script>



<div class="container">
    <div class="row">

<div class="col-4">

      <h1>Words per minutes</h1>

<div class="container">
    <div class="row">
        <div class="col-2 ">
<label class=" fw-bold " for="">Riječi</label>
<label class=" fw-bold mt-4" for="">Min</label>
<label class=  "fw-bold mt-4 " for="">Sek</label>
</div>
<div class="col-10">
    
    <input bind:value={rijeci} type="number" class="form-control w-50 mb-2 fw-bold">
    <input bind:value={min} type="number" class="form-control w-50 fw-bold">
    <input bind:value={sek}  type="number" class="form-control w-50 mt-2 fw-bold">
        </div>
      <p class="mt-4"><strong>Rezultat:</strong><span class="fw-bold  offset-1">{rez}</span></p>
    </div>
</div>


      
<div class="container">
    <div class="row">
        <label for=""></label>
    </div>
</div>



</div>

       <div class="col-4">


<h1 class="text-center">Shulte table</h1>

<div class="schulte-wrap">
    <div class="row mb-3">
        <div class="col-auto">
            <div class="btn-group" role="group">
                {#each SIZES as s}
                    <button
                        class="btn {size === s ? 'btn-primary' : 'btn-outline-primary'}"
                        type="button"
                        onclick={() => changeSize(s)}
                    >{s}x{s}</button>
                {/each}
            </div>
        </div>
        <div class="col-auto">
            <button class="btn btn-success" type="button" onclick={shuffle}>Promiješaj</button>
        </div>
    </div>

    <div class="schulte-grid" style="grid-template-columns: repeat({size}, 1fr); max-width: {size * 70}px;">
        {#each grid as num, i}
            <div class="schulte-cell {num === 1 ? 'schulte-center' : ''}">{num}</div>
        {/each}
    </div>
</div>


       </div>
    



<div class="schulte-wrap col-4 mt-0">
  
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
</style>