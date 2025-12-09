import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Users, 
  Clock, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Pause,
  Play,
  Square,
  RefreshCw,
  Volume2,
  VolumeX
} from 'lucide-react';
import { 
  useCallStatus, 
  useMultipleCallStatus, 
  useCampaignDetails,
  useStopCall,
  usePauseCampaign,
  useResumeCampaign 
} from '@/hooks/useCalls';
import { CallStatusBadge } from './CallStatusBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui';

interface RealTimeCallMonitorProps {
  campaignId?: string;
  activeCalls?: string[]; // execution IDs of active calls
  onCallComplete?: (callId: string) => void;
}

interface LiveCallData {
  executionId: string;
  leadName: string;
  leadPhone: string;
  status: string;
  duration: number;
  agentId?: string;
  progress?: string;
}

export const RealTimeCallMonitor: React.FC<RealTimeCallMonitorProps> = ({
  campaignId,
  activeCalls = [],
  onCallComplete
}) => {
  const [liveView, setLiveView] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedCall, setSelectedCall] = useState<string>('');

  // Campaign monitoring
  const { 
    data: campaignData, 
    isLoading: campaignLoading 
  } = useCampaignDetails(campaignId || null);

  // Multiple call status monitoring
  const { 
    data: multiCallStatus, 
    isLoading: callsLoading 
  } = useMultipleCallStatus(activeCalls, true);

  // Individual call monitoring for selected call
  const { 
    data: selectedCallData 
  } = useCallStatus(selectedCall, { 
    enabled: !!selectedCall,
    refetchInterval: 3000 
  });

  // Mutations
  const stopCall = useStopCall();
  const pauseCampaign = usePauseCampaign();
  const resumeCampaign = useResumeCampaign();

  // Live metrics state
  const [metrics, setMetrics] = useState({
    activeCalls: 0,
    completedCalls: 0,
    failedCalls: 0,
    interestedLeads: 0,
    averageDuration: 0,
    successRate: 0
  });

  useEffect(() => {
    if (multiCallStatus) {
      const activeCount = multiCallStatus.filter(
        call => call.status?.data?.status === 'in_progress'
      ).length;
      
      const completedCount = multiCallStatus.filter(
        call => call.status?.data?.status === 'completed'
      ).length;
      
      const failedCount = multiCallStatus.filter(
        call => call.status?.data?.status === 'failed'
      ).length;

      setMetrics(prev => ({
        ...prev,
        activeCalls: activeCount,
        completedCalls: completedCount,
        failedCalls: failedCount
      }));
    }
  }, [multiCallStatus]);

  // Notification sound for call completion
  useEffect(() => {
    if (soundEnabled && multiCallStatus) {
      const justCompleted = multiCallStatus.some(call => 
        call.status?.data?.status === 'completed' && 
        call.status?.data?.interested
      );
      
      if (justCompleted) {
        // Play notification sound
        const audio = new Audio('/notification.wav');
        audio.play().catch(() => {/* Ignore audio play errors */});
        
        // Call completion callback
        multiCallStatus.forEach(call => {
          if (call.status?.data?.status === 'completed') {
            onCallComplete?.(call.executionId);
          }
        });
      }
    }
  }, [multiCallStatus, soundEnabled, onCallComplete]);

  const handleStopCall = async (executionId: string) => {
    try {
      await stopCall.mutateAsync(executionId);
    } catch (error) {
      console.error('Failed to stop call:', error);
    }
  };

  const handlePauseCampaign = async () => {
    if (campaignId) {
      try {
        await pauseCampaign.mutateAsync(campaignId);
      } catch (error) {
        console.error('Failed to pause campaign:', error);
      }
    }
  };

  const handleResumeCampaign = async () => {
    if (campaignId) {
      try {
        await resumeCampaign.mutateAsync(campaignId);
      } catch (error) {
        console.error('Failed to resume campaign:', error);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (campaignLoading && !campaignData) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading campaign data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Live Call Monitor</h2>
          {campaignData?.data?.campaign && (
            <p className="text-gray-600">
              Campaign: {campaignData.data.campaign.campaignName}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="gap-2"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
            Sound
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLiveView(!liveView)}
            className="gap-2"
          >
            {liveView ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {liveView ? 'Pause' : 'Resume'} Live View
          </Button>
          
          {campaignId && campaignData?.data?.campaign?.status === 'running' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePauseCampaign}
              className="gap-2 text-orange-600"
              disabled={pauseCampaign.isPending}
            >
              {pauseCampaign.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Pause className="w-4 h-4" />
              )}
              Pause Campaign
            </Button>
          )}
          
          {campaignId && campaignData?.data?.campaign?.status === 'paused' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResumeCampaign}
              className="gap-2 text-green-600"
              disabled={resumeCampaign.isPending}
            >
              {resumeCampaign.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Resume Campaign
            </Button>
          )}
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="shrink-0">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Calls</p>
              <p className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                {metrics.activeCalls}
                {liveView && (
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="shrink-0">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {metrics.completedCalls}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="shrink-0">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Failed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {metrics.failedCalls}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="shrink-0">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Interested</p>
              <p className="text-2xl font-semibold text-gray-900">
                {metrics.interestedLeads}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Call Grid */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Live Calls</h3>
          <div className="flex items-center gap-2">
            {liveView && (
              <span className="inline-flex items-center gap-1 text-sm text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live
              </span>
            )}
            <span className="text-sm text-gray-500">
              Updates every 3 seconds
            </span>
          </div>
        </div>

        {callsLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
            <span className="ml-2 text-gray-600">Loading call status...</span>
          </div>
        ) : !multiCallStatus || multiCallStatus.length === 0 ? (
          <div className="text-center py-8">
            <Phone className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No active calls</h3>
            <p className="mt-1 text-sm text-gray-500">
              Calls will appear here when campaign starts
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {multiCallStatus.map((call) => (
              <div 
                key={call.executionId} 
                className={`p-6 hover:bg-gray-50 cursor-pointer ${
                  selectedCall === call.executionId ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => setSelectedCall(call.executionId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="shrink-0">
                      <div className={`w-3 h-3 rounded-full ${
                        call.status?.data?.status === 'in_progress' 
                          ? 'bg-green-500 animate-pulse' 
                          : call.status?.data?.status === 'completed'
                          ? 'bg-blue-500'
                          : 'bg-red-500'
                      }`} />
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {call.status?.data?.lead?.full_name || 'Loading...'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {call.status?.data?.lead?.contact_number || call.executionId}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <CallStatusBadge 
                        status={call.status?.data?.status || 'unknown'} 
                      />
                      {call.status?.data?.duration && (
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDuration(call.status.data.duration)}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Call</p>
                      <p className="text-sm font-medium">
                        {call.executionId.slice(0, 8)}...
                      </p>
                    </div>
                    
                    {call.status?.data?.status === 'in_progress' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStopCall(call.executionId);
                        }}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        disabled={stopCall.isPending}
                      >
                        {stopCall.isPending ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Square className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Call Progress */}
                {call.status?.data?.status === 'in_progress' && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Call Progress</span>
                      <span>{call.status.data.duration || 0}s</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((call.status.data.duration || 0) / 300 * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Interest Level */}
                {call.status?.data?.interested && (
                  <div className="mt-3">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Interested
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Call Details */}
      {selectedCall && selectedCallData?.data && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Call Details - {selectedCallData.data.lead?.full_name}
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Call Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <CallStatusBadge status={selectedCallData.data.status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span>{selectedCallData.data.duration ? formatDuration(selectedCallData.data.duration) : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Call ID:</span>
                  <span>{selectedCallData.data.executionId.slice(0, 12)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Started:</span>
                  <span>{new Date(selectedCallData.data.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Lead Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span>{selectedCallData.data.lead?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span>{selectedCallData.data.lead?.contact_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lead ID:</span>
                  <span>{selectedCallData.data.lead?._id}</span>
                </div>
                {selectedCallData.data.interested && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-green-600 font-medium">Interested</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Recording Controls */}
          {selectedCallData.data.recording && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Call Recording</h4>
              <audio 
                controls 
                className="w-full"
                src={selectedCallData.data.recording}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};