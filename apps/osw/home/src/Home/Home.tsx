import { lazy, Suspense, useState } from "react";

import classes from "./Home.module.scss";

const Hour = lazy(() => import("./Hour"));

export default function Home() {
	const [count, setCount] = useState(0);

	console.log(classes);

	return <div className={classes.wrapper}>
		<h1 className="bg-linear-to-r from-primary-222/50 to-quaternary-990/80 text-secondary-888">Layout Module</h1>
		<p>This is the Layout module loaded via Module Federation.</p>
		<p>Count: {count}</p>
		<button onClick={() => setCount(count + 1)}>Increment</button>
		<Suspense fallback={<div>Loading...</div>}>
			<Hour />
		</Suspense>
	</div>;
}
