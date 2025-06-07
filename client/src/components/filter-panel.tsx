import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Star, Building, Clock } from "lucide-react";

interface FilterPanelProps {
  filters: {
    search: string;
    industry: string;
    companySize: string;
    priority: string;
    minScore?: number;
  };
  onFiltersChange: (filters: any) => void;
}

export function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilter = (key: string) => {
    onFiltersChange({ ...filters, [key]: key === "minScore" ? undefined : "" });
  };

  const activeFilters = Object.entries(filters).filter(([key, value]) => 
    value !== "" && value !== undefined
  );

  return (
    <Card className="shadow-sm border border-slate-200 mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold text-slate-900">Smart Filters</h3>
            
            {/* Quick Filter Badges */}
            <Badge 
              variant={filters.minScore === 80 ? "default" : "outline"}
              className="cursor-pointer hover:scale-105 transition-transform"
              onClick={() => handleFilterChange("minScore", filters.minScore === 80 ? undefined : 80)}
            >
              <Star className="w-3 h-3 mr-1" />
              High Score (80+)
            </Badge>
            
            <Badge 
              variant={filters.companySize === "500-1000" ? "default" : "outline"}
              className="cursor-pointer hover:scale-105 transition-transform"
              onClick={() => handleFilterChange("companySize", filters.companySize === "500-1000" ? "" : "500-1000")}
            >
              <Building className="w-3 h-3 mr-1" />
              Enterprise
            </Badge>
            
            <Badge 
              variant={filters.priority === "hot" ? "default" : "outline"}
              className="cursor-pointer hover:scale-105 transition-transform"
              onClick={() => handleFilterChange("priority", filters.priority === "hot" ? "" : "hot")}
            >
              <Clock className="w-3 h-3 mr-1" />
              Hot Leads
            </Badge>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Search companies or contacts..." 
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10 w-64"
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            </div>
            
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>
        
        {/* Active Filters Display */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200">
            <span className="text-sm text-slate-600">Active filters:</span>
            {activeFilters.map(([key, value]) => (
              <Badge 
                key={key} 
                variant="secondary" 
                className="cursor-pointer"
                onClick={() => clearFilter(key)}
              >
                {key}: {value?.toString()}
                <span className="ml-1">×</span>
              </Badge>
            ))}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onFiltersChange({ search: "", industry: "", companySize: "", priority: "", minScore: undefined })}
            >
              Clear all
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
