import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgentStatus } from "@/types/tennis";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useEffect, useState } from "react";

export default function AgentStatusDashboard() {
  const [realtimeAgentStatus, setRealtimeAgentStatus] = useState<AgentStatus[] | null>(null);
  const { lastMessage, subscribe } = useWebSocket();

  const { data: agentStatus, isLoading } = useQuery({
    queryKey: ["/api/agents/status"],
    refetchInterval: 5000,
  });

  useEffect(() => {
    subscribe("agents:status");
  }, [subscribe]);

  useEffect(() => {
    if (lastMessage?.channel === "agents:status" && lastMessage.data) {
      setRealtimeAgentStatus(lastMessage.data);
    }
  }, [lastMessage]);

  const displayAgentStatus = realtimeAgentStatus || agentStatus;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-400";
      case "processing": return "bg-blue-400";
      case "idle": return "bg-gray-400";
      case "error": return "bg-red-400";
      default: return "bg-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Active";
      case "processing": return "Processing";
      case "idle": return "Idle";
      case "error": return "Error";
      default: return "Unknown";
    }
  };

  const agentGroups = [
    {
      title: "Recent Performance",
      type: "recent_performance",
      icon: "fas fa-chart-line",
      description: "Form, momentum, and clutch performance analysis"
    },
    {
      title: "Surface Analysis",
      type: "surface_environment",
      icon: "fas fa-globe",
      description: "Court conditions and environmental factors"
    },
    {
      title: "Statistical Engine",
      type: "statistical",
      icon: "fas fa-calculator",
      description: "Service, return, and rally pattern analysis"
    },
    {
      title: "H2H Oracle",
      type: "matchup",
      icon: "fas fa-users",
      description: "Head-to-head and tactical matchup analysis"
    },
    {
      title: "News Sentinel",
      type: "contextual",
      icon: "fas fa-newspaper",
      description: "Injury and news monitoring"
    },
    {
      title: "Physical Condition",
      type: "physical_condition",
      icon: "fas fa-heartbeat",
      description: "Workload, recovery, and endurance analysis"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agentGroups.map((group, index) => (
          <Card key={index} className="bg-card-gradient border border-divine-gold/20 divine-shadow animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-divine-gray-light rounded mb-4"></div>
              <div className="h-4 bg-divine-gray-light rounded mb-2"></div>
              <div className="h-4 bg-divine-gray-light rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {agentGroups.map((group, index) => {
        const groupAgents = displayAgentStatus?.filter((agent: AgentStatus) => 
          agent.type === group.type
        ) || [];

        const activeAgents = groupAgents.filter(agent => agent.status === "active").length;
        const avgAccuracy = groupAgents.length > 0 
          ? groupAgents.reduce((sum, agent) => sum + agent.accuracy, 0) / groupAgents.length 
          : 0;

        return (
          <Card 
            key={index} 
            className="bg-card-gradient border border-divine-gold/20 divine-shadow hover:gold-glow transition-all fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold text-divine-gold">{group.title}</h4>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    activeAgents > 0 ? 'bg-green-400' : 'bg-gray-400'
                  } animate-pulse-gold`}></div>
                  <Badge 
                    variant={activeAgents > 0 ? "default" : "secondary"} 
                    className={activeAgents > 0 ? "bg-green-600" : "bg-gray-600"}
                  >
                    {activeAgents > 0 ? "Active" : "Idle"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {groupAgents.slice(0, 3).map((agent, agentIndex) => (
                  <div key={agentIndex} className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">{agent.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`}></div>
                      <span className="text-divine-gold font-bold text-sm">
                        {agent.accuracy.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-divine-black rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">
                      {groupAgents.length} agents active
                    </div>
                    <div className="text-sm text-divine-gold font-bold">
                      Avg Accuracy: {avgAccuracy.toFixed(1)}%
                    </div>
                  </div>
                  <i className={`${group.icon} text-2xl text-divine-gold/60`}></i>
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-3">{group.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
