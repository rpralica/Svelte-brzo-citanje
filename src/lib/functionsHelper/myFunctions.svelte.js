//Korisne funkcije

/**
 * Pretvara datum iz ISO format (YYYY-MM-DD) u naš format (DD.MM.YYYY.)
 * @param {string | Date} datumZaFormat - Datum koji se formatira
 * @returns {string} - Formatirani datum
 */

import { onMount } from 'svelte';
export function nasDatum(datumZaFormat) {
	if (!datumZaFormat) return '';

	const d = new Date(datumZaFormat);
	if (isNaN(d.getTime())) return ''; // Ako nije validan datum

	const dan = String(d.getDate()).padStart(2, '0');
	const mesec = String(d.getMonth() + 1).padStart(2, '0');
	const godina = d.getFullYear();

	return `${dan}.${mesec}.${godina}.`;
}

/* 
  KORIŠĆENJE ZA nasDatum:
  import { nasDatum } from '$lib/helpers.js';
  
  const formatirani = nasDatum('2026-08-03'); 
  // Rezultat: "03.08.2026."
*/

/**
 * Formatira broj u naš novčani format (npr. 1250.5 -> 1.250,50)
 * @param {number} iznos - Broj koji se formatira
 * @returns {string} - Formatirani novčani iznos
 */
export function formatirajNovac(iznos) {
	if (isNaN(iznos) || iznos === null) return '0,00';

	return Number(iznos).toLocaleString('sr-RS', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});
}

/* 
  KORIŠĆENJE ZA formatirajNovac:
  import { formatirajNovac } from '$lib/helpers.js';
  
  const cena = formatirajNovac(1250500.5); 
  // Rezultat: "1.250.500,50"
*/

/**
 * Izračunava iznos PDV-a na osnovu iznosa i procenta poreza.
 * @param {number} iznos - Osnovna cena ili iznos
 * @param {number} stopaPdv - Procenat PDV-a (npr. 17, 25)
 * @returns {number} - Samo iznos poreza
 */
export function calcPdv(iznos, stopaPdv) {
	// Sigurnosna provera da imamo validne brojeve
	const cistiIznos = Number(iznos) || 0;
	const cistaStopa = Number(stopaPdv) || 0;

	// Računa visinu PDV-a i zaokružuje na dve decimale
	const pdvIznos = (cistiIznos * cistaStopa) / 100;

	return Number(pdvIznos.toFixed(2));
}

// Primeri korišćenja:
// console.log(calcPdv(100, 17)); // Vraća: 17
// console.log(calcPdv(200, 25)); // Vraća: 50
//Email validation

/********************************************************** */

export function jeValidanEmail(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

//Generisanje inicijala

export function inicijali(imeIPrezime) {
	return imeIPrezime
		.split(' ')
		.map((r) => r[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);
}

//Sortiranje niza po ključu

export function sortirajPo(niz, kljuc, opadajuce = false) {
	return [...niz].sort((a, b) => {
		if (a[kljuc] < b[kljuc]) return opadajuce ? 1 : -1;
		if (a[kljuc] > b[kljuc]) return opadajuce ? -1 : 1;
		return 0;
	});
}

//Validacija inputa
/*
Primjer upotrebe

<script>
	import { isEmail, isFilled, isNumber } from '$lib/validation.js';

	let email = $state('');
	let name = $state('');
	let price = $state('');

	let emailValid = $derived(isEmail(email));
	let nameValid = $derived(isFilled(naziv));
	let priceValid = $derived(isNumber(cijena));

	let formValid = $derived(emailValid && nameValid && priceValid);
</script>

*/

export function isEmail(value) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isNumber(value) {
	return value !== '' && !isNaN(Number(value));
}

export function isPositiveNumber(value) {
	return isNumber(value) && Number(value) > 0;
}

export function isFilled(value) {
	return typeof value === 'string' && value.trim().length > 0;
}

export function isLengthBetween(value, min, max) {
	const length = String(value).trim().length;
	return length >= min && length <= max;
}

export function isPhoneNumber(value) {
	// adjust the regex to match the phone format you need (e.g. BiH numbers)
	return /^[+]?[0-9\s\-()]{6,20}$/.test(value);
}




//Localstorage


export function localStore(kljuc, pocetnaVrijednost) {
	let vrijednost = $state(pocetnaVrijednost);

	onMount(() => {
		try {
			const sacuvano = localStorage.getItem(kljuc);
			if (sacuvano !== null) {
				vrijednost = JSON.parse(sacuvano);
			}
		} catch {
			vrijednost = pocetnaVrijednost;
		}
	});

	$effect(() => {
		try {
			localStorage.setItem(kljuc, JSON.stringify(vrijednost));
		} catch (e) {
			console.warn('localStorage greška:', e);
		}
	});

	return {
		get value() {
			return vrijednost;
		},
		set value(nova) {
			vrijednost = nova;
		}
	};
}

/*
Korištenje u komponenti


<script>
    import { localStore } from '$lib/localStore.js';

    const brzina = localStore('brzinaMs', 1500);
    const boja = localStore('margin_boja', '#46b2e0');
    const sirina = localStore('readerWidth', 80);
</script>

<input type="number" bind:value={brzina.value} />
<input type="color" bind:value={boja.value} />
<p>Brzina: {brzina.value}</p>

*/


// FILE LOAD

// utils.js
export function readTxtFile(file) {
    return new Promise((resolve, reject) => {
        // Provjera tipa fajla
        if (!file || file.type !== "text/plain") {
            reject(new Error("Dozvoljeni su samo .txt fajlovi!"));
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            resolve(e.target.result); // Vraćamo pročitani sadržaj
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsText(file);
    });
}


//KORIŠTENJE
/* 
<script>
    import { readTxtFile } from './utils.js'; // Uvezeš odakle ti treba

    let fileContent = $state("");
    let isFileLoaded = $state(false);

    async function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            // Pozivamo našu funkciju i čekamo rezultat preko await-a
            fileContent = await readTxtFile(file);
            isFileLoaded = true;
        } catch (error) {
            alert(error.message);
        }
    }
</script>

<main class="container">
    <h2>Starter Template - Čitač fajlova</h2>

    <input 
        type="file" 
        accept=".txt" 
        disabled={isFileLoaded} 
        onchange={handleFileUpload} 
    />

    {#if isFileLoaded}
        <div class="content-box">
            <h3>Učitano:</h3>
            <pre>{fileContent}</pre>
        </div>
    {/if}
</main>



*/