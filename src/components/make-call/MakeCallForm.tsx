"use client";

import { useState } from "react";
import Input from "@/components/ui/input";
import { Phone, Loader, AlertCircle } from "lucide-react";
import { useAssistants } from "@/hooks/useAssistants";
import { useInitiateCustomCall } from "@/hooks/useInitiateCall";

interface FormData {
  name: string;
  projectName: string;
  mobileNumber: string;
  assistantId: string;
}

export default function MakeCallForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    projectName: "",
    mobileNumber: "",
    assistantId: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch assistants using React Query
  const { data: assistantsData, isLoading: isLoadingAssistants, isError: assistantsError } = useAssistants();
  
  // Mutation for initiating custom call
  const callMutation = useInitiateCustomCall();

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
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!formData.projectName.trim()) {
      setError("Project name is required");
      return false;
    }
    if (!formData.mobileNumber.trim()) {
      setError("Mobile number is required");
      return false;
    }
    if (!/^\d{10,15}$/.test(formData.mobileNumber.replace(/\D/g, ""))) {
      setError("Please enter a valid mobile number");
      return false;
    }
    if (!formData.assistantId) {
      setError("Please select an assistant");
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

    setSuccess("");
    setError("");

    try {
      const result = await callMutation.mutateAsync({
        customerName: formData.name,
        projectName: formData.projectName,
        recipientPhoneNumber: formData.mobileNumber,
        assistantId: formData.assistantId,
      });

      if (result.success) {
        setSuccess(`Call initiated successfully! Calling ${result.data?.customer_name}`);
        setFormData({
          name: "",
          projectName: "",
          mobileNumber: "",
          assistantId: "",
        });
        // Success message 3 seconds baad remove hoga
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to initiate call. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 py-8">
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .form-card {
          animation: slideInUp 0.6s ease-out forwards;
        }
        
        .input-focus:focus {
          border-color: #34DB17;
          box-shadow: 0 0 0 3px rgba(52, 219, 23, 0.1);
        }
        
        .submit-btn-hover:hover:not(:disabled) {
          background: linear-gradient(135deg, #34DB17 0%, #306B25 100%);
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(52, 219, 23, 0.3);
        }
      `}</style>
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="form-card bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-br from-[#34DB17] to-[#306B25] rounded-full shadow-lg transform hover:scale-110 transition-transform duration-300">
                <Phone className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#34DB17] to-[#306B25] bg-clip-text text-transparent">Make a Call</h1>
            <p className="text-gray-600 text-sm mt-2">
              Connect with your leads using AI assistants
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fadeIn">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-4 bg-green-50 border border-[#34DB17] rounded-xl flex items-start gap-3 animate-fadeIn">
                <div className="w-5 h-5 bg-gradient-to-br from-[#34DB17] to-[#306B25] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 mt-0.5">✓</div>
                <p className="text-green-700 text-sm font-medium">{success}</p>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Customer Name
              </label>
              <Input
                id="name"
                type="text"
                name="name"
                placeholder="Enter customer name"
                value={formData.name}
                onChange={handleChange}
                className="input-focus w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34DB17]/50 focus:border-[#34DB17] transition-all duration-300"
                disabled={callMutation.isPending}
              />
            </div>

            {/* Project Name Field */}
            <div>
              <label htmlFor="projectName" className="block text-sm font-semibold text-gray-700 mb-2">
                Project Name
              </label>
              <Input
                id="projectName"
                type="text"
                name="projectName"
                placeholder="Enter project name"
                value={formData.projectName}
                onChange={handleChange}
                className="input-focus w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34DB17]/50 focus:border-[#34DB17] transition-all duration-300"
                disabled={callMutation.isPending}
              />
            </div>

            {/* Mobile Number Field */}
            <div>
              <label htmlFor="mobileNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile Number
              </label>
              <Input
                id="mobileNumber"
                type="tel"
                name="mobileNumber"
                placeholder="Enter mobile number (10-15 digits)"
                value={formData.mobileNumber}
                onChange={handleChange}
                className="input-focus w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34DB17]/50 focus:border-[#34DB17] transition-all duration-300"
                disabled={callMutation.isPending}
              />
            </div>

            {/* Assistant Dropdown */}
            <div>
              <label htmlFor="assistantId" className="block text-sm font-semibold text-gray-700 mb-2">
                Select AI Assistant
              </label>
              
              {/* Loading state */}
              {isLoadingAssistants && (
                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center gap-2 text-gray-600 text-sm font-medium">
                  <Loader className="w-4 h-4 animate-spin text-[#34DB17]" />
                  <span>Loading assistants...</span>
                </div>
              )}

              {/* Error state */}
              {assistantsError && !isLoadingAssistants && (
                <div className="w-full px-4 py-3 border border-red-300 rounded-lg bg-red-50 flex items-center gap-2 text-red-600 text-sm font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Failed to load assistants</span>
                </div>
              )}

              {/* Success state - dropdown */}
              {!isLoadingAssistants && !assistantsError && (
                <select
                  id="assistantId"
                  name="assistantId"
                  value={formData.assistantId}
                  onChange={handleChange}
                  className="input-focus w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34DB17]/50 focus:border-[#34DB17] bg-white text-gray-700 font-medium transition-all duration-300"
                  disabled={callMutation.isPending}
                >
                  <option value="">Choose an assistant...</option>
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={callMutation.isPending || isLoadingAssistants}
              className="submit-btn-hover w-full py-3 px-4 bg-gradient-to-r from-[#34DB17] to-[#306B25] hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 mt-7"
            >
              {callMutation.isPending ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Initiating Call...</span>
                </>
              ) : (
                <>
                  <Phone className="w-5 h-5" />
                  <span>Make Call</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Text */}
          <p className="text-xs sm:text-sm text-center text-gray-600 mt-6 leading-relaxed">
            💬 The call will be initiated with the selected AI assistant
          </p>
        </div>
      </div>
    </div>
  );
}
