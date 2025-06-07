import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Database, Zap, Github, Building, Settings, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ProspectingPanelProps {
  onLeadsProspected?: () => void;
}

export function LeadProspectingPanel({ onLeadsProspected }: ProspectingPanelProps) {
  const [technology, setTechnology] = useState<string>('');
  const [industry, setIndustry] = useState<string>('');
  const [limit, setLimit] = useState<number>(10);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      onLeadsProspected?.();
    },
    onError: (error) => {
      toast({
        title: "Prospecting Failed",
        description: "Failed to prospect new leads. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleProspect = (source: string) => {
    prospectMutation.mutate({
      source,
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
        {/* Quick Prospect Buttons */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700">Quick Prospect</Label>
          <div className="grid grid-cols-1 gap-3">
            <Button 
              onClick={() => handleProspect('github')}
              disabled={prospectMutation.isPending}
              className="flex items-center justify-between p-4 h-auto"
              variant="outline"
            >
              <div className="flex items-center space-x-3">
                <Github className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">GitHub Companies</div>
                  <div className="text-xs text-muted-foreground">Tech companies with active repositories</div>
                </div>
              </div>
              <Badge variant="secondary">Real Data</Badge>
            </Button>
            
            <Button 
              onClick={() => handleProspect('ycombinator')}
              disabled={prospectMutation.isPending}
              className="flex items-center justify-between p-4 h-auto"
              variant="outline"
            >
              <div className="flex items-center space-x-3">
                <Building className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Y Combinator Portfolio</div>
                  <div className="text-xs text-muted-foreground">Vetted startup ecosystem</div>
                </div>
              </div>
              <Badge variant="secondary">High Quality</Badge>
            </Button>
          </div>
        </div>

        {/* Technology Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700">Technology Focus (Optional)</Label>
          <Select value={technology} onValueChange={setTechnology}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by technology" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Technologies</SelectItem>
              {commonTechnologies.map((tech) => (
                <SelectItem key={tech} value={tech.toLowerCase()}>
                  {tech}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Industry Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700">Industry Focus (Optional)</Label>
          <Select value={industry} onValueChange={setIndustry}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {industries.map((ind) => (
                <SelectItem key={ind} value={ind}>
                  {ind}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lead Limit */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700">Lead Limit</Label>
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

        {/* Status */}
        {prospectMutation.isPending && (
          <div className="flex items-center space-x-2 text-sm text-blue-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Prospecting leads...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}