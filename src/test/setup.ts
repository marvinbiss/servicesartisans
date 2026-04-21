import '@testing-library/jest-dom'

// jsdom ne polyfill pas `Element.scrollIntoView` — les composants qui en
// font usage dans des setTimeout (scroll vers section quiz, etc.) lèvent
// un TypeError asynchrone qui pollue la sortie des tests et peut faire
// crasher le runner. On stub avec un no-op.
if (typeof window !== 'undefined' && typeof Element !== 'undefined') {
  if (typeof Element.prototype.scrollIntoView !== 'function') {
    Element.prototype.scrollIntoView = function scrollIntoViewStub() {
      /* no-op */
    }
  }
  if (typeof window.scrollTo !== 'function') {
    Object.defineProperty(window, 'scrollTo', {
      value: () => {},
      writable: true,
    })
  }
}
