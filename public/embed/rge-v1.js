(function () {
  'use strict';
  var cfg = (typeof window !== 'undefined' && window.SARGEConfig) || {};
  var selector = cfg.container || '#sa-rge-search';
  var container = typeof document !== 'undefined' ? document.querySelector(selector) : null;
  if (!container) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[sa-rge-embed] container not found: ' + selector);
    }
    return;
  }
  var origin = cfg.origin || 'https://servicesartisans.fr';
  var params = new URLSearchParams();
  if (cfg.metier) params.set('metier', String(cfg.metier));
  if (cfg.theme) params.set('theme', String(cfg.theme));
  if (cfg.ville) params.set('ville', String(cfg.ville));
  var qs = params.toString();
  var src = origin + '/embed/rge' + (qs ? '?' + qs : '');
  var iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.title = 'Recherche artisan RGE — ServicesArtisans';
  iframe.setAttribute('loading', 'lazy');
  iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
  iframe.setAttribute(
    'sandbox',
    'allow-forms allow-scripts allow-top-navigation allow-popups'
  );
  iframe.style.width = '100%';
  iframe.style.minHeight = '120px';
  iframe.style.border = '0';
  iframe.style.display = 'block';
  container.innerHTML = '';
  container.appendChild(iframe);
})();
