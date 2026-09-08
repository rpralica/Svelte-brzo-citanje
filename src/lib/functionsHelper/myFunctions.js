//Korisne funkcije

/**
 * Pretvara datum iz ISO format (YYYY-MM-DD) u naš format (DD.MM.YYYY.)
 * @param {string | Date} datumZaFormat - Datum koji se formatira
 * @returns {string} - Formatirani datum
 */
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