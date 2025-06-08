import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Globe, 
  Building2, 
  DollarSign, 
  Users, 
  TrendingUp, 
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { useState } from "react";
import type { Lead } from "@shared/schema";

interface LeadEnrichmentStatusProps {
  lead: Lead;
  onEnrich?: (leadId: number) => void;
}

export function LeadEnrichmentStatus({ lead, onEnrich }: LeadEnrichmentStatusProps) {
  const [isEnriching, setIsEnriching] = useState(false);

  const enrichmentSources = [
    {
      name: "LinkedIn Company",
      status: lead.isEnriched ? "completed" : "pending",
      icon: Building2,
      data: lead.website ? "Company profile found" : "Pending enrichment"
    },
    {
      name: "Crunchbase Funding",
      status: lead.fundingStage ? "completed" : "pending", 
      icon: DollarSign,
      data: lead.fundingStage || "Funding data not available"
    },
    {
      name: "Tech Stack Analysis",
      status: lead.techStack?.length ? "completed" : "pending",
      icon: Globe,
      data: lead.techStack?.length ? `${lead.techStack.length} technologies` : "Tech stack unknown"
    },
    {
      name: "Employee Count",
      status: lead.employeeCount ? "completed" : "pending",
      icon: Users,
      data: lead.employeeCount ? `${lead.employeeCount} employees` : "Size data missing"
    }
  ];

  const completedSources = enrichmentSources.filter(s => s.status === "completed").length;
  const enrichmentProgress = (completedSources / enrichmentSources.length) * 100;

  const handleEnrich = async () => {
    if (!onEnrich) return;
    
    setIsEnriching(true);
    try {
      await onEnrich(lead.id);
    } finally {
      setIsEnriching(false);
    }
  };

  return (
    <Card className="card-premium">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Data Enrichment</span>
          </div>
          <Badge 
            variant={enrichmentProgress === 100 ? "default" : "secondary"}
            className="text-xs"
          >
            {Math.round(enrichmentProgress)}% Complete
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Enrichment Progress</span>
            <span className="font-medium">{completedSources}/{enrichmentSources.length} sources</span>
          </div>
          <Progress value={enrichmentProgress} className="h-2" />
        </div>

        {/* Data Sources */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Data Sources</h4>
          <div className="space-y-2">
            {enrichmentSources.map((source) => {
              const IconComponent = source.icon;
              return (
                <div key={source.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${source.status === 'completed' ? 'bg-success/10' : 'bg-muted'}`}>
                      <IconComponent className={`h-4 w-4 ${source.status === 'completed' ? 'text-success' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{source.name}</p>
                      <p className="text-xs text-muted-foreground">{source.data}</p>
                    </div>
                  </div>
                  {source.status === 'completed' ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Scoring Factors */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-semibold text-sm">AI Scoring Factors</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Company Size</p>
              <p className="font-medium text-sm">{getCompanySizeWeight(lead.companySize)}% weight</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Decision Level</p>
              <p className="font-medium text-sm">{getDecisionWeight(lead.jobTitle)}% weight</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Industry Value</p>
              <p className="font-medium text-sm">{getIndustryWeight(lead.industry)}% weight</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Tech Fit</p>
              <p className="font-medium text-sm">{getTechFitWeight(lead.techStack)}% weight</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t">
          <div className="flex gap-2">
            <Button
              onClick={handleEnrich}
              disabled={isEnriching || enrichmentProgress === 100}
              size="sm"
              className="flex-1"
            >
              {isEnriching ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Enriching...
                </>
              ) : enrichmentProgress === 100 ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Fully Enriched
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Enrich Data
                </>
              )}
            </Button>
            {lead.website && (
              <Button variant="outline" size="sm" asChild>
                <a href={lead.website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Quality Score */}
        <div className="bg-primary/5 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Lead Quality Score</p>
              <p className="text-xs text-muted-foreground">AI-calculated based on enriched data</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{lead.score}</div>
              <p className="text-xs text-muted-foreground">out of 100</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getCompanySizeWeight(size: string): number {
  const weights: Record<string, number> = {
    'Enterprise': 25,
    'Large': 20,
    'Medium': 15,
    'Small': 10,
    'Startup': 12
  };
  return weights[size] || 10;
}

function getDecisionWeight(jobTitle: string): number {
  const title = jobTitle.toLowerCase();
  if (title.includes('ceo') || title.includes('founder')) return 25;
  if (title.includes('cto') || title.includes('vp')) return 20;
  if (title.includes('director') || title.includes('head')) return 15;
  if (title.includes('manager')) return 10;
  return 8;
}

function getIndustryWeight(industry: string): number {
  const highValueIndustries = ['Technology', 'Financial Services', 'Healthcare', 'SaaS'];
  return highValueIndustries.includes(industry) ? 20 : 12;
}

function getTechFitWeight(techStack?: string[]): number {
  if (!techStack?.length) return 5;
  const modernTech = ['React', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'Python'];
  const matches = techStack.filter(tech => 
    modernTech.some(modern => tech.toLowerCase().includes(modern.toLowerCase()))
  );
  return Math.min(15, 5 + (matches.length * 2));
}