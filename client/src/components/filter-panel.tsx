import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Star, Building, Clock, MapPin, Briefcase, ExternalLink, Globe, Users, DollarSign, Calendar, Code, TrendingUp, Sparkles } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Enhanced industry categories for advanced filtering
const INDUSTRY_OPTIONS = [
  { value: "all", label: "All Industries", category: "All" },
  
  // High-value tech industries
  { value: "SaaS", label: "SaaS", category: "High-Tech" },
  { value: "FinTech", label: "FinTech", category: "High-Tech" },
  { value: "Cybersecurity", label: "Cybersecurity", category: "High-Tech" },
  { value: "AI/ML", label: "AI/ML", category: "High-Tech" },
  { value: "Enterprise Software", label: "Enterprise Software", category: "High-Tech" },
  { value: "Cloud Services", label: "Cloud Services", category: "High-Tech" },
  { value: "DevOps", label: "DevOps", category: "High-Tech" },
  { value: "Data Analytics", label: "Data Analytics", category: "High-Tech" },
  
  // Growth industries
  { value: "E-commerce", label: "E-commerce", category: "Growth" },
  { value: "HealthTech", label: "HealthTech", category: "Growth" },
  { value: "EdTech", label: "EdTech", category: "Growth" },
  { value: "PropTech", label: "PropTech", category: "Growth" },
  { value: "InsurTech", label: "InsurTech", category: "Growth" },
  { value: "LegalTech", label: "LegalTech", category: "Growth" },
  { value: "HRTech", label: "HRTech", category: "Growth" },
  { value: "MarTech", label: "MarTech", category: "Growth" },
  
  // Traditional industries
  { value: "Healthcare", label: "Healthcare", category: "Traditional" },
  { value: "Financial Services", label: "Financial Services", category: "Traditional" },
  { value: "Manufacturing", label: "Manufacturing", category: "Traditional" },
  { value: "Retail", label: "Retail", category: "Traditional" },
  { value: "Real Estate", label: "Real Estate", category: "Traditional" },
  { value: "Media", label: "Media", category: "Traditional" },
  { value: "Transportation", label: "Transportation", category: "Traditional" },
  { value: "Travel", label: "Travel", category: "Traditional" },
];

// Popular tech hubs and cities for location filtering
const LOCATION_OPTIONS = [
  { value: "all", label: "All Locations", tier: "All" },
  
  // US Tech Hubs
  { value: "San Francisco, CA", label: "San Francisco, CA", tier: "Tier 1" },
  { value: "Seattle, WA", label: "Seattle, WA", tier: "Tier 1" },
  { value: "New York, NY", label: "New York, NY", tier: "Tier 1" },
  { value: "Boston, MA", label: "Boston, MA", tier: "Tier 1" },
  { value: "Austin, TX", label: "Austin, TX", tier: "Tier 1" },
  { value: "Los Angeles, CA", label: "Los Angeles, CA", tier: "Tier 2" },
  { value: "Chicago, IL", label: "Chicago, IL", tier: "Tier 2" },
  { value: "Denver, CO", label: "Denver, CO", tier: "Tier 2" },
  { value: "Atlanta, GA", label: "Atlanta, GA", tier: "Tier 2" },
  
  // International
  { value: "London, UK", label: "London, UK", tier: "International" },
  { value: "Toronto, CA", label: "Toronto, CA", tier: "International" },
  { value: "Berlin, DE", label: "Berlin, DE", tier: "International" },
  { value: "Amsterdam, NL", label: "Amsterdam, NL", tier: "International" },
  { value: "Tel Aviv, IL", label: "Tel Aviv, IL", tier: "International" },
  { value: "Singapore", label: "Singapore", tier: "International" },
];

interface FilterPanelProps {
  filters: {
    search: string;
    industry: string;
    companySize: string;
    priority: string;
    location?: string;
    minScore?: number;
  };
  onFiltersChange: (filters: any) => void;
}

