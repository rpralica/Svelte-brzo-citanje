<script>
	import Horizontal from './Horizontal.svelte';
	import Vertical from './Vertical.svelte';
	import Konvergencija from './Nos.svelte';
	import Shulte from './Shulte.svelte';
import Tahitoskop from './Tahitoskop.svelte';
	let aktivnaVjezba = $state('horizontal');
</script>

<svelte:head>
	<title>Brzo Čitanje</title>
</svelte:head>

<div class="container py-3 shadow-lg rounded">
	<div class="d-flex justify-content-center mb-3">
		<div class="btn-group shadow-lg " role="group">
			<button
				class="btn fw-bold   {aktivnaVjezba === 'horizontal' ? 'btn-info' : 'btn-white'}"
				type="button"
				onclick={() => (aktivnaVjezba = 'horizontal')}>Horizontalno</button
			>
			<button
				class="btn fw-bold  {aktivnaVjezba === 'vertikalno' ? 'btn-info' : 'btn-white'}"
				type="button"
				onclick={() => (aktivnaVjezba = 'vertikalno')}>Vertikalno</button
			>
			<button
				class="btn fw-bold  {aktivnaVjezba === 'konvergencija' ? 'btn-info' : 'btn-white'}"
				type="button"
				onclick={() => (aktivnaVjezba = 'konvergencija')}>Konvergencija</button
			>

			<button
				class="btn fw-bold  {aktivnaVjezba === 'shulte' ? 'btn-info' : 'btn-white'}"
				type="button"
				onclick={() => (aktivnaVjezba = 'shulte')}>Shulte</button>

<button
				class="btn fw-bold  {aktivnaVjezba === 'tahitoskop' ? 'btn-info' : 'btn-white'}"
				type="button"
				onclick={() => (aktivnaVjezba = 'tahitoskop')}>Tahitoskop</button>




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
{:else if aktivnaVjezba === 'tahitoskop'}
		<Tahitoskop />

	{/if}
</div>
