import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { StatsCards } from "@/components/stats-cards";
import { LeadsList } from "@/components/leads-list";
import { LeadInsightsDashboard } from "@/components/lead-insights-dashboard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, RotateCcw } from "lucide-react";
import { useState, useMemo } from "react";
import type { Lead } from "@shared/schema";

export default function Dashboard() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [scoreFilter, setScoreFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const { data: allLeads, isLoading } = useQuery({
    queryKey: ["/api/leads"],
    queryFn: async () => {
      const response = await fetch("/api/leads");
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
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const searchFields = [
          lead.companyName,
          lead.contactName,
          lead.jobTitle,
          lead.industry,
          lead.location
        ].map(field => field.toLowerCase());
        
        if (!searchFields.some(field => field.includes(search))) {
          return false;
        }
      }
      
      // Score filter
      if (scoreFilter !== 'all') {
        if (scoreFilter === 'high' && lead.score < 80) return false;
        if (scoreFilter === 'medium' && (lead.score < 60 || lead.score >= 80)) return false;
        if (scoreFilter === 'low' && lead.score >= 60) return false;
      }
      
      return true;
    });
  }, [allLeads, searchTerm, scoreFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setScoreFilter('all');
    setSelectedLead(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 lg:py-8 max-w-[1600px] 2xl:max-w-[1800px]">
        {/* Stats Section */}
        <section className="mb-8">
          <StatsCards stats={stats} />
        </section>
        
        {/* Simple Search and Filters */}
        <section className="mb-6">
          <div className="bg-card rounded-lg border p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads by company, name, or industry..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Score Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden lg:block">Filter by score:</span>
                <div className="flex gap-1">
                  <Button
                    variant={scoreFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setScoreFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={scoreFilter === 'high' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setScoreFilter('high')}
                  >
                    Hot (80+)
                  </Button>
                  <Button
                    variant={scoreFilter === 'medium' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setScoreFilter('medium')}
                  >
                    Warm (60-79)
                  </Button>
                  <Button
                    variant={scoreFilter === 'low' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setScoreFilter('low')}
                  >
                    Cold (&lt;60)
                  </Button>
                </div>
              </div>
              
              {/* Clear Filters */}
              {(searchTerm || scoreFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
            
            {/* Active Filters Display */}
            {(searchTerm || scoreFilter !== 'all') && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {searchTerm && (
                  <Badge variant="secondary" className="text-xs">
                    Search: "{searchTerm}"
                  </Badge>
                )}
                {scoreFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    Score: {scoreFilter}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  {filteredLeads?.length || 0} leads found
                </span>
              </div>
            )}
          </div>
        </section>
        
        {/* Main Content Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 2xl:grid-cols-16 gap-6 lg:gap-8 2xl:gap-10">
          {/* Leads List */}
          <div className="lg:col-span-7 2xl:col-span-9">
            <LeadsList 
              leads={filteredLeads || []}
              isLoading={isLoading}
              selectedLead={selectedLead}
              onSelectLead={setSelectedLead}
            />
          </div>
          
          {/* Analytics Panel */}
          <div className="lg:col-span-5 2xl:col-span-7">
            <div className="lg:sticky lg:top-24">
              <LeadInsightsDashboard 
                selectedLead={selectedLead}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}