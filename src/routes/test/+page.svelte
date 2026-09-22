<script>
/* global Swal */
    // --- Tri kratka teksta (~200 rijeci) za Brzi test ---
    const SHORT_TEXTS = [
`Vlak je kasnio već dvadeset minuta kad je Amir konačno ugledao svjetla stanice. Sjedio je sam u posljednjem vagonu, gledajući kroz prozor u maglu koja se dizala iznad polja. Kondukter je prošao pored njega treći put te noći, provjeravajući karte putnika kojih je bilo sve manje.

Na sljedećoj stanici ušla je starija žena sa velikom torbom punom jabuka. Sjela je nasuprot Amiru i ponudila mu jednu. On je zahvalio i uzeo je, iznenađen njenom ljubaznošću u tako kasan sat. Pričali su o vremenu, o poljima kroz koja su prolazili, o tome kako se svijet promijenio otkako je ona bila mlada.

Kad je vlak konačno stigao na njegovu stanicu, Amir je izašao u hladnu noć. Iza sebe je čuo zvižduk lokomotive koja je nastavljala dalje, noseći staricu i njenu torbu jabuka ka nekom drugom gradu, nekoj drugoj priči koju on nikad neće saznati.

Hodao je kući razmišljajući o tome koliko ljudi svaki dan prolazi kroz naše živote samo na trenutak, ostavljajući iza sebe malu, toplu uspomenu poput ukusa jabuke pojedene u vozu koji kasni.`,

`Pekar Ibrahim ustajao je svaki dan u četiri ujutru, mnogo prije nego što bi se grad probudio. Njegova mala pekara na uglu ulice mirisala je na svježi hljeb i kifle još dok su prve zvijezde blijedjele na nebu. Voljeo je tu tišinu, taj trenutak prije nego što bi svijet počeo da se kreće.

Prvi mušterija tog jutra bio je stari Mehmed, koji je dolazio svaki dan u isto vrijeme, kupovao isti hljeb i sjedao na klupu ispred pekare da ga pojede uz šoljicu kafe koju bi Ibrahim uvijek spremio. Nisu mnogo pričali, ali su se razumjeli kroz to malo jutarnje zajedništvo.

Kako je sunce izlazilo, sve više ljudi je ulazilo u pekaru. Djeca na putu za školu, radnici koji žure na posao, majke sa kolicima. Ibrahim je za svakoga imao osmijeh i toplu riječ, znajući imena skoro svih svojih mušterija.

Uveče, kad bi zatvorio pekaru, sjedio bi trenutak sam u tišini, gledajući praznu ulicu, zahvalan na životu koji je izgradio, hljeb po hljeb, jutro po jutro.`,

`Planinar Faruk je krenuo u zoru, dok je magla još ležala u dolinama poput bijelog pokrivača. Cilj mu je bio vrh koji je vidio stotinu puta iz grada, ali nikad se nije popeo na njega. Danas je odlučio da promijeni to.

Prvi sati hoda bili su lagani, staza je vodila kroz gustu šumu punu ptičjeg pjeva. Kako se penjao više, drveće je postajalo rjeđe, a vazduh hladniji i čistiji. Zaustavio se na jednoj litici da popije vodu i pogleda nazad na dolinu koja se prostirala ispod njega.

Oko podneva stigao je do najtežeg dijela staze, strme kamenite padine gdje je morao koristiti i ruke da se popne. Bio je umoran, noge su ga boljele, ali osjećaj blizine vrha davao mu je snagu da nastavi.

Kad je konačno stigao na vrh, pogled koji ga je dočekao oduzeo mu je dah. Cijela dolina, grad, rijeka koja se presijavala na suncu - sve je izgledalo drugačije odozgo, malo i mirno. Sjeo je na kamen, otvorio svoju flašu vode, i po prvi put te godine osjetio potpuni mir.`
    ];

    // --- Tri duza teksta (~2000 rijeci) za Kompletni test ---
    const LONG_TEXTS = [
`Čuvar svjetionika

Svjetionik na rtu Vela Straža stajao je tamo već sto dvadeset godina, uporno se opirući vjetrovima i olujama koje su dolazile sa otvorenog mora. Stariji stanovnici obližnjeg ribarskog sela pamtili su priče svojih djedova o tome kako je izgrađen, kamen po kamen, rukama ljudi koji su znali da će on jednog dana spasiti bezbroj života.

Petar je postao čuvar svjetionika prije dvadeset i tri godine, naslijedivši dužnost od svog oca, koji ju je naslijedio od svog. Bio je to posao koji se prenosio kroz generacije, kao neko tiho nasljeđe odgovornosti prema moru i onima koji njime plove. Svako jutro, prije zore, Petar bi se penjao stotinu i osamdeset stepenica do vrha kule da provjeri stanje svjetla, da očisti staklo od soli i prašine, da se uvjeri da mehanizam koji okreće snop svjetlosti radi besprijekorno.

Život na rtu bio je usamljen, ali Petar ga nije doživljavao tako. Imao je svoje navike, svoj ritam koji je pratio plimu i oseku, godišnja doba, seobe ptica koje su svake godine prolazile iznad njegovog malog svijeta. Njegova kuća, prilijepljena uz podnožje svjetionika, imala je samo dvije sobe, ali svaka je bila ispunjena knjigama koje je čitao tokom dugih zimskih večeri kada bi vjetar zavijao oko zidova poput izgubljene duše.

Jednog novembarskog jutra, dok je magla još uvijek ležala nisko nad vodom, Petar je primijetio nešto neobično na horizontu. Mali čamac, previše mali za takvo more, borio se sa talasima koji su prijetili da ga svakog trenutka prevrnu. Bez razmišljanja, Petar je pojurio niz stepenice, zgrabio svoj stari dogled i potrčao ka obali.

Kroz dogled je vidio čovjeka koji je očajnički veslao, pokušavajući da održi čamac usmjerenim ka obali. Petar je znao ovu obalu bolje od bilo koga živog - znao je gdje su stijene skrivene ispod površine, gdje su struje najopasnije, gdje bi čamac mogao biti razbijen u trenu ako bi skrenuo samo nekoliko metara u pogrešnom pravcu.

Zapalio je signalnu baklju i počeo mahati njome, pokušavajući privući pažnju čovjeka u čamcu i usmjeriti ga dalje od opasnosti. Prošlo je nekoliko dugih minuta neizvjesnosti prije nego što je čovjek u čamcu primijetio signal i promijenio kurs, slijedeći Petrove upute koliko je god mogao u takvom nevremenu.

Konačno, nakon što se činilo da traje čitavu vječnost, čamac je uspio da se probije kroz posljednje talase i pristane na malu pješčanu plažu ispod svjetionika. Petar je otrčao do njega i pomogao iscrpljenom čovjeku da izađe, umotavajući ga u ćebe koje je uvijek držao spremno za takve prilike, iako se, srećom, rijetko dešavale.

Čovjek se zvao Ante, ribar iz susjednog sela, čiji je motor otkazao usred noći dok je bio daleko na otvorenom moru. Veslao je satima, izgubljen u magli, ne znajući tačno gdje se nalazi, dok konačno nije ugledao svjetlo svjetionika koje ga je vodilo kući.

Te noći, dok su sjedili u Petrovoj maloj kuhinji, pijući vrelu supu koju je Petar brzo skuhao, Ante je pričao o strahu koji je osjećao dok je bio izgubljen na moru, o trenucima kada je mislio da neće nikad više vidjeti svoju porodicu. Petar ga je slušao ćutke, sjećajući se svih priča koje je čuo tokom godina o ljudima koje je more pokušalo uzeti, i o svjetlu koje ih je, iznova i iznova, vodilo nazad.

Sljedećih dana, vijest o spasavanju proširila se selom. Ljudi su dolazili do svjetionika, donoseći hranu i poklone, zahvaljujući Petru na onome što je uradio. On je uvijek skromno odbijao pohvale, govoreći da je samo radio svoj posao, da je svjetionik taj koji zaslužuje zahvalnost, ne on.

Ali duboko u sebi, Petar je znao da posao čuvara svjetionika nije samo o održavanju mehanizma i čišćenju stakla. Bio je to posao čuvanja nade, održavanja jednog malog svjetla u tami koje je govorilo izgubljenim dušama na moru: niste sami, put kući postoji, samo pratite svjetlo.

Zima je te godine bila posebno teška. Oluje su dolazile jedna za drugom, talasi su se razbijali o stijene sa silinom koja je tresla i sam svjetionik. Petar je proveo bezbrojne noći budan, provjeravajući mehanizam, uvjeravajući se da svjetlo nikad ne utrne, ni na trenutak, jer je znao da bi taj jedan trenutak mraka mogao značiti razliku između života i smrti za nekoga tamo vani.

Kada je napokon došlo proljeće, i more se smirilo, Petar je sjedio na svojoj uobičajenoj klupi ispred kuće, gledajući kako se sunce spušta iza horizonta, bojeći nebo u nijanse narandžaste i ljubičaste. Ante je počeo redovno svraćati, donoseći ribu koju bi ulovio, i njih dvojica su razgovarali o moru, o životu, o svemu što je prošlo.

Godine su prolazile, a Petar je nastavio svoju dužnost, penjući se svako jutro uz one iste stepenice, provjeravajući svjetlo, čekajući. Znao je da će jednog dana morati predati tu dužnost nekome drugom, možda svom sinu, ako ga ikad bude imao, ili nekom mladom čovjeku iz sela koji bi želio naučiti ovaj stari zanat.

Ali za sada, dok god je sunce zalazilo i noć dolazila, Petar je bio tamo, čuvar svjetla, čuvar nade, tihi heroj kojeg su znali samo oni koji su ga trebali, u onim trenucima kada je magla bila gusta, a put kući nejasan, i kada bi jedno jedino svjetlo na rtu bilo sve što stoji između njih i tame.`,

`Selo iznad rijeke

Selo Podgrađe smjestilo se na blagoj padini iznad rijeke Une, tamo gdje se zelena voda uvija oko stijena poput zmije koja spava. Generacijama su ovdje živjeli isti rodovi, obrađujući istu zemlju, čuvajući iste priče koje su se prenosile od djeda na unuka, od bake na unuku, kraj vatre koja nikad nije sasvim utrnula.

Hasan je odrastao slušajući te priče od svoje bake Fatime, koja je znala napamet historiju svakog kamena, svakog drveta, svake kuće u selu. Pričala mu je o velikoj poplavi koja se dogodila prije šezdeset godina, kada je rijeka nabujala toliko da je odnijela pola sela, i o tome kako su se ljudi ujedinili da ponovo izgrade sve što je izgubljeno.

Kao dijete, Hasan je provodio ljeta trčeći bosonog kroz polja pšenice, plivajući u hladnoj vodi rijeke sa ostalom djecom iz sela, penjući se na stara stabla oraha koja su rasla duž obale. Život je bio jednostavan, ritam određen godišnjim dobima - sjetva u proljeće, žetva u ljeto, berba u jesen, i dugi zimski mjeseci kada bi se selo skupilo oko vatre, čekajući proljeće.

Kada je Hasan navršio osamnaest godina, otišao je u grad da studira, kao što su mnogi mladi ljudi iz sela učinili prije njega. Grad je bio uzbudljiv, pun mogućnosti koje selo nikad nije moglo ponuditi, ali nešto duboko u njemu uvijek je čeznulo za mirom rijeke, za jednostavnošću života kojem je pripadao.

Godine su prolazile, a Hasan je izgradio život u gradu - posao, stan, krug prijatelja. Ali svakog ljeta, vraćao se u Podgrađe da posjeti baku Fatimu, koja je ostala u staroj porodičnoj kući, odbijajući da je napusti uprkos molbama svoje djece da dođu živjeti sa njima u gradu.

"Ovdje sam rođena, ovdje ću i umrijeti," govorila bi ona uvijek, sjedeći na svojoj verandi, gledajući rijeku koja je proticala ispod. "Grad je za mlade. Selo je za one koji znaju šta je zaista važno u životu."

Jednog ljeta, kada je Hasan došao u posjetu, zatekao je selo u pripremama za veliku svečanost - stogodišnjicu osnivanja lokalne škole. Cijelo selo bilo je uzbuđeno, pripremajući hranu, ukrašavajući glavni trg, pozivajući sve bivše učenike, gdje god da su živjeli, da se vrate na ovaj poseban dan.

Hasan je pomogao u pripremama, radeći rame uz rame sa ljudima koje je poznavao cijeli život, i sa mnogima koje nije vidio godinama. Bilo je nešto posebno u tom osjećaju zajedništva, u načinu na koji se cijelo selo ujedinilo oko jedne zajedničke svrhe.

Na dan svečanosti, stotine ljudi su se okupile na glavnom trgu. Stari učitelji pričali su priče o generacijama učenika koje su prošle kroz njihove učionice. Bivši učenici, sada odrasli sa svojom djecom, dijelili su sjećanja na svoje školske dane. Djeca su trčala okolo, igrajući se istih igara koje su njihovi roditelji i djedovi igrali decenijama ranije.

Hasan je stajao pored svoje bake, gledajući cijelu scenu sa osjećajem dubokog mira. Shvatio je da, bez obzira koliko daleko ode, bez obzira koliko godina provede u gradu, ovo mjesto će uvijek biti njegov korijen, njegovo mjesto pripadanja.

"Znaš," rekla je Fatima, gledajući ga sa osmijehom, "grad ti može dati posao, novac, uzbuđenje. Ali samo ovo mjesto može ti dati mir. Zato se uvijek vraćaš, zar ne?"

Hasan je klimnuo glavom, ne mogavši da nađe riječi koje bi u potpunosti opisale ono što je osjećao. Gledao je rijeku koja je nastavljala svoj vječni tok, isti tok koji je promatrao kao dijete, isti tok koji će nastaviti dugo nakon što svi oni budu otišli.

Te noći, dok je selo slavilo uz muziku i vatromet koji se odražavao na površini rijeke, Hasan je odlučio nešto važno. Razgovaraće sa svojim poslodavcem o mogućnosti rada na daljinu, barem nekoliko mjeseci godišnje, kako bi mogao provoditi više vremena ovdje, u mjestu koje je oblikovalo ko je on zaista.

Sljedećih godina, Hasan je pronašao način da živi između dva svijeta - grada koji mu je davao karijeru, i sela koje mu je davalo dušu. Njegova baka Fatima, iako je stario, nastavila je da sjedi na svojoj verandi svako veče, pričajući priče novim generacijama djece, čuvajući plamen sjećanja živim.

A rijeka je nastavila teći, kao što je tekla stoljećima prije, noseći sa sobom priče, sjećanja, i nade svih onih koji su ikad zvali Podgrađe svojim domom.`,

`Poslednja smjena

Inspektor Vlado Marić sjedio je za svojim stolom u policijskoj stanici, gledajući kroz prozor u kišu koja je padala na prazne ulice grada. Bila je to njegova posljednja smjena prije penzije, nakon trideset i dvije godine službe, i osjećao je čudnu mješavinu olakšanja i tuge dok je razmišljao o svim slučajevima koje je riješio, i onima koje nikad nije uspio.

Njegova kolegica, mlada detektivka Amela Hasić, ušla je u njegovu kancelariju noseći dvije šoljice kafe. "Posljednja noć, šefe," rekla je, spuštajući jednu šoljicu na njegov sto. "Osjećate li se sentimentalno?"

Vlado se nasmiješio, uzimajući kafu. "Više nego što bih priznao. Trideset i dvije godine je dug period da provedeš u jednom poslu. Vidio sam ovaj grad kako se mijenja, vidio sam generacije kriminalaca dolaziti i odlaziti, vidio sam kolege koji su postali prijatelji, i prijatelje koje smo izgubili u liniji dužnosti."

Upravo tada, telefon na njegovom stolu je zazvonio. Amela je podigla obrvu dok je Vlado odgovarao na poziv. Nakon nekoliko trenutaka, spustio je slušalicu sa ozbiljnim izrazom lica.

"Provala u staroj biblioteci na Trgu slobode," rekao je, ustajući i uzimajući svoj kaput. "Čuvar je pronašao razbijen prozor i nestali su neki stari rukopisi iz posebne zbirke. Hajdemo, ovo bi mogao biti moj posljednji slučaj."

Vožnja do biblioteke bila je tiha, obojica utonuli u svoje misli dok su kiša udarala o vjetrobransko staklo. Kada su stigli, čuvar biblioteke, stariji čovjek po imenu Josip, čekao ih je pred ulazom, izgledajući uznemireno.

"Nikad se ovo nije desilo prije," rekao je, vodeći ih do razbijenog prozora na zadnjoj strani zgrade. "Ova biblioteka stoji ovdje sto pedeset godina, i nikad nismo imali provalu."

Vlado je pažljivo pregledao mjesto zločina, primjećujući detalje koje je njegovo tridesetogodišnje iskustvo naučilo da traži - način na koji je staklo razbijeno, sugerišući da je počinilac znao tačno gdje udariti da izbjegne alarm; nedostatak otisaka prstiju, što je značilo profesionalca; i činjenicu da su samo određeni rukopisi nestali, dok su vrjedniji predmeti ostavljeni netaknuti.

"Ovo nije bio slučajan lopov," rekao je Vlado Ameli, dok je ona fotografisala mjesto zločina. "Neko je tačno znao šta traži."

Sljedećih sat vremena, pregledali su zapise biblioteke, pokušavajući identifikovati koji su tačno rukopisi ukradeni i ko bi mogao imati interes za njih. Josip im je pokazao katalog, i Vlado je primijetio nešto zanimljivo - svi ukradeni dokumenti bili su povezani sa istorijom lokalne porodice Kovačević, jedne od najstarijih i najuglednijih porodica u gradu.

"Kovačevići," promrmljao je Vlado, sjećajući se starih priča o toj porodici. "Čuo sam glasine da postoji spor oko nasljedstva unutar porodice. Možda je ovo povezano."

Amela je brzo istražila i otkrila da je najstariji sin porodice Kovačević, Damir, nedavno bio u pravnoj bitci sa svojom sestrom oko porodičnog imanja. Dokumenti koji su nestali mogli su sadržati informacije relevantne za taj spor - možda stari testament ili dokaz o vlasništvu koji bi mogao promijeniti ishod slučaja.

Vlado i Amela su otišli do Damirove kuće te večeri, i nakon nekoliko sati ispitivanja, Damir je konačno priznao. Unajmio je nekoga da ukrade dokumente koji su dokazivali da je njegova sestra imala zakonsko pravo na veći dio nasljedstva, nadajući se da će ih uništiti prije nego što advokati mogu da ih koriste na sudu.

Dok su vodili Damira u pritvor, Vlado je osjetio poznato zadovoljstvo koje je dolazilo sa rješavanjem slučaja - osjećaj da je pravda, makar u ovom malom slučaju, izvršena. Bio je to osjećaj koji ga je motivisao kroz sve ove godine, kroz sve teške noći i opasne situacije.

Kasno te noći, kada su se konačno vratili u stanicu da završe papirologiju, Amela je pogledala Vlada sa osmijehom. "Nije loše za posljednji slučaj, šefe. Kompletan misterij, riješen za jednu noć."

Vlado se nasmijao, osjećajući umor, ali i duboko zadovoljstvo. "Znaš, mislio sam da ću provesti posljednju smjenu čitajući stare izvještaje i prisjećajući se prošlosti. Umjesto toga, dobio sam jedan posljednji pravi slučaj da pokažem da stari pas još uvijek ima nekoliko trikova."

Kada je sunce počelo izlaziti, obilježavajući kraj njegove posljednje smjene i početak njegovog penzionisanja, Vlado je stajao na balkonu policijske stanice, gledajući grad koji je štitio tolike godine. Amela mu se pridružila, noseći dvije šoljice svježe kafe.

"Šta ćete raditi sad, šefe? Sad kad više nećete biti inspektor Marić?"

Vlado je razmislio o pitanju na trenutak. "Mislim da ću konačno naučiti pecati kako mi je otac uvijek govorio. Ali znaš šta, Amela? Mislim da ću povremeno svraćati ovamo. Ne mogu se u potpunosti odvojiti od ovog mjesta, od ovog posla. Previše je duboko utkano u ono ko sam ja."

Amela se nasmiješila, podižući svoju šoljicu kafe u malu zdravicu. "Za trideset i dvije godine službe, i za mnogo više godina mira koji dolazi poslije."

Vlado je kucnuo svoju šoljicu o njenu, gledajući preko grada dok je sunce obasjavalo ulice koje je štitio toliko dugo. Bila je to dobra karijera, pomislio je. Dobar život, posvećen zaštiti drugih. I dok je posljednja smjena završavala, osjećao je mir znajući da ostavlja grad u sposobnim rukama mlade detektivke pored sebe.`
    ];

    let testType = $state('brzi'); // 'brzi' | 'kompletni'
    let testText = $state('');
    let testActive = $state(false);
    let testStartTime = 0;
    let results = $state([]); 
    
    let fontSize = $state(20);
    let isJustified = $state(true); // Default uključeno obostrano poravnanje

    function changeFont(delta) {
        fontSize = Math.max(12, Math.min(32, fontSize + delta));
    }

    function resetFont() {
        fontSize = 16;
    }

    function toggleJustify() {
        isJustified = !isJustified;
    }

    // Funkcija za učitavanje .txt fajla sa računara
    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            testText = e.target.result;
        };
        reader.readAsText(file);
        
        // Resetuje input da može ponovo isti fajl da se izabere po potrebi
        event.target.value = '';
    }

    function countWords(s) {
        const trimmed = s.trim();
        if (trimmed.length === 0) return 0;
        return trimmed.split(/\s+/).length;
    }

    function selectTestType(type) {
        if (testActive) return;
        testType = type;
    }

    function generateText() {
        if (!testType) {
            Swal.fire('Info', 'Prvo izaberi tip testa (Brzi ili Kompletan).', 'info');
            return;
        }
        const pool = testType === 'brzi' ? SHORT_TEXTS : LONG_TEXTS;
        testText = pool[Math.floor(Math.random() * pool.length)];
    }

    function startTest() {
        if (!testType) {
            Swal.fire('Info', 'Prvo izaberi tip testa.', 'info');
            return;
        }
        if (!testText.trim()) {
            Swal.fire('Info', 'Prvo generiši, učitaj fajl ili nalijepi tekst za citanje.', 'info');
            return;
        }
        testActive = true;
        testStartTime = Date.now();
    }

    function stopTest() {
        if (!testActive) return;
        const seconds = (Date.now() - testStartTime) / 1000;
        const wordCount = countWords(testText);
        const minutes = seconds / 60;
        const wpm = minutes > 0 ? Math.round(wordCount / minutes) : 0;
        testActive = false;

        results = [...results, { type: testType, words: wordCount, seconds, wpm, fontSize }];

        Swal.fire({
            title: 'Rezultat',
            html:
                'Tip: ' +
                (testType === 'brzi' ? 'Brzi test' : 'Kompletan test') +
                '<br>Rijeci: ' +
                wordCount +
                '<br>Vrijeme: ' +
                seconds.toFixed(1) +
                's<br><b>WPM: ' +
                wpm +
                '</b>',
            icon: 'success'
        });
    }

    function clearAll() {
        if (testActive) return;
        testText = '';
    }
