import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, Search, Sparkles, Target, TrendingUp, Download, User, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link, useLocation } from "wouter";

export function Header() {
  const { toast } = useToast();
  const [location] = useLocation();

  const handleExportToCRM = async () => {
    try {
      const response = await fetch("/api/leads/export/csv");
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "saasquatch_leads.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Leads exported to CSV successfully",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export leads. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass-morphism">
      <div className="container mx-auto flex h-20 max-w-[1600px] 2xl:max-w-[1800px] items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Logo Section */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative animate-float">
              <div className="absolute inset-0 bg-gradient-primary rounded-full blur-md opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-primary p-2.5 rounded-full">
                <Brain className="h-6 w-6 text-white" />
                <Zap className="absolute -top-1 -right-1 h-3 w-3 text-yellow-300 animate-pulse-glow" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl gradient-text">
                Saasquatch Leads
              </span>
              <div className="flex items-center space-x-2 mt-0.5">
                <Badge variant="secondary" className="text-[10px] bg-gradient-primary text-white px-1.5 py-0.5 h-5">
                  <Sparkles className="h-2.5 w-2.5 mr-1" />
                  AI-Powered
                </Badge>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 h-5 hidden sm:flex">
                  <Target className="h-2.5 w-2.5 mr-1" />
                  Smart Scoring
                </Badge>
              </div>
            </div>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link href="/">
              <Button 
                variant={location === "/" ? "secondary" : "ghost"} 
                size="sm" 
                className="text-sm"
              >
                Dashboard
              </Button>
            </Link>
            <Link href="/scoring-system">
              <Button 
                variant={location === "/scoring-system" ? "secondary" : "ghost"} 
                size="sm" 
                className="text-sm"
              >
                <Info className="h-4 w-4 mr-1.5" />
                Scoring System
              </Button>
            </Link>
          </nav>
        </div>
        
        {/* Search Section */}
        <div className="flex-1 max-w-md mx-6 hidden md:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <Button 
              variant="outline" 
              className="w-full justify-start text-left font-normal bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80 hover:border-primary/50 transition-all duration-300 pl-10 h-10"
            >
              <span className="text-muted-foreground text-sm">Search companies, contacts...</span>
              <kbd className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 lg:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>
        </div>
        
        {/* Actions Section */}
        <div className="flex items-center space-x-3">
          {/* Live Status */}
          <div className="hidden xl:flex items-center space-x-3 text-sm text-muted-foreground bg-background/30 backdrop-blur-sm rounded-full px-3 py-1.5 border border-border/50">
            <div className="flex items-center space-x-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-success" />
              <span className="font-medium text-xs">Live Scoring</span>
            </div>
            <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button 
              onClick={handleExportToCRM}
              variant="outline" 
              size="sm" 
              className="hidden lg:flex btn-gradient text-white border-0 h-9"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export
            </Button>
            
            <Button variant="outline" size="sm" className="hidden lg:flex h-9">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Prospect
            </Button>
            
            <ThemeToggle />
            
            {/* User Avatar */}
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-primary rounded-full flex items-center justify-center ring-2 ring-primary/20 transition-all duration-300 hover:ring-primary/40 cursor-pointer">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-background animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Animated border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-pulse-glow"></div>
    </header>
  );
}