export function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const [companySearch, setCompanySearch] = useState<string>('');
  const [companyDetails, setCompanyDetails] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const companySearchMutation = useMutation({
    mutationFn: async (companyName: string) => {
      const response = await apiRequest("POST", "/api/companies/search", { companyName });
      return response.json();
    },
    onSuccess: (data) => {
      setCompanyDetails(data);
      setIsDialogOpen(true);
    },
    onError: () => {
      toast({
        title: "Search Failed",
        description: "Could not find company details. Please try a different name.",
        variant: "destructive",
      });
    },
  });

  const handleCompanySearch = () => {
    if (!companySearch.trim()) {
      toast({
        title: "Company Name Required",
        description: "Please enter a company name to search",
        variant: "destructive",
      });
      return;
    }
    companySearchMutation.mutate(companySearch.trim());
  };

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilter = (key: string) => {
    onFiltersChange({ ...filters, [key]: key === "minScore" ? undefined : "" });
  };

  const activeFilters = Object.entries(filters).filter(([key, value]) => 
    value !== "" && value !== undefined
  );

  return (
    <Card className="shadow-sm border border-slate-200 mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold text-slate-900">Smart Filters</h3>
            
            {/* Quick Filter Badges */}
            <Badge 
              variant={filters.minScore === 80 ? "default" : "outline"}
              className="cursor-pointer hover:scale-105 transition-transform"
              onClick={() => handleFilterChange("minScore", filters.minScore === 80 ? undefined : 80)}
            >
              <Star className="w-3 h-3 mr-1" />
              High Score (80+)
            </Badge>
            
            <Badge 
              variant={filters.companySize === "500-1000" ? "default" : "outline"}
              className="cursor-pointer hover:scale-105 transition-transform"
              onClick={() => handleFilterChange("companySize", filters.companySize === "500-1000" ? "" : "500-1000")}
            >
              <Building className="w-3 h-3 mr-1" />
              Enterprise
            </Badge>
            
            <Badge 
              variant={filters.priority === "hot" ? "default" : "outline"}
              className="cursor-pointer hover:scale-105 transition-transform"
              onClick={() => handleFilterChange("priority", filters.priority === "hot" ? "" : "hot")}
            >
              <Clock className="w-3 h-3 mr-1" />
              Hot Leads
            </Badge>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Search companies or contacts..." 
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10 w-64"
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            </div>
            
            {/* Company Details Search */}
            <div className="flex space-x-2">
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Get company details..."
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                  className="pl-10 w-48"
                  onKeyPress={(e) => e.key === 'Enter' && handleCompanySearch()}
                />
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={handleCompanySearch}
                    disabled={companySearchMutation.isPending}
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                  >
                    {companySearchMutation.isPending ? (
                      <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    Search
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-3">
                      {companyDetails?.logo && (
                        <img 
                          src={companyDetails.logo} 
                          alt={`${companyDetails.companyName} logo`}
                          className="w-8 h-8 rounded object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <Building className="w-6 h-6 text-blue-600" />
                      <span>Company Details: {companyDetails?.companyName}</span>
                    </DialogTitle>
                  </DialogHeader>
                  
                  {companyDetails && (
                    <div className="space-y-6 mt-6">
                      {/* Company Overview with Logo */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            {companyDetails.logo && (
                              <img 
                                src={companyDetails.logo} 
                                alt={`${companyDetails.companyName} logo`}
                                className="w-16 h-16 rounded-lg object-contain bg-white p-2 shadow-sm"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold text-slate-900 mb-2">{companyDetails.companyName}</h3>
                              {companyDetails.domain && (
                                <p className="text-slate-600 mb-3">{companyDetails.domain}</p>
                              )}
                              {companyDetails.description && (
                                <p className="text-slate-700 text-sm mb-4 max-w-2xl leading-relaxed">{companyDetails.description}</p>
                              )}
                              
                              {/* Basic Info Grid */}
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center space-x-2">
                                  <Building className="w-4 h-4 text-slate-500" />
                                  <span><strong>Industry:</strong> {companyDetails.industry || companyDetails.sector}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <MapPin className="w-4 h-4 text-slate-500" />
                                  <span><strong>Location:</strong> {companyDetails.location}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Users className="w-4 h-4 text-slate-500" />
                                  <span><strong>Employees:</strong> {companyDetails.employeeCount || companyDetails.employeesRange}</span>
                                </div>
                                {companyDetails.foundedYear && (
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="w-4 h-4 text-slate-500" />
                                    <span><strong>Founded:</strong> {companyDetails.foundedYear}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Score Badges */}
                          <div className="ml-6 space-y-2">
                            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                              companyDetails.priority === 'hot' ? 'bg-red-100 text-red-800' :
                              companyDetails.priority === 'warm' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              <Star className="w-4 h-4 mr-2" />
                              Clearbit: {companyDetails.score}/100
                            </div>
                            {companyDetails.mlScore && (
                              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                                companyDetails.mlPriority === 'hot' ? 'bg-purple-100 text-purple-800' :
                                companyDetails.mlPriority === 'warm' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                <TrendingUp className="w-4 h-4 mr-2" />
                                ML Score: {companyDetails.mlScore}/100
                              </div>
                            )}
                            <div className="text-center text-xs text-slate-500 capitalize">
                              {companyDetails.priority} Priority
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Social Media & Links */}
                      {(companyDetails.linkedinUrl || companyDetails.twitterUrl || companyDetails.website || companyDetails.crunchbaseUrl) && (
                        <div className="bg-white p-6 rounded-lg border">
                          <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                            <Globe className="w-5 h-5 mr-2 text-blue-600" />
                            Online Presence
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            {companyDetails.website && (
                              <a href={companyDetails.website} target="_blank" rel="noopener noreferrer" 
                                 className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                <Globe className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium">Website</span>
                              </a>
                            )}
                            {companyDetails.linkedinUrl && (
                              <a href={companyDetails.linkedinUrl} target="_blank" rel="noopener noreferrer" 
                                 className="flex items-center space-x-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors">
                                <Users className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium">LinkedIn</span>
                              </a>
                            )}
                            {companyDetails.twitterUrl && (
                              <a href={companyDetails.twitterUrl} target="_blank" rel="noopener noreferrer" 
                                 className="flex items-center space-x-2 px-3 py-2 bg-sky-100 hover:bg-sky-200 rounded-lg transition-colors">
                                <span className="text-sm font-medium">Twitter</span>
                              </a>
                            )}
                            {companyDetails.crunchbaseUrl && (
                              <a href={companyDetails.crunchbaseUrl} target="_blank" rel="noopener noreferrer" 
                                 className="flex items-center space-x-2 px-3 py-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium">Crunchbase</span>
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Financial Metrics */}
                      {(companyDetails.annualRevenue || companyDetails.totalFunding || companyDetails.marketCap || companyDetails.fundingInfo) && (
                        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                          <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                            Financial Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {companyDetails.annualRevenue && (
                              <div className="text-center p-3 bg-white rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                  ${(companyDetails.annualRevenue / 1000000).toFixed(1)}M
                                </div>
                                <div className="text-sm text-slate-600">Annual Revenue</div>
                              </div>
                            )}
                            {companyDetails.totalFunding && (
                              <div className="text-center p-3 bg-white rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">
                                  ${(companyDetails.totalFunding / 1000000).toFixed(1)}M
                                </div>
                                <div className="text-sm text-slate-600">Total Funding</div>
                              </div>
                            )}
                            {companyDetails.marketCap && (
                              <div className="text-center p-3 bg-white rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">
                                  ${(companyDetails.marketCap / 1000000).toFixed(1)}M
                                </div>
                                <div className="text-sm text-slate-600">Market Cap</div>
                              </div>
                            )}
                          </div>
                          {companyDetails.fundingInfo && (
                            <div className="mt-4 p-3 bg-white rounded-lg">
                              <p className="text-green-800 font-medium">{companyDetails.fundingInfo}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tech Stack */}
                      {companyDetails.techStack && companyDetails.techStack.length > 0 && (
                        <div className="bg-white p-6 rounded-lg border">
                          <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                            <Code className="w-5 h-5 mr-2 text-blue-600" />
                            Technology Stack ({companyDetails.techStack.length} technologies)
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {companyDetails.techStack.map((tech: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs px-3 py-1">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                          {companyDetails.techCategories && companyDetails.techCategories.length > 0 && (
                            <div className="mt-4">
                              <h5 className="font-medium text-slate-700 mb-2">Categories</h5>
                              <div className="flex flex-wrap gap-2">
                                {companyDetails.techCategories.map((category: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {category}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* AI Insights */}
                      {companyDetails.aiInsights && (
                        <div className="bg-slate-50 p-6 rounded-lg border">
                          <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                            <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                            AI-Generated Insights
                          </h4>
                          
                          <div className="space-y-4">
                            <div>
                              <h5 className="font-medium text-slate-700 mb-2">Summary</h5>
                              <p className="text-slate-600 text-sm leading-relaxed">{companyDetails.aiInsights.summary}</p>
                            </div>
                            
                            <div>
                              <h5 className="font-medium text-slate-700 mb-2">Key Insights</h5>
                              <ul className="space-y-1">
                                {companyDetails.aiInsights.keyInsights.map((insight: string, index: number) => (
                                  <li key={index} className="text-slate-600 text-sm flex items-start">
                                    <TrendingUp className="w-3 h-3 mr-2 mt-1 text-green-500 shrink-0" />
                                    {insight}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h5 className="font-medium text-slate-700 mb-2">Recommended Approach</h5>
                              <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                                <p className="text-blue-800 text-sm">{companyDetails.aiInsights.recommendedApproach}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
            
            <Select value={filters.industry || "all"} onValueChange={(value) => handleFilterChange("industry", value === "all" ? "" : value)}>
              <SelectTrigger className="w-48">
                <Briefcase className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Select Industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{option.label}</span>
                      {option.category !== "All" && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {option.category}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filters.location || "all"} onValueChange={(value) => handleFilterChange("location", value === "all" ? "" : value)}>
              <SelectTrigger className="w-48">
                <MapPin className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                {LOCATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{option.label}</span>
                      {option.tier !== "All" && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {option.tier}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Active Filters Display */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200">
            <span className="text-sm text-slate-600">Active filters:</span>
            {activeFilters.map(([key, value]) => (
              <Badge 
                key={key} 
                variant="secondary" 
                className="cursor-pointer"
                onClick={() => clearFilter(key)}
              >
                {key}: {value?.toString()}
                <span className="ml-1">×</span>
              </Badge>
            ))}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onFiltersChange({ search: "", industry: "", companySize: "", priority: "", minScore: undefined })}
            >
              Clear all
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
