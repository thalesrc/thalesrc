import { loadRemote } from '@module-federation/enhanced/runtime';

console.log('Shell application loaded');

const app = document.getElementById('app');

class OswHome extends HTMLElement {
	connectedCallback() {
		loadRemote('osw/home/Home').then((module: any) => module.bootstrap(this)).catch((err) => {
			console.error('Error loading remote Home module:', err);
		});
	}
}

customElements.define('osw-home', OswHome);

if (app) {
  app.innerHTML = `
    <osw-home></osw-home>
  `;
}

export {};
