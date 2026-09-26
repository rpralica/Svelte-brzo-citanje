<script>
	import Sidebar from './Sidebar.svelte';
	import Reader from './Reader.svelte';
	import SidebarDesni from './SidebarDesni.svelte';


	const PACER_KEY = 'pacer_color';
	const MARGIN_KEY = 'margin_debljina';
	const COLOR_KEY = 'margin_boja';
    const CHUNK_KEY='chunk_size'

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

	let pacerColor = $state(
		typeof localStorage !== 'undefined' && localStorage.getItem(PACER_KEY) !== null
			? localStorage.getItem(PACER_KEY)
			: '#0dcaf0'
	);
	let paceChunkSize = $state(
    typeof localStorage !== 'undefined' && localStorage.getItem(CHUNK_KEY) !== null
        ? Number(localStorage.getItem(CHUNK_KEY)) // <--- OVDE JE BILA GREŠKA (vraćalo string)
        : 2
);

	

	// Automatski snimi svaki put kad se bilo koja od ove dvije vrijednosti promijeni,
	// bez obzira odakle je promjena stigla (Sidebar preko bind:, ili bilo ko drugi)
	$effect(() => {
		localStorage.setItem(MARGIN_KEY, String(marginDebljina));
	});
	$effect(() => {
		localStorage.setItem(COLOR_KEY, changeColor);
	});
	$effect(() => {
		localStorage.setItem(PACER_KEY, pacerColor);
		 document.documentElement.style.setProperty('--pace-mark-color', pacerColor);
	});

	$effect(() => {
	
		localStorage.setItem(CHUNK_KEY, paceChunkSize);
	});
	let pastedText=$state('');
	 function clearTa() {
        pastedText = '';
    }

</script>

<svelte:head>
	<title>Brzo Čitanje</title>
</svelte:head>

<Sidebar bind:marginDebljina bind:changeColor bind:pacerColor bind:paceChunkSize />

<SidebarDesni {clearTa}></SidebarDesni>

<div class="d-flex justify-content-center container">
	<Reader {marginDebljina} {changeColor} {pacerColor} {clearTa} bind:pastedText {paceChunkSize} />
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
