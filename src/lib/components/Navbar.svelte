<script>
	import { page } from '$app/state';

	// Stanje za otvaranje/zatvaranje menija na mobilnom
	let isOpen = $state(false);

	function isActive(path) {
		return page.url.pathname === path;
	}

	function closeMenu() {
		isOpen = false;
	}
</script>

<nav class="container border border-2 border-info shadow p-3 mb-5 mt-2 bg-body rounded sticky-top">
	<div class="nav-container">
		<!-- Logo levo (ima klasu .logo-img za laku kontrolu veličine slike) -->
		<a href="/" class="logo-link" onclick={closeMenu}>
			<!-- Kad staviš pravu sliku, samo zameni span sa img tagom koji ima klasu logo-img -->
			<img src="/logo.jpg" alt="Logo" class="logo-img" />
			<!-- Privremeni tekst ako slika još nije tu -->
			<!-- <span class="placeholder-logo">LOGO</span> -->
		</a>

		<!-- Hamburger dugme - VIDLJIVO SAMO NA MALIM EKRANIMA kad se meni sakrije -->
		<button class="menu-toggle" onclick={() => (isOpen = !isOpen)} aria-label="Meni">
			{#if isOpen}
				✕ Zatvori
			{:else}
				☰ Meni
			{/if}
		</button>

		<!-- Linkovi -->
		<div class="nav-links d-flex mx-auto" class:active-menu={isOpen}>
			<a href="/" class:active={isActive('/')} onclick={closeMenu}>Home</a>
			<a href="/tools" class:active={isActive('/tools')} onclick={closeMenu}>Tools</a>
		</div>
	</div>
</nav>

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

	/* KONTROLA VELIČINE LOGOA - ovde namesti visinu/širinu kako hoćeš */
	.logo-link {
		text-decoration: none;
		display: flex;
		align-items: center;
	}

	.logo-img {
		height: 40px; /* Možeš smanjiti na 30px ili povećati po želji */
		width: auto;
		object-fit: contain;
	}

	/* Privremeni placeholder ako nema slike */
	.placeholder-logo {
		font-weight: bold;
		font-size: 1.2rem;
		color: #333;
		background: #e2e8f0;
		padding: 4px 8px;
		border-radius: 4px;
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: 40px;
	}

	/* Dugme za meni - po defaultu SAKRIVENO na velikom ekranu */
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

	/* Stilovi za linkove sa tvojom animacijom */
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

	/* MEDIA QUERY ZA MANJE EKRANE (telefone i manje tablete) */
	@media (max-width: 768px) {
		/* Prikazujemo dugme samo ovde */
		.menu-toggle {
			display: block;
		}

		/* Sakrivamo linkove dok se ne klikne dugme */
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

		/* Kada je meni otvoren */
		.nav-links.active-menu {
			display: flex;
		}
	}
</style>
