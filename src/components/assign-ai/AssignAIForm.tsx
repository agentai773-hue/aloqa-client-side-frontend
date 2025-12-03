"use client";

import { useState } from "react";
import Input from "@/components/ui/input";
import { Zap, Loader, AlertCircle, Trash2, Plus, CheckCircle } from "lucide-react";
import { useAssistants } from "@/hooks/useAssistants";
import { usePhoneNumbers } from "@/hooks/usePhoneNumbers";
import { useProjects } from "@/hooks/useProjects";
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
        data: projectsData,
        isLoading: isLoadingProjects,
        isError: projectsError,
    } = useProjects();

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
        <div className="min-h-screen bg-gray-50 p-4 py-8">
            <div className="max-w-6xl mx-auto">


                <div className="grid grid-cols-1 gap-6">
                    {/* Assignment Form - Full Width */}
                    <div>
                        <div className="bg-white rounded-2xl shadow p-8">
                            {/* Form Header with Green Background */}
                            {/* <div className="flex items-center gap-3 p-4 bg-linear-to-r from-[#EDFFED] to-[#ECFFF5] rounded-xl border border-[#CAF6CB] mb-8 -mx-8 -mt-8 px-8 py-4">
                <div className="p-2 bg-[#34DB17] rounded-full">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-[#00AC0B]">
                  Assign AI
                </h2>
              </div> */}

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

                                {/* Form Fields - 3 Column Grid */}
                                <div className="bg-white rounded-2xl  p-8">

                                    {/* ✅ ASSIGN AI HEADER BOX */}
                                    <div className="flex items-center gap-3 p-6 bg-linear-to-r from-[#EDFFED] to-[#ECFFF5] rounded-2xl border border-[#CAF6CB] mb-8">
                                        <div className="p-3 bg-[#34DB17] rounded-full">
                                            <Zap className="w-6 h-6 text-white" />
                                        </div>
                                        <h1 className="text-2xl font-bold text-[#00AC0B]">Assign AI</h1>
                                    </div>

                                    {/* ✅ FORM FIELDS GRID */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                        {/* Project Name */}
                                        <div>
                                            <label
                                                htmlFor="projectName"
                                                className="block text-sm font-medium text-gray-700 mb-2"
                                            >
                                                Project Name <span className="text-red-500">*</span>
                                            </label>

                                            {isLoadingProjects && (
                                                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center gap-2 text-gray-600 text-sm">
                                                    <Loader className="w-4 h-4 animate-spin" />
                                                    <span>Loading...</span>
                                                </div>
                                            )}

                                            {projectsError && !isLoadingProjects && (
                                                <div className="w-full px-4 py-3 border border-red-300 rounded-lg bg-red-50 flex items-center gap-2 text-red-600 text-sm">
                                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                                    <span>Failed to load</span>
                                                </div>
                                            )}

                                            {!isLoadingProjects && !projectsError && (
                                                <select
                                                    id="projectName"
                                                    name="projectName"
                                                    value={formData.projectName}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-[#34DB17] 
                     focus:border-transparent bg-white text-gray-700"
                                                    disabled={isSubmitting}
                                                >
                                                    <option value="">Choose Project</option>
                                                    {projectsData && projectsData.length > 0 ? (
                                                        projectsData.map((project: string) => (
                                                            <option key={project} value={project}>
                                                                {project}
                                                            </option>
                                                        ))
                                                    ) : (
                                                        <option disabled>No projects available</option>
                                                    )}
                                                </select>
                                            )}
                                        </div>

                                        {/* AI Assistant */}
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
                                                    <span>Loading...</span>
                                                </div>
                                            )}

                                            {assistantsError && !isLoadingAssistants && (
                                                <div className="w-full px-4 py-3 border border-red-300 rounded-lg bg-red-50 flex items-center gap-2 text-red-600 text-sm">
                                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                                    <span>Failed to load</span>
                                                </div>
                                            )}

                                            {!isLoadingAssistants && !assistantsError && (
                                                <select
                                                    id="assistantId"
                                                    name="assistantId"
                                                    value={formData.assistantId}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-[#34DB17] 
                     focus:border-transparent bg-white text-gray-700"
                                                    disabled={isSubmitting}
                                                >
                                                    <option value="">Choose Assistant</option>
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

                                        {/* Phone Number */}
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
                                                    <span>Loading...</span>
                                                </div>
                                            )}

                                            {phoneNumbersError && !isLoadingPhoneNumbers && (
                                                <div className="w-full px-4 py-3 border border-red-300 rounded-lg bg-red-50 flex items-center gap-2 text-red-600 text-sm">
                                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                                    <span>Failed to load</span>
                                                </div>
                                            )}

                                            {!isLoadingPhoneNumbers && !phoneNumbersError && (
                                                <select
                                                    id="phoneId"
                                                    name="phoneId"
                                                    value={formData.phoneId}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-[#34DB17] 
                     focus:border-transparent bg-white text-gray-700"
                                                    disabled={isSubmitting}
                                                >
                                                    <option value="">Choose phone number</option>
                                                    {phoneNumbersData?.data &&
                                                        Array.isArray(phoneNumbersData.data) &&
                                                        phoneNumbersData.data.length > 0 ? (
                                                        phoneNumbersData.data.map((phone: any) => (
                                                            <option key={phone._id} value={phone._id}>
                                                                {phone.phoneNumber} {phone.isDefault ? "(Default)" : ""}
                                                            </option>
                                                        ))
                                                    ) : (
                                                        <option disabled>No phone numbers available</option>
                                                    )}
                                                </select>
                                            )}
                                        </div>
                                    </div>

                                </div>


                                {/* Cancel and Submit Buttons */}
                                <div className="grid grid-cols-2 gap-4 mt-8">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFormData({
                                                projectName: "",
                                                assistantId: "",
                                                phoneId: "",
                                            })
                                        }
                                        className="py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-all duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={
                                            isSubmitting ||
                                            isLoadingAssistants ||
                                            isLoadingPhoneNumbers ||
                                            isLoadingProjects
                                        }
                                        className="py-3 px-4 bg-[#34DB17] hover:bg-[#2FC812] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
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
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Assignments List - Full Width */}
                    <div>
                        <div className="bg-white rounded-2xl shadow p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-[#34DB17] rounded-full">
                                    <CheckCircle className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-lg font-bold text-[#00AC0B]">
                                    Your Assignments
                                </h2>
                            </div>

                            {isLoadingAssignments ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-center">
                                        <Loader className="w-8 h-8 animate-spin text-[#34DB17] mx-auto mb-3" />
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
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                                    Assistant Name
                                                </th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                                    Project
                                                </th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                                    Phone Number
                                                </th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                                    Date
                                                </th>
                                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(assignmentsByProject).map(
                                                ([projectName, assignments]) =>
                                                    (assignments as any[]).map((assignment) => (
                                                        <tr
                                                            key={assignment._id}
                                                            className="border-b border-gray-100 hover:bg-gray-50 transition"
                                                        >
                                                            <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                                                                {assignment.assistantId?.agentName ||
                                                                    "Assistant"}
                                                            </td>
                                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                                {projectName}
                                                            </td>
                                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                                {assignment.phoneId?.phoneNumber || "N/A"}
                                                            </td>
                                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                                {new Date(
                                                                    assignment.createdAt
                                                                ).toLocaleDateString()}
                                                            </td>
                                                            <td className="py-3 px-4 text-center">
                                                                <button
                                                                    onClick={() =>
                                                                        handleUnassign(assignment._id)
                                                                    }
                                                                    disabled={
                                                                        unassignMutation.isPending
                                                                    }
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 inline-block"
                                                                    title="Remove assignment"
                                                                >
                                                                    <Trash2 className="w-5 h-5" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
