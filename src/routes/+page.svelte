<script>
	import Sidebar from './Sidebar.svelte';
	import Reader from './Reader.svelte';
</script>

<svelte:head>
	<title>Brzo Čitanje</title>
</svelte:head>

<Sidebar  />

<div class="d-flex justify-content-center container">
	<Reader />
</div>
<style>

	/* Na malim ekranima traka je na dnu (vidi Sidebar.svelte), pa ovdje
       ne treba lijevi razmak, nego prostor na dnu da je traka ne prekrije */
	@media (max-width: 768px) {
		
	}
</style>
