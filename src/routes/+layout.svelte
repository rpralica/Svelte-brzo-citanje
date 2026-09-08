<script>
	import favicon from '$lib/assets/favicon.svg';
	import Navbar from '$lib/components/Navbar.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Navbar></Navbar>

<div class="d-flex flex-column min-vh-100">
	<div class="d-flex flex-grow-1">
		

		<main class="flex-grow-1 p-4">
			{@render children()}
		</main>
	</div>

	<footer class="text-white text-center py-3 mt-auto">
		<div
			class="container rounded col-12 rounded"
			style="box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px; background:#a0e0c8"
		>
			<br />
			<h3 class="text-center text-primary">Copyright &copy by Matejko Team</h3>
			<br />
		</div>
	</footer>
</div>
	
