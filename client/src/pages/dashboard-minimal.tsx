import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header-simple";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, Users, Building, MapPin, Mail, Phone, Globe, Brain, Loader2, FileText, Factory } from "lucide-react";
import { useState, useMemo } from "react";
import type { Lead } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedCompanyType, setSelectedCompanyType] = useState("");
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

  // Get unique locations and industries for filter options
  const uniqueLocations = useMemo(() => {
    const locations = Array.from(new Set(leads.map((lead: Lead) => lead.location)));
    return locations.sort();
  }, [leads]);

  const uniqueIndustries = useMemo(() => {
    const industries = Array.from(new Set(leads.map((lead: Lead) => lead.industry)));
    return industries.sort();
  }, [leads]);

  const uniqueCompanyTypes = useMemo(() => {
    const types = Array.from(new Set(leads.map((lead: any) => lead.companyType || "enterprise")));
    return types.sort();
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

            {/* Results Count */}
            <div className="text-sm text-gray-500 whitespace-nowrap">
              {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''}
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
                ) : filteredLeads.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No leads found</div>
                ) : (
                  <div className="divide-y">
                    {filteredLeads.map((lead: Lead) => (
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
                          </DialogHeader>
                          <ScrollArea className="max-h-[70vh]">
                            {analysisMutation.data && (
                              <div className="space-y-6 p-4">
                                {/* Basic Information */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                                    <Building className="w-4 h-4 mr-2" />
                                    Basic Information
                                  </h3>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><strong>Company:</strong> {analysisMutation.data?.analysis?.basicInfo?.companyName || 'N/A'}</div>
                                    <div><strong>Domain:</strong> {analysisMutation.data?.analysis?.basicInfo?.domain || 'N/A'}</div>
                                    <div><strong>Founded:</strong> {analysisMutation.data?.analysis?.basicInfo?.foundedYear || 'N/A'}</div>
                                    <div><strong>HQ:</strong> {analysisMutation.data?.analysis?.basicInfo?.headquarters || 'N/A'}</div>
                                    <div><strong>Legal Name:</strong> {analysisMutation.data?.analysis?.basicInfo?.legalName || 'N/A'}</div>
                                    <div><strong>Entity Type:</strong> {analysisMutation.data?.analysis?.basicInfo?.entityType || 'N/A'}</div>
                                  </div>
                                </div>

                                <Separator />

                                {/* Executive Team */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                                    <Users className="w-4 h-4 mr-2" />
                                    Executive Team
                                  </h3>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><strong>CEO:</strong> {analysisMutation.data?.analysis?.executiveTeam?.ceo || 'N/A'}</div>
                                    <div><strong>CTO:</strong> {analysisMutation.data?.analysis?.executiveTeam?.cto || 'N/A'}</div>
                                    <div><strong>CFO:</strong> {analysisMutation.data?.analysis?.executiveTeam?.cfo || 'N/A'}</div>
                                    <div><strong>Key Decision Makers:</strong> {analysisMutation.data?.analysis?.executiveTeam?.keyDecisionMakers?.join(', ') || 'N/A'}</div>
                                  </div>
                                </div>

                                <Separator />

                                {/* Company Overview */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-3">Company Overview</h3>
                                  <div className="space-y-2 text-sm">
                                    <div><strong>Description:</strong> {analysisMutation.data?.analysis?.companyOverview?.description || 'N/A'}</div>
                                    <div><strong>Mission:</strong> {analysisMutation.data?.analysis?.companyOverview?.mission || 'N/A'}</div>
                                    <div><strong>Business Model:</strong> {analysisMutation.data?.analysis?.companyOverview?.businessModel || 'N/A'}</div>
                                    <div><strong>Key Products:</strong> {analysisMutation.data?.analysis?.companyOverview?.keyProducts?.join(', ') || 'N/A'}</div>
                                    <div><strong>USP:</strong> {analysisMutation.data?.analysis?.companyOverview?.uniqueSellingProposition || 'N/A'}</div>
                                  </div>
                                </div>

                                <Separator />

                                {/* Financial Summary */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-3">Financial Summary</h3>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><strong>Revenue:</strong> {analysisMutation.data?.analysis?.financialSummary?.revenue || 'N/A'}</div>
                                    <div><strong>Employees:</strong> {analysisMutation.data?.analysis?.financialSummary?.employeeCount?.toLocaleString() || 'N/A'}</div>
                                    <div><strong>Valuation:</strong> {analysisMutation.data?.analysis?.financialSummary?.valuation || 'N/A'}</div>
                                    <div><strong>Funding Rounds:</strong> {analysisMutation.data?.analysis?.financialSummary?.fundingRounds?.join(', ') || 'N/A'}</div>
                                    <div><strong>Investors:</strong> {analysisMutation.data?.analysis?.financialSummary?.investors?.join(', ') || 'N/A'}</div>
                                    <div><strong>Profitability:</strong> {analysisMutation.data?.analysis?.financialSummary?.profitability || 'N/A'}</div>
                                  </div>
                                </div>

                                <Separator />

                                {/* Growth Indicators */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-3">Growth Indicators</h3>
                                  <div className="space-y-2 text-sm">
                                    <div><strong>Recent Funding:</strong> {analysisMutation.data?.analysis?.growthIndicators?.recentFunding || 'N/A'}</div>
                                    <div><strong>Hiring Trends:</strong> {analysisMutation.data?.analysis?.growthIndicators?.hiringTrends || 'N/A'}</div>
                                    <div><strong>Tech Stack:</strong> {analysisMutation.data?.analysis?.growthIndicators?.techStack?.join(', ') || 'N/A'}</div>
                                    <div><strong>Job Postings:</strong> {analysisMutation.data?.analysis?.growthIndicators?.jobPostings || 'N/A'}</div>
                                    <div><strong>Market Expansion:</strong> {analysisMutation.data?.analysis?.growthIndicators?.marketExpansion?.join(', ') || 'N/A'}</div>
                                  </div>
                                </div>

                                <Separator />

                                {/* AI Recommendations */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                                    <Brain className="w-4 h-4 mr-2" />
                                    AI Recommendations
                                  </h3>
                                  <div className="space-y-3 text-sm">
                                    <div>
                                      <strong>Lead Quality:</strong>
                                      <p className="mt-1 text-gray-600">{analysisMutation.data?.analysis?.aiRecommendations?.leadQuality || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <strong>Approach Strategy:</strong>
                                      <p className="mt-1 text-gray-600">{analysisMutation.data?.analysis?.aiRecommendations?.approachStrategy || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <strong>Buying Signals:</strong>
                                      <ul className="mt-1 list-disc list-inside text-gray-600">
                                        {analysisMutation.data?.analysis?.aiRecommendations?.buyingSignals?.map((signal: string, idx: number) => (
                                          <li key={idx}>{signal}</li>
                                        )) || <li>N/A</li>}
                                      </ul>
                                    </div>
                                    <div>
                                      <strong>Risk Factors:</strong>
                                      <ul className="mt-1 list-disc list-inside text-gray-600">
                                        {analysisMutation.data?.analysis?.aiRecommendations?.riskFactors?.map((risk: string, idx: number) => (
                                          <li key={idx}>{risk}</li>
                                        )) || <li>N/A</li>}
                                      </ul>
                                    </div>
                                    <div>
                                      <strong>Next Steps:</strong>
                                      <ul className="mt-1 list-disc list-inside text-gray-600">
                                        {analysisMutation.data?.analysis?.aiRecommendations?.nextSteps?.map((step: string, idx: number) => (
                                          <li key={idx}>{step}</li>
                                        )) || <li>N/A</li>}
                                      </ul>
                                    </div>
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