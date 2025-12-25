export function Header() {
	return (
		<header className="relative py-20 px-6">
			<div className="max-w-6xl mx-auto text-center">
				<div className="inline-block mb-6">
					<div
						className="text-8xl font-black mb-4 bg-gradient-to-r from-primary-600 via-secondary-600 to-tertiary-600 bg-clip-text text-transparent animate-pulse"
						style={{ animationDuration: '3s' }}
					>
						Thalesrc
					</div>
					<div className="h-2 bg-gradient-to-r from-primary-500 via-secondary-500 to-tertiary-500 rounded-full" />
				</div>
				<p className="text-3xl font-bold mb-4 bg-gradient-to-r from-quaternary-600 to-warning-600 bg-clip-text text-transparent">
					Open Source Magic ✨
				</p>
				<p className="text-xl text-neutral-700 max-w-3xl mx-auto">
					A vibrant collection of high-quality libraries crafted with passion for the modern JavaScript ecosystem
				</p>
			</div>
		</header>
	);
}
