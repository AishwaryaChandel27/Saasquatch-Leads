import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Building, Users, DollarSign, TrendingUp, Globe, Shield, Handshake, Newspaper, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CompanyAnalysisReportProps {
  leadId: number;
  companyName: string;
}

interface AnalysisReport {
  basicInfo: {
    companyName: string;
    domain: string;
    foundedYear: string;
    headquarters: string;
    logo: string;
    legalName: string;
    entityType: string;
  };
  executiveTeam: {
    ceo: string;
    cto: string;
    cfo: string;
    keyDecisionMakers: string[];
    linkedinProfiles: string[];
    contactInfo: {
      email: string;
      phone: string;
    };
  };
  companyOverview: {
    description: string;
    mission: string;
    industry: string;
    businessModel: string;
    keyProducts: string[];
    uniqueSellingProposition: string;
  };
  financialSummary: {
    revenue: string;
    employeeCount: number;
    valuation: string;
    fundingRounds: string[];
    investors: string[];
    profitability: string;
  };
  growthIndicators: {
    recentFunding: string;
    hiringTrends: string;
    techStack: string[];
    jobPostings: number;
    marketExpansion: string[];
  };
  webSocialPresence: {
    website: string;
    linkedin: string;
    twitter: string;
    facebook: string;
    trafficEstimates: string;
    seoRankings: string;
    googleTrends: string;
  };
  technographics: {
    crm: string;
    emailTools: string[];
    analytics: string[];
    hosting: string[];
    security: string[];
  };
  complianceRisk: {
    legalFilings: string;
    regulatoryIssues: string[];
    lawsuits: string[];
    dataBreaches: string[];
    gdprCompliance: string;
  };
  partnersClients: {
    strategicAlliances: string[];
    majorClients: string[];
    vendorRelationships: string[];
    supplyChain: string;
  };
  newsInsights: {
    recentNews: string[];
    pressReleases: string[];
    mediaCoverage: string;
    maActivity: string[];
  };
  aiRecommendations: {
    leadQuality: string;
    approachStrategy: string;
    buyingSignals: string[];
    riskFactors: string[];
    nextSteps: string[];
  };
}

