export function BackgroundBlobs() {
	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none">
			<div
				className="absolute -top-40 -left-40 w-96 h-96 bg-linear-to-br from-primary-300/30 to-secondary-300/30 rounded-full blur-3xl animate-pulse"
				style={{ animationDuration: '4s' }}
			/>
			<div
				className="absolute top-1/3 -right-40 w-96 h-96 bg-linear-to-br from-tertiary-300/30 to-quaternary-300/30 rounded-full blur-3xl animate-pulse"
				style={{ animationDuration: '6s' }}
			/>
			<div
				className="absolute -bottom-40 left-1/3 w-96 h-96 bg-linear-to-br from-warning-300/30 to-danger-300/30 rounded-full blur-3xl animate-pulse"
				style={{ animationDuration: '5s' }}
			/>
		</div>
	);
}
