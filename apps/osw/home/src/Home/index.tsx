import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import Home from './Home';

export async function bootstrap(element: HTMLElement) {
	const root = ReactDOM.createRoot(element);

	root.render(
		<StrictMode>
			<Home />
		</StrictMode>
	);

	return () => root.unmount();
}
