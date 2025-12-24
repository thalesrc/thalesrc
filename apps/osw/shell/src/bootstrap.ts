import { loadRemote } from '@module-federation/enhanced/runtime';

console.log('Shell application loaded');

const app = document.getElementById('app');

class OswLanding extends HTMLElement {
	connectedCallback() {
		loadRemote('osw/landing').then((module: any) => module.bootstrap(this)).catch((err) => {
			console.error('Error loading remote Landing module:', err);
		});
	}
}

customElements.define('osw-landing', OswLanding);

if (app) {
  app.innerHTML = `
    <osw-landing></osw-landing>
  `;
}

export {};
