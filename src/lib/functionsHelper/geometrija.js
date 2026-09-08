//2D Tijela

// Kvadrat (stranica a)
export function povrKvad(a) { return a * a; }
export function obimKvad(a) { return 4 * a; }



// Krug (poluprečnik r)
export function povrKruga(r) { return Math.PI * (r ** 2); }
export function obimKruga(r) { return 2 * Math.PI * r; }

//  Raznostranični trougao (stranice a, b, c - obim i površina preko Heronovog obrasca gde je s poluproizvod obima)
export function obimRaznosTrou(a, b, c) { return a + b + c; }
export function povrsinaRaznosTrou(a, b, c) { let s = (a + b + c) / 2; return Math.sqrt(s * (s - a) * (s - b) * (s - c)); }

//  Jednakokraki trougao (osnova a, krak b)
export function obimJednkrakTrou(a, b) { return a + 2 * b; }
export function povrJednkrakTrou(a, b) {
	return (a * Math.sqrt(b * b - (a * a) / 4)) / 2;
}

//  Jednakostranični trougao (stranica a)
export function obimJednstrTrou(a) { return 3 * a; }
export function povrJednstrTrou(a) {
	return (Math.sqrt(3) / 4) * (a * a);
}

// Pravougli trougao (katete a, b, hipotenuza c)
export function obimPravougTrou(a, b, c) { return a + b + c; }
export function povrPravougTrou(a, b) { return (a * b) / 2; }



//  Pravougaonik (stranice a, b)
export function obimPravoug(a, b) { return 2 * (a + b); }
export function povrsinaPravoug(a, b) { return a * b; }

//  Paralelogram (stranice a, b i visina va na stranicu a)
export function obimParalel(a, b) { return 2 * (a + b); }
export function povrsinaParalel(a, va) { return a * va; }

//  Romb (stranica a, visina v, dijagonale d1 i d2)
export function obimRomba(a) { return 4 * a; }
export function povrRomba(d1, d2) { return (d1 * d2) / 2; }

//  Trapez (stranice a, b, c, d i visina v)
export function obimTrapeza(a, b, c, d) { return a + b + c + d; }
export function povrTrapeza(a, b, v) { return ((a + b) / 2) * v; }





//3D Tijela

//  Kocka (stranica a)
export function zaprKocke(a) { return a * a * a; }
export function povrKocke(a) { return 6 * (a * a); }

//  Kvadar (stranice a, b, c)
export function zaprKvadra(a, b, c) { return a * b * c; }
export function povrKvadra(a, b, c) { return 2 * (a * b + a * c + b * c); }

//  Četvorostrana prizma (površina baze B, obim baze Ob, visina h, lateralna površina M)
export function zaprCetvorostrPrizme(B, h) { return B * h; }
export function povrsinaCetvorostranePrizme(B, M) { return 2 * B + M; }

//  Pravilna šestostrana prizma (stranica baze a, visina prizme h)
export function zaprSestostrPriz(a, h) { return 3 * Math.sqrt(3) * (a * a) / 2 * h; }
export function povrSestostrPriz(a, h) {
	return 3 * Math.sqrt(3) * (a * a) + 6 * a * h;
}

//  Trostrana piramida / Tetraedar (stranica a)
export function zaprTetraedra(a) { return (Math.sqrt(2) / 12) * (a * a * a); }
export function povrTetraedra(a) { return Math.sqrt(3) * (a * a); }

//  Četvorostrana piramida sa kvadratnom bazom (stranica baze a, visina h, visina bočne strane ha)
export function zaprCetvorPiram(a, h) { return (a * a * h) / 3; }
export function povrCetvorPiram(a, ha) {
	return a * a + 2 * a * ha;
}

//  Petostrana piramida sa pravilnom bazom (površina baze B, obim baze O, visina bočne strane apotema ap)
export function zaprPetostrPiram(B, h) { return (B * h) / 3; }
export function povrPetostrPiram(B, O, ap) { return B + (O * ap) / 2; }

//  Valjak / Cilindar (poluprečnik baze r, visina h)
export function zaprValj(r, h) { return Math.PI * (r * r) * h; }
export function povrValj(r, h) { return 2 * Math.PI * r * (r + h); }

//  Kupa / Konus (poluprečnik baze r, visina h, izvodnica s)
export function zaprKupe(r, h) { return (Math.PI * (r * r) * h) / 3; }
export function povrsKupe(r, s) { return Math.PI * r * (r + s); }



//  Lopta (poluprečnik r)
export function zaprLopte(r) { return (4 / 3) * Math.PI * (r * r * r); }
export function povrLopte(r) { return 4 * Math.PI * (r * r); }

//  Polulopta (poluprečnik r)
export function zaprPolul(r) { return (2 / 3) * Math.PI * (r * r * r); }
export function povrPolul(r) { return 3 * Math.PI * (r * r); }









