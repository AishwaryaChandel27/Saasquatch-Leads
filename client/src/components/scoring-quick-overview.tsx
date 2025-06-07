import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Target, TrendingUp, Building, Users, DollarSign, ExternalLink } from "lucide-react";
import { Link } from "wouter";

export function ScoringQuickOverview() {
  const topFactors = [
    { name: "Company Size", weight: 20, icon: Building, color: "text-blue-600" },
    { name: "Industry Value", weight: 15, icon: Target, color: "text-green-600" },
    { name: "Job Title Level", weight: 15, icon: Users, color: "text-purple-600" },
    { name: "Funding Stage", weight: 12, icon: DollarSign, color: "text-orange-600" }
  ];

  const scoreRanges = [
    { range: "80-100", label: "Hot", color: "bg-success", count: 3 },
    { range: "60-79", label: "Warm", color: "bg-warning", count: 2 },
    { range: "0-59", label: "Cold", color: "bg-muted", count: 0 }
  ];

  return (
    <Card className="card-premium">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span className="text-lg">AI Scoring System</span>
          </CardTitle>
          <Link href="/scoring-system">
            <Button variant="outline" size="sm" className="text-xs">
              <ExternalLink className="h-3 w-3 mr-1" />
              View Details
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Score Distribution */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-foreground">Current Score Distribution</h4>
          <div className="space-y-2">
            {scoreRanges.map((range) => (
              <div key={range.range} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 ${range.color} rounded-full`}></div>
                  <span className="text-sm text-muted-foreground">{range.label} ({range.range})</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {range.count} leads
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Top Scoring Factors */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-foreground">Top Scoring Factors</h4>
          <div className="space-y-3">
            {topFactors.map((factor) => (
              <div key={factor.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <factor.icon className={`h-4 w-4 ${factor.color}`} />
                    <span className="text-sm text-foreground">{factor.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{factor.weight}%</span>
                </div>
                <Progress value={factor.weight * 5} className="h-1.5" />
              </div>
            ))}
          </div>
        </div>

        {/* Algorithm Benefits */}
        <div className="bg-primary/5 rounded-lg p-3 space-y-2">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm text-foreground">Performance Impact</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>↑ 40% conversion rate</div>
            <div>↓ 75% wasted effort</div>
            <div>↑ 50% faster closure</div>
            <div>Real-time updates</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}