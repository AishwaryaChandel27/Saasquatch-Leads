import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header-simple";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, Users, Building, MapPin, Mail, Phone, Globe, Brain, Loader2, FileText, Factory, ArrowUpDown, Target, BarChart3, Lightbulb, CheckCircle } from "lucide-react";
import { useState, useMemo } from "react";
import type { Lead } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedCompanyType, setSelectedCompanyType] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["/api/leads"],
    queryFn: async () => {
      const response = await fetch("/api/leads");
      if (!response.ok) throw new Error("Failed to fetch leads");
      return response.json();
    },
  });

  const filteredLeads = useMemo(() => {
    return leads.filter((lead: Lead) => {
      // Search term filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch = [
          lead.companyName,
          lead.contactName,
          lead.jobTitle,
          lead.industry,
          lead.location
        ].some(field => field.toLowerCase().includes(search));
        if (!matchesSearch) return false;
      }

      // Location filter
      if (selectedLocation && selectedLocation !== "all") {
        if (!lead.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
          return false;
        }
      }

      // Industry filter
      if (selectedIndustry && selectedIndustry !== "all") {
        if (lead.industry !== selectedIndustry) {
          return false;
        }
      }

      // Company type filter
      if (selectedCompanyType && selectedCompanyType !== "all") {
        if ((lead as any).companyType !== selectedCompanyType) {
          return false;
        }
      }

      return true;
    });
  }, [leads, searchTerm, selectedLocation, selectedIndustry, selectedCompanyType]);

  // Sort filtered leads based on selected criteria
  const sortedLeads = useMemo(() => {
    const sorted = [...filteredLeads];
    
    switch (sortBy) {
      case "score":
        return sorted.sort((a, b) => (b.score || 0) - (a.score || 0));
      case "companyName":
        return sorted.sort((a, b) => a.companyName.localeCompare(b.companyName));
      case "employeeCount":
        return sorted.sort((a, b) => {
          const aCount = a.employeeCount || 0;
          const bCount = b.employeeCount || 0;
          return bCount - aCount;
        });
      case "priority":
        return sorted.sort((a, b) => {
          const priorityOrder = { "hot": 3, "warm": 2, "cold": 1 };
          return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                 (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
        });
      case "recentActivity":
        return sorted.sort((a, b) => {
          const aActivity = a.lastContact ? new Date(a.lastContact).getTime() : 0;
          const bActivity = b.lastContact ? new Date(b.lastContact).getTime() : 0;
          return bActivity - aActivity;
        });
      case "fundingAmount":
        return sorted.sort((a, b) => {
          // Extract numeric value from funding strings
          const extractFunding = (funding: string | null) => {
            if (!funding) return 0;
            const match = funding.match(/\$?(\d+(?:\.\d+)?)\s*([kmb]?)/i);
            if (!match) return 0;
            let value = parseFloat(match[1]);
            const unit = match[2]?.toLowerCase();
            if (unit === 'k') value *= 1000;
            if (unit === 'm') value *= 1000000;
            if (unit === 'b') value *= 1000000000;
            return value;
          };
          return extractFunding(b.fundingAmount) - extractFunding(a.fundingAmount);
        });
      case "industry":
        return sorted.sort((a, b) => a.industry.localeCompare(b.industry));
      case "location":
        return sorted.sort((a, b) => a.location.localeCompare(b.location));
      default:
        return sorted;
    }
  }, [filteredLeads, sortBy]);

  // Get unique locations and industries for filter options
  const uniqueLocations = useMemo(() => {
    const locations = Array.from(new Set(leads.map((lead: Lead) => lead.location)));
    return locations.sort() as string[];
  }, [leads]);

  const uniqueIndustries = useMemo(() => {
    const industries = Array.from(new Set(leads.map((lead: Lead) => lead.industry)));
    return industries.sort() as string[];
  }, [leads]);

  const uniqueCompanyTypes = useMemo(() => {
    const types = Array.from(new Set(leads.map((lead: any) => lead.companyType || "enterprise")));
    return types.sort() as string[];
  }, [leads]);

  // AI Analysis mutation
  const analysisMutation = useMutation({
    mutationFn: async (leadId: number) => {
      const response = await fetch(`/api/leads/${leadId}/analyze`, {
        method: "POST"
      });
      if (!response.ok) throw new Error("Analysis failed");
      return response.json();
    },
    onSuccess: () => {
      setAnalysisOpen(true);
    }
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-gray-400";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Location Filter */}
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {uniqueLocations.map((location: string) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Industry Filter */}
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-gray-500" />
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {uniqueIndustries.map((industry: string) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Company Type Filter */}
            <div className="flex items-center space-x-2">
              <Factory className="h-4 w-4 text-gray-500" />
              <Select value={selectedCompanyType} onValueChange={setSelectedCompanyType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Company Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Company Types</SelectItem>
                  {uniqueCompanyTypes.map((type: string) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Sorting Options */}
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="h-4 w-4 text-gray-500" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Score (High to Low)</SelectItem>
                  <SelectItem value="companyName">Company Name (A-Z)</SelectItem>
                  <SelectItem value="employeeCount">Employee Count</SelectItem>
                  <SelectItem value="priority">Priority Level</SelectItem>
                  <SelectItem value="recentActivity">Recent Activity</SelectItem>
                  <SelectItem value="fundingAmount">Funding Amount</SelectItem>
                  <SelectItem value="industry">Industry</SelectItem>
                  <SelectItem value="location">Location</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-500 whitespace-nowrap">
              {sortedLeads.length} lead{sortedLeads.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leads List */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6 text-center text-gray-500">Loading leads...</div>
                ) : sortedLeads.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No leads found</div>
                ) : (
                  <div className="divide-y">
                    {sortedLeads.map((lead: Lead) => (
                      <div
                        key={lead.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedLead?.id === lead.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                        onClick={() => setSelectedLead(lead)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{lead.companyName}</h3>
                              <div className={`w-6 h-6 ${getScoreColor(lead.score)} rounded-full flex items-center justify-center`}>
                                <span className="text-white text-xs font-bold">{Math.round(lead.score/10)}</span>
                              </div>
                            </div>
                            <p className="text-gray-600 text-sm mb-1">{lead.contactName} • {lead.jobTitle}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Building className="w-3 h-3 mr-1" />
                                {lead.companySize}
                              </span>
                              <span className="flex items-center">
                                <Users className="w-3 h-3 mr-1" />
                                {lead.industry}
                              </span>
                              <span className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {lead.location}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">{lead.score}</div>
                            <div className="text-xs text-gray-500">score</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Lead Details */}
          <div className="lg:col-span-1">
            {selectedLead ? (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedLead.companyName}</h2>
                      <p className="text-gray-600">{selectedLead.contactName}</p>
                      <p className="text-gray-500 text-sm">{selectedLead.jobTitle}</p>
                    </div>

                    <div className="space-y-3">
                      {selectedLead.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{selectedLead.email}</span>
                        </div>
                      )}
                      
                      {selectedLead.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{selectedLead.phone}</span>
                        </div>
                      )}
                      
                      {selectedLead.website && (
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{selectedLead.website}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Company Size:</span>
                        <span className="text-sm font-medium">{selectedLead.companySize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Industry:</span>
                        <span className="text-sm font-medium">{selectedLead.industry}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Location:</span>
                        <span className="text-sm font-medium">{selectedLead.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Score:</span>
                        <span className="text-sm font-bold">{selectedLead.score}/100</span>
                      </div>
                    </div>

                    <div className="pt-4 space-y-3">
                      <Badge 
                        variant={selectedLead.score >= 80 ? "default" : selectedLead.score >= 60 ? "secondary" : "outline"}
                        className="w-full justify-center py-2"
                      >
                        {selectedLead.score >= 80 ? "Hot Lead" : selectedLead.score >= 60 ? "Warm Lead" : "Cold Lead"}
                      </Badge>

                      <Dialog open={analysisOpen} onOpenChange={setAnalysisOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full" 
                            variant="outline"
                            onClick={() => analysisMutation.mutate(selectedLead.id)}
                            disabled={analysisMutation.isPending}
                          >
                            {analysisMutation.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Brain className="w-4 h-4 mr-2" />
                                AI Company Analysis
                              </>
                            )}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh]">
                          <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                              <FileText className="w-5 h-5" />
                              <span>Company Analysis Report - {selectedLead.companyName}</span>
                            </DialogTitle>
                            <DialogDescription>
                              Comprehensive AI-powered analysis including company insights, scoring breakdown, and strategic recommendations
                            </DialogDescription>
                          </DialogHeader>
                          <ScrollArea className="max-h-[70vh]">
                            {analysisMutation.data && (
                              <div className="space-y-6 p-4">
                                {/* Lead Score Breakdown */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                                    <Target className="w-4 h-4 mr-2" />
                                    Lead Quality Analysis
                                  </h3>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><strong>Overall Score:</strong> {analysisMutation.data?.qualityMetrics?.score || 'N/A'}/100</div>
                                    <div><strong>Category:</strong> 
                                      <Badge className="ml-2" variant={analysisMutation.data?.qualityMetrics?.category === 'High' ? 'default' : analysisMutation.data?.qualityMetrics?.category === 'Medium' ? 'secondary' : 'outline'}>
                                        {analysisMutation.data?.qualityMetrics?.category || 'N/A'}
                                      </Badge>
                                    </div>
                                    <div><strong>Confidence:</strong> {analysisMutation.data?.qualityMetrics?.confidence || 'N/A'}%</div>
                                  </div>
                                </div>

                                <Separator />

                                {/* Scoring Breakdown */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    Detailed Score Breakdown
                                  </h3>
                                  <div className="space-y-3">
                                    {analysisMutation.data?.enrichmentData && Object.entries(analysisMutation.data.enrichmentData).map(([key, data]: [string, any]) => (
                                      <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                        <div>
                                          <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                          <p className="text-xs text-gray-600">{data.reasoning}</p>
                                        </div>
                                        <Badge variant="outline">{data.score}/100</Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <Separator />

                                {/* AI Insights */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                                    <Brain className="w-4 h-4 mr-2" />
                                    AI Strategic Insights
                                  </h3>
                                  <div className="space-y-3">
                                    {analysisMutation.data?.aiInsights?.map((insight: string, index: number) => (
                                      <div key={index} className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                                        <p className="text-sm">{insight}</p>
                                      </div>
                                    )) || <p className="text-gray-500">No AI insights available</p>}
                                  </div>
                                </div>

                                <Separator />

                                {/* Recommendations */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                                    <Lightbulb className="w-4 h-4 mr-2" />
                                    Strategic Recommendations
                                  </h3>
                                  <div className="space-y-2">
                                    {analysisMutation.data?.qualityMetrics?.recommendations?.map((rec: string, index: number) => (
                                      <div key={index} className="flex items-start space-x-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm">{rec}</p>
                                      </div>
                                    )) || <p className="text-gray-500">No recommendations available</p>}
                                  </div>
                                </div>
                              </div>
                            )}
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a lead to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}