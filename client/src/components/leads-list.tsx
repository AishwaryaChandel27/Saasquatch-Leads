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
      <Card className="shadow-sm border border-slate-200">
        <CardContent className="p-6">
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start space-x-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">AI-Scored Leads</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
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
      
      <div className="divide-y divide-slate-200">
        {paginatedLeads.map((lead) => (
          <div 
            key={lead.id}
            className={`p-6 hover:bg-slate-50 transition-colors cursor-pointer ${
              selectedLead?.id === lead.id ? "bg-blue-50 border-l-4 border-l-primary" : ""
            }`}
            onClick={() => onSelectLead(lead)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
                  {getCompanyInitials(lead.companyName)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-slate-900">{lead.companyName}</h3>
                    <div className="flex items-center space-x-1">
                      <div className={`w-3 h-3 ${getScoreBadgeColor(lead.score)} rounded-full ${lead.score >= 80 ? 'animate-pulse' : ''}`}></div>
                      <span className={`${getScoreColor(lead.score)} font-semibold text-sm`}>{lead.score}</span>
                    </div>
                  </div>
                  <p className="text-slate-600 mb-2">{lead.contactName} - {lead.jobTitle}</p>
                  <div className="flex items-center space-x-4 text-sm text-slate-500">
                    <span className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {lead.companySize} employees
                    </span>
                    <span className="flex items-center">
                      <Building className="w-3 h-3 mr-1" />
                      {lead.industry}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {lead.location}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getPriorityColor(lead.priority)}>
                  {getPriorityLabel(lead.priority)}
                </Badge>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="p-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">
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
