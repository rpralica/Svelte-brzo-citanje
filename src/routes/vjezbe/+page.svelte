<script>
    import Horizontal from './Horizontal.svelte';
    import Vertical from './Vertical.svelte';
    import Konvergencija from './Nos.svelte';
    import Shulte from './Shulte.svelte';

    let aktivnaVjezba = $state('horizontal');
</script>

<div class="container py-3">
    <div class="d-flex justify-content-center mb-3">
        <div class="btn-group" role="group">

            <button
                class="btn {aktivnaVjezba === 'horizontal' ? 'btn-info' : 'btn-white'}"
                type="button"
                onclick={() => (aktivnaVjezba = 'horizontal')}
            >Horizontalno</button>
            <button
                class="btn {aktivnaVjezba === 'vertikalno' ? 'btn-info' : 'btn-white'}"
                type="button"
                onclick={() => (aktivnaVjezba = 'vertikalno')}
            >Vertikalno</button>
            <button
                class="btn {aktivnaVjezba === 'konvergencija' ? 'btn-info' : 'btn-white'}"
                type="button"
                onclick={() => (aktivnaVjezba = 'konvergencija')}
            >Konvergencija</button>

 <button
                class="btn {aktivnaVjezba === 'shulte' ? 'btn-info' : 'btn-white'}"
                type="button"
                onclick={() => (aktivnaVjezba = 'shulte')}
            >Shulte</button>

        </div>
    </div>

    {#if aktivnaVjezba === 'horizontal'}
        <Horizontal />
    {:else if aktivnaVjezba === 'vertikalno'}
        <Vertical />
    {:else if aktivnaVjezba === 'konvergencija'}
        <Konvergencija />
    
     {:else if aktivnaVjezba === 'shulte'}
        <Shulte />
    {/if}
</div>