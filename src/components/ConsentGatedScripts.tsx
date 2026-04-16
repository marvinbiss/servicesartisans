'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

interface ConsentState {
  analytics: boolean
  marketing: boolean
}

function getConsent(): ConsentState {
  try {
    const raw = localStorage.getItem('cookie_preferences')
    if (!raw) return { analytics: false, marketing: false }
    const parsed = JSON.parse(raw)
    return {
      analytics: parsed.analytics === true,
      marketing: parsed.marketing === true,
    }
  } catch {
    return { analytics: false, marketing: false }
  }
}

export default function ConsentGatedScripts() {
  const [consent, setConsent] = useState<ConsentState>({ analytics: false, marketing: false })

  useEffect(() => {
    setConsent(getConsent())
    const handler = () => setConsent(getConsent())
    window.addEventListener('cookie-preferences-updated', handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener('cookie-preferences-updated', handler)
      window.removeEventListener('storage', handler)
    }
  }, [])

  return (
    <>
      {consent.marketing && process.env.NEXT_PUBLIC_META_PIXEL_ID && (
        <Script id="meta-pixel" strategy="lazyOnload">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
fbq('track', 'PageView');`}
        </Script>
      )}
      {consent.analytics && (
        <Script id="contentsquare-deferred" strategy="lazyOnload">
          {`(function(){function l(){if(l.d)return;l.d=1;var s=document.createElement('script');s.src='https://t.contentsquare.net/uxa/8da7eeef2dab8.js';s.async=true;document.head.appendChild(s)}if(typeof requestIdleCallback==='function'){requestIdleCallback(l,{timeout:5000})}else{setTimeout(l,5000)}})();`}
        </Script>
      )}
    </>
  )
}
