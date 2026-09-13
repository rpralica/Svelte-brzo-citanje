# Brzo Čitanje - Aplikacija

Pregled svih funkcija ugrađenih u aplikaciju za vježbanje brzog čitanja (Svelte 5 + Bootstrap 5.3 + Firebase).

---

## 1. Učitavanje sadržaja

- **PDF fajl** - jedini podržan format za čitanje dokumenata (izabran namjerno umjesto .txt/.docx zbog jednostavnosti). Ako izabereš nešto drugo, iskoči SweetAlert upozorenje.
- Stranice se čitaju **jedna po jedna** (Pristup 1) preko `pdf.js` - tekst svake stranice se izvuče kad je prikažeš.
- Odmah nakon učitavanja prve stranice, u pozadini se izvlači tekst **svih** stranica (radi pretrage) - dok to traje, piše "Priprema teksta za pretragu...".
- **Zalijepi tekst** - kad nije učitan PDF, prikazuje se textarea gdje možeš zalijepiti bilo kakav tekst, sa live brojanjem riječi i brojanjem selektovanih riječi. Nestaje automatski kad učitaš PDF.
- **"✕ Zatvori PDF (novi tekst)"** dugme u toolbaru vraća na paste-text prikaz bez potrebe za refresh-om stranice.

## 2. Prikaz teksta i navigacija

- Tekst trenutne stranice prikazan je kao pojedinačne riječi (`<span>` elementi) - to omogućava klik na riječ, markere i praćenje pozicije.
- **Font** - A-/A+/Reset dugmad, default veličina 25 (zbog slabijeg vida). Pamti se u Firebase.
- **Širina** - Smanji/Povećaj dugmad, mijenja širinu čitalačkog bloka (%), centrirano na ekranu. Pamti se u Firebase.
- **Margine (vodilice)** - dvije tanke vertikalne linije preko teksta (lijeva/desna), pomjerljive dugmadima (Margina L / Margina D), uz on/off prekidač ("Margine" switch, default isključen). Služe kao periferni vodič za trening. Pamte se u Firebase.
- **Prethodna / Sljedeća** - navigacija kroz PDF stranice, dostupna i iznad i ispod čitača.
- **"Idi na str."** - polje + dugme za direktan skok na bilo koju stranicu (radi i na Enter).
- Svaki prelazak na sljedeću stranicu automatski skroluje ekran na vrh čitača (bez ručnog skrolovanja).

## 3. Pretraga (Search)

- Pretražuje **cijeli dokument** (sve stranice), ne samo trenutnu.
- Prikazuje broj rezultata + kontekst (par riječi prije/poslije pogotka) + broj stranice.
- Klik na rezultat te odvede direktno na tu stranicu i riječ.

## 4. Pozicija i markeri

- **Sačuvaj poziciju / Idi na sačuvanu poziciju** - pamti broj stranice po fajlu, u Firebase (uz potvrdu prije prepisivanja stare pozicije, i prikaz prethodne pozicije).
- **Marker Početak / Marker Kraj / Obriši markere** - klikneš na riječ, pa označiš početak i kraj proizvoljnog segmenta teksta (ne mora biti cijela stranica) - prikazuje tačan broj riječi između njih.

## 5. Race - mjerenje brzine (WPM)

- **Start Race / Stop Race** - mjeri WPM za svaku **završenu** stranicu (stranica na kojoj klikneš Stop se NE računa ako nije završena kroz "Sljedeća").
- Ako PDF ima samo **jednu stranicu**, Stop Race izračuna WPM direktno za nju (nema "Sljedeća" koja bi to normalno pokrenula).
- Nakon Stop-a, prikazuje se **prosjek** WPM-a kroz sve završene stranice.
- **Provjere na 1/5/10 minuta** - dodatno, kroz trku se automatski bilježi kumulativni WPM na 1., 5. i 10. minutu (od početka, bez pauziranog vremena), i njihov prosjek - pouzdanija procjena stvarne brzine nego mjerenje na kratko.
- **Pauza/Nastavi** (jedinstveno dugme) - pauzira Race (i Pacer ako je aktivan) istovremeno, npr. za prekid zbog posla. Vrijeme provedeno u pauzi se ne računa u mjerenje. Dok je pauzirano, "Sljedeća" i "Idi na str." su blokirani dok ne klikneš Nastavi.
- Prethodna kunela i skok na drugu stranicu se **ne** računaju kao završena stranica za Race.

## 6. Pacer - automatski vodeni tempo čitanja

- Postaviš **WPM** (ciljana brzina) i **veličinu grupe riječi** (select 1-10, default 3 - grupno, ne riječ-po-riječ, da odgovara tehnici perifernog/chunk čitanja).
- Highlight (boja podesiva - v. tačku 8) se sam pomjera kroz tekst tim tempom.
- **Auto-scroll** - ako highlight ode van vidljivog dijela ekrana, automatski se glatko skroluje da ostane vidljiv.
- Kad stigne do kraja stranice, samo se zaustavi (ti ručno klikćeš Sljedeća).
- Pri prelasku na novu stranicu, Pacer se automatski restartuje od početka (ako je i dalje aktivan).
- **Stop Pacer** ga potpuno isključuje.

## 7. Start/Stop za zalijepljeni tekst

- Kad koristiš "Zalijepi tekst" (ne PDF), imaš zaseban **Start/Stop** za mjerenje WPM-a tog teksta - Start zapamti vrijeme, Stop izračuna WPM (na osnovu trenutnog broja riječi u polju) i prikaže rezultat kroz SweetAlert.

## 8. Podešavanja (Sidebar - ⚙ ikonica)

- Nalazi se u uskoj traci sa lijeve strane ekrana (na telefonu se prebacuje na dno, vodoravno).
- **Countdown tajmer** - minute/sekunde, Start/Pauza/Reset. Ispravno pauzira (ne resetuje) i nastavlja od zaustavljenog vremena.
- **Štoperica** - Start/Pauza/Reset, broji uzlazno.
- **Boja Pacer highlight-a** - color picker u Podešavanjima, mijenja boju preko CSS varijable, pamti se u Firebase.

## 9. Schulte tabele (Tools tab)

- Veličine **5x5, 7x7, 9x9**.
- Broj **1 je uvijek fiksiran u centru**, ostali brojevi se promiješaju dugmetom "Promiješaj" - vježba za fiksiranje pogleda na centar i hvatanje okolnih brojeva perifernim vidom.

## 10. Firebase (sinhronizacija)

- Google login/logout.
- U Firestore (po korisniku) se čuvaju: veličina fonta, širina čitača, pozicija po PDF fajlu, margine (lijeva/desna + on/off), boja Pacer highlight-a, WPM tempo za Pacer.
- Zamijenjeno je ranije `localStorage` rješenje - sve novo što se pamti ide u Firebase, ne u localStorage.

## 11. Navigacija (Navbar)

- Home i Tools linkovi, hamburger meni na malim ekranima (ispod 768px), sa zatvaranjem klikom van menija.

## 12. Napomene o tehnikama čitanja (lično, ne u kodu)

- Trenutna tehnika: grupisanje riječi (chunking), periferno čitanje ivica reda, tehnika "čitanja unazad" na return sweep-u.
- Dvije linije margina (tačka 2) osmišljene su baš za tu tehniku - da vizuelno pokažu gdje periferno oko treba da hvata rub reda.

---

