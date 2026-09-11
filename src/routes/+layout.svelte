<script>
	import { onMount } from 'svelte';
	import { auth } from '$lib/firebase';
	import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
	import Navbar from '$lib/components/Navbar.svelte';

	let user = $state(null);

	// Prati da li je korisnik ulogovan ili odjavljen
	onMount(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			user = currentUser;
		});
		return () => unsubscribe();
	});

	// Funkcija za Google prijavu koja se proslijeđuje u navbar
	async function loginWithGoogle() {
		const provider = new GoogleAuthProvider();

		// Ovdje dodajemo liniju koja uvijek traži izbor naloga:
		provider.setCustomParameters({
			prompt: 'select_account'
		});

		try {
			await signInWithPopup(auth, provider);
		} catch (error) {
			console.error('Greška pri prijavi:', error);
		}
	}

	// Funkcija za odjavu
	async function handleSignOut() {
		try {
			await signOut(auth);
			window.location.href = '/';
		} catch (error) {
			console.error('Greška pri odjavi:', error);
		}
	}

	let { children } = $props();
</script>

<!-- Navbar dobija ulogovanog korisnika i funkcije za prijavu/odjavu -->
<Navbar {user} onLogin={loginWithGoogle} onLogout={handleSignOut} />

<!-- Ovdje se renderuje sadržaj stranica (npr. Reader.svelte) -->
{@render children()}
