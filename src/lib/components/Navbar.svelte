<script>
	import { page } from '$app/state';

	// Primamo korisnika, kao i funkcije za prijavu i odjavu kroz props
	let { user = null, onLogin = () => {}, onLogout = () => {} } = $props();

	// Stanje za otvaranje/zatvaranje menija na mobilnom
	let isOpen = $state(false);
	let navEl; // referenca na <nav> element, za detekciju klika van menija

	function isActive(path) {
		return page.url.pathname === path;
	}

	function closeMenu() {
		isOpen = false;
	}

	// Pomoćna funkcija koja siječe email i uzima dio prije @
	function getUsername(email) {
		if (!email) return '';
		return email.split('@')[0];
	}

	// Kad je meni otvoren, klik BILO GDJE van <nav> elementa ga zatvara
	$effect(() => {
		if (!isOpen) return;

		function handleClickOutside(event) {
			if (navEl && !navEl.contains(event.target)) {
				isOpen = false;
			}
		}

		// Malo odlozeno da ne uhvati isti klik koji je meni otvorio
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<nav
	bind:this={navEl}
	class="container border border-2 border-info shadow p-3 mb-5 mt-2 bg-body rounded"
>
	<div class="nav-container">
		<!-- Logo levo (ima klasu .logo-img za laku kontrolu veličine slike) -->
		<a href="/" class="logo-link" onclick={closeMenu}>
			<img src="/logo.jpg" alt="Logo" class="logo-img" />
		</a>

		<!-- Hamburger dugme - VIDLJIVO SAMO NA MALIM EKRANIMA kad se meni sakrije -->
		<button class="menu-toggle" onclick={() => (isOpen = !isOpen)}>
			{#if isOpen}
				✕
			{:else}
				☰
			{/if}
		</button>

		<!-- Središnji linkovi -->
		<div class="nav-links" class:active-menu={isOpen}>
			<a href="/" class:active={isActive('/')} onclick={closeMenu}>Čitanje</a>
			<a href="/vjezbe" class:active={isActive('/vjezbe')} onclick={closeMenu}>Vježbe</a>
			<a href="/test" class:active={isActive('/test')} onclick={closeMenu}>Test</a>
		</div>

		<!-- Desna strana: Auth sekcija skroz desno -->
		<div class="auth-section" class:active-menu={isOpen}>
			{#if user}
				<div class="user-info">
					<span class="logged-text"
						>Logged as: <strong class="text-success">{getUsername(user.email)}</strong></span
					>
					<a
						href="#logout"
						class="logout-link"
						onclick={(e) => {
							e.preventDefault();
							onLogout();
							closeMenu();
						}}
					>
						Logout
					</a>
				</div>
			{:else}
				<button
					class="btn btn-outline-dark btn-sm text-success fw-bold"
					onclick={() => {
						onLogin();
						closeMenu();
					}}>🔑 Login</button
				>
			{/if}
		</div>
	</div>
</nav>

{#if !user}
	<div style="height: 2rem;width: 25rem;" class="container alert alert-success pt-1">
		<h6 class="text-center">Ulogujte se da bi se čuvala podešavanja</h6>
	</div>
{/if}

<style>
	nav {
		background-color: #f8f8f8;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
		padding: 15px 25px;
	}

	.nav-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
	}

	.logo-link {
		text-decoration: none;
		display: flex;
		align-items: center;
	}

	.logo-img {
		height: 40px;
		width: auto;
		object-fit: contain;
	}

	/* Na desktopu je meni uvijek vidljiv kao red, centriran automatskim marginama */
	.nav-links {
		display: flex;
		align-items: center;
		gap: 40px;
		margin: 0 auto;
	}

	.menu-toggle {
		display: none;
		background: deepskyblue;
		color: white;
		border: none;
		padding: 8px 14px;
		font-size: 1rem;
		font-weight: bold;
		border-radius: 4px;
		cursor: pointer;
	}

	.nav-links a {
		position: relative;
		padding: 10px 0;
		text-decoration: none;
		color: #333;
		font-weight: 500;
		font-size: 1.6rem;
		overflow: hidden;
		transition: color 0.9s ease;
		white-space: nowrap;
	}

	.nav-links a::after {
		content: '';
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		bottom: 0;
		width: 0;
		height: 3px;
		background-color: deepskyblue;
		transition: width 0.9s ease-out;
	}

	.nav-links a:hover::after {
		width: 100%;
	}

	.nav-links a.active::after {
		width: 100%;
		background-color: deepskyblue;
	}

	.nav-links a.active {
		color: deepskyblue;
	}

	/* Auth sekcija desno */
	.auth-section {
		display: flex;
		align-items: center;
	}

	.user-info {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		font-size: 0.95rem;
		color: #333;
	}

	.logged-text {
		white-space: nowrap;
	}

	.logout-link {
		color: #dc3545;
		text-decoration: none;
		font-size: 0.85rem;
		font-weight: 600;
		margin-top: 2px;
		transition: opacity 0.2s ease;
	}

	.logout-link:hover {
		opacity: 0.75;
		text-decoration: underline;
	}

	@media (max-width: 768px) {
		.menu-toggle {
			display: block;
		}

		.nav-links {
			display: none;
			width: 100%;
			flex-direction: column;
			align-items: center;
			gap: 15px;
			margin-top: 15px;
			padding-top: 15px;
			border-top: 1px solid #ddd;
		}

		.auth-section {
			display: none;
			width: 100%;
			flex-direction: column;
			align-items: center;
			margin-top: 15px;
			padding-top: 15px;
			border-top: 1px solid #ddd;
		}

		.nav-links.active-menu,
		.auth-section.active-menu {
			display: flex;
		}

		.user-info {
			align-items: center;
		}

		.nav-links a {
			font-size: 1.2rem;
			padding: 5px 0;
		}
	}
</style>