export default function CompanyAnalysisReport({ leadId, companyName }: CompanyAnalysisReportProps) {
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const { toast } = useToast();

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/leads/${leadId}/analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate analysis report');
      }
      
      const data = await response.json();
      return data.report;
    },
    onSuccess: (data) => {
      setReport(data);
      toast({
        title: "Analysis Complete",
        description: `Generated comprehensive analysis for ${companyName}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to generate company analysis",
        variant: "destructive",
      });
    },
  });

  const handleGenerateReport = () => {
    generateReportMutation.mutate();
  };

  if (!report) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Company Analysis Report</span>
          </CardTitle>
          <CardDescription>
            Generate a comprehensive AI-powered analysis using real-world data from LinkedIn, GitHub, Crunchbase, and news sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleGenerateReport}
            disabled={generateReportMutation.isPending}
            className="w-full"
            size="lg"
          >
            {generateReportMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing {companyName}...
              </>
            ) : (
              <>
                <Lightbulb className="mr-2 h-4 w-4" />
                Generate Analysis Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Company Analysis Report: {report.basicInfo.companyName}</span>
          </CardTitle>
          <CardDescription>
            Comprehensive analysis powered by real-world data and AI insights
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="technology">Technology</TabsTrigger>
          <TabsTrigger value="risk">Risk & Compliance</TabsTrigger>
          <TabsTrigger value="recommendations">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Founded</p>
                  <p>{report.basicInfo.foundedYear || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Headquarters</p>
                  <p>{report.basicInfo.headquarters || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Domain</p>
                  <p>{report.basicInfo.domain || 'Not available'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Entity Type</p>
                  <p>{report.basicInfo.entityType}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Executive Team</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CEO</p>
                  <p>{report.executiveTeam.ceo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CTO</p>
                  <p>{report.executiveTeam.cto}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CFO</p>
                  <p>{report.executiveTeam.cfo}</p>
                </div>
                {report.executiveTeam.contactInfo.email !== 'Not available' && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Contact Email</p>
                    <p>{report.executiveTeam.contactInfo.email}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Company Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                <p className="text-sm leading-relaxed">{report.companyOverview.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Industry</p>
                  <Badge variant="secondary">{report.companyOverview.industry}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Business Model</p>
                  <p className="text-sm">{report.companyOverview.businessModel}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">USP</p>
                  <p className="text-sm">{report.companyOverview.uniqueSellingProposition}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                </div>
                <p className="text-2xl font-bold">{report.financialSummary.revenue}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-medium text-muted-foreground">Employees</p>
                </div>
                <p className="text-2xl font-bold">{report.financialSummary.employeeCount || 'Unknown'}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <p className="text-sm font-medium text-muted-foreground">Valuation</p>
                </div>
                <p className="text-2xl font-bold">{report.financialSummary.valuation}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-orange-600" />
                  <p className="text-sm font-medium text-muted-foreground">Profitability</p>
                </div>
                <p className="text-2xl font-bold">{report.financialSummary.profitability}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Funding Rounds</CardTitle>
              </CardHeader>
              <CardContent>
                {report.financialSummary.fundingRounds.length > 0 ? (
                  <div className="space-y-2">
                    {report.financialSummary.fundingRounds.map((round, index) => (
                      <Badge key={index} variant="outline">{round}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No funding rounds disclosed</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Investors</CardTitle>
              </CardHeader>
              <CardContent>
                {report.financialSummary.investors.length > 0 ? (
                  <div className="space-y-2">
                    {report.financialSummary.investors.map((investor, index) => (
                      <Badge key={index} variant="secondary">{investor}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No investors disclosed</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Growth Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recent Funding</p>
                  <p>{report.growthIndicators.recentFunding}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Hiring Trends</p>
                  <p>{report.growthIndicators.hiringTrends}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Job Postings</p>
                  <p>{report.growthIndicators.jobPostings} active positions</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Technology Stack</CardTitle>
              </CardHeader>
              <CardContent>
                {report.growthIndicators.techStack.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {report.growthIndicators.techStack.map((tech, index) => (
                      <Badge key={index} variant="outline">{tech}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No technology stack identified</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>Web & Social Presence</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Website</p>
                <p className="text-sm">{report.webSocialPresence.website || 'Not available'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">LinkedIn</p>
                <p className="text-sm">{report.webSocialPresence.linkedin ? 'Active' : 'Not found'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Traffic Estimates</p>
                <p className="text-sm">{report.webSocialPresence.trafficEstimates}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technology" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Technographics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">CRM System</p>
                  <Badge variant="secondary">{report.technographics.crm}</Badge>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Email Tools</p>
                  <div className="flex flex-wrap gap-1">
                    {report.technographics.emailTools.length > 0 ? (
                      report.technographics.emailTools.map((tool, index) => (
                        <Badge key={index} variant="outline" className="text-xs">{tool}</Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">Unknown</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Analytics</p>
                  <div className="flex flex-wrap gap-1">
                    {report.technographics.analytics.length > 0 ? (
                      report.technographics.analytics.map((tool, index) => (
                        <Badge key={index} variant="outline" className="text-xs">{tool}</Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">Unknown</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Security Tools</p>
                  <div className="flex flex-wrap gap-1">
                    {report.technographics.security.length > 0 ? (
                      report.technographics.security.map((tool, index) => (
                        <Badge key={index} variant="outline" className="text-xs">{tool}</Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">Unknown</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Compliance & Risk Assessment</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Legal Filings</p>
                  <p className="text-sm">{report.complianceRisk.legalFilings}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">GDPR Compliance</p>
                  <Badge variant={report.complianceRisk.gdprCompliance.includes('Compliant') ? 'default' : 'destructive'}>
                    {report.complianceRisk.gdprCompliance}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Regulatory Issues</p>
                  {report.complianceRisk.regulatoryIssues.length > 0 ? (
                    <div className="space-y-1">
                      {report.complianceRisk.regulatoryIssues.map((issue, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">{issue}</Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-green-600">No issues identified</span>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Data Breaches</p>
                  {report.complianceRisk.dataBreaches.length > 0 ? (
                    <div className="space-y-1">
                      {report.complianceRisk.dataBreaches.map((breach, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">{breach}</Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-green-600">No breaches reported</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Lightbulb className="h-4 w-4" />
                <span>AI-Powered Insights & Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Lead Quality Assessment</p>
                <p className="text-sm bg-muted p-3 rounded">{report.aiRecommendations.leadQuality}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Recommended Approach Strategy</p>
                <p className="text-sm bg-muted p-3 rounded">{report.aiRecommendations.approachStrategy}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Buying Signals</p>
                  <div className="space-y-2">
                    {report.aiRecommendations.buyingSignals.map((signal, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <p className="text-sm">{signal}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Risk Factors</p>
                  <div className="space-y-2">
                    {report.aiRecommendations.riskFactors.map((risk, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <p className="text-sm">{risk}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Next Steps</p>
                <div className="space-y-2">
                  {report.aiRecommendations.nextSteps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-sm">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Newspaper className="h-4 w-4" />
                <span>Recent News & Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {report.newsInsights.recentNews.length > 0 ? (
                <div className="space-y-3">
                  {report.newsInsights.recentNews.slice(0, 5).map((news, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <p className="text-sm">{news}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No recent news coverage found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center">
        <Button 
          onClick={handleGenerateReport}
          disabled={generateReportMutation.isPending}
          variant="outline"
        >
          {generateReportMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing Analysis...
            </>
          ) : (
            'Refresh Analysis'
          )}
        </Button>
      </div>
    </div>
  );
}