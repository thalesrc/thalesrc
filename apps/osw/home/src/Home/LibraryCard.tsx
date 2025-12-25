import type { Library } from './libraries';

interface LibraryCardProps {
	library: Library;
	index: number;
}

export function LibraryCard({ library, index }: LibraryCardProps) {
	return (
		<div
			className="group relative h-full"
			style={{ animationDelay: `${index * 0.1}s` }}
		>
			<div className={`h-full absolute -inset-1 bg-gradient-to-r ${library.gradient} rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500 ${library.hoverGradient}`} />
			<div className="h-full relative bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 flex flex-col">
				<div className="flex items-start justify-between mb-4">
					<div className="text-5xl">{library.emoji}</div>
					<span className={`text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r ${library.gradient} text-white shadow-md`}>
						{library.category}
					</span>
				</div>

				<h3 className={`font-bold text-xl mb-2 bg-gradient-to-r ${library.gradient} bg-clip-text text-transparent`}>
					{library.name}
				</h3>

				<div className="flex gap-2 mb-3 flex-wrap">
					{library.type === 'npm' ? (
						<>
							<a
								href={`https://www.npmjs.com/package/@thalesrc/${library.packageName}`}
								target="_blank"
								rel="noopener noreferrer"
								className="hover:opacity-80 transition-opacity"
							>
								<img
									src={`https://img.shields.io/npm/v/@thalesrc/${library.packageName}.svg?style=flat-square`}
									alt="npm version"
									className="h-5"
								/>
							</a>
							<a
								href={`https://www.npmjs.com/package/@thalesrc/${library.packageName}`}
								target="_blank"
								rel="noopener noreferrer"
								className="hover:opacity-80 transition-opacity"
							>
								<img
									src={`https://img.shields.io/npm/dm/@thalesrc/${library.packageName}.svg?style=flat-square`}
									alt="npm downloads"
									className="h-5"
								/>
							</a>
						</>
					) : (
						<>
							<a
								href={`https://github.com/thalesrc/thalesrc/pkgs/container/${library.packageName}`}
								target="_blank"
								rel="noopener noreferrer"
								className="hover:opacity-80 transition-opacity"
							>
								<img
									src={`https://img.shields.io/badge/ghcr.io-thalesrc%2F${library.packageName}-blue?style=flat-square&logo=docker`}
									alt="docker image"
									className="h-5"
								/>
							</a>
							<a
								href={`https://github.com/thalesrc/thalesrc/tree/master/libs/${library.packageName}`}
								target="_blank"
								rel="noopener noreferrer"
								className="hover:opacity-80 transition-opacity"
							>
								<img
									src="https://img.shields.io/badge/type-docker-2496ED?style=flat-square&logo=docker"
									alt="docker type"
									className="h-5"
								/>
							</a>
						</>
					)}
				</div>

				<p className="text-neutral-600 leading-relaxed text-sm mb-4 flex-grow">
					{library.description}
				</p>

				<div className="flex gap-3 text-sm mt-auto">
					<a
						href={
							library.type === 'npm'
								? `https://www.npmjs.com/package/@thalesrc/${library.packageName}`
								: `https://github.com/thalesrc/thalesrc/pkgs/container/${library.packageName}`
						}
						target="_blank"
						rel="noopener noreferrer"
						className={`flex items-center gap-1 font-semibold bg-gradient-to-r ${library.gradient} bg-clip-text text-transparent hover:opacity-70 transition-opacity`}
					>
						<span>{library.type === 'npm' ? '📦' : '🐳'}</span> {library.type === 'npm' ? 'npm' : 'GHCR'}
					</a>
					<a
						href={`https://github.com/thalesrc/thalesrc/tree/master/libs/${library.packageName}`}
						target="_blank"
						rel="noopener noreferrer"
						className={`flex items-center gap-1 font-semibold bg-gradient-to-r ${library.gradient} bg-clip-text text-transparent hover:opacity-70 transition-opacity`}
					>
						<span>⭐</span> GitHub
					</a>
				</div>

				<div className={`mt-4 h-1 rounded-full bg-gradient-to-r ${library.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
			</div>
		</div>
	);
}
