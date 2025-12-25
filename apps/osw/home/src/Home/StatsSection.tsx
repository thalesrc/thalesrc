export function StatsSection() {
	return (
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
	);
}
