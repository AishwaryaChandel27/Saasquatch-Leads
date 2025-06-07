import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { StatsCards } from "@/components/stats-cards";
import { FilterPanel } from "@/components/filter-panel";
import { LeadsList } from "@/components/leads-list";
import { AIInsightsPanel } from "@/components/ai-insights-panel";
import { useState } from "react";
import type { Lead } from "@shared/schema";

export default function Dashboard() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    industry: "",
    companySize: "",
    priority: "",
    minScore: undefined as number | undefined,
  });

  const { data: leads, isLoading } = useQuery({
    queryKey: ["/api/leads", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== undefined) {
          params.append(key, value.toString());
        }
      });
      const response = await fetch(`/api/leads?${params}`);
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
        
        <FilterPanel 
          filters={filters} 
          onFiltersChange={setFilters}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LeadsList 
              leads={leads || []}
              isLoading={isLoading}
              selectedLead={selectedLead}
              onSelectLead={setSelectedLead}
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
