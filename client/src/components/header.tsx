import { Button } from "@/components/ui/button";
import { Rocket, Download, User } from "lucide-react";
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
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Rocket className="text-primary text-2xl" />
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">Saasquatch Leads</span>
            </div>
            <span className="px-2 py-1 bg-secondary/10 text-secondary text-xs font-medium rounded-full">
              AI Enhanced
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              onClick={handleExportToCRM}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export to CRM</span>
            </Button>
            <ThemeToggle />
            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
