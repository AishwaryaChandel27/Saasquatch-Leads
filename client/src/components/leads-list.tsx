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
        return b.employeeCount - a.employeeCount;
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
    <Card className="shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">AI-Scored Leads</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <span className="text-sm text-slate-600 dark:text-slate-400">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[150px]">
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
      
      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {paginatedLeads.map((lead) => (
          <div 
            key={lead.id}
            className={`p-4 sm:p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${
              selectedLead?.id === lead.id ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-primary" : ""
            }`}
            onClick={() => onSelectLead(lead)}
          >
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {getCompanyInitials(lead.companyName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 mb-2">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">{lead.companyName}</h3>
                    <div className="flex items-center space-x-1">
                      <div className={`w-3 h-3 ${getScoreBadgeColor(lead.score)} rounded-full ${lead.score >= 80 ? 'animate-pulse' : ''}`}></div>
                      <span className={`${getScoreColor(lead.score)} font-semibold text-sm`}>{lead.score}</span>
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-2 truncate">{lead.contactName} - {lead.jobTitle}</p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500 dark:text-slate-500">
                    <span className="flex items-center bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                      <Users className="w-3 h-3 mr-1" />
                      {lead.companySize}
                    </span>
                    <span className="flex items-center bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                      <Building className="w-3 h-3 mr-1" />
                      {lead.industry}
                    </span>
                    <span className="flex items-center bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded truncate">
                      <MapPin className="w-3 h-3 mr-1" />
                      {lead.location}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end space-x-2 w-full sm:w-auto">
                <Badge className={`${getPriorityColor(lead.priority)} dark:bg-opacity-20`}>
                  {getPriorityLabel(lead.priority)}
                </Badge>
                <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
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
