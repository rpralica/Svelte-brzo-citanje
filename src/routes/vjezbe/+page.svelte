<script>
    import Horizontal from './Horizontal.svelte';
    import Vertical from './Vertical.svelte';
    import Konvergencija from './Nos.svelte';
    import Shulte from './Shulte.svelte';
    import Tahitoskop from './Tahitoskop.svelte';
    import Rsvp from './Rsvp.svelte';
    let aktivnaVjezba = $state('horizontal');

    const naziviVjezbi = {
        horizontal: 'Horizontalno',
        vertikalno: 'Vertikalno',
        konvergencija: 'Konvergencija',
        shulte: 'Shulte',
        tahitoskop: 'Tahitoskop',
        rsvp: 'RSVP'
    };
</script>

<svelte:head>
    <title>Brzo Čitanje</title>
</svelte:head>

<div class="container py-3 shadow-lg rounded">
    <div class="d-flex justify-content-center mb-3">
        <!-- 1. VERZIJA ZA TELEFONE: Dropdown meni prilagođen za tamnu/svijetlu temu -->
        <div class="dropdown d-md-none w-100 px-2">
            <button
                class="btn btn-info fw-bold w-100 dropdown-toggle shadow-sm text-dark"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                <span>Vježba:</span> {naziviVjezbi[aktivnaVjezba]}
            </button>
            <!-- Dodata klasa dropdown-menu-dark ili automatsko praćenje teme preko Bootstrap varijabli -->
            <ul class="dropdown-menu w-100 text-center shadow">
                {#each Object.entries(naziviVjezbi) as [key, naziv]}
                    <li>
                        <button
                            class="dropdown-item fw-bold {aktivnaVjezba === key ? 'active' : ''}"
                            type="button"
                            onclick={() => (aktivnaVjezba = key)}>{naziv}</button
                        >
                    </li>
                {/each}
            </ul>
        </div>

        <!-- 2. VERZIJA ZA TABLETE I DESKTOP -->
        <div
            class="d-none d-md-flex flex-wrap justify-content-center gap-1 shadow-lg p-1 rounded bg-body-tertiary border"
            role="group"
        >
            {#each Object.entries(naziviVjezbi) as [key, naziv]}
                <button
                    class="btn fw-bold {aktivnaVjezba === key ? 'btn-info text-dark' : 'btn-outline-secondary'}"
                    type="button"
                    onclick={() => (aktivnaVjezba = key)}>{naziv}</button
                >
            {/each}
        </div>
    </div>

    <!-- Prikaz aktivne vježbe -->
    {#if aktivnaVjezba === 'horizontal'}
        <Horizontal />
    {:else if aktivnaVjezba === 'vertikalno'}
        <Vertical />
    {:else if aktivnaVjezba === 'konvergencija'}
        <Konvergencija />
    {:else if aktivnaVjezba === 'shulte'}
        <Shulte />
    {:else if aktivnaVjezba === 'tahitoskop'}
        <Tahitoskop />
    {:else if aktivnaVjezba === 'rsvp'}
        <Rsvp />
    {/if}
</div>