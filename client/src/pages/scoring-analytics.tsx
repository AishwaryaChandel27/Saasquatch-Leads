import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, Users, Target, Award, AlertTriangle, CheckCircle } from "lucide-react";
import type { Lead } from "@shared/schema";
import { Header } from "@/components/header-simple";

interface ScoreDistribution {
  range: string;
  count: number;
  percentage: number;
  color: string;
}

interface IndustryScore {
  industry: string;
  avgScore: number;
  count: number;
  color: string;
}

interface PriorityBreakdown {
  priority: string;
  count: number;
  avgScore: number;
  color: string;
}

const COLORS = {
  hot: '#ef4444',
  warm: '#f97316', 
  cold: '#6b7280',
  high: '#22c55e',
  medium: '#3b82f6',
  low: '#ef4444'
};

export default function ScoringAnalytics() {
  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ['/api/leads'],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Calculate score distribution
  const scoreDistribution: ScoreDistribution[] = [
    { range: '90-100', count: 0, percentage: 0, color: '#22c55e' },
    { range: '80-89', count: 0, percentage: 0, color: '#84cc16' },
    { range: '70-79', count: 0, percentage: 0, color: '#eab308' },
    { range: '60-69', count: 0, percentage: 0, color: '#f97316' },
    { range: '50-59', count: 0, percentage: 0, color: '#ef4444' },
    { range: '0-49', count: 0, percentage: 0, color: '#dc2626' }
  ];

  leads.forEach(lead => {
    const score = lead.score || 0;
    if (score >= 90) scoreDistribution[0].count++;
    else if (score >= 80) scoreDistribution[1].count++;
    else if (score >= 70) scoreDistribution[2].count++;
    else if (score >= 60) scoreDistribution[3].count++;
    else if (score >= 50) scoreDistribution[4].count++;
    else scoreDistribution[5].count++;
  });

  const totalLeads = leads.length;
  scoreDistribution.forEach(item => {
    item.percentage = totalLeads > 0 ? (item.count / totalLeads) * 100 : 0;
  });

  // Calculate industry scores
  const industryMap = new Map<string, { total: number; count: number }>();
  leads.forEach(lead => {
    const industry = lead.industry || 'Unknown';
    const current = industryMap.get(industry) || { total: 0, count: 0 };
    industryMap.set(industry, {
      total: current.total + (lead.score || 0),
      count: current.count + 1
    });
  });

  const industryScores: IndustryScore[] = Array.from(industryMap.entries())
    .map(([industry, data]) => ({
      industry,
      avgScore: data.count > 0 ? Math.round(data.total / data.count) : 0,
      count: data.count,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    }))
    .sort((a, b) => b.avgScore - a.avgScore);

  // Calculate priority breakdown
  const priorityMap = new Map<string, { total: number; count: number }>();
  leads.forEach(lead => {
    const priority = lead.priority || 'cold';
    const current = priorityMap.get(priority) || { total: 0, count: 0 };
    priorityMap.set(priority, {
      total: current.total + (lead.score || 0),
      count: current.count + 1
    });
  });

  const priorityBreakdown: PriorityBreakdown[] = Array.from(priorityMap.entries())
    .map(([priority, data]) => ({
      priority,
      count: data.count,
      avgScore: data.count > 0 ? Math.round(data.total / data.count) : 0,
      color: COLORS[priority as keyof typeof COLORS] || '#6b7280'
    }));

  // Calculate metrics
  const avgScore = totalLeads > 0 ? Math.round(leads.reduce((sum, lead) => sum + (lead.score || 0), 0) / totalLeads) : 0;
  const highQualityLeads = leads.filter(lead => (lead.score || 0) >= 80).length;
  const hotLeads = leads.filter(lead => lead.priority === 'hot').length;
  const enrichedLeads = leads.filter(lead => lead.isEnriched).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Header/>
        <div>
          <h1 className="text-3xl font-bold">Scoring Analytics</h1>
          <p className="text-muted-foreground">Comprehensive analysis of lead quality and distribution</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">{avgScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Quality</p>
                <p className="text-2xl font-bold">{highQualityLeads}</p>
                <p className="text-xs text-muted-foreground">Score ≥ 80</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hot Leads</p>
                <p className="text-2xl font-bold">{hotLeads}</p>
                <p className="text-xs text-muted-foreground">Priority: Hot</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Enriched</p>
                <p className="text-2xl font-bold">{enrichedLeads}</p>
                <p className="text-xs text-muted-foreground">AI Enhanced</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>Distribution of lead scores across different ranges</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'count' ? `${value} leads` : `${value.toFixed(1)}%`,
                    name === 'count' ? 'Count' : 'Percentage'
                  ]}
                />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Breakdown</CardTitle>
            <CardDescription>Lead distribution by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ priority, count }) => `${priority}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {priorityBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} leads`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Industry Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Industry Performance</CardTitle>
          <CardDescription>Average scores by industry sector</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={industryScores} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="industry" type="category" width={150} />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  name === 'avgScore' ? `${value} avg score` : `${value} leads`,
                  name === 'avgScore' ? 'Average Score' : 'Count'
                ]}
              />
              <Bar dataKey="avgScore" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Score Ranges</CardTitle>
            <CardDescription>Detailed breakdown of score distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {scoreDistribution.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{item.range}</span>
                  <Badge variant="outline" style={{ backgroundColor: item.color, color: 'white' }}>
                    {item.count} leads ({item.percentage.toFixed(1)}%)
                  </Badge>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Analysis</CardTitle>
            <CardDescription>Average scores by priority level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {priorityBreakdown.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <div>
                    <p className="font-medium capitalize">{item.priority}</p>
                    <p className="text-sm text-muted-foreground">{item.count} leads</p>
                  </div>
                </div>
                <Badge variant="outline">
                  Avg: {item.avgScore}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
