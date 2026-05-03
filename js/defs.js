/* ══════════════════════════════════════════════
   DEFS — card definitions, suggestions, admin constants
══════════════════════════════════════════════ */

var ADMIN_KEY = 'pep_admin_v1';
var adminData = {
  assessors:[],specialists:[],departments:[],positions:[],
  people:[],
  archived:{assessors:[],specialists:[],departments:[],positions:[]},
  history:[],
  periods:[
    {code:'P1',name:'P1',from:'01-01',to:'04-30'},
    {code:'P2',name:'P2',from:'05-01',to:'08-31'},
    {code:'P3',name:'P3',from:'09-01',to:'12-31'}
  ],
  goals:{callsPerPeriod:9,mailsPerPeriod:9,systemsPerPeriod:9,minAvg:92,greatShare:60},
  access:{role:'admin'}
};
var ADMIN_ICONS = {assessors:'👤',specialists:'🧑',departments:'🏢',positions:'💼'};


// ══════════════════════════════════════════════
// DEFINITIONS
// ══════════════════════════════════════════════
const DEFS={
  r:{name:'Karta Rozmów',cl:'Rozmowa',sections:[
    {key:'mery',lbl:'I. Merytoryka',w:.45,cls:'sec-a',criteria:[
      {n:'Weryfikacja klienta',h:'Poprawna identyfikacja dzwoniącego zgodnie z obowiązującą procedurą; wymagane pytania weryfikacyjne przed udzieleniem jakichkolwiek informacji.'},
      {n:'Znajomość procedur i poprawność merytoryczna',h:'Informacje zgodne z bazą wiedzy, aktualnymi procedurami oraz wytycznymi przełożonego; brak błędów merytorycznych.'},
      {n:'Rozpoznanie potrzeb klienta',h:'Specjalista poprawnie identyfikuje powód kontaktu, zadaje właściwe pytania, weryfikuje sprawę przed działaniem; klient nie musi się powtarzać.'},
      {n:'Empatia i nastawienie na klienta',h:'Specjalista rozpoznaje emocje klienta i reaguje adekwatnie; okazuje zrozumienie; klient czuje się wysłuchany i zaopiekowany.'},
      {n:'Rozwiązanie sprawy i FTR (First Time Resolution)',h:'Działania prowadzące do rozwiązania sprawy podczas jednego kontaktu; skupia się na kompletnym rozwiązaniu; prawidłowy status FTR w systemie.'},
      {n:'Działania uzgodnione z klientem i samodzielność',h:'Zlecone działania adekwatne do informacji od klienta; obsługa standardowych spraw samodzielnie, bez zbędnych konsultacji.'},
      {n:'Edukacja i usamodzielnienie klienta',h:'Specjalista przekazuje klientowi wiedzę umożliwiającą samodzielne działanie w przyszłości; autentyczne zaangażowanie; brak proszenia o NPS.'},
    ]},
    {key:'jak',lbl:'II. Jakość / Komunikacja',w:.45,cls:'sec-b',criteria:[
      {n:'Struktura rozmowy (przywitanie, przedstawienie, podsumowanie, pożegnanie)',h:'Uporządkowana i logiczna rozmowa. Czytelne powitanie i przedstawienie, podsumowanie ustaleń, wskazanie dalszych kroków, uprzejme pożegnanie.'},
      {n:'Ton, tempo i atmosfera rozmowy',h:'Uprzejmy i profesjonalny ton przez cały czas rozmowy. Tempo dostosowane do rozmówcy. Brak oznak zniecierpliwienia, podnoszenia głosu.'},
      {n:'Poprawność i zrozumiałość językowa. Zwroty grzecznościowe.',h:'Informacje formułowane prosto i jasno. Brak zdrobnień i niewyjaśnionych pojęć specjalistycznych. Używa: "proszę", "dziękuję", "przepraszam".'},
      {n:'Aktywne słuchanie, dostosowanie się do rozmówcy',h:'Specjalista uważnie słucha, reaguje adekwatnie, zadaje pytania doprecyzowujące, potrafi sparafrazować kluczowe kwestie.'},
      {n:'Prowadzenie rozmowy, zarządzanie ciszą',h:'Specjalista kontroluje przebieg rozmowy. Nie pozostawia klienta bez kontaktu ponad 2 min. bez uprzedzenia. Informuje o podejmowanych działaniach.'},
      {n:'Język korzyści, pozytywna narracja',h:'Komunikaty z językiem korzyści; skupienie na możliwościach dostępnych dla klienta; unikanie negatywnych sformułowań.'},
      {n:'Edukacja klienta',h:'Informuje klienta o dostępnych opcjach lub usprawnieniach. Oferuje wsparcie i wspiera budowanie samodzielności klienta w przyszłości.'},
    ]},
    {key:'sys',lbl:'III. Działania w Systemach',w:.10,cls:'sec-c',criteria:[
      {n:'Poprawne uzupełnienie skryptu w Altarze (FTR / OTRS)',h:'Prawidłowy zapis sprawy; status FTR; typ problemu; MID/OID/TID; właściwy dział/usługa; podpisanie zgłoszenia zgodnie z procedurą.'},
      {n:'Czas ACW – działania po zakończeniu rozmowy',h:'Czas przeznaczony na działania po rozmowie zgodny z procedurą; Specjalista nie przedłuża zbędnie czasu ACW.'},
    ]},
  ]},
  m:{name:'Karta Maili',cl:'Mail',sections:[
    {key:'mery',lbl:'I. Merytoryka',w:.45,cls:'sec-a',criteria:[
      {n:'Weryfikacja klienta',h:'Poprawna identyfikacja nadawcy / weryfikacja danych zgodnie z obowiązującą procedurą.'},
      {n:'Poprawność merytoryczna odpowiedzi',h:'Informacje zgodne z bazą wiedzy lub wytycznymi przełożonego; brak błędów merytorycznych.'},
      {n:'Rozpoznanie potrzeb i celu kontaktu',h:'Odpowiedź odnosi się do wszystkich pytań klienta; poprawne określenie powodu kontaktu.'},
      {n:'Rozwiązanie sprawy (FTR) i działania uzgodnione z klientem',h:'Odpowiedź adekwatna do potrzeb; działania zgodne z procedurą FTR; rozwiązanie przy pierwszym kontakcie.'},
      {n:'Edukacja / usamodzielnienie klienta',h:'Przekazanie wiedzy umożliwiającej klientowi samodzielne działanie; zachowanie standardów instrukcji.'},
    ]},
    {key:'jak',lbl:'II. Jakość / Komunikacja',w:.45,cls:'sec-b',criteria:[
      {n:'Powitanie i zakończenie – zgodność ze standardem',h:'Powitanie zgodne z zasadami (Szanowny Panie/Pani); pożegnanie spójne z formą powitania; dostosowanie do płci/stanowiska.'},
      {n:'Profesjonalizm i struktura wiadomości',h:'Jednolita czcionka, kolorystyka, formatowanie; poprawna stopka; modyfikacja tematu odpowiedzi; zwięzła treść.'},
      {n:'Poprawność językowa i unikanie negatywizmów',h:'Brak błędów ortograficznych/gramatycznych; brak zdrobnień, osłabiaczy, zwrotów: Witam, Cześć, Ty/Oni; język korzyści.'},
      {n:'Jasność przekazu i ekspozycja kluczowych informacji',h:'Najważniejsze elementy wyróżnione; logiczna struktura; informacje łatwe do zrozumienia dla klienta.'},
      {n:'Inicjatywa i postawa pro-kliencka',h:'Proponowanie najlepszych rozwiązań; przejęcie kontroli nad sprawą; przy odpowiedzi >48h – przeprosiny za czas oczekiwania.'},
    ]},
    {key:'sys',lbl:'III. Działania w Systemach',w:.10,cls:'sec-c',criteria:[
      {n:'Poprawne uzupełnienie systemów (Altar / FTR / OTRS / CRM)',h:'Prawidłowy zapis sprawy; status FTR; typ problemu; MID/OID/TID; właściwy dział/usługa; podpisanie zgłoszenia.'},
      {n:'Efektywny czas obsługi maila',h:'Zgodność z procedurą czasu odpowiedzi; prawidłowy zapis w historii Altara.'},
    ]},
  ]},
  s:{name:'Karta Systemów',cl:'Kontakt',sections:[
    {key:'obs',lbl:'I. Obsługa w Systemach',w:.50,cls:'sec-a',criteria:[
      {n:'Poprawne uzupełnienie skryptu w Altarze (w tym FTR)',h:'Prawidłowy status FTR; poprawny typ problemu; kompletna historia kontaktu w Altarze; brak błędów zapisu zgodnie z procedurą.'},
      {n:'Poprawne uzupełnienie pozostałych systemów w obrębie uprawnień',h:'Wszystkie obsługiwane systemy uzupełnione poprawnie (OTRS, CRM, MVM i inne); brak pominiętych pól obowiązkowych.'},
    ]},
    {key:'dok',lbl:'II. Dokumentacja Zgłoszenia',w:.30,cls:'sec-b',criteria:[
      {n:'Poprawny zapis zgłoszenia / wiadomości',h:'Podpisanie zgłoszenia/wiadomości; poprawny temat i treść; właściwy dział, usługa oraz dane (MID/OID/TID) zgodnie z procedurą.'},
      {n:'Prawidłowe przekazanie sprawy / eskalacja',h:'Sprawy przekazane do właściwego działu z kompletnym opisem; poprawna eskalacja; brak zbędnych przekierowań standardowych spraw.'},
    ]},
    {key:'eff',lbl:'III. Efektywność',w:.20,cls:'sec-c',criteria:[
      {n:'Efektywny czas obsługi (ACW / czas skryptu / czas maila)',h:'Czas działań po zakończeniu kontaktu zgodny z procedurą; brak nieuzasadnionego przedłużania czasu obsługi posprzedażowej.'},
      {n:'Samodzielność Specjalisty',h:'Standardowe sprawy obsłużone bez zbędnych konsultacji; konsultacje tylko przy sprawach niestandardowych lub zgodnie z procedurą.'},
    ]},
  ]},
};

// COMMENT SUGGESTIONS per section
const SUGGESTIONS={
  mery:['Brak weryfikacji klienta','Błędna informacja merytoryczna','Nie rozpoznał potrzeby','Brak empatii','Sprawa nierozwiązana','Zależność od konsultacji','Brak edukacji klienta'],
  jak:['Brak przywitania','Nieodpowiedni ton','Błędy językowe','Nie słuchał aktywnie','Długie przerwy bez informacji','Negatywne sformułowania','Brak podsumowania'],
  sys:['Błędny zapis w Altarze','ACW przekroczony'],
  obs:['Brak zapisu FTR','Pominięte systemy'],
  dok:['Błędny zapis zgłoszenia','Zła eskalacja'],
  eff:['ACW przekroczony','Zbędne konsultacje'],
};

