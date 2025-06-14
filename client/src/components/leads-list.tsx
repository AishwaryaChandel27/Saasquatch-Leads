import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Building, MapPin, ChevronRight } from "lucide-react";
import type { Lead } from "@shared/schema";
import { useState } from "react";

interface LeadsListProps {
  leads: Lead[];
  isLoading: boolean;
  selectedLead: Lead | null;
  onSelectLead: (lead: Lead) => void;
}

export function LeadsList({ leads, isLoading, selectedLead, onSelectLead }: LeadsListProps) {
  const [sortBy, setSortBy] = useState("score");
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 10;

  const sortedLeads = [...leads].sort((a, b) => {
    switch (sortBy) {
      case "score":
        return b.score - a.score;
      case "companySize":
        return (b.employeeCount || 0) - (a.employeeCount || 0);
      case "recentActivity":
        return new Date(b.recentActivity || 0).getTime() - new Date(a.recentActivity || 0).getTime();
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedLeads.length / leadsPerPage);
  const startIndex = (currentPage - 1) * leadsPerPage;
  const paginatedLeads = sortedLeads.slice(startIndex, startIndex + leadsPerPage);

  const getCompanyInitials = (companyName: string) => {
    return companyName
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-success";
    if (score >= 60) return "bg-warning";
    return "bg-destructive";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "hot":
        return "bg-success/10 text-success";
      case "warm":
        return "bg-warning/10 text-warning";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "hot":
        return "Hot Lead";
      case "warm":
        return "Warm Lead";
      default:
        return "Cold Lead";
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start space-x-3 sm:space-x-4">
                <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3 sm:w-1/3" />
                  <Skeleton className="h-3 w-1/2 sm:w-1/4" />
                  <Skeleton className="h-3 w-3/4 sm:w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-premium h-fit">
      <div className="p-4 lg:p-6 xl:p-8 border-b border-border/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-4">
            <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold gradient-text">AI-Scored Leads</h2>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs lg:text-sm">
                <Users className="h-3 w-3 lg:h-4 lg:w-4 mr-1.5" />
                {leads.length} prospects
              </Badge>
              <Badge variant="outline" className="text-xs lg:text-sm">
                Real-time scoring
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-muted-foreground hidden lg:block">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] lg:w-[160px] xl:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Lead Score</SelectItem>
                <SelectItem value="companySize">Company Size</SelectItem>
                <SelectItem value="recentActivity">Recent Activity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-border/50">
        {paginatedLeads.map((lead) => (
          <div 
            key={lead.id}
            className={`p-4 lg:p-6 xl:p-8 hover:bg-muted/50 transition-all duration-300 cursor-pointer group transform hover:scale-[1.01] ${
              selectedLead?.id === lead.id ? "bg-primary/5 border-l-4 border-l-primary shadow-lg" : ""
            }`}
            onClick={() => onSelectLead(lead)}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4 lg:space-x-6 flex-1 min-w-0">
                {/* Company Avatar - Enhanced for large screens */}
                <div className="relative">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 bg-gradient-primary rounded-xl lg:rounded-2xl flex items-center justify-center text-white font-semibold flex-shrink-0 group-hover:scale-105 transition-all duration-300">
                    <span className="text-sm lg:text-base xl:text-lg">{getCompanyInitials(lead.companyName)}</span>
                  </div>
                  <div className={`absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 ${getScoreBadgeColor(lead.score)} rounded-full border-2 border-background flex items-center justify-center`}>
                    <span className="text-[10px] lg:text-xs font-bold text-white">{Math.round(lead.score/10)}</span>
                  </div>
                </div>
                
                {/* Lead Info - Enhanced layout */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 mb-2">
                    <h3 className="font-bold text-foreground truncate text-lg lg:text-xl xl:text-2xl">{lead.companyName}</h3>
                    <div className="score-badge mt-1 lg:mt-0">
                      <span className="text-sm lg:text-base font-bold">{lead.score}</span>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-3 lg:mb-4 truncate text-sm lg:text-base">
                    <span className="font-medium">{lead.contactName}</span> • {lead.jobTitle}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">
                      <Users className="w-3 h-3 mr-1" />
                      {lead.companySize}
                    </Badge>
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">
                      <Building className="w-3 h-3 mr-1" />
                      {lead.industry}
                    </Badge>
                    <Badge variant="secondary" className="bg-muted text-muted-foreground hidden sm:flex">
                      <MapPin className="w-3 h-3 mr-1" />
                      {lead.location}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Priority and Arrow */}
              <div className="flex items-center space-x-3">
                <Badge className={`${getPriorityColor(lead.priority)} border-0`}>
                  {getPriorityLabel(lead.priority)}
                </Badge>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Showing {startIndex + 1} to {Math.min(startIndex + leadsPerPage, sortedLeads.length)} of {sortedLeads.length} leads
            </span>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button 
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
