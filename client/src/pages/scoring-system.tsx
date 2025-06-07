import { Header } from "@/components/header";
import { ScoringSystemOverview } from "@/components/scoring-system-overview";

export default function ScoringSystemPage() {
  return (
    <div className="min-h-screen transition-colors">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl">
        <ScoringSystemOverview />
      </main>
    </div>
  );
}