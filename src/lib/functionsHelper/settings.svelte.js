/* global Swal */
import { browser } from '$app/environment';

const pocetneVrijednosti = {
	marginLeft: 10,
	marginRight: 10,
	marginDebljina: 2,
	marginBoja: '#46b2e0',
	pacerColor: '#0dcaf0',
	paceChunkSize: 2,
	fontSize: 25,
	readerWidthPercent: 40
};

function ucitaj() {
	if (!browser) return { ...pocetneVrijednosti };
	const sacuvano = localStorage.getItem('podesavanja');
	return sacuvano ? { ...pocetneVrijednosti, ...JSON.parse(sacuvano) } : { ...pocetneVrijednosti };
}

export const podesavanja = $state(ucitaj());

function sacuvaj() {
	if (!browser) return;
	localStorage.setItem('podesavanja', JSON.stringify(podesavanja));
}

// Primijeni pacer boju na CSS varijablu odmah pri prvom ucitavanju
if (browser) {
	document.documentElement.style.setProperty('--pace-mark-color', podesavanja.pacerColor);
}
const FONT_MIN = 12;
const FONT_MAX = 60;
const MARGIN_MIN = 0;
const MARGIN_MAX = 40;

const WIDTH_MIN = 20;
const WIDTH_MAX = 100;
export const WIDTH_STEP = 10;
export const MARGIN_STEP = 2;

export function changeMarginLeft(delta) {
	podesavanja.marginLeft = Math.min(
		MARGIN_MAX,
		Math.max(MARGIN_MIN, podesavanja.marginLeft + delta)
	);
	sacuvaj();
}

export function changeMarginRight(delta) {
	podesavanja.marginRight = Math.min(
		MARGIN_MAX,
		Math.max(MARGIN_MIN, podesavanja.marginRight + delta)
	);
	sacuvaj();
}

export function setMarginDebljina(value) {
	podesavanja.marginDebljina = value;
	sacuvaj();
}

export function setMarginBoja(value) {
	podesavanja.marginBoja = value;
	sacuvaj();
}

export function setPacerColor(value) {
	podesavanja.pacerColor = value;
	if (browser) {
		document.documentElement.style.setProperty('--pace-mark-color', value);
	}
	sacuvaj();
}

export function setPaceChunkSize(value) {
	podesavanja.paceChunkSize = Number(value);
	sacuvaj();
}

export function changeFont(delta) {
	podesavanja.fontSize = Math.min(FONT_MAX, Math.max(FONT_MIN, podesavanja.fontSize + delta));
	sacuvaj();
}
export function resetFont() {
	podesavanja.fontSize = 25;
	sacuvaj();
}

export function changeWidth(delta) {
	podesavanja.readerWidthPercent = Math.min(
		WIDTH_MAX,
		Math.max(WIDTH_MIN, podesavanja.readerWidthPercent + delta)
	);
	sacuvaj();
}

export async function resetMargin() {
	const result = await Swal.fire({
		title: 'Resetovati margine?',
		text: 'Vratiti debljinu i boju na podrazumijevane vrijednosti?',
		icon: 'question',
		showCancelButton: true,
		confirmButtonText: 'Da, resetuj',
		cancelButtonText: 'Otkazi'
	});

	if (result.isConfirmed) {
		podesavanja.marginLeft = 10;
		podesavanja.marginRight = 10;
		podesavanja.marginBoja = '#4cdee1';
		Swal.fire({
			title: 'Resetovano!',
			icon: 'success',
			timer: 1000,
			showConfirmButton: false
		});
	}
}

export async function resetPacer() {
	const result = await Swal.fire({
		title: 'Resetovati boju pacera ?',
		text: 'Vratiti  boju na default ?',
		icon: 'question',
		showCancelButton: true,
		confirmButtonText: 'Da, resetuj',
		cancelButtonText: 'Otkazi'
	});

	if (result.isConfirmed) {
		podesavanja.pacerColor = '#0dcaf0';
		podesavanja.paceChunkSize = 3;
		Swal.fire({
			title: 'Resetovano!',
			icon: 'success',
			timer: 1000,
			showConfirmButton: false
		});
	}
}
