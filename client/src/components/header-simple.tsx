import { Brain, BarChart3, Target, Globe } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export function Header() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: Brain },
    { path: "/scoring-analytics", label: "Analytics", icon: BarChart3 },
    { path: "/scoring-system", label: "Scoring", icon: Target },
  ];

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Lead Scorer</h1>
              <p className="text-sm text-gray-500">AI-powered lead qualification</p>
            </div>
          </div>
          
          <nav className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
