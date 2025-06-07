import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Building, 
  Users, 
  DollarSign, 
  Calendar, 
  Zap,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";

export function ScoringSystemOverview() {
  const scoringFactors = [
    {
      name: "Company Size",
      weight: 20,
      icon: Building,
      description: "Employee count and organizational scale",
      criteria: ["1000+ employees: 20 points", "500-1000: 15 points", "100-500: 10 points", "50-100: 5 points"]
    },
    {
      name: "Industry Value",
      weight: 15,
      icon: Target,
      description: "Market relevance and growth potential",
      criteria: ["Tech/Fintech: 15 points", "Healthcare: 12 points", "Enterprise: 10 points", "Other: 5 points"]
    },
    {
      name: "Job Title Level",
      weight: 15,
      icon: Users,
      description: "Decision-making authority and influence",
      criteria: ["C-Level: 15 points", "VP/Director: 12 points", "Manager: 8 points", "Individual: 3 points"]
    },
    {
      name: "Funding Stage",
      weight: 12,
      icon: DollarSign,
      description: "Financial capacity and growth trajectory",
      criteria: ["Series C+/Public: 12 points", "Series B: 10 points", "Series A: 7 points", "Seed: 4 points"]
    },
    {
      name: "Tech Stack Modernity",
      weight: 10,
      icon: Zap,
      description: "Technology adoption and innovation readiness",
      criteria: ["Cloud-native: 10 points", "Modern stack: 8 points", "Mixed: 5 points", "Legacy: 2 points"]
    },
    {
      name: "Market Position",
      weight: 8,
      icon: TrendingUp,
      description: "Competitive standing and market share",
      criteria: ["Market leader: 8 points", "Strong player: 6 points", "Growing: 4 points", "Emerging: 2 points"]
    },
    {
      name: "Growth Indicators",
      weight: 8,
      icon: Calendar,
      description: "Recent expansion and hiring activity",
      criteria: ["Rapid growth: 8 points", "Steady growth: 6 points", "Stable: 4 points", "Declining: 1 point"]
    },
    {
      name: "Decision Making Power",
      weight: 7,
      icon: CheckCircle,
      description: "Budget authority and procurement influence",
      criteria: ["Direct authority: 7 points", "Influence: 5 points", "Contributor: 3 points", "Observer: 1 point"]
    },
    {
      name: "Buying Signals",
      weight: 3,
      icon: AlertCircle,
      description: "Intent indicators and timing relevance",
      criteria: ["Strong signals: 3 points", "Some signals: 2 points", "Weak signals: 1 point", "No signals: 0 points"]
    },
    {
      name: "Competitive Landscape",
      weight: 2,
      icon: XCircle,
      description: "Market saturation and opportunity assessment",
      criteria: ["Open market: 2 points", "Competitive: 1 point", "Saturated: 0 points"]
    }
  ];

  const scoreRanges = [
    {
      range: "80-100",
      label: "Hot Lead",
      color: "bg-success",
      description: "High-priority prospect with strong buying potential",
      action: "Immediate outreach recommended"
    },
    {
      range: "60-79",
      label: "Warm Lead",
      color: "bg-warning",
      description: "Quality prospect worth nurturing and engagement",
      action: "Strategic follow-up and relationship building"
    },
    {
      range: "0-59",
      label: "Cold Lead",
      color: "bg-muted",
      description: "Lower priority prospect requiring long-term nurturing",
      action: "Add to drip campaigns and monitor for changes"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="relative">
            <Brain className="h-8 w-8 text-primary" />
            <Zap className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">AI Lead Scoring System</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Our advanced machine learning algorithm analyzes 10 key factors to provide accurate lead quality scores, 
          helping sales teams prioritize high-impact prospects and optimize conversion rates.
        </p>
      </div>

      {/* Scoring Factors */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <span>Scoring Factors & Weights</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {scoringFactors.map((factor, index) => (
            <div key={factor.name} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <factor.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{factor.name}</h3>
                    <p className="text-sm text-muted-foreground">{factor.description}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {factor.weight}% weight
                </Badge>
              </div>
              
              <Progress value={factor.weight * 5} className="h-2" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-13">
                {factor.criteria.map((criterion, idx) => (
                  <div key={idx} className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
                    {criterion}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Score Ranges */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Score Interpretation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {scoreRanges.map((range) => (
            <div key={range.range} className="flex items-center space-x-4 p-4 rounded-lg border border-border/50">
              <div className={`w-4 h-4 ${range.color} rounded-full`}></div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-foreground">{range.label}</span>
                  <Badge variant="outline" className="text-xs">
                    Score: {range.range}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{range.description}</p>
                <p className="text-xs text-primary font-medium">{range.action}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Algorithm Benefits */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>Algorithm Benefits</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Sales Efficiency</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>75% reduction in unqualified lead pursuit</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>40% increase in conversion rates</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>50% faster deal closure times</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Data Intelligence</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Real-time scoring updates</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Multi-source data enrichment</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Continuous model improvement</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}