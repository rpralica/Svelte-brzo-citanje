<script>
	import Sidebar from './Sidebar.svelte';
	import Reader from './Reader.svelte';
	import Settings from './Settings.svelte';



	


</script>

<svelte:head>
	<title>Brzo Čitanje</title>
</svelte:head>

<Sidebar  />

<Settings></Settings>

<div class="d-flex justify-content-center container">
	<Reader />
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
