import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Building2, 
  Users, 
  DollarSign, 
  Briefcase,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
import type { Lead } from "@shared/schema";

interface TargetProfileMatcherProps {
  lead: Lead;
}

interface TargetCriteria {
  name: string;
  weight: number;
  matcher: (lead: Lead) => { matches: boolean; reason: string; score: number };
  icon: any;
}

export function TargetProfileMatcher({ lead }: TargetProfileMatcherProps) {
  const targetCriteria: TargetCriteria[] = [
    {
      name: "Target Industry",
      weight: 25,
      icon: Building2,
      matcher: (lead) => {
        const targetIndustries = ['Technology', 'Financial Services', 'Healthcare', 'SaaS', 'Fintech', 'Biotech'];
        const matches = targetIndustries.includes(lead.industry);
        return {
          matches,
          reason: matches 
            ? `${lead.industry} is a target sector` 
            : `${lead.industry} is not in target sectors (Tech, Finance, Healthcare)`,
          score: matches ? 100 : 20
        };
      }
    },
    {
      name: "Decision Maker Role",
      weight: 30,
      icon: Users,
      matcher: (lead) => {
        const title = lead.jobTitle.toLowerCase();
        const executiveRoles = ['ceo', 'cto', 'cfo', 'founder', 'vp', 'vice president', 'director', 'head of'];
        const isDecisionMaker = executiveRoles.some(role => title.includes(role));
        
        let score = 0;
        let reason = '';
        
        if (title.includes('ceo') || title.includes('founder')) {
          score = 100;
          reason = 'C-level executive with ultimate decision authority';
        } else if (title.includes('cto') || title.includes('cfo')) {
          score = 95;
          reason = 'Technical/Financial decision maker';
        } else if (title.includes('vp') || title.includes('vice president')) {
          score = 85;
          reason = 'VP-level with significant decision influence';
        } else if (title.includes('director') || title.includes('head of')) {
          score = 75;
          reason = 'Department head with budget authority';
        } else if (title.includes('manager')) {
          score = 50;
          reason = 'Management role with limited decision power';
        } else {
          score = 20;
          reason = 'Individual contributor role';
        }
        
        return {
          matches: isDecisionMaker,
          reason,
          score
        };
      }
    },
    {
      name: "Company Size",
      weight: 20,
      icon: Building2,
      matcher: (lead) => {
        const targetSizes = ['Medium', 'Large', 'Enterprise'];
        const matches = targetSizes.includes(lead.companySize);
        
        let score = 0;
        switch (lead.companySize) {
          case 'Enterprise':
            score = 100;
            break;
          case 'Large':
            score = 85;
            break;
          case 'Medium':
            score = 70;
            break;
          case 'Small':
            score = 40;
            break;
          case 'Startup':
            score = 30;
            break;
          default:
            score = 20;
        }
        
        return {
          matches,
          reason: matches 
            ? `${lead.companySize} company has sufficient budget capacity`
            : `${lead.companySize} company may have budget constraints`,
          score
        };
      }
    },
    {
      name: "Funding Status",
      weight: 15,
      icon: DollarSign,
      matcher: (lead) => {
        const fundedStages = ['Series A', 'Series B', 'Series C', 'IPO', 'Acquired'];
        const hasFunding = lead.fundingStage && fundedStages.includes(lead.fundingStage);
        
        let score = 0;
        if (lead.fundingStage) {
          switch (lead.fundingStage) {
            case 'IPO':
            case 'Acquired':
              score = 100;
              break;
            case 'Series C':
            case 'Series D':
              score = 90;
              break;
            case 'Series B':
              score = 80;
              break;
            case 'Series A':
              score = 70;
              break;
            case 'Seed':
              score = 50;
              break;
            case 'Pre-seed':
              score = 30;
              break;
            default:
              score = 40;
          }
        } else {
          score = 35; // Unknown funding
        }
        
        return {
          matches: hasFunding || false,
          reason: lead.fundingStage 
            ? `${lead.fundingStage} indicates available capital`
            : 'Funding status unknown',
          score
        };
      }
    },
    {
      name: "Tech Stack Alignment",
      weight: 10,
      icon: Briefcase,
      matcher: (lead) => {
        if (!lead.techStack?.length) {
          return {
            matches: false,
            reason: 'Tech stack information not available',
            score: 20
          };
        }
        
        const modernTech = [
          'react', 'node.js', 'python', 'aws', 'azure', 'docker', 
          'kubernetes', 'microservices', 'api', 'cloud', 'saas'
        ];
        
        const techMatches = lead.techStack.filter(tech =>
          modernTech.some(modern => tech.toLowerCase().includes(modern))
        );
        
        const score = Math.min(100, 20 + (techMatches.length * 15));
        const matches = techMatches.length >= 2;
        
        return {
          matches,
          reason: matches 
            ? `Uses ${techMatches.length} modern technologies`
            : `Limited modern tech stack (${techMatches.length} matches)`,
          score
        };
      }
    }
  ];

  const results = targetCriteria.map(criteria => {
    const result = criteria.matcher(lead);
    return {
      ...criteria,
      ...result,
      weightedScore: (result.score * criteria.weight) / 100
    };
  });

  const totalScore = results.reduce((sum, result) => sum + result.weightedScore, 0);
  const matchingCriteria = results.filter(r => r.matches).length;
  
  const getMatchLevel = (score: number) => {
    if (score >= 80) return { level: 'Excellent', color: 'text-success', bgColor: 'bg-success' };
    if (score >= 65) return { level: 'Good', color: 'text-warning', bgColor: 'bg-warning' };
    if (score >= 45) return { level: 'Fair', color: 'text-orange-600', bgColor: 'bg-orange-500' };
    return { level: 'Poor', color: 'text-destructive', bgColor: 'bg-destructive' };
  };

  const matchLevel = getMatchLevel(totalScore);

  return (
    <Card className="card-premium">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <span>Target Profile Match</span>
          </div>
          <Badge variant="secondary" className={`text-xs ${matchLevel.color}`}>
            {matchLevel.level} Fit
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold text-primary">{Math.round(totalScore)}%</div>
          <div className="text-sm text-muted-foreground">
            {matchingCriteria}/{targetCriteria.length} criteria met
          </div>
          <Progress value={totalScore} className="h-3" />
        </div>

        {/* Criteria Breakdown */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Profile Analysis</h4>
          <div className="space-y-3">
            {results.map((result) => {
              const IconComponent = result.icon;
              return (
                <div key={result.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{result.name}</span>
                      <span className="text-xs text-muted-foreground">({result.weight}% weight)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {result.matches ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : result.score > 50 ? (
                        <AlertTriangle className="h-4 w-4 text-warning" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className="text-sm font-bold">{Math.round(result.weightedScore)}</span>
                    </div>
                  </div>
                  <div className="pl-6">
                    <p className="text-xs text-muted-foreground">{result.reason}</p>
                    <Progress value={result.score} className="h-1 mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
          <h4 className="font-semibold text-sm">Sales Strategy Recommendations</h4>
          <div className="space-y-1 text-xs">
            {getRecommendations(results, totalScore).map((rec, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-muted-foreground">{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Business Value Assessment */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-primary">{getBusinessValue(totalScore)}</div>
              <div className="text-xs text-muted-foreground">Business Value</div>
            </div>
            <div>
              <div className="text-lg font-bold text-primary">{getPriority(totalScore)}</div>
              <div className="text-xs text-muted-foreground">Priority Level</div>
            </div>
            <div>
              <div className="text-lg font-bold text-primary">{getTimeframe(totalScore)}</div>
              <div className="text-xs text-muted-foreground">Engagement Time</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getRecommendations(results: any[], totalScore: number): string[] {
  const recommendations = [];
  
  if (totalScore >= 80) {
    recommendations.push("High-priority lead: Schedule immediate executive demo");
    recommendations.push("Prepare custom ROI presentation for their industry");
  } else if (totalScore >= 65) {
    recommendations.push("Strong potential: Begin technical discovery calls");
    recommendations.push("Share relevant case studies from similar companies");
  } else if (totalScore >= 45) {
    recommendations.push("Moderate fit: Focus on education and relationship building");
    recommendations.push("Identify additional stakeholders who may influence decision");
  } else {
    recommendations.push("Lower priority: Consider automated nurturing sequence");
    recommendations.push("Re-evaluate quarterly as company situation may change");
  }
  
  const industryResult = results.find(r => r.name === "Target Industry");
  if (industryResult && !industryResult.matches) {
    recommendations.push("Non-target industry: Assess potential for horizontal expansion");
  }
  
  const roleResult = results.find(r => r.name === "Decision Maker Role");
  if (roleResult && !roleResult.matches) {
    recommendations.push("Individual contributor: Identify economic buyer and champion path");
  }
  
  return recommendations.slice(0, 4);
}

function getBusinessValue(score: number): string {
  if (score >= 80) return "High";
  if (score >= 65) return "Medium";
  if (score >= 45) return "Low";
  return "Minimal";
}

function getPriority(score: number): string {
  if (score >= 80) return "P1";
  if (score >= 65) return "P2";
  if (score >= 45) return "P3";
  return "P4";
}

function getTimeframe(score: number): string {
  if (score >= 80) return "0-30 days";
  if (score >= 65) return "1-3 months";
  if (score >= 45) return "3-6 months";
  return "6+ months";
}