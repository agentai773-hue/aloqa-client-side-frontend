"use client";

import { useState } from "react";
import Input from "@/components/ui/input";
import { Zap, Loader, AlertCircle, Trash2, Plus } from "lucide-react";
import { useAssistants } from "@/hooks/useAssistants";
import { usePhoneNumbers } from "@/hooks/usePhoneNumbers";
import {
  useAssignAssistantPhoneMutation,
  useUnassignAssistantPhoneMutation,
  useAllAssignments,
} from "@/hooks/useAssignAssistantPhone";

interface FormData {
  projectName: string;
  assistantId: string;
  phoneId: string;
}

export default function AssignAIForm() {
  const [formData, setFormData] = useState<FormData>({
    projectName: "",
    assistantId: "",
    phoneId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch data using React Query hooks
  const {
    data: assistantsData,
    isLoading: isLoadingAssistants,
    isError: assistantsError,
  } = useAssistants();

  const {
    data: phoneNumbersData,
    isLoading: isLoadingPhoneNumbers,
    isError: phoneNumbersError,
  } = usePhoneNumbers();

  const {
    data: assignmentsData,
    isLoading: isLoadingAssignments,
  } = useAllAssignments();

  // Mutations
  const assignMutation = useAssignAssistantPhoneMutation();
  const unassignMutation = useUnassignAssistantPhoneMutation();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.projectName.trim()) {
      setError("Project name is required");
      return false;
    }
    if (!formData.assistantId) {
      setError("Please select an assistant");
      return false;
    }
    if (!formData.phoneId) {
      setError("Please select a phone number");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSuccess("");
    setError("");

    try {
      // Find the selected phone to check if it's default
      const selectedPhone = phoneNumbersData?.data?.find(
        (p: any) => p._id === formData.phoneId
      );

      // If it's default number, send the phone number instead of ID
      const phoneToSend = selectedPhone?.isDefault
        ? selectedPhone.phoneNumber
        : formData.phoneId;

      const result = await assignMutation.mutateAsync({
        assistantId: formData.assistantId,
        phoneId: phoneToSend,
        projectName: formData.projectName,
      });

      if (result.success) {
        setSuccess(`✓ AI assigned to ${formData.projectName} successfully!`);
        setFormData({
          projectName: "",
          assistantId: "",
          phoneId: "",
        });

        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to assign AI");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to assign AI. Please try again."
      );
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnassign = async (assignmentId: string) => {
    if (!confirm("Are you sure you want to remove this assignment?")) {
      return;
    }

    try {
      const result = await unassignMutation.mutateAsync(assignmentId);
      if (result.success) {
        setSuccess("✓ Assignment removed successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to remove assignment");
    }
  };

  // Group assignments by project
  const assignmentsByProject =
    assignmentsData?.data && Array.isArray(assignmentsData.data)
      ? (assignmentsData.data as any[]).reduce(
          (acc, assignment) => {
            const project = assignment.projectName;
            if (!acc[project]) acc[project] = [];
            acc[project].push(assignment);
            return acc;
          },
          {} as Record<string, any[]>
        )
      : {};

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-linear-to-br from-purple-500 to-indigo-600 rounded-full">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Assign AI</h1>
          </div>
          <p className="text-gray-600">
            Assign AI assistants and phone numbers to your projects
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assignment Form - Left Side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                New Assignment
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 text-sm">{success}</p>
                  </div>
                )}

                {/* Project Name Field */}
                <div>
                  <label
                    htmlFor="projectName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Project Name
                  </label>
                  <Input
                    id="projectName"
                    type="text"
                    name="projectName"
                    placeholder="e.g., Shilp Serene"
                    value={formData.projectName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Assistant Dropdown */}
                <div>
                  <label
                    htmlFor="assistantId"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    AI Assistant
                  </label>

                  {isLoadingAssistants && (
                    <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center gap-2 text-gray-600 text-sm">
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Loading assistants...</span>
                    </div>
                  )}

                  {assistantsError && !isLoadingAssistants && (
                    <div className="w-full px-4 py-3 border border-red-300 rounded-lg bg-red-50 flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Failed to load assistants</span>
                    </div>
                  )}

                  {!isLoadingAssistants && !assistantsError && (
                    <select
                      id="assistantId"
                      name="assistantId"
                      value={formData.assistantId}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-700"
                      disabled={isSubmitting}
                    >
                      <option value="">Choose assistant...</option>
                      {assistantsData?.data && assistantsData.data.length > 0 ? (
                        assistantsData.data.map((assistant) => (
                          <option key={assistant._id} value={assistant._id}>
                            {assistant.agentName}
                          </option>
                        ))
                      ) : (
                        <option disabled>No assistants available</option>
                      )}
                    </select>
                  )}
                </div>

                {/* Phone Number Dropdown */}
                <div>
                  <label
                    htmlFor="phoneId"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Phone Number
                  </label>

                  {isLoadingPhoneNumbers && (
                    <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center gap-2 text-gray-600 text-sm">
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Loading phone numbers...</span>
                    </div>
                  )}

                  {phoneNumbersError && !isLoadingPhoneNumbers && (
                    <div className="w-full px-4 py-3 border border-red-300 rounded-lg bg-red-50 flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Failed to load phone numbers</span>
                    </div>
                  )}

                  {!isLoadingPhoneNumbers && !phoneNumbersError && (
                    <select
                      id="phoneId"
                      name="phoneId"
                      value={formData.phoneId}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-700"
                      disabled={isSubmitting}
                    >
                      <option value="">Choose phone number...</option>
                      {phoneNumbersData?.data &&
                      Array.isArray(phoneNumbersData.data) &&
                      phoneNumbersData.data.length > 0 ? (
                        phoneNumbersData.data.map((phone: any) => (
                          <option key={phone._id} value={phone._id}>
                            {phone.phoneNumber}{" "}
                            {phone.isDefault ? "(Default)" : ""}
                          </option>
                        ))
                      ) : (
                        <option disabled>No phone numbers available</option>
                      )}
                    </select>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    isLoadingAssistants ||
                    isLoadingPhoneNumbers
                  }
                  className="w-full py-3 px-4 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 mt-7"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Assigning...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Assign Now</span>
                    </>
                  )}
                </button>
              </form>

              <p className="text-xs text-center text-gray-500 mt-6">
                Assign AI and phone to manage leads by project
              </p>
            </div>
          </div>

          {/* Assignments List - Right Side */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Your Assignments
              </h2>

              {isLoadingAssignments ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
                    <p className="text-gray-600">Loading assignments...</p>
                  </div>
                </div>
              ) : Object.keys(assignmentsByProject).length === 0 ? (
                <div className="text-center py-12">
                  <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No assignments yet</p>
                  <p className="text-gray-500 text-sm">
                    Create your first assignment using the form on the left
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(assignmentsByProject).map(
                    ([projectName, assignments]) => (
                      <div key={projectName}>
                        <h3 className="font-semibold text-gray-900 mb-3 px-4 py-2 bg-gray-100 rounded-lg">
                          {projectName}
                        </h3>
                        <div className="space-y-2 ml-2">
                          {(assignments as any[]).map((assignment) => (
                            <div
                              key={assignment._id}
                              className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium text-gray-900">
                                    {assignment.assistantId?.agentName ||
                                      "Assistant"}
                                  </p>
                                  {assignment.phoneId?.isDefault && (
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">
                                  📱{" "}
                                  {assignment.phoneId?.phoneNumber ||
                                    "Phone"}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(
                                    assignment.createdAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  handleUnassign(assignment._id)
                                }
                                disabled={unassignMutation.isPending}
                                className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                title="Remove assignment"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
