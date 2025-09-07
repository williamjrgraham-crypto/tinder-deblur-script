// ==UserScript==
// @name        Tinder Deblur v3.1 Mejorado
// @namespace   JhonnyDev Scripts
// @match       https://tinder.com/*
// @grant       none
// @version     3.1
// @author      Tú
// @description Unblur actualizado con fetch adicional para asegurar imágenes limpias
// ==/UserScript==

(async function() {
  'use strict';

  function getToken() {
    return localStorage.getItem("TinderWeb/APIToken") || "";
  }

  async function fetchTeasers() {
    const res = await fetch('https://api.gotinder.com/v2/fast-match/teasers', {
      headers: {
        'X-Auth-Token': getToken(),
        platform: 'android'
      }
    });
    return res.ok ? (await res.json()).data.results : [];
  }

  async function fetchUser(id) {
    const res = await fetch(`https://api.gotinder.com/user/${id}`, {
      headers: {
        'X-Auth-Token': getToken(),
        platform: 'android'
      }
    });
    return res.ok ? (await res.json()).results : null;
  }

  async function unblur() {
    const teasers = await fetchTeasers();
    const elems = document.querySelectorAll('.Expand.enterAnimationContainer > div:nth-child(1)');
    teasers.forEach(async (t, i) => {
      const el = elems[i];
      if (!el) return;
      let url = t.user.photos?.[0]?.url;
      if (url?.includes('images-ssl') || url?.includes('unknown')) {
        const u = await fetchUser(t.user._id);
        if (u?.photos?.[0]?.url) url = u.photos[0].url;
      }
      if (url) {
        el.style.backgroundImage = `url(${url})`;
        el.style.filter = 'none';
      }
    });
  }

  function initObserver() {
    const check = () => {
      if (['/app/likes-you', '/app/gold-home'].includes(location.pathname)) {
        console.debug('Tinder Deblur: running unblur()');
        unblur();
      }
    };
    new MutationObserver(check).observe(document.body, { childList: true, subtree: true });
    setInterval(check, 5000);
  }

  window.addEventListener('load', initObserver);
})();


