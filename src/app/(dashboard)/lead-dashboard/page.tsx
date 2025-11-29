"use client";

import { useState, useEffect } from "react";
import {
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { useAllSiteVisits } from "@/hooks/useSiteVisits";

interface StatCard {
  title: string;
  value: string;
  trend: string;
  trendType: "up" | "down";
  icon: React.ReactNode;
  bgColor: string;
  iconBgColor: string;
  borderColor: string;
}

export default function LeadDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [statsData, setStatsData] = useState<StatCard[]>([]);

  // Fetch leads data
  const { data: leadsData = [] } = useLeads();
  const leads = Array.isArray(leadsData) ? leadsData : [];

  // Fetch site visits data
  const { siteVisits = [] } = useAllSiteVisits();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate lead counts by status
  useEffect(() => {
    if (mounted && leads.length > 0) {
      const totalLeads = leads.length;
      const connectedLeads = leads.filter((lead) => lead.lead_type === "connected").length;
      const pendingLeads = leads.filter((lead) => lead.lead_type === "pending").length;
      const hotLeads = leads.filter((lead) => lead.lead_type === "hot").length;
      const fakeLeads = leads.filter((lead) => lead.lead_type === "fake").length;
      const coldLeads = leads.filter((lead) => lead.lead_type === "cold").length;
      const totalSiteVisits = siteVisits.length;

      const newStatsData: StatCard[] = [
        {
          title: "Total Lead",
          value: totalLeads.toString(),
          trend: "8.5% Up from yesterday",
          trendType: "up",
          icon: <Users className="w-6 h-6" />,
          bgColor: "#E5F4F5",
          iconBgColor: "#A0E5EB80",
          borderColor: "#A0E5EB",
        },
        {
          title: "Connected Leads",
          value: connectedLeads.toString(),
          trend: "1.3% Up from past week",
          trendType: "up",
          icon: <CheckCircle className="w-6 h-6" />,
          bgColor: "#FFF8E8",
          iconBgColor: "#FFEDC4CC",
          borderColor: "#FFEDC4",
        },
        {
          title: "Pending Leads",
          value: pendingLeads.toString(),
          trend: "4.3% Down from yesterday",
          trendType: "down",
          icon: <Clock className="w-6 h-6" />,
          bgColor: "#EDFFED",
          iconBgColor: "#CAF6CB80",
          borderColor: "#CAF6CB",
        },
        {
          title: "Hot Leads",
          value: hotLeads.toString(),
          trend: "1.8% Up from yesterday",
          trendType: "up",
          icon: <AlertCircle className="w-6 h-6" />,
          bgColor: "#FFF1FC",
          iconBgColor: "#FFC8F580",
          borderColor: "#FFC8F5",
        },
        {
          title: "Fake Leads",
          value: fakeLeads.toString(),
          trend: "1.8% Up from yesterday",
          trendType: "up",
          icon: <AlertCircle className="w-6 h-6" />,
          bgColor: "#FFE9E9",
          iconBgColor: "#FFC4C480",
          borderColor: "#FFC4C4",
        },
        {
          title: "Cold Leads",
          value: coldLeads.toString(),
          trend: "1.8% Up from yesterday",
          trendType: "up",
          icon: <Eye className="w-6 h-6" />,
          bgColor: "#FFF4F0",
          iconBgColor: "#FFD6C7CC",
          borderColor: "#FFD6C7",
        },
        {
          title: "Site Visit",
          value: totalSiteVisits.toString(),
          trend: "1.8% Up from yesterday",
          trendType: "up",
          icon: <Eye className="w-6 h-6" />,
          bgColor: "#F1F1FF",
          iconBgColor: "#DAD9FFCC",
          borderColor: "#DAD9FF",
        },
        {
          title: "Converted Leads",
          value: "2040",
          trend: "1.8% Up from yesterday",
          trendType: "up",
          icon: <CheckCircle className="w-6 h-6" />,
          bgColor: "#ECFFF5",
          iconBgColor: "#CAF7E0CC",
          borderColor: "#CAF7E0",
        },
      ];

      setStatsData(newStatsData);
    }
  }, [mounted, leads, siteVisits]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-linear-to-br from-[#34DB17] to-[#00AC0B] rounded-full">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#00AC0B]">Lead Dashboard</h1>
          </div>
          <p className="text-[#00AC0B] font-medium">
            Overview of all leads and their statuses
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <div
              key={index}
              className="rounded-2xl p-6 transition-all duration-300 hover:shadow-lg"
              style={{
                backgroundColor: stat.bgColor,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
              }}
            >
              {/* Header with title and icon */}
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">
                  {stat.title}
                </h3>
                <div
                  className="p-3 rounded-full"
                  style={{
                    backgroundColor: stat.iconBgColor,
                  }}
                >
                  <div className="text-gray-700">{stat.icon}</div>
                </div>
              </div>

              {/* Value */}
              <div className="mb-3">
                <p className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>

              {/* Trend */}
              <div className="flex items-center gap-2">
                {stat.trendType === "up" ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">
                      {stat.trend}
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-600">
                      {stat.trend}
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
