import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header-simple";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Users, Building, MapPin, Mail, Phone, Globe } from "lucide-react";
import { useState, useMemo } from "react";
import type { Lead } from "@shared/schema";

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["/api/leads"],
    queryFn: async () => {
      const response = await fetch("/api/leads");
      if (!response.ok) throw new Error("Failed to fetch leads");
      return response.json();
    },
  });

  const filteredLeads = useMemo(() => {
    if (!searchTerm) return leads;
    
    return leads.filter((lead: Lead) => {
      const search = searchTerm.toLowerCase();
      return [
        lead.companyName,
        lead.contactName,
        lead.jobTitle,
        lead.industry,
        lead.location
      ].some(field => field.toLowerCase().includes(search));
    });
  }, [leads, searchTerm]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-gray-400";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Simple Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leads List */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6 text-center text-gray-500">Loading leads...</div>
                ) : filteredLeads.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No leads found</div>
                ) : (
                  <div className="divide-y">
                    {filteredLeads.map((lead: Lead) => (
                      <div
                        key={lead.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedLead?.id === lead.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                        onClick={() => setSelectedLead(lead)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{lead.companyName}</h3>
                              <div className={`w-6 h-6 ${getScoreColor(lead.score)} rounded-full flex items-center justify-center`}>
                                <span className="text-white text-xs font-bold">{Math.round(lead.score/10)}</span>
                              </div>
                            </div>
                            <p className="text-gray-600 text-sm mb-1">{lead.contactName} • {lead.jobTitle}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Building className="w-3 h-3 mr-1" />
                                {lead.companySize}
                              </span>
                              <span className="flex items-center">
                                <Users className="w-3 h-3 mr-1" />
                                {lead.industry}
                              </span>
                              <span className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {lead.location}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">{lead.score}</div>
                            <div className="text-xs text-gray-500">score</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Lead Details */}
          <div className="lg:col-span-1">
            {selectedLead ? (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedLead.companyName}</h2>
                      <p className="text-gray-600">{selectedLead.contactName}</p>
                      <p className="text-gray-500 text-sm">{selectedLead.jobTitle}</p>
                    </div>

                    <div className="space-y-3">
                      {selectedLead.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{selectedLead.email}</span>
                        </div>
                      )}
                      
                      {selectedLead.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{selectedLead.phone}</span>
                        </div>
                      )}
                      
                      {selectedLead.website && (
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{selectedLead.website}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Company Size:</span>
                        <span className="text-sm font-medium">{selectedLead.companySize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Industry:</span>
                        <span className="text-sm font-medium">{selectedLead.industry}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Location:</span>
                        <span className="text-sm font-medium">{selectedLead.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Score:</span>
                        <span className="text-sm font-bold">{selectedLead.score}/100</span>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Badge 
                        variant={selectedLead.score >= 80 ? "default" : selectedLead.score >= 60 ? "secondary" : "outline"}
                        className="w-full justify-center py-2"
                      >
                        {selectedLead.score >= 80 ? "Hot Lead" : selectedLead.score >= 60 ? "Warm Lead" : "Cold Lead"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a lead to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}