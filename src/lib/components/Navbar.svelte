<script>
    import { page } from '$app/state';

    // Stanje za otvaranje/zatvaranje menija na mobilnom
    let isOpen = $state(false);
    let navEl; // referenca na <nav> element, za detekciju klika van menija

    function isActive(path) {
        return page.url.pathname === path;
    }

    function closeMenu() {
        isOpen = false;
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
        <!-- Logo levo -->
        <a href="/" class="logo-link" onclick={closeMenu}>
            <img src="/logo.jpg" alt="Logo" class="logo-img" />
        </a>

        <!-- Hamburger dugme -->
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
            <a href="/test" class:active={isActive('/test')} onclick={closeMenu}>Alati</a>
        </div>
	 
    </div>
</nav>

<style>



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

        .nav-links.active-menu {
            display: flex;
        }

        .nav-links a {
            font-size: 1.2rem;
            padding: 5px 0;
        }
    }
</style>