import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Database, Zap, Github, Building, Settings, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DataSource {
  id: string;
  name: string;
  description: string;
  dataPoints: string[];
}

interface ProspectingPanelProps {
  onLeadsProspected?: () => void;
}

export function LeadProspectingPanel({ onLeadsProspected }: ProspectingPanelProps) {
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [technology, setTechnology] = useState<string>('');
  const [industry, setIndustry] = useState<string>('');
  const [limit, setLimit] = useState<number>(10);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dataSources, isLoading: sourcesLoading } = useQuery({
    queryKey: ['/api/leads/sources'],
    queryFn: async () => {
      const response = await fetch('/api/leads/sources');
      if (!response.ok) throw new Error('Failed to fetch data sources');
      return response.json();
    },
  });

  const prospectMutation = useMutation({
    mutationFn: async (params: { source: string; technology?: string; industry?: string; limit: number }) => {
      const response = await apiRequest("POST", "/api/leads/prospect", params);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Prospecting Complete",
        description: `Successfully found ${data.count} new leads from ${data.source}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      onLeadsProspected?.();
    },
    onError: () => {
      toast({
        title: "Prospecting Failed",
        description: "Failed to prospect leads. Please try again.",
        variant: "destructive",
      });
    },
  });

  const enrichAllMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/leads/enrich-all");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Enrichment Complete",
        description: `Enriched ${data.enrichedCount} leads with real-world data`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
    },
    onError: () => {
      toast({
        title: "Enrichment Failed",
        description: "Failed to enrich leads. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleProspect = () => {
    if (!selectedSource) {
      toast({
        title: "Select Data Source",
        description: "Please select a data source to prospect from",
        variant: "destructive",
      });
      return;
    }

    if (selectedSource === 'technology' && !technology) {
      toast({
        title: "Technology Required",
        description: "Please specify a technology for this data source",
        variant: "destructive",
      });
      return;
    }

    prospectMutation.mutate({
      source: selectedSource,
      technology: technology || undefined,
      industry: industry || undefined,
      limit
    });
  };

  const commonTechnologies = [
    'React', 'Angular', 'Vue.js', 'Node.js', 'Python', 'Java', 'PHP', 
    'Ruby', 'Go', 'TypeScript', 'JavaScript', 'Docker', 'Kubernetes',
    'AWS', 'Azure', 'MongoDB', 'PostgreSQL', 'Redis', 'Elasticsearch'
  ];

  const industries = [
    'SaaS', 'FinTech', 'Healthcare', 'E-commerce', 'Education', 'Marketing',
    'Data Analytics', 'Cloud Services', 'Cybersecurity', 'AI/ML', 'IoT'
  ];

  if (sourcesLoading) {
    return (
      <Card className="shadow-sm border border-slate-200">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-primary" />
          <span>Lead Prospecting</span>
          <Badge variant="secondary" className="ml-2">Real Data</Badge>
        </CardTitle>
        <p className="text-sm text-slate-600">
          Find new leads from authentic company databases and public sources
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data Source Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700">Data Source</Label>
          <Select value={selectedSource} onValueChange={setSelectedSource}>
            <SelectTrigger>
              <SelectValue placeholder="Select a data source" />
            </SelectTrigger>
            <SelectContent>
              {dataSources?.map((source) => (
                <SelectItem key={source.id} value={source.id}>
                  <div className="flex items-center space-x-2">
                    {source.id === 'github' && <Github className="w-4 h-4" />}
                    {source.id === 'ycombinator' && <Zap className="w-4 h-4" />}
                    {source.id === 'technology' && <Settings className="w-4 h-4" />}
                    <span>{source.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedSource && dataSources && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 mb-2">
                {dataSources.find(s => s.id === selectedSource)?.description}
              </p>
              <div className="flex flex-wrap gap-1">
                {dataSources.find(s => s.id === selectedSource)?.dataPoints.map((point, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {point}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Technology Filter (for technology source) */}
        {selectedSource === 'technology' && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700">Technology</Label>
            <Select value={technology} onValueChange={setTechnology}>
              <SelectTrigger>
                <SelectValue placeholder="Select technology" />
              </SelectTrigger>
              <SelectContent>
                {commonTechnologies.map((tech) => (
                  <SelectItem key={tech} value={tech}>
                    {tech}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Industry Filter (optional) */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700">Industry (Optional)</Label>
          <Select value={industry} onValueChange={setIndustry}>
            <SelectTrigger>
              <SelectValue placeholder="All industries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All industries</SelectItem>
              {industries.map((ind) => (
                <SelectItem key={ind} value={ind}>
                  {ind}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Limit */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700">Number of Leads</Label>
          <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 leads</SelectItem>
              <SelectItem value="10">10 leads</SelectItem>
              <SelectItem value="20">20 leads</SelectItem>
              <SelectItem value="50">50 leads</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleProspect}
            disabled={prospectMutation.isPending || !selectedSource}
            className="w-full"
          >
            <Search className="w-4 h-4 mr-2" />
            {prospectMutation.isPending ? "Prospecting..." : "Start Prospecting"}
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => enrichAllMutation.mutate()}
            disabled={enrichAllMutation.isPending}
            className="w-full"
          >
            <Building className="w-4 h-4 mr-2" />
            {enrichAllMutation.isPending ? "Enriching..." : "Enrich Existing Leads"}
          </Button>
        </div>

        {/* Success Messages */}
        {prospectMutation.isSuccess && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800">
              Successfully prospected {prospectMutation.data?.count} new leads
            </span>
          </div>
        )}

        {/* Data Source Info */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <h4 className="font-medium text-slate-900 mb-2">Available Sources:</h4>
          <ul className="space-y-1 text-sm text-slate-600">
            <li>• GitHub: Tech companies with active repositories</li>
            <li>• Y Combinator: Validated startup companies</li>
            <li>• Technology: Companies using specific tech stacks</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}