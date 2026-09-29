<script>
	
	
	import Navbar from '$lib/components/Navbar.svelte';

	

	// Prati da li je korisnik ulogovan ili odjavljen
	

	// Funkcija za Google prijavu koja se proslijeđuje u navbar

	// Funkcija za odjavu
	

	let { children } = $props();
</script>

<!-- Navbar dobija ulogovanog korisnika i funkcije za prijavu/odjavu -->
<Navbar  />

<!-- Ovdje se renderuje sadržaj stranica (npr. Reader.svelte) -->
{@render children()}
