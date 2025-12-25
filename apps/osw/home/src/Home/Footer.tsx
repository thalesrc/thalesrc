export function Footer() {
	return (
		<footer className="relative py-10 px-6 border-t-2 border-gradient-to-r from-primary-200 via-secondary-200 to-tertiary-200">
			<div className="max-w-6xl mx-auto">
				<div className="flex flex-col items-center gap-4">
					<p className="text-lg font-semibold bg-linear-to-r from-primary-600 via-secondary-600 to-tertiary-600 bg-clip-text text-transparent">
						Built with 💜 for developers, by developers
					</p>
					<div className="flex gap-6 items-center flex-wrap justify-center">
						<a
							href="https://www.npmjs.com/org/thalesrc"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-2 text-neutral-700 hover:text-primary-600 transition-colors font-medium"
						>
							<span className="text-xl">📦</span>
							<span>npm @thalesrc</span>
						</a>
						<span className="text-neutral-300">•</span>
						<a
							href="https://github.com/thalesrc/thalesrc"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-2 text-neutral-700 hover:text-primary-600 transition-colors font-medium"
						>
							<span className="text-xl">⭐</span>
							<span>GitHub Repository</span>
						</a>
					</div>
					<p className="text-neutral-500 text-sm">Empowering the open source community, one library at a time</p>
				</div>
			</div>
		</footer>
	);
}
