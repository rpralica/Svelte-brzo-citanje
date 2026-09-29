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
		tahitoskop: 'Tahitoskop'
	};
</script>

<svelte:head>
	<title>Brzo Čitanje</title>
</svelte:head>

<div class="container py-3 shadow-lg rounded">
	<div class="d-flex justify-content-center mb-3">
		<!-- 1. VERZIJA ZA TELEFONE: Hamburger / Dropdown meni (prikazuje se samo na manjim ekranima) -->
		<div class="dropdown d-md-none w-100 px-2">
			<button
				class="btn btn-info fw-bold w-100 dropdown-toggle shadow-sm"
				type="button"
				data-bs-toggle="dropdown"
				aria-expanded="false"
			>
				<span class="text-light h5">Vježba:</span>
				{naziviVjezbi[aktivnaVjezba]}
			</button>
			<ul class="dropdown-menu w-100 text-center shadow">
				<li>
					<button
						class="dropdown-item fw-bold {aktivnaVjezba === 'horizontal' ? 'active' : ''}"
						type="button"
						onclick={() => (aktivnaVjezba = 'horizontal')}>Horizontalno</button
					>
				</li>
				<li>
					<button
						class="dropdown-item fw-bold {aktivnaVjezba === 'vertikalno' ? 'active' : ''}"
						type="button"
						onclick={() => (aktivnaVjezba = 'vertikalno')}>Vertikalno</button
					>
				</li>
				<li>
					<button
						class="dropdown-item fw-bold {aktivnaVjezba === 'konvergencija' ? 'active' : ''}"
						type="button"
						onclick={() => (aktivnaVjezba = 'konvergencija')}>Konvergencija</button
					>
				</li>
				<li>
					<button
						class="dropdown-item fw-bold {aktivnaVjezba === 'shulte' ? 'active' : ''}"
						type="button"
						onclick={() => (aktivnaVjezba = 'shulte')}>Shulte</button
					>
				</li>
				<li>
					<button
						class="dropdown-item fw-bold {aktivnaVjezba === 'tahitoskop' ? 'active' : ''}"
						type="button"
						onclick={() => (aktivnaVjezba = 'tahitoskop')}>Tahitoskop</button
					>
				</li>
				<li>
					<button
						class="dropdown-item fw-bold {aktivnaVjezba === 'rsvp' ? 'active' : ''}"
						type="button"
						onclick={() => (aktivnaVjezba = 'rsvp')}>RSVP</button
					>
				</li>
			</ul>
		</div>

		<!-- 2. VERZIJA ZA TABLETE I DESKTOP: Klasični dugmići u redu (prikazuje se od srednjih ekrana naviše) -->
		<div
			class="d-none d-md-flex flex-wrap justify-content-center gap-1 shadow-lg p-1 rounded bg-light"
			role="group"
		>
			<button
				class="btn fw-bold {aktivnaVjezba === 'horizontal' ? 'btn-info' : 'btn-white'}"
				type="button"
				onclick={() => (aktivnaVjezba = 'horizontal')}>Horizontalno</button
			>
			<button
				class="btn fw-bold {aktivnaVjezba === 'vertikalno' ? 'btn-info' : 'btn-white'}"
				type="button"
				onclick={() => (aktivnaVjezba = 'vertikalno')}>Vertikalno</button
			>
			<button
				class="btn fw-bold {aktivnaVjezba === 'konvergencija' ? 'btn-info' : 'btn-white'}"
				type="button"
				onclick={() => (aktivnaVjezba = 'konvergencija')}>Konvergencija</button
			>
			<button
				class="btn fw-bold {aktivnaVjezba === 'shulte' ? 'btn-info' : 'btn-white'}"
				type="button"
				onclick={() => (aktivnaVjezba = 'shulte')}>Shulte</button
			>
			<button
				class="btn fw-bold {aktivnaVjezba === 'tahitoskop' ? 'btn-info' : 'btn-white'}"
				type="button"
				onclick={() => (aktivnaVjezba = 'tahitoskop')}>Tahitoskop</button
			>
			<button
				class="btn fw-bold {aktivnaVjezba === 'rsvp' ? 'btn-info' : 'btn-white'}"
				type="button"
				onclick={() => (aktivnaVjezba = 'rsvp')}>RSVP</button
			>
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
