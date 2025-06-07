import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Filter, X, Search, Building2, Users, MapPin, Briefcase, TrendingUp } from "lucide-react";

interface FilterCriteria {
  search: string;
  industries: string[];
  companySizes: string[];
  locations: string[];
  jobTitles: string[];
  scoreRange: [number, number];
  priority: string[];
  techStack: string[];
  fundingStage: string[];
  recentActivity: boolean;
  aiEnriched: boolean;
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterCriteria) => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const INDUSTRY_OPTIONS = [
  "Technology", "SaaS", "E-commerce", "Financial Services", "Healthcare", 
  "Manufacturing", "Real Estate", "Education", "Media", "Consulting",
  "Retail", "Transportation", "Energy", "Construction", "Food & Beverage"
];

const COMPANY_SIZE_OPTIONS = [
  "1-10", "11-50", "51-200", "201-500", "501-1000", "1001-5000", "5000+"
];

const JOB_TITLE_OPTIONS = [
  "CEO", "CTO", "VP Engineering", "VP Sales", "VP Marketing", "Director",
  "Engineering Manager", "Product Manager", "Sales Manager", "Marketing Manager"
];

const TECH_STACK_OPTIONS = [
  "React", "Node.js", "Python", "AWS", "Docker", "Kubernetes", "PostgreSQL",
  "MongoDB", "Redis", "TypeScript", "GraphQL", "Microservices"
];

const FUNDING_STAGE_OPTIONS = [
  "Seed", "Series A", "Series B", "Series C", "Series D+", "IPO", "Acquired"
];

export function AdvancedFilters({ onFiltersChange, onClearFilters, isOpen, onToggle }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterCriteria>({
    search: "",
    industries: [],
    companySizes: [],
    locations: [],
    jobTitles: [],
    scoreRange: [0, 100],
    priority: [],
    techStack: [],
    fundingStage: [],
    recentActivity: false,
    aiEnriched: false
  });

  const updateFilters = (key: keyof FilterCriteria, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleArrayFilter = (key: keyof FilterCriteria, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilters(key, newArray);
  };

  const clearAllFilters = () => {
    const emptyFilters: FilterCriteria = {
      search: "",
      industries: [],
      companySizes: [],
      locations: [],
      jobTitles: [],
      scoreRange: [0, 100],
      priority: [],
      techStack: [],
      fundingStage: [],
      recentActivity: false,
      aiEnriched: false
    };
    setFilters(emptyFilters);
    onClearFilters();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.industries.length) count++;
    if (filters.companySizes.length) count++;
    if (filters.locations.length) count++;
    if (filters.jobTitles.length) count++;
    if (filters.scoreRange[0] > 0 || filters.scoreRange[1] < 100) count++;
    if (filters.priority.length) count++;
    if (filters.techStack.length) count++;
    if (filters.fundingStage.length) count++;
    if (filters.recentActivity) count++;
    if (filters.aiEnriched) count++;
    return count;
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={onToggle}
        className="relative mb-4"
      >
        <Filter className="h-4 w-4 mr-2" />
        Advanced Filters
        {getActiveFilterCount() > 0 && (
          <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
            {getActiveFilterCount()}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="mb-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Advanced Filters
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  Clear All
                </Button>
                <Button variant="ghost" size="sm" onClick={onToggle}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Search */}
            <div className="space-y-2">
              <Label className="flex items-center">
                <Search className="h-4 w-4 mr-2" />
                Search Companies or Contacts
              </Label>
              <Input
                placeholder="Search by company name, contact name, or keywords..."
                value={filters.search}
                onChange={(e) => updateFilters("search", e.target.value)}
              />
            </div>

            {/* Score Range */}
            <div className="space-y-3">
              <Label className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Lead Score Range: {filters.scoreRange[0]} - {filters.scoreRange[1]}
              </Label>
              <Slider
                value={filters.scoreRange}
                onValueChange={(value) => updateFilters("scoreRange", value)}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Industries */}
              <div className="space-y-3">
                <Label className="flex items-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  Industries
                </Label>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {INDUSTRY_OPTIONS.map((industry) => (
                    <div key={industry} className="flex items-center space-x-2">
                      <Checkbox
                        id={`industry-${industry}`}
                        checked={filters.industries.includes(industry)}
                        onCheckedChange={() => toggleArrayFilter("industries", industry)}
                      />
                      <Label htmlFor={`industry-${industry}`} className="text-sm font-normal">
                        {industry}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Company Sizes */}
              <div className="space-y-3">
                <Label className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Company Size
                </Label>
                <div className="space-y-2">
                  {COMPANY_SIZE_OPTIONS.map((size) => (
                    <div key={size} className="flex items-center space-x-2">
                      <Checkbox
                        id={`size-${size}`}
                        checked={filters.companySizes.includes(size)}
                        onCheckedChange={() => toggleArrayFilter("companySizes", size)}
                      />
                      <Label htmlFor={`size-${size}`} className="text-sm font-normal">
                        {size} employees
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Job Titles */}
              <div className="space-y-3">
                <Label className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Job Titles
                </Label>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {JOB_TITLE_OPTIONS.map((title) => (
                    <div key={title} className="flex items-center space-x-2">
                      <Checkbox
                        id={`title-${title}`}
                        checked={filters.jobTitles.includes(title)}
                        onCheckedChange={() => toggleArrayFilter("jobTitles", title)}
                      />
                      <Label htmlFor={`title-${title}`} className="text-sm font-normal">
                        {title}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-3">
                <Label>Priority Level</Label>
                <div className="space-y-2">
                  {["hot", "warm", "cold"].map((priority) => (
                    <div key={priority} className="flex items-center space-x-2">
                      <Checkbox
                        id={`priority-${priority}`}
                        checked={filters.priority.includes(priority)}
                        onCheckedChange={() => toggleArrayFilter("priority", priority)}
                      />
                      <Label htmlFor={`priority-${priority}`} className="text-sm font-normal capitalize">
                        {priority} Leads
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tech Stack */}
              <div className="space-y-3">
                <Label>Tech Stack</Label>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {TECH_STACK_OPTIONS.map((tech) => (
                    <div key={tech} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tech-${tech}`}
                        checked={filters.techStack.includes(tech)}
                        onCheckedChange={() => toggleArrayFilter("techStack", tech)}
                      />
                      <Label htmlFor={`tech-${tech}`} className="text-sm font-normal">
                        {tech}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Funding Stage */}
              <div className="space-y-3">
                <Label>Funding Stage</Label>
                <div className="space-y-2">
                  {FUNDING_STAGE_OPTIONS.map((stage) => (
                    <div key={stage} className="flex items-center space-x-2">
                      <Checkbox
                        id={`funding-${stage}`}
                        checked={filters.fundingStage.includes(stage)}
                        onCheckedChange={() => toggleArrayFilter("fundingStage", stage)}
                      />
                      <Label htmlFor={`funding-${stage}`} className="text-sm font-normal">
                        {stage}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Filters */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recent-activity"
                  checked={filters.recentActivity}
                  onCheckedChange={(checked) => updateFilters("recentActivity", checked)}
                />
                <Label htmlFor="recent-activity" className="text-sm font-normal">
                  Recent Activity Only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ai-enriched"
                  checked={filters.aiEnriched}
                  onCheckedChange={(checked) => updateFilters("aiEnriched", checked)}
                />
                <Label htmlFor="ai-enriched" className="text-sm font-normal">
                  AI Enriched Leads Only
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}