import { useEffect, useState } from "react";

export default function Hour() {
	const [seconds, setSeconds] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setSeconds(new Date().getSeconds());
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	return <div className="text-red-800 bg-primary">Current seconds: {seconds}</div>;
}

