<script>
  import Rijeci from "./Rijeci.svelte";
  import Vrijeme from "./Vrijeme.svelte";
  import Wpm from "./Wpm.svelte";

  let selWpm = $state('wpm');
  let wpm = $state(0);
  let min = $state(0);
  let rijeci=$state(0);
  let sec = $state(0);
  let minute = $state(0);
  let sekunde = $state(0);

</script>

<fieldset class="border container p-3 rounded mt-3">
 
<legend class="text-center text-success fw-bold fst-italic">
    {selWpm === 'rijeci' ? 'Riječi' : selWpm === 'wpm' ? 'Wpm' : 'Vrijeme'}
</legend>
    <div class="container mt-3">
        <div class="row">
            <div class="col-12">
                <select bind:value={selWpm} class="form-select form-select-lg mb-3 w-100 d-flex mx-auto" aria-label="Large select example">
                  <option value="wpm">Wpm</option>
                  <option value="rijeci">Rijeci</option>
                  <option value="vrijeme">Vrijeme</option>
                </select>
            </div>
        </div>
    </div>
</fieldset>

{#if selWpm==='rijeci'}

<Rijeci  bind:wpm bind:min bind:sec></Rijeci>

{:else if selWpm==='wpm' }
<Wpm bind:rijeci bind:min bind:sec></Wpm>

{:else if selWpm==='vrijeme'}
<Vrijeme  bind:rijeci  bind:wpm bind:minute bind:sekunde ></Vrijeme>
{/if}



