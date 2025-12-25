import { libraries } from './libraries';
import { BackgroundBlobs } from './BackgroundBlobs';
import { Header } from './Header';
import { LibraryCard } from './LibraryCard';
import { StatsSection } from './StatsSection';
import { Footer } from './Footer';

export default function Home() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-tertiary-50 relative overflow-hidden">
			<BackgroundBlobs />
			<Header />

			<main className="relative px-6 pb-20">
				<div className="max-w-7xl mx-auto">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{libraries.map((lib, index) => (
							<LibraryCard key={lib.name} library={lib} index={index} />
						))}
					</div>
				</div>
			</main>

			<StatsSection />
			<Footer />
		</div>
	);
}
