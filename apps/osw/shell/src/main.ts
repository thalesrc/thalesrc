import { registerRemotes } from '@module-federation/enhanced/runtime';

fetch('/assets/module-federation.manifest.json')
  .then((res) => res.json())
  .then((remotes: Record<string, string>) =>
    Object.entries(remotes).map(([name, entry]) => ({ name, entry }))
  )
  .then((remotes) => registerRemotes(remotes))
  .then(() => { // Head insertions
    const gtagScript = document.createElement('script');

    gtagScript.async = true;
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.GOOGLE_ANALYTICS_ID}`;
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]){window.dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', `${import.meta.env.GOOGLE_ANALYTICS_ID}`);
    document.head.appendChild(gtagScript);
  })
  .then(() => Promise.all([
    import('@thalesrc/elements/router')
  ]))
  .then(() => import('./bootstrap').catch((err) => console.error(err)));
