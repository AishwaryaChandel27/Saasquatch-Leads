import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { StatsCards } from "@/components/stats-cards";

import { LeadsList } from "@/components/leads-list";
import { AIInsightsPanel } from "@/components/ai-insights-panel";
import { LeadProspectingPanel } from "@/components/lead-prospecting-panel";
import { useState } from "react";
import type { Lead } from "@shared/schema";

export default function Dashboard() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const { data: leads, isLoading } = useQuery({
    queryKey: ["/api/leads"],
    queryFn: async () => {
      const response = await fetch(`/api/leads`);
      if (!response.ok) throw new Error("Failed to fetch leads");
      return response.json();
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <StatsCards stats={stats} />
        
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-2">
            <LeadsList 
              leads={leads || []}
              isLoading={isLoading}
              selectedLead={selectedLead}
              onSelectLead={setSelectedLead}
            />
          </div>
          
          <div className="space-y-6">
            <LeadProspectingPanel 
              onLeadsProspected={() => {
                // Refresh leads and stats when new leads are prospected
              }}
            />
          </div>
          
          <div>
            <AIInsightsPanel 
              selectedLead={selectedLead}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
