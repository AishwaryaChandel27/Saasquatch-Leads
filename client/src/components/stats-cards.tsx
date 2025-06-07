import { Card, CardContent } from "@/components/ui/card";
import { Users, Star, Brain, TrendingUp, ArrowUpRight, Zap } from "lucide-react";

interface StatsCardsProps {
  stats?: {
    totalLeads: number;
    highPriority: number;
    aiEnriched: number;
    conversionRate: string;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="card-premium shimmer-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded w-20 mb-3 animate-pulse"></div>
                  <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded w-16 animate-pulse"></div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-xl animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Leads",
      value: stats.totalLeads.toLocaleString(),
      icon: Users,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
      change: "+12%",
      changeType: "positive"
    },
    {
      title: "High Priority",
      value: stats.highPriority.toString(),
      icon: Star,
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900",
      change: "+8%",
      changeType: "positive"
    },
    {
      title: "AI Enriched",
      value: stats.aiEnriched.toString(),
      icon: Brain,
      gradient: "from-purple-500 to-indigo-600",
      bgGradient: "from-purple-50 to-indigo-100 dark:from-purple-950 dark:to-indigo-900",
      change: "+24%",
      changeType: "positive"
    },
    {
      title: "Conversion Rate",
      value: stats.conversionRate,
      icon: TrendingUp,
      gradient: "from-orange-500 to-red-600",
      bgGradient: "from-orange-50 to-red-100 dark:from-orange-950 dark:to-red-900",
      change: "+5%",
      changeType: "positive"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 xl:gap-8 mb-6 lg:mb-8">
      {statCards.map((stat, index) => (
        <Card 
          key={stat.title} 
          className="card-premium group hover:scale-105 transition-all duration-300"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-6 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 neural-grid opacity-30"></div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <div className="flex items-center text-xs font-medium text-success">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      {stat.change}
                    </div>
                  </div>
                </div>
                
                <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${stat.bgGradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                  <stat.icon className={`w-7 h-7 bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent relative z-10`} />
                  {stat.title === "AI Enriched" && (
                    <Zap className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 animate-pulse" />
                  )}
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full transition-all duration-1000 ease-out`}
                  style={{ 
                    width: `${Math.min(100, (parseInt(stat.value.replace(/[^\d]/g, '')) / 1000) * 100)}%`,
                    animationDelay: `${index * 200}ms`
                  }}
                ></div>
              </div>
            </div>
            
            {/* Hover glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl`}></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
