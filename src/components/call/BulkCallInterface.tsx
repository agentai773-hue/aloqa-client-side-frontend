import React, { useState } from 'react';
import { 
  Users, 
  Upload, 
  Play, 
  AlertCircle, 
  CheckCircle, 
  X,
  Phone,
  FileText
} from 'lucide-react';

interface BulkCallInterfaceProps {
  selectedProject?: string;
  onClose?: () => void;
  preSelectedLeads?: string[];
}

interface CampaignConfig {
  name: string;
  script: string;
  language: 'hindi' | 'hinglish' | 'english';
  maxConcurrentCalls: number;
  retryAttempts: number;
  callInterval: number;
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

const mockLeads: Lead[] = [
  { id: '1', name: 'रमेश शर्मा', phone: '+91 9876543210', email: 'ramesh@example.com' },
  { id: '2', name: 'Priya Singh', phone: '+91 8765432109', email: 'priya@example.com' },
  { id: '3', name: 'अजय कुमार', phone: '+91 7654321098', email: 'ajay@example.com' },
  { id: '4', name: 'Neha Gupta', phone: '+91 6543210987', email: 'neha@example.com' },
];

export const BulkCallInterface: React.FC<BulkCallInterfaceProps> = ({
  selectedProject,
  onClose,
  preSelectedLeads = []
}) => {
  const [step, setStep] = useState(1);
  const [selectedLeads, setSelectedLeads] = useState<Lead[]>([]);
  const [config, setConfig] = useState<CampaignConfig>({
    name: '',
    script: '',
    language: 'hinglish',
    maxConcurrentCalls: 5,
    retryAttempts: 3,
    callInterval: 30
  });
  const [uploading, setUploading] = useState(false);
  const [campaignStarted, setCampaignStarted] = useState(false);

  const handleConfigChange = (key: keyof CampaignConfig, value: string | number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleLeadSelection = (lead: Lead, selected: boolean) => {
    if (selected) {
      setSelectedLeads(prev => [...prev, lead]);
    } else {
      setSelectedLeads(prev => prev.filter(l => l.id !== lead.id));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    // Simulate file upload
    setTimeout(() => {
      setSelectedLeads(mockLeads);
      setUploading(false);
      setStep(2);
    }, 1500);
  };

  const startCampaign = () => {
    if (!config.name || selectedLeads.length === 0) return;
    
    setCampaignStarted(true);
    // Simulate campaign start
    console.log('Starting campaign:', config, selectedLeads);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">Select Leads</h3>
              <p className="text-gray-600">Choose leads या upload CSV file</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Manual Selection */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Manual Selection</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {mockLeads.map((lead) => (
                    <label key={lead.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={selectedLeads.some(l => l.id === lead.id)}
                        onChange={(e) => handleLeadSelection(lead, e.target.checked)}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                        <div className="text-sm text-gray-500">{lead.phone}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* CSV Upload */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">CSV Upload</h4>
                <div className="text-center">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-4">
                      Upload CSV with leads data
                    </p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="csv-upload"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="csv-upload"
                      className={`cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 ${
                        uploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {uploading ? 'Uploading...' : 'Choose File'}
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    CSV format: name, phone, email
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={selectedLeads.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next ({selectedLeads.length} leads)
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">Campaign Configuration</h3>
              <p className="text-gray-600">Set up your calling campaign</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) => handleConfigChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Real Estate Campaign Dec 2025"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={config.language}
                    onChange={(e) => handleConfigChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="hindi">Hindi</option>
                    <option value="hinglish">Hinglish</option>
                    <option value="english">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Concurrent Calls
                  </label>
                  <select
                    value={config.maxConcurrentCalls}
                    onChange={(e) => handleConfigChange('maxConcurrentCalls', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value={1}>1</option>
                    <option value={3}>3</option>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Call Script
                </label>
                <textarea
                  value={config.script}
                  onChange={(e) => handleConfigChange('script', e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="नमस्ते! मैं [Agent Name] हूँ और मैं real estate के बारे में बात करना चाहता हूँ..."
                />
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-2">Selected Leads ({selectedLeads.length})</h4>
              <div className="max-h-32 overflow-y-auto">
                {selectedLeads.slice(0, 5).map((lead) => (
                  <div key={lead.id} className="flex items-center gap-3 py-1">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{lead.name} - {lead.phone}</span>
                  </div>
                ))}
                {selectedLeads.length > 5 && (
                  <div className="text-sm text-gray-500">+{selectedLeads.length - 5} more leads</div>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={startCampaign}
                disabled={!config.name || selectedLeads.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Start Campaign
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (campaignStarted) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Campaign Started!</h3>
        <p className="text-gray-600 mb-6">
          Your bulk calling campaign "{config.name}" has been initiated with {selectedLeads.length} leads.
        </p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
              step >= 1 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
            }`}>
              1
            </div>
            <span className="text-sm font-medium">Select Leads</span>
          </div>
          <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
              step >= 2 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
            }`}>
              2
            </div>
            <span className="text-sm font-medium">Configure</span>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {renderStepContent()}
      </div>
    </div>
  );
};