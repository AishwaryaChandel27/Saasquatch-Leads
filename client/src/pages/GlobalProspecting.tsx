import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Globe, Users, Building, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ProspectingOptions {
  industries: string[];
  locations: string[];
  companySizes: string[];
  leadQuantities: number[];
  sources: Array<{
    id: string;
    name: string;
    enabled: boolean;
  }>;
}

interface ProspectingRequest {
  industry?: string;
  companySize?: string;
  location?: string;
  limit: number;
  sources: string[];
}

export default function GlobalProspecting() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedCompanySize, setSelectedCompanySize] = useState<string>("");
  const [selectedQuantity, setSelectedQuantity] = useState<number>(10);
  const [selectedSources, setSelectedSources] = useState<string[]>(['linkedin', 'github', 'crunchbase', 'news']);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch prospecting options
  const { data: options, isLoading: optionsLoading } = useQuery<ProspectingOptions>({
    queryKey: ['/api/leads/prospect-options'],
  });

  // Global prospecting mutation
  const prospectMutation = useMutation({
    mutationFn: async (data: ProspectingRequest) => {
      return await apiRequest('/api/leads/prospect-global', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (result) => {
      toast({
        title: "Global Prospecting Successful",
        description: result.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
    },
    onError: (error: any) => {
      toast({
        title: "Prospecting Failed",
        description: error.message || "Failed to prospect global leads",
        variant: "destructive",
      });
    },
  });

  const handleProspect = () => {
    const request: ProspectingRequest = {
      industry: selectedIndustry || undefined,
      companySize: selectedCompanySize || undefined,
      location: selectedLocation || undefined,
      limit: selectedQuantity,
      sources: selectedSources,
    };

    prospectMutation.mutate(request);
  };

  const toggleSource = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  if (optionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading prospecting options...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Globe className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Global Lead Prospecting</h1>
      </div>
      
      <p className="text-muted-foreground">
        Find leads from LinkedIn, GitHub, Crunchbase, and news sources worldwide. Select your criteria and quantity.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prospecting Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Prospecting Criteria</span>
            </CardTitle>
            <CardDescription>
              Configure your global lead search parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Lead Quantity Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Leads</label>
              <Select value={selectedQuantity.toString()} onValueChange={(value) => setSelectedQuantity(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select quantity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 leads</SelectItem>
                  <SelectItem value="10">10 leads</SelectItem>
                  <SelectItem value="25">25 leads</SelectItem>
                  <SelectItem value="50">50 leads</SelectItem>
                  <SelectItem value="100">100 leads</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Industry Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center space-x-1">
                <Building className="h-4 w-4" />
                <span>Industry (Optional)</span>
              </label>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="All industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Industries</SelectItem>
                  {options?.industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>Location (Optional)</span>
              </label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Global" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Global</SelectItem>
                  {options?.locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Company Size Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>Company Size (Optional)</span>
              </label>
              <Select value={selectedCompanySize} onValueChange={setSelectedCompanySize}>
                <SelectTrigger>
                  <SelectValue placeholder="All sizes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Sizes</SelectItem>
                  {options?.companySizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data Sources Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Data Sources</label>
              <div className="grid grid-cols-2 gap-2">
                {options?.sources.map((source) => (
                  <div
                    key={source.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedSources.includes(source.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-primary/50'
                    }`}
                    onClick={() => toggleSource(source.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{source.name}</span>
                      {selectedSources.includes(source.id) && (
                        <Badge variant="default" className="h-5">
                          ✓
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Select multiple sources for comprehensive prospecting
              </p>
            </div>

            {/* Prospect Button */}
            <Button 
              onClick={handleProspect}
              disabled={prospectMutation.isPending || selectedSources.length === 0}
              className="w-full"
              size="lg"
            >
              {prospectMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Prospecting...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Find {selectedQuantity} Global Leads
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Prospecting Info */}
        <Card>
          <CardHeader>
            <CardTitle>Data Sources</CardTitle>
            <CardDescription>
              Global platforms we search for leads
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-sm">LinkedIn Companies</p>
                  <p className="text-xs text-muted-foreground">
                    Company profiles and executive contacts
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-sm">GitHub Organizations</p>
                  <p className="text-xs text-muted-foreground">
                    Tech companies with active repositories
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-sm">Crunchbase Startups</p>
                  <p className="text-xs text-muted-foreground">
                    Funded startups and scale-ups
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-sm">News Sources</p>
                  <p className="text-xs text-muted-foreground">
                    Recently mentioned companies
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                ⚡ Powered by real-time data aggregation from multiple global sources
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Display */}
      {prospectMutation.isSuccess && prospectMutation.data && (
        <Card>
          <CardHeader>
            <CardTitle>Prospecting Results</CardTitle>
            <CardDescription>
              {prospectMutation.data.message}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {prospectMutation.data.data?.leads?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Leads Found</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {prospectMutation.data.data?.sourcesUsed?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Sources Used</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {prospectMutation.data.data?.industriesFound?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Industries</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(((prospectMutation.data.data?.leads?.length || 0) / selectedQuantity) * 100)}%
                </p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
            
            {prospectMutation.data.data?.sourcesUsed && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Sources Used:</p>
                <div className="flex flex-wrap gap-2">
                  {prospectMutation.data.data.sourcesUsed.map((source: string) => (
                    <Badge key={source} variant="secondary">
                      {source}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}