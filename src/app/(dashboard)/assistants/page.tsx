"use client";

import { useState } from "react";
import { Loader, AlertCircle, Bot, Users, Briefcase } from "lucide-react";
import { useAssistants } from "@/hooks/useAssistants";
import { useLeads } from "@/hooks/useLeads";
import { useAllAssignments } from "@/hooks/useAssignAssistantPhone";

interface AssistantWithLeads {
  _id: string;
  agentName: string;
  agentType?: string;
  projects: string[];
  leads: Array<{
    _id: string;
    full_name: string;
    contact_number: string;
    project_name: string | null;
    lead_type: string;
    call_status: string;
  }>;
  totalLeads: number;
}

export default function AssistantsPage() {
  const [selectedAssistant, setSelectedAssistant] = useState<string | null>(null);

  // Fetch assistants
  const { data: assistantsData, isLoading: isLoadingAssistants } =
    useAssistants();

  // Fetch leads
  const { data: leadsData, isLoading: isLoadingLeads } = useLeads();

  // Fetch assignments (assistant -> project mapping)
  const { data: assignmentsData, isLoading: isLoadingAssignments } =
    useAllAssignments();

  // Process data to combine assistants with their projects and leads
  const getAssistantsWithLeads = (): AssistantWithLeads[] => {
    if (!assistantsData?.data) return [];

    return assistantsData.data.map((assistant) => {
      // Get projects assigned to this assistant
      let assignedProjects: string[] = [];
      
      if (assignmentsData?.data && Array.isArray(assignmentsData.data)) {
        const assignments = assignmentsData.data as any[];
        assignedProjects = assignments
          .filter((a) => {
            // Handle both direct assistantId string and assistantId object with _id
            const assignmentAssistantId = typeof a.assistantId === 'string' 
              ? a.assistantId 
              : a.assistantId?._id;
            return assignmentAssistantId === assistant._id;
          })
          .map((a) => a.projectName)
          .filter((p, i, arr) => arr.indexOf(p) === i); // Remove duplicates
      }

      // Get leads from projects assigned to this assistant
      // Filter leads based on matching project_name with assigned projects
      const leadsForAssistant = Array.isArray(leadsData)
        ? leadsData.filter((lead: any) => {
            if (!lead.project_name) return false; // Skip leads without project_name
            return assignedProjects.some((project) =>
              lead.project_name.toLowerCase().trim() === project.toLowerCase().trim()
            );
          })
        : [];

      return {
        _id: assistant._id,
        agentName: assistant.agentName,
        agentType: assistant.agentType,
        projects: assignedProjects,
        leads: leadsForAssistant,
        totalLeads: leadsForAssistant.length,
      };
    });
  };

  const assistantsWithLeads = getAssistantsWithLeads();
  const isLoading =
    isLoadingAssistants || isLoadingLeads || isLoadingAssignments;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading assistants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-linear-to-br from-blue-500 to-purple-600 rounded-full">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">AI Assistants</h1>
          </div>
          <p className="text-gray-600">
            View all assistants, their assigned projects, and linked leads
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Assistants List - Left Side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow p-6 sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Assistants
              </h2>

              {assistantsWithLeads.length === 0 ? (
                <div className="text-center py-8">
                  <Bot className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">
                    No assistants available
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {assistantsWithLeads.map((assistant) => (
                    <button
                      key={assistant._id}
                      onClick={() => setSelectedAssistant(assistant._id)}
                      className={`w-full text-left p-3 rounded-lg transition ${
                        selectedAssistant === assistant._id
                          ? "bg-purple-100 border border-purple-300"
                          : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <p className="font-medium text-gray-900 text-sm">
                        {assistant.agentName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Users className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {assistant.totalLeads} leads
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Assistant Details - Right Side */}
          <div className="lg:col-span-3">
            {!selectedAssistant ? (
              <div className="bg-white rounded-2xl shadow p-12 text-center">
                <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Select an assistant to view details
                </p>
              </div>
            ) : (
              (() => {
                const selected = assistantsWithLeads.find(
                  (a) => a._id === selectedAssistant
                );
                if (!selected) return null;

                return (
                  <div className="space-y-6">
                    {/* Assistant Overview Card */}
                    <div className="bg-white rounded-2xl shadow p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            {selected.agentName}
                          </h2>
                          {selected.agentType && (
                            <p className="text-sm text-gray-500 mt-1">
                              Type: {selected.agentType}
                            </p>
                          )}
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                          <Bot className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {/* Total Leads */}
                        <div className="bg-linear-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                          <p className="text-gray-600 text-sm font-medium">
                            Total Leads
                          </p>
                          <p className="text-3xl font-bold text-blue-600 mt-2">
                            {selected.totalLeads}
                          </p>
                        </div>

                        {/* Assigned Projects */}
                        <div className="bg-linear-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                          <p className="text-gray-600 text-sm font-medium">
                            Projects
                          </p>
                          <p className="text-3xl font-bold text-purple-600 mt-2">
                            {selected.projects.length}
                          </p>
                        </div>

                        {/* Active Leads */}
                        <div className="bg-linear-to-br from-green-50 to-green-100 p-4 rounded-lg">
                          <p className="text-gray-600 text-sm font-medium">
                            Hot Leads
                          </p>
                          <p className="text-3xl font-bold text-green-600 mt-2">
                            {
                              selected.leads.filter(
                                (l) => l.lead_type === "hot"
                              ).length
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Projects Section */}
                    {selected.projects.length > 0 && (
                      <div className="bg-white rounded-2xl shadow p-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Briefcase className="w-5 h-5" />
                          Assigned Projects
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selected.projects.map((project) => {
                            const projectLeads = selected.leads.filter(
                              (l) => l.project_name?.toLowerCase().trim() === project.toLowerCase().trim()
                            );
                            return (
                              <div
                                key={project}
                                className="px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg"
                              >
                                <p className="text-sm font-medium text-purple-900">
                                  {project}
                                </p>
                                <p className="text-xs text-purple-600 mt-1">
                                  {projectLeads.length} leads
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Leads List */}
                    <div className="bg-white rounded-2xl shadow p-8">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Linked Leads ({selected.leads.length})
                      </h3>

                      {selected.leads.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500">
                            No leads assigned to this assistant yet
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                  Name
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                  Phone
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                  Project
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                  Type
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {selected.leads.map((lead) => (
                                <tr
                                  key={lead._id}
                                  className="border-b border-gray-100 hover:bg-gray-50"
                                >
                                  <td className="py-3 px-4 text-sm text-gray-900">
                                    {lead.full_name}
                                  </td>
                                  <td className="py-3 px-4 text-sm text-gray-600">
                                    {lead.contact_number}
                                  </td>
                                  <td className="py-3 px-4 text-sm">
                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                                      {lead.project_name}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-sm">
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-medium ${
                                        lead.lead_type === "hot"
                                          ? "bg-red-50 text-red-700"
                                          : lead.lead_type === "cold"
                                          ? "bg-blue-50 text-blue-700"
                                          : "bg-gray-50 text-gray-700"
                                      }`}
                                    >
                                      {lead.lead_type}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-sm">
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-medium ${
                                        lead.call_status === "connected"
                                          ? "bg-green-50 text-green-700"
                                          : lead.call_status === "pending"
                                          ? "bg-yellow-50 text-yellow-700"
                                          : "bg-gray-50 text-gray-700"
                                      }`}
                                    >
                                      {lead.call_status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
