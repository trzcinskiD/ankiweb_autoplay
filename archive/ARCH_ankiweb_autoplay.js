// ==UserScript==
// @name         Ankiweb Autoplay
// @namespace    https://odblokowany.com/
// @version      1.0.0
// @description  Automatically plays sound files on ankiweb.net
// @author       trzcinskid
// @license      GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @match        https://ankiweb.net/study/
// @match        https://ankiuser.net/study/
// @grant        none
// ==/UserScript==

(function () {
  let playing = false;
  let playqueue = [];
  // observe obserwuje całe drzewko + dodawane i usuwane childy elementu
  const genoptions = {
    subtree: true,
    childList: true,
  };
  const audiooptions = {
    attributes: true,
    attributeFilter: ['src'],
    // true nic nie zmienia
    subtree: false,
  };
  // e to klawisz przy 'keydown'.
  const replay = (e) => {
    const isR = e.key ? e.key == 'r' || e.key == 'R' : e.keyCode == 67;
    // sprawdzanie czy wciśnięty został klawisz R
    if (isR) {
      // kolejką stają się wtedy wszystkie tagi audio. Poniższa funkcja tworzy z obiektu podobnego do array - array na której można w JS pracować.
      playqueue = [].slice.call(document.getElementsByTagName('audio'));
      // dźwięki są po kolei odtwarzane
      ff();
      // usuwany listener typu e czyli 'keydown' chyba???,
      // ale tej funkcji nie rozumiem. Do czego odnosi się this?, czym jest arguments calle? Dowiem się jak zadziała reszta.
      console.log(e.type);
      console.log(this);
      console.log(arguments.callee);
      this.removeEventListener(e.type, arguments.callee);
    }
  };
  const ff = () => {
    // odtwarzanie po kolei dźwięków z kolejki
    if (playqueue.length) {
      const el = playqueue.shift();
      el.play();
      el.addEventListener('ended', ff);
    } else {
      // jeśli kolejka pusta
      playing = false;
      const bs = document.getElementsByClassName('btn-primary'); // ta funkcja zwraca button-primary. [0] to study now z przejścia do talii (study now) a [1] to Show Answer
      let btn = bs[bs.length - 1]; // wybiera ostatni button z listy - w tym wypadku show answer
      if (window.getComputedStyle(btn).visibility == 'hidden') {
        // pobiera styl buttona show answer i sprawdza czy jest ukryty. Ukryty jest wtedy gdy pokazujemy odpowiedź. Ale wtedy dochodzi 3 button - good
        // dzięki tej funkcji i tak wybieramy wciąż jako button 'show answer'
        btn = bs[bs.length - 2];
      }
      // focusujemy się na buttonie show answer
      btn.focus();
      // resetowanie funkcji replay - czemu resetowanie to nie wiem..
      document.removeEventListener('keydown', replay);
      document.addEventListener('keydown', replay);
    }
  };
  // Funkcja otrzymuje mutation.target i jest uruchamian tylko w audiocallback
  const doplay = (t) => {
    console.log('doplay', t);
    // jeśli coś gra to dodaje aktualny target mutacji do kolejki
    if (playing) {
      playqueue.push(t);
    } else {
      // jeśli nic nie gra to ustawiana flaga, że już gra
      playing = true;
      // mutation.target.play() - gdy wywołam tą funkcję na tagu - document.getElementsByTagName('audio')[0].play() - to odpalę dźwięk
      t.play();
      // jeśli mutation.target skończy grać to wywołuje funkcje ff()
      t.addEventListener('ended', ff);
    }
    console.log('doplay', playqueue);
  };
  // Ta funkcja bierze mutacje z DOM.
  const audiocallback = (mutations) => {
    // Tablica mutacji przeglądana po kolei.
    mutations.forEach((m) => {
      // Z każdej mutacji wybiera target??
      // nie wiem co to jest ale console.log tu nie dociera. Gdzieś wczesniej musi sie blokować
      const t = m.target;
      // to dla audio pewnie - sprawdza czy element nie został odegrany i czy w ogóle ma źródło
      if (!t.srcdone && t.src) {
        // jeśli oba na tak to element oznaczany jako odegrany
        t.srcdone = true;
        // uruchamiana funkcja do grania dźwięku z mutation.target
        doplay(t);
      }
    });
  };
  const ma = new MutationObserver(audiocallback);
  const gencallback = (allmutations) => {
    document.removeEventListener('keydown', replay);
    playing = false;
    playqueue = [];
    // mam wszystkie mutacje. Jedna z nich dotyczy audio bo sie pojawiło a reszta innych rzeczy np. całego body
    allmutations.forEach((mr) => {
      // przechodzę przez wszystkie i ustalam dla każdej target -> czyli widok DOM
      const n = mr.target;
      [].forEach.call(n.getElementsByTagName('source'), (el) => {
        console.log('gencallback', el, el.srcdone, el.src);
        console.log(!el.srcdone);
        if (!el.srcdone && el.src) {
          // jeśli oba na tak to element oznaczany jako odegrany
          el.srcdone = true;
          console.log('srcdone after set', el.srcdone);
          // uruchamiana funkcja do grania dźwięku z mutation.target
          doplay(el.parentNode);
        }
        // ma.observe(el, audiooptions);
      });
    });
  };
  // obserwacja wszystkich mutacji w całym body i przekazanie ich do funkcji gencallback
  const mo = new MutationObserver(gencallback);
  mo.observe(document.body, genoptions);
})();
