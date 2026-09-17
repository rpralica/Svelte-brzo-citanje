<script>
	import Sidebar from './Sidebar.svelte';
	import Reader from './Reader.svelte';

	const MARGIN_KEY = 'margin_debljina';
	const COLOR_KEY = 'margin_boja';
	let marginDebljina = $state(
		typeof localStorage !== 'undefined' && localStorage.getItem(MARGIN_KEY) !== null
			? parseInt(localStorage.getItem(MARGIN_KEY), 10)
			: 2
	);
	let changeColor = $state(
		typeof localStorage !== 'undefined' && localStorage.getItem(COLOR_KEY) !== null
			? localStorage.getItem(COLOR_KEY)
			: '#46b2e0'
	);

	// Automatski snimi svaki put kad se bilo koja od ove dvije vrijednosti promijeni,
	// bez obzira odakle je promjena stigla (Sidebar preko bind:, ili bilo ko drugi)
	$effect(() => {
		localStorage.setItem(MARGIN_KEY, String(marginDebljina));
	});
	$effect(() => {
		localStorage.setItem(COLOR_KEY, changeColor);
	});
</script>

<svelte:head>
	<title>Brzo Čitanje</title>
</svelte:head>

<Sidebar bind:marginDebljina bind:changeColor />

<div class="d-flex justify-content-center container">
	<Reader {marginDebljina} {changeColor} />
</div>

<style>
	.reader-main {
		margin-left: 78px;
	}

	/* Na malim ekranima traka je na dnu (vidi Sidebar.svelte), pa ovdje
       ne treba lijevi razmak, nego prostor na dnu da je traka ne prekrije */
	@media (max-width: 768px) {
		.reader-main {
			margin-left: 0;
			padding-bottom: 76px;
		}
	}
</style>
