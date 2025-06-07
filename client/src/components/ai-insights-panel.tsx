import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, Sparkles, Mail, Calendar, Plus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Lead, AIInsights } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface AIInsightsPanelProps {
  selectedLead: Lead | null;
}

export function AIInsightsPanel({ selectedLead }: AIInsightsPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ["/api/leads/insights", selectedLead?.id],
    queryFn: async () => {
      if (!selectedLead) return null;
      
      // Check if insights already exist
      if (selectedLead.aiInsights) {
        return JSON.parse(selectedLead.aiInsights) as AIInsights;
      }
      
      // Generate new insights
      const response = await fetch(`/api/leads/${selectedLead.id}/insights`, {
        method: "POST",
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Failed to generate insights");
      return response.json();
    },
    enabled: !!selectedLead,
  });

  const generateInsightsMutation = useMutation({
    mutationFn: async (leadId: number) => {
      const response = await apiRequest("POST", `/api/leads/${leadId}/insights`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads/insights", selectedLead?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Insights Generated",
        description: "New AI insights have been generated for this lead",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate insights. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateEmailMutation = useMutation({
    mutationFn: async (data: { leadId: number; productName: string }) => {
      const response = await apiRequest("POST", `/api/leads/${data.leadId}/email`, {
        productName: data.productName,
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Show email in a modal or copy to clipboard
      navigator.clipboard.writeText(data.email);
      toast({
        title: "Email Generated",
        description: "Outreach email copied to clipboard",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate email. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateEmail = () => {
    if (!selectedLead) return;
    generateEmailMutation.mutate({ 
      leadId: selectedLead.id, 
      productName: "our solution" 
    });
  };

  const getBuyingIntentColor = (intent: string) => {
    switch (intent) {
      case "high":
        return "text-success";
      case "medium":
        return "text-warning";
      case "low":
        return "text-destructive";
      default:
        return "text-slate-600";
    }
  };

  const getScoreBreakdown = (lead: Lead) => {
    // Calculate score breakdown based on lead scoring algorithm
    const companySize = getCompanySizeScore(lead.companySize);
    const industry = getIndustryScore(lead.industry);
    const jobTitle = getJobTitleScore(lead.jobTitle);
    const engagement = Math.max(0, lead.score - companySize - industry - jobTitle);

    return {
      companySize,
      industry,
      jobTitle,
      engagement,
    };
  };

  const getCompanySizeScore = (size: string) => {
    const weights: Record<string, number> = {
      "1000+": 25,
      "500-1000": 24,
      "200-500": 22,
      "50-200": 18,
      "10-50": 12,
      "1-10": 8,
    };
    return weights[size] || 5;
  };

  const getIndustryScore = (industry: string) => {
    const weights: Record<string, number> = {
      "SaaS": 25,
      "FinTech": 24,
      "Technology": 23,
      "E-commerce": 22,
      "Healthcare": 21,
      "Data Analytics": 20,
      "Cloud Services": 19,
    };
    return weights[industry] || 10;
  };

  const getJobTitleScore = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("ceo") || lowerTitle.includes("cto")) return 25;
    if (lowerTitle.includes("vp")) return 23;
    if (lowerTitle.includes("director")) return 20;
    if (lowerTitle.includes("head")) return 18;
    if (lowerTitle.includes("manager")) return 15;
    return 10;
  };

  if (!selectedLead) {
    return (
      <div className="space-y-6">
        <Card className="shadow-sm border border-slate-200">
          <CardContent className="p-6 text-center">
            <Brain className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">AI Company Insights</h3>
            <p className="text-slate-600">Select a lead to view AI-generated insights and analysis</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const scoreBreakdown = getScoreBreakdown(selectedLead);

  return (
    <div className="space-y-6">
      {/* AI Company Summary */}
      <Card className="shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="w-5 h-5 text-secondary" />
            <h3 className="text-lg font-semibold text-slate-900">AI Company Insights</h3>
          </div>
          
          {insightsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : insights ? (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-slate-900 mb-2">{selectedLead.companyName}</h4>
                <p className="text-sm text-slate-700 mb-3">{insights.summary}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Buying Intent</span>
                    <span className={`font-semibold capitalize ${getBuyingIntentColor(insights.buyingIntent)}`}>
                      {insights.buyingIntent}
                    </span>
                  </div>
                  {insights.budgetRange && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Budget Range</span>
                      <span className="font-semibold text-slate-900">{insights.budgetRange}</span>
                    </div>
                  )}
                  {insights.decisionTimeline && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Decision Timeline</span>
                      <span className="font-semibold text-warning">{insights.decisionTimeline}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {insights.keyInsights && insights.keyInsights.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-medium text-slate-900">Key Insights:</h5>
                  <ul className="text-sm text-slate-600 space-y-1">
                    {insights.keyInsights.map((insight, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-slate-600 mb-4">No insights generated yet</p>
            </div>
          )}
          
          <Button 
            onClick={() => selectedLead && generateInsightsMutation.mutate(selectedLead.id)}
            disabled={generateInsightsMutation.isPending}
            variant="outline"
            className="w-full mt-4"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {generateInsightsMutation.isPending ? "Generating..." : "Generate More Insights"}
          </Button>
        </CardContent>
      </Card>

      {/* Tech Stack & Enrichment */}
      <Card className="shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Tech Stack Analysis</h3>
          
          {selectedLead.techStack && selectedLead.techStack.length > 0 ? (
            <div className="space-y-3">
              {selectedLead.techStack.map((tech, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{tech}</span>
                  <Badge variant="outline" className="text-xs">
                    {getTechCategory(tech)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-600 text-center py-4">No tech stack data available</p>
          )}
        </CardContent>
      </Card>

      {/* Lead Scoring Breakdown */}
      <Card className="shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Score Breakdown</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Company Size</span>
                <span className="text-sm font-semibold text-slate-900">{scoreBreakdown.companySize}/25</span>
              </div>
              <Progress value={(scoreBreakdown.companySize / 25) * 100} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Industry Match</span>
                <span className="text-sm font-semibold text-slate-900">{scoreBreakdown.industry}/25</span>
              </div>
              <Progress value={(scoreBreakdown.industry / 25) * 100} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Job Title Relevance</span>
                <span className="text-sm font-semibold text-slate-900">{scoreBreakdown.jobTitle}/25</span>
              </div>
              <Progress value={(scoreBreakdown.jobTitle / 25) * 100} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Engagement Signals</span>
                <span className="text-sm font-semibold text-slate-900">{scoreBreakdown.engagement}/25</span>
              </div>
              <Progress value={(scoreBreakdown.engagement / 25) * 100} className="h-2" />
            </div>
            
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">Total Score</span>
                <span className="text-2xl font-bold text-success">{selectedLead.score}/100</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-sm border border-slate-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          
          <div className="space-y-3">
            <Button className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add to CRM
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleGenerateEmail}
              disabled={generateEmailMutation.isPending}
            >
              <Mail className="w-4 h-4 mr-2" />
              {generateEmailMutation.isPending ? "Generating..." : "Generate Outreach Email"}
            </Button>
            
            <Button variant="outline" className="w-full">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Follow-up
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getTechCategory(tech: string): string {
  const techLower = tech.toLowerCase();
  if (techLower.includes("salesforce") || techLower.includes("hubspot")) return "CRM";
  if (techLower.includes("slack") || techLower.includes("teams")) return "Communication";
  if (techLower.includes("aws") || techLower.includes("azure") || techLower.includes("gcp")) return "Cloud";
  if (techLower.includes("react") || techLower.includes("node") || techLower.includes("python")) return "Development";
  if (techLower.includes("tableau") || techLower.includes("analytics")) return "Analytics";
  return "Technology";
}
