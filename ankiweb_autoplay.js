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
  const genoptions = {
    subtree: true,
    childList: true,
  };
  const replay = (e) => {
    const isR = e.key ? e.key == 'r' || e.key == 'R' : e.keyCode == 67;
    if (isR) {
      playqueue = [].slice.call(document.getElementsByTagName('audio'));
      ff();
      document.removeEventListener('keydown', replay);
    }
  };
  const ff = () => {
    if (playqueue.length) {
      const el = playqueue.shift();
      el.play();
      el.addEventListener('ended', ff);
    } else {
      playing = false;
      const bs = document.getElementsByClassName('btn-primary');
      let btn = bs[bs.length - 1];
      if (window.getComputedStyle(btn).visibility == 'hidden') {
        btn = bs[bs.length - 2];
      }
      btn.focus();
      document.removeEventListener('keydown', replay);
      document.addEventListener('keydown', replay);
    }
  };
  const doplay = (t) => {
    if (playing) {
      playqueue.push(t);
    } else {
      playing = true;
      t.play();
      t.addEventListener('ended', ff);
    }
  };
  const gencallback = (allmutations) => {
    document.removeEventListener('keydown', replay);
    playing = false;
    playqueue = [];
    allmutations.forEach((mr) => {
      const n = mr.target;
      [].forEach.call(n.getElementsByTagName('source'), (el) => {
        if (!el.srcdone && el.src) {
          el.srcdone = true;
          doplay(el.parentNode);
        }
      });
    });
  };
  const mo = new MutationObserver(gencallback);
  mo.observe(document.body, genoptions);
})();
