import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Award, 
  Target, 
  Brain,
  Building2,
  DollarSign,
  Users,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Lead } from "@shared/schema";

interface LeadQualityMetrics {
  score: number;
  category: 'High' | 'Medium' | 'Low';
  confidence: number;
  factors: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
  recommendations: string[];
}

interface EnrichmentData {
  score: number;
  completeness: number;
  confidence: number;
}

interface AnalysisResult {
  leadId: number;
  qualityMetrics: LeadQualityMetrics | null;
  enrichmentData: any;
  enrichmentScore: EnrichmentData | null;
  aiInsights: any;
  analysisTimestamp: string;
}

interface LeadQualityAnalyticsProps {
  lead: Lead | null;
}

export function LeadQualityAnalytics({ lead }: LeadQualityAnalyticsProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const analyzeLeadMutation = useMutation({
    mutationFn: async (leadId: number) => {
      const response = await fetch(`/api/leads/${leadId}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Analysis failed');
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysis(data);
      toast({
        title: "Analysis Complete",
        description: "Advanced lead scoring and enrichment completed successfully"
      });
    },
    onError: () => {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze lead. Please try again.",
        variant: "destructive"
      });
    }
  });

  if (!lead) {
    return (
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardContent className="p-8 text-center">
          <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">
            Lead Quality Analytics
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Select a lead to view advanced scoring and enrichment data
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lead Header */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-slate-900 dark:text-slate-100">
                {lead.companyName} - {lead.contactName}
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {lead.jobTitle} • {lead.industry}
              </p>
            </div>
            <Button
              onClick={() => analyzeLeadMutation.mutate(lead.id)}
              disabled={analyzeLeadMutation.isPending}
              className="flex items-center space-x-2"
            >
              {analyzeLeadMutation.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Brain className="w-4 h-4" />
              )}
              <span>Analyze Lead</span>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Current Score Display */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 border-slate-200 dark:border-slate-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Current Lead Score
              </h3>
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {lead.score}/100
                </div>
                <Badge 
                  variant={lead.priority === 'hot' ? 'destructive' : lead.priority === 'warm' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {lead.priority} Priority
                </Badge>
              </div>
            </div>
            <Award className="w-12 h-12 text-blue-500 dark:text-blue-400" />
          </div>
        </CardContent>
      </Card>

      {/* Advanced Analysis Results */}
      {analysis && (
        <>
          {/* Quality Metrics */}
          {analysis.qualityMetrics && (
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-slate-900 dark:text-slate-100">
                  <TrendingUp className="w-5 h-5" />
                  <span>Advanced Quality Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Score Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {analysis.qualityMetrics.score}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Quality Score</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {analysis.qualityMetrics.confidence}%
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Confidence</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <Badge 
                      variant={analysis.qualityMetrics.category === 'High' ? 'destructive' : 
                               analysis.qualityMetrics.category === 'Medium' ? 'default' : 'secondary'}
                      className="text-sm"
                    >
                      {analysis.qualityMetrics.category} Quality
                    </Badge>
                  </div>
                </div>

                {/* Positive Factors */}
                {analysis.qualityMetrics.factors.positive.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Positive Factors
                    </h4>
                    <div className="space-y-2">
                      {analysis.qualityMetrics.factors.positive.map((factor, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Negative Factors */}
                {analysis.qualityMetrics.factors.negative.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center">
                      <XCircle className="w-4 h-4 mr-2" />
                      Risk Factors
                    </h4>
                    <div className="space-y-2">
                      {analysis.qualityMetrics.factors.negative.map((factor, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div>
                  <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Recommendations
                  </h4>
                  <div className="space-y-2">
                    {analysis.qualityMetrics.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enrichment Score */}
          {analysis.enrichmentScore && (
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-slate-900 dark:text-slate-100">
                  <Building2 className="w-5 h-5" />
                  <span>Data Enrichment Score</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Enrichment Score
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {analysis.enrichmentScore.score}/100
                      </span>
                    </div>
                    <Progress value={analysis.enrichmentScore.score} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Data Completeness
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {analysis.enrichmentScore.completeness}%
                      </span>
                    </div>
                    <Progress value={analysis.enrichmentScore.completeness} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Confidence Level
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {analysis.enrichmentScore.confidence}%
                      </span>
                    </div>
                    <Progress value={analysis.enrichmentScore.confidence} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Key Metrics Summary */}
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-slate-900 dark:text-slate-100">
                <Activity className="w-5 h-5" />
                <span>Scoring Breakdown</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Company Size</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{lead.companySize}</div>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Funding Stage</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{lead.fundingInfo || 'Unknown'}</div>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <Users className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Job Authority</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{lead.jobTitle}</div>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <Target className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Industry Value</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{lead.industry}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Analysis Timestamp */}
      {analysis && (
        <div className="text-center text-xs text-slate-500 dark:text-slate-400">
          Last analyzed: {new Date(analysis.analysisTimestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
}