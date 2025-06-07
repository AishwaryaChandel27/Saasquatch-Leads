import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, Search, Sparkles, Target, TrendingUp, Download, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const { toast } = useToast();

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
      <div className="container flex h-20 max-w-screen-2xl items-center px-4 sm:px-6 lg:px-8">
        <div className="mr-6 flex items-center">
          <a className="flex items-center space-x-3 group" href="/">
            <div className="relative animate-float">
              <div className="absolute inset-0 bg-gradient-primary rounded-full blur-md opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-primary p-3 rounded-full">
                <Brain className="h-7 w-7 text-white" />
                <Zap className="absolute -top-1 -right-1 h-4 w-4 text-yellow-300 animate-pulse-glow" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-2xl gradient-text">
                Saasquatch Leads
              </span>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="text-xs bg-gradient-primary text-white px-2 py-1">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI-Powered
                </Badge>
                <Badge variant="outline" className="text-xs px-2 py-1 hidden sm:flex">
                  <Target className="h-3 w-3 mr-1" />
                  Smart Scoring
                </Badge>
              </div>
            </div>
          </a>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <Button 
                variant="outline" 
                className="w-full justify-start text-left font-normal bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80 hover:border-primary/50 transition-all duration-300 pl-10 h-12"
              >
                <span className="text-muted-foreground">Search companies, contacts...</span>
                <kbd className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-[11px] font-medium opacity-100 sm:flex">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-4 text-sm text-muted-foreground bg-background/30 backdrop-blur-sm rounded-full px-4 py-2 border border-border/50">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="font-medium">Live Scoring</span>
              </div>
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                onClick={handleExportToCRM}
                variant="outline" 
                size="sm" 
                className="hidden md:flex btn-gradient text-white border-0"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              <Button variant="outline" size="sm" className="hidden md:flex">
                <Sparkles className="h-4 w-4 mr-2" />
                Prospect
              </Button>
              
              <ThemeToggle />
              
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center ring-2 ring-primary/20 transition-all duration-300 hover:ring-primary/40 cursor-pointer">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Animated border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-pulse-glow"></div>
    </header>
  );
}