</script>

<svelte:head>
    <title>Brzo Čitanje</title>
</svelte:head>

<div class="test-wrap row">
    <fieldset class="border p-3 rounded bg-info">
        <legend class="px-2 fw-bold text-danger text-center pb-4">Test brzine čitanja</legend>

        <div class="d-flex justify-content-center gap-4 mb-3">
            <div class="form-check">
                <input
                    class="form-check-input"
                    type="radio"
                    name="testType"
                    id="testBrzi"
                    checked={testType === 'brzi'}
                    disabled={testActive}
                    onclick={() => selectTestType('brzi')}
                />
                <label class="form-check-label text-primary fw-bolder" for="testBrzi">Brzi test ( 1 minuta)</label>
            </div>
            <div class="form-check">
                <input
                    class="form-check-input"
                    type="radio"
                    name="testType"
                    id="testKompletni"
                    checked={testType === 'kompletni'}
                    disabled={testActive}
                    onclick={() => selectTestType('kompletni')}
                />
                <label class="form-check-label text-primary fw-bolder" for="testKompletni">Kompletan test ( 10 minuta)</label>
            </div>
        </div>

        <!-- Glavne kontrole: Font, Justify, Učitaj fajl, Generiši, Obriši -->
        <div class="d-flex flex-wrap justify-content-center align-items-center gap-2 mb-3">
            <!-- Font kontrole -->
            <div class="btn-group btn-group-sm" role="group">
                <button class="btn btn-outline-light text-dark fw-bold" type="button" onclick={() => changeFont(-1)}>A-</button>
                <span class="btn btn-light disabled text-dark">{fontSize}px</span>
                <button class="btn btn-outline-light text-dark fw-bold" type="button" onclick={() => changeFont(1)}>A+</button>
                <button class="btn btn-outline-light text-dark" type="button" onclick={resetFont}>Reset</button>
            </div>

            <!-- Dugme za ravnanje (Justify) -->
            <button 
                class="btn btn-sm {isJustified ? 'btn-warning' : 'btn-danger text-light'}" 
                type="button" 
                onclick={toggleJustify}
                title="Uključi/isključi obostrano poravnanje teksta">
                Justify
            </button>

            <!-- Učitavanje TXT fajla -->
            <label class="btn btn-outline-light btn-sm text-dark mb-0" style="cursor: pointer;">
                Učitaj fajl (.txt)
                <input type="file" accept=".txt" class="d-none" onchange={handleFileUpload} disabled={testActive} />
            </label>

            <!-- Generisanje i brisanje -->
            <button class="btn btn-outline-light btn-sm text-dark" type="button" onclick={generateText} disabled={testActive}>Generisi</button>
            <button class="btn btn-outline-danger btn-sm" type="button" onclick={clearAll} disabled={testActive}>Obrisi</button>
        </div>

        <!-- Textarea sa dinamičkim fontom i opcionalnim justify ravnanjem -->
        <textarea
            class="form-control mb-3 custom-textarea" 
            rows="14"
            style="font-size: {fontSize}px; text-align: {isJustified ? 'justify' : 'left'};"
            placeholder="Generisi tekst, učitaj .txt fajl sa računara, ili nalijepi svoj tekst ovdje..."
            bind:value={testText}
            disabled={testActive}
        ></textarea>

        <div class="d-flex justify-content-center gap-2">
            {#if !testActive}
                <button class="btn btn-warning" type="button" onclick={startTest}>🏁 Start</button>
            {:else}
                <button class="btn btn-danger" type="button" onclick={stopTest}>⏹ Stop</button>
            {/if}
        </div>

        {#if results.length > 0}
            <div class="mt-3">
                <div class="fw-bold small mb-1">Rezultati (ova sesija):</div>
                {#each results as r, i}
                    <div class="info">
                        {i + 1}. {r.type === 'brzi' ? 'Brzi' : 'Kompletan'} - {r.words} rijeci, {r.seconds.toFixed(1)}s, {r.fontSize}px -
                        <strong>{r.wpm} wpm</strong>
                    </div>
                {/each}
            </div>
        {/if}
    </fieldset>
</div>

<style>
    .test-wrap {
        max-width: 700px;
        margin: 0 auto;
    }
    .info {
        font-size: 15px;
        color: #333;
    }
    /* Osigurava da se tekst unutar textarea lijepo ponaša kod obostranog poravnanja */
    .custom-textarea {
        line-height: 1.6;
    }
</style>