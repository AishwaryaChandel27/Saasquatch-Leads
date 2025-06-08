import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Target, 
  Users, 
  Building2, 
  MapPin, 
  DollarSign,
  Calendar,
  Mail,
  Phone,
  Globe,
  Briefcase,
  Star
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { LeadEnrichmentStatus } from "@/components/lead-enrichment-status";
import { TargetProfileMatcher } from "@/components/target-profile-matcher";
import type { Lead } from "@shared/schema";

interface LeadInsightsDashboardProps {
  selectedLead: Lead | null;
}

export function LeadInsightsDashboard({ selectedLead }: LeadInsightsDashboardProps) {
  const { data: leads = [] } = useQuery<Lead[]>({
    queryKey: ["/api/leads"]
  });

  // Calculate comprehensive analytics
  const analytics = {
    industryDistribution: getIndustryDistribution(leads),
    companySizeBreakdown: getCompanySizeBreakdown(leads),
    locationAnalysis: getLocationAnalysis(leads),
    scoreDistribution: getScoreDistribution(leads),
    recentActivity: getRecentActivity(leads),
    conversionPotential: getConversionPotential(leads)
  };

  if (!selectedLead) {
    return (
      <div className="space-y-6">
        {/* Overall Analytics */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Lead Analytics Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Industry Distribution */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Industry Distribution</h4>
              <div className="space-y-2">
                {analytics.industryDistribution.map((industry) => (
                  <div key={industry.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{industry.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={industry.percentage} className="w-20 h-2" />
                      <span className="text-xs text-muted-foreground w-8">{industry.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Score Distribution */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Score Distribution</h4>
              <div className="grid grid-cols-3 gap-4">
                {analytics.scoreDistribution.map((range) => (
                  <div key={range.label} className="text-center space-y-2">
                    <div className={`w-12 h-12 mx-auto rounded-full ${range.color} flex items-center justify-center`}>
                      <span className="text-white font-bold text-sm">{range.count}</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium">{range.label}</p>
                      <p className="text-xs text-muted-foreground">{range.range}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Locations */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Geographic Distribution</h4>
              <div className="space-y-2">
                {analytics.locationAnalysis.slice(0, 4).map((location) => (
                  <div key={location.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{location.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {location.count} leads
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Potential */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-success" />
              <span>Conversion Potential</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">High Potential</p>
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold text-success">{analytics.conversionPotential.high}</div>
                  <Badge variant="secondary" className="text-xs bg-success/10 text-success">
                    Ready to engage
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Medium Potential</p>
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold text-warning">{analytics.conversionPotential.medium}</div>
                  <Badge variant="secondary" className="text-xs bg-warning/10 text-warning">
                    Nurture needed
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Expected Conversion Rate</span>
                <span className="font-semibold text-primary">24.8%</span>
              </div>
              <Progress value={24.8} className="mt-2" />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Summary */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Selected lead detailed analysis
  return (
    <div className="space-y-6">
      {/* Target Profile Match */}
      <TargetProfileMatcher lead={selectedLead} />
      
      {/* Data Enrichment Status */}
      <LeadEnrichmentStatus 
        lead={selectedLead} 
        onEnrich={async (leadId) => {
          // Trigger enrichment process
          try {
            const response = await fetch(`/api/leads/${leadId}/enrich`, {
              method: 'POST',
            });
            if (response.ok) {
              // Refresh lead data
              window.location.reload();
            }
          } catch (error) {
            console.error('Enrichment failed:', error);
          }
        }}
      />

      {/* Lead Profile */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span>{selectedLead.companyName} Contact Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Contact Information */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">{selectedLead.contactName}</p>
                <p className="text-xs text-muted-foreground">{selectedLead.jobTitle}</p>
              </div>
            </div>
            
            {selectedLead.email && (
              <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm">{selectedLead.email}</p>
                  <p className="text-xs text-muted-foreground">Primary contact</p>
                </div>
              </div>
            )}
            
            {selectedLead.phone && (
              <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm">{selectedLead.phone}</p>
                  <p className="text-xs text-muted-foreground">Direct line</p>
                </div>
              </div>
            )}
            
            {selectedLead.website && (
              <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm">{selectedLead.website}</p>
                  <p className="text-xs text-muted-foreground">Company website</p>
                </div>
              </div>
            )}
          </div>

          {/* Company Details */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Company Size</p>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{selectedLead.companySize}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Industry</p>
              <div className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{selectedLead.industry}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Location</p>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{selectedLead.location}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Lead Score</p>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-warning" />
                <span className="text-sm font-bold">{selectedLead.score}/100</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getIndustryDistribution(leads: Lead[]) {
  const industries = leads.reduce((acc, lead) => {
    acc[lead.industry] = (acc[lead.industry] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(industries)
    .map(([name, count]) => ({
      name,
      count,
      percentage: (count / leads.length) * 100
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function getCompanySizeBreakdown(leads: Lead[]) {
  const sizes = leads.reduce((acc, lead) => {
    acc[lead.companySize] = (acc[lead.companySize] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(sizes).map(([size, count]) => ({ size, count }));
}

function getLocationAnalysis(leads: Lead[]) {
  const locations = leads.reduce((acc, lead) => {
    acc[lead.location] = (acc[lead.location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(locations)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function getScoreDistribution(leads: Lead[]) {
  const high = leads.filter(l => l.score >= 80).length;
  const medium = leads.filter(l => l.score >= 60 && l.score < 80).length;
  const low = leads.filter(l => l.score < 60).length;

  return [
    { label: 'Hot', range: '80-100', count: high, color: 'bg-success' },
    { label: 'Warm', range: '60-79', count: medium, color: 'bg-warning' },
    { label: 'Cold', range: '0-59', count: low, color: 'bg-muted' }
  ];
}

function getRecentActivity(leads: Lead[]) {
  return [
    { action: 'New lead scored above 85', time: '2 hours ago', type: 'High Priority' },
    { action: '3 leads enriched with AI data', time: '4 hours ago', type: 'Enrichment' },
    { action: 'Lead moved to warm category', time: '6 hours ago', type: 'Score Update' },
    { action: 'New prospect identified', time: '8 hours ago', type: 'Prospecting' }
  ];
}

function getConversionPotential(leads: Lead[]) {
  const high = leads.filter(l => l.score >= 75).length;
  const medium = leads.filter(l => l.score >= 50 && l.score < 75).length;
  
  return { high, medium };
}

function getEngagementRecommendations(lead: Lead) {
  const recommendations = [];
  
  if (lead.score >= 80) {
    recommendations.push({
      action: 'Schedule immediate demo call',
      reason: 'High lead score indicates strong buying intent',
      priority: 'high'
    });
  }
  
  if (lead.jobTitle.toLowerCase().includes('cto') || lead.jobTitle.toLowerCase().includes('director')) {
    recommendations.push({
      action: 'Send technical product overview',
      reason: 'Technical decision maker identified',
      priority: 'high'
    });
  }
  
  if (lead.companySize === 'Enterprise' || lead.companySize === 'Large') {
    recommendations.push({
      action: 'Involve enterprise sales team',
      reason: 'Large company requires specialized approach',
      priority: 'medium'
    });
  }
  
  recommendations.push({
    action: 'Send personalized email sequence',
    reason: 'Build relationship and demonstrate value',
    priority: 'medium'
  });
  
  return recommendations;
}