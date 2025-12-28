import { loadRemote } from '@module-federation/enhanced/runtime';

class OswHome extends HTMLElement {
	connectedCallback() {
		loadRemote('osw/home/Home').then((module: any) => module.bootstrap(this)).catch((err) => {
			console.error('Error loading remote Home module:', err);
		});
	}
}

customElements.define('osw-home', OswHome);

export {};
