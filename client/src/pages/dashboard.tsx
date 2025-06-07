import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { StatsCards } from "@/components/stats-cards";
import { LeadsList } from "@/components/leads-list";
import { LeadQualityAnalytics } from "@/components/lead-quality-analytics";
import { LeadProspectingPanel } from "@/components/lead-prospecting-panel";
import { AdvancedFilters } from "@/components/advanced-filters";
import { ScoringQuickOverview } from "@/components/scoring-quick-overview";
import { useState, useMemo } from "react";
import type { Lead } from "@shared/schema";

interface FilterCriteria {
  search: string;
  industries: string[];
  companySizes: string[];
  locations: string[];
  jobTitles: string[];
  scoreRange: [number, number];
  priority: string[];
  techStack: string[];
  fundingStage: string[];
  recentActivity: boolean;
  aiEnriched: boolean;
}

export default function Dashboard() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FilterCriteria>({
    search: "",
    industries: [],
    companySizes: [],
    locations: [],
    jobTitles: [],
    scoreRange: [0, 100],
    priority: [],
    techStack: [],
    fundingStage: [],
    recentActivity: false,
    aiEnriched: false
  });

  const { data: allLeads, isLoading } = useQuery({
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

  const filteredLeads = useMemo(() => {
    if (!allLeads) return [];
    
    return allLeads.filter((lead: Lead) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          lead.companyName.toLowerCase().includes(searchTerm) ||
          lead.contactName.toLowerCase().includes(searchTerm) ||
          lead.jobTitle.toLowerCase().includes(searchTerm) ||
          lead.industry.toLowerCase().includes(searchTerm);
        if (!matchesSearch) return false;
      }

      // Score range filter
      if (lead.score < filters.scoreRange[0] || lead.score > filters.scoreRange[1]) {
        return false;
      }

      // Industry filter
      if (filters.industries.length > 0 && !filters.industries.includes(lead.industry)) {
        return false;
      }

      // Company size filter
      if (filters.companySizes.length > 0 && !filters.companySizes.includes(lead.companySize)) {
        return false;
      }

      // Job title filter
      if (filters.jobTitles.length > 0) {
        const matchesJobTitle = filters.jobTitles.some(title => 
          lead.jobTitle.toLowerCase().includes(title.toLowerCase())
        );
        if (!matchesJobTitle) return false;
      }

      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(lead.priority)) {
        return false;
      }

      // Tech stack filter
      if (filters.techStack.length > 0 && lead.techStack) {
        const hasMatchingTech = filters.techStack.some(tech => 
          lead.techStack?.includes(tech)
        );
        if (!hasMatchingTech) return false;
      }

      // Recent activity filter
      if (filters.recentActivity && !lead.recentActivity) {
        return false;
      }

      // AI enriched filter
      if (filters.aiEnriched && !lead.isEnriched) {
        return false;
      }

      return true;
    });
  }, [allLeads, filters]);

  const handleFiltersChange = (newFilters: FilterCriteria) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      industries: [],
      companySizes: [],
      locations: [],
      jobTitles: [],
      scoreRange: [0, 100],
      priority: [],
      techStack: [],
      fundingStage: [],
      recentActivity: false,
      aiEnriched: false
    });
  };

  return (
    <div className="min-h-screen transition-colors">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl">
        {/* Stats Cards Section */}
        <section className="mb-8">
          <StatsCards stats={stats} />
        </section>
        
        {/* Filters Section */}
        <section className="mb-6">
          <AdvancedFilters
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            isOpen={filtersOpen}
            onToggle={() => setFiltersOpen(!filtersOpen)}
          />
        </section>
        
        {/* Main Content Grid */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
          {/* Leads List - Takes full width on mobile, 7 columns on xl screens */}
          <div className="xl:col-span-7 order-1">
            <LeadsList 
              leads={filteredLeads || []}
              isLoading={isLoading}
              selectedLead={selectedLead}
              onSelectLead={setSelectedLead}
            />
          </div>
          
          {/* Right Sidebar - Stack vertically on mobile, side by side on xl */}
          <div className="xl:col-span-5 order-2 space-y-6">
            {/* Prospecting Panel */}
            <div className="w-full">
              <LeadProspectingPanel 
                onLeadsProspected={() => {
                  window.location.reload();
                }}
              />
            </div>
            
            {/* Analytics Panel */}
            <div className="w-full">
              <div className="xl:sticky xl:top-24">
                <LeadQualityAnalytics 
                  lead={selectedLead}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
