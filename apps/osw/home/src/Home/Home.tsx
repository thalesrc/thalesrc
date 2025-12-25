export default function Home() {
	const libraries = [
		{
			name: '@thalesrc/js-utils',
			description: 'Comprehensive JavaScript utility functions for web development. Tree-shakeable, zero dependencies, high performance utilities with full TypeScript support.',
			category: 'JavaScript',
			emoji: '✨',
			gradient: 'from-primary-400 via-primary-500 to-primary-700',
			hoverGradient: 'hover:from-primary-500 hover:via-primary-600 hover:to-primary-800',
			npmPackage: 'js-utils'
		},
		{
			name: '@thalesrc/ts-utils',
			description: 'Advanced TypeScript utility functions and helper methods. Simplify complex operations with type-safe utilities designed for modern TypeScript projects.',
			category: 'TypeScript',
			emoji: '🎯',
			gradient: 'from-secondary-400 via-secondary-500 to-secondary-700',
			hoverGradient: 'hover:from-secondary-500 hover:via-secondary-600 hover:to-secondary-800',
			npmPackage: 'ts-utils'
		},
		{
			name: '@thalesrc/extra-ts-types',
			description: 'Extra TypeScript utility types for advanced type manipulation and better type safety. Expand your type toolkit with powerful type utilities.',
			category: 'TypeScript',
			emoji: '🔷',
			gradient: 'from-secondary-500 via-primary-500 to-tertiary-500',
			hoverGradient: 'hover:from-secondary-600 hover:via-primary-600 hover:to-tertiary-600',
			npmPackage: 'extra-ts-types'
		},
		{
			name: '@thalesrc/react-utils',
			description: 'Production-ready React hooks and utility components. Simplify your React development with reusable, well-tested hooks and components.',
			category: 'React',
			emoji: '⚛️',
			gradient: 'from-tertiary-400 via-tertiary-500 to-tertiary-700',
			hoverGradient: 'hover:from-tertiary-500 hover:via-tertiary-600 hover:to-tertiary-800',
			npmPackage: 'react-utils'
		},
		{
			name: '@thalesrc/rx-utils',
			description: 'Powerful RxJS utilities and operators. Convert Observables to AsyncIterables, create custom operators, and streamline reactive programming.',
			category: 'RxJS',
			emoji: '🌊',
			gradient: 'from-quaternary-400 via-quaternary-500 to-quaternary-700',
			hoverGradient: 'hover:from-quaternary-500 hover:via-quaternary-600 hover:to-quaternary-800',
			npmPackage: 'rx-utils'
		},
		{
			name: '@thalesrc/dom-utils',
			description: 'Essential DOM manipulation and query utilities. Simplify browser interactions with intuitive helper functions for modern web development.',
			category: 'Browser',
			emoji: '🎨',
			gradient: 'from-success-400 via-success-500 to-success-700',
			hoverGradient: 'hover:from-success-500 hover:via-success-600 hover:to-success-800',
			npmPackage: 'dom-utils'
		},
		{
			name: '@thalesrc/drag-drop',
			description: 'Framework-independent drag-and-drop library built with Lit Elements. Works with React, Vue, Angular, or vanilla JS with extended drag-drop events.',
			category: 'Browser',
			emoji: '🎪',
			gradient: 'from-warning-400 via-warning-500 to-warning-700',
			hoverGradient: 'hover:from-warning-500 hover:via-warning-600 hover:to-warning-800',
			npmPackage: 'drag-drop'
		},
		{
			name: '@thalesrc/node-utils',
			description: 'Server-side Node.js utilities for backend development. Streamline server operations with battle-tested helper functions.',
			category: 'Node.js',
			emoji: '🚀',
			gradient: 'from-danger-400 via-danger-500 to-danger-700',
			hoverGradient: 'hover:from-danger-500 hover:via-danger-600 hover:to-danger-800',
			npmPackage: 'node-utils'
		},
		{
			name: '@thalesrc/hermes',
			description: 'JavaScript messaging library for cross-context communication. Enable seamless message passing between iframes, workers, and windows.',
			category: 'Communication',
			emoji: '📡',
			gradient: 'from-primary-500 via-secondary-500 to-tertiary-500',
			hoverGradient: 'hover:from-primary-600 hover:via-secondary-600 hover:to-tertiary-600',
			npmPackage: 'hermes'
		},
		{
			name: '@thalesrc/reactive-storage',
			description: 'Reactive storage solutions for modern applications. Build reactive data persistence layers with observable storage patterns.',
			category: 'Storage',
			emoji: '💾',
			gradient: 'from-secondary-500 via-tertiary-500 to-quaternary-500',
			hoverGradient: 'hover:from-secondary-600 hover:via-tertiary-600 hover:to-quaternary-600',
			npmPackage: 'reactive-storage'
		},
		{
			name: '@thalesrc/paintlet',
			description: 'CSS Paint API utilities for creating custom paint worklets. Unlock the power of CSS Houdini for dynamic, performant graphics.',
			category: 'Browser',
			emoji: '🖌️',
			gradient: 'from-tertiary-500 via-quaternary-500 to-success-500',
			hoverGradient: 'hover:from-tertiary-600 hover:via-quaternary-600 hover:to-success-600',
			npmPackage: 'paintlet'
		},
		{
			name: '@thalesrc/nx-utils',
			description: 'Nx monorepo utilities and custom executors. Enhance your Nx workspace with powerful build tools and development workflows.',
			category: 'Tooling',
			emoji: '🔧',
			gradient: 'from-quaternary-500 via-warning-500 to-danger-500',
			hoverGradient: 'hover:from-quaternary-600 hover:via-warning-600 hover:to-danger-600',
			npmPackage: 'nx-utils'
		},
		{
			name: '@thalesrc/auto-proxy',
			description: 'Docker-aware nginx reverse proxy with automatic SSL and service discovery. Perfect for development environments with gRPC and database support.',
			category: 'DevOps',
			emoji: '🔌',
			gradient: 'from-primary-500 via-tertiary-500 to-success-500',
			hoverGradient: 'hover:from-primary-600 hover:via-tertiary-600 hover:to-success-600',
			npmPackage: 'auto-proxy'
		},
		{
			name: '@thalesrc/docker-frp',
			description: 'Fast Reverse Proxy container with server and client modes. Features web GUI for configuration, TLS support, and built-in health monitoring.',
			category: 'DevOps',
			emoji: '🐳',
			gradient: 'from-tertiary-500 via-success-500 to-primary-500',
			hoverGradient: 'hover:from-tertiary-600 hover:via-success-600 hover:to-primary-600',
			npmPackage: 'docker-frp'
		}
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-tertiary-50 relative overflow-hidden">
			{/* Animated Background Blobs */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-primary-300/30 to-secondary-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
				<div className="absolute top-1/3 -right-40 w-96 h-96 bg-gradient-to-br from-tertiary-300/30 to-quaternary-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }}></div>
				<div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-gradient-to-br from-warning-300/30 to-danger-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }}></div>
			</div>

			{/* Header */}
			<header className="relative py-20 px-6">
				<div className="max-w-6xl mx-auto text-center">
					<div className="inline-block mb-6">
						<div className="text-8xl font-black mb-4 bg-gradient-to-r from-primary-600 via-secondary-600 to-tertiary-600 bg-clip-text text-transparent animate-pulse" style={{ animationDuration: '3s' }}>
							Thalesrc
						</div>
						<div className="h-2 bg-gradient-to-r from-primary-500 via-secondary-500 to-tertiary-500 rounded-full"></div>
					</div>
					<p className="text-3xl font-bold mb-4 bg-gradient-to-r from-quaternary-600 to-warning-600 bg-clip-text text-transparent">
						Open Source Magic ✨
					</p>
					<p className="text-xl text-neutral-700 max-w-3xl mx-auto">
						A vibrant collection of high-quality libraries crafted with passion for the modern JavaScript ecosystem
					</p>
				</div>
			</header>

			{/* Libraries Grid */}
			<main className="relative px-6 pb-20">
				<div className="max-w-7xl mx-auto">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-stretch gap-8">
						{libraries.map((lib, index) => (
							<div
								key={lib.name}
								className="group relative h-full"
								style={{ animationDelay: `${index * 0.1}s` }}
							>
								<div className={`h-full absolute -inset-1 bg-gradient-to-r ${lib.gradient} rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500 ${lib.hoverGradient}`}></div>
								<div className="h-full relative bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
									<div className="flex items-start justify-between mb-4">
										<div className="text-5xl">{lib.emoji}</div>
										<span className={`text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r ${lib.gradient} text-white shadow-md`}>
											{lib.category}
										</span>
									</div>
									<h3 className={`font-bold text-xl mb-2 bg-gradient-to-r ${lib.gradient} bg-clip-text text-transparent`}>
										{lib.name}
									</h3>

									{/* Badges */}
									<div className="flex gap-2 mb-3 flex-wrap">
										<a
											href={`https://www.npmjs.com/package/@thalesrc/${lib.npmPackage}`}
											target="_blank"
											rel="noopener noreferrer"
											className="hover:opacity-80 transition-opacity"
										>
											<img
												src={`https://img.shields.io/npm/v/@thalesrc/${lib.npmPackage}.svg?style=flat-square`}
												alt="npm version"
												className="h-5"
											/>
										</a>
										<a
											href={`https://www.npmjs.com/package/@thalesrc/${lib.npmPackage}`}
											target="_blank"
											rel="noopener noreferrer"
											className="hover:opacity-80 transition-opacity"
										>
											<img
												src={`https://img.shields.io/npm/dm/@thalesrc/${lib.npmPackage}.svg?style=flat-square`}
												alt="npm downloads"
												className="h-5"
											/>
										</a>
									</div>

									<p className="text-neutral-600 leading-relaxed text-sm mb-4">
										{lib.description}
									</p>

									{/* Links */}
									<div className="flex gap-3 text-sm">
										<a
											href={`https://www.npmjs.com/package/@thalesrc/${lib.npmPackage}`}
											target="_blank"
											rel="noopener noreferrer"
											className={`flex items-center gap-1 font-semibold bg-gradient-to-r ${lib.gradient} bg-clip-text text-transparent hover:opacity-70 transition-opacity`}
										>
											<span>📦</span> npm
										</a>
										<a
											href="https://github.com/thalesrc/thalesrc"
											target="_blank"
											rel="noopener noreferrer"
											className={`flex items-center gap-1 font-semibold bg-gradient-to-r ${lib.gradient} bg-clip-text text-transparent hover:opacity-70 transition-opacity`}
										>
											<span>⭐</span> GitHub
										</a>
									</div>

									<div className={`mt-4 h-1 rounded-full bg-gradient-to-r ${lib.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
								</div>
							</div>
						))}
					</div>
				</div>
			</main>

			{/* Fun Stats Section */}
			<section className="relative py-16 px-6">
				<div className="max-w-4xl mx-auto">
					<div className="grid grid-cols-3 gap-8 text-center">
						<div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg">
							<div className="text-4xl font-black bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
								14+
							</div>
							<div className="text-sm font-semibold text-neutral-600 mt-2">Libraries</div>
						</div>
						<div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg">
							<div className="text-4xl font-black bg-gradient-to-r from-tertiary-600 to-quaternary-600 bg-clip-text text-transparent">
								100%
							</div>
							<div className="text-sm font-semibold text-neutral-600 mt-2">Open Source</div>
						</div>
						<div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg">
							<div className="text-4xl font-black bg-gradient-to-r from-warning-600 to-danger-600 bg-clip-text text-transparent">
								∞
							</div>
							<div className="text-sm font-semibold text-neutral-600 mt-2">Possibilities</div>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="relative py-10 px-6 border-t-2 border-gradient-to-r from-primary-200 via-secondary-200 to-tertiary-200">
				<div className="max-w-6xl mx-auto">
					<div className="flex flex-col items-center gap-4">
						<p className="text-lg font-semibold bg-gradient-to-r from-primary-600 via-secondary-600 to-tertiary-600 bg-clip-text text-transparent">
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
		</div>
	);
}
