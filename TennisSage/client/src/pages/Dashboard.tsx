import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import AgentStatusDashboard from "@/components/AgentStatusDashboard";
import PredictionDashboard from "@/components/PredictionDashboard";
import LuxuryFeatures from "@/components/LuxuryFeatures";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useEffect } from "react";

export default function Dashboard() {
  const { subscribe } = useWebSocket();

  // Subscribe to real-time updates
  useEffect(() => {
    subscribe("agents:status");
    subscribe("matches:new");
    subscribe("analysis:completed");
  }, [subscribe]);

  const { data: recentPredictions, isLoading: predictionsLoading } = useQuery({
    queryKey: ["/api/predictions/recent"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: upcomingMatches, isLoading: matchesLoading } = useQuery({
    queryKey: ["/api/matches/upcoming"],
    refetchInterval: 60000, // Refresh every minute
  });

  return (
    <div className="min-h-screen bg-divine-gradient">
      <Navigation />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Agent Status Dashboard */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 fade-in">
            <h2 className="text-4xl font-bold gradient-text mb-4">
              Multi-Agent AI Oracle
            </h2>
            <p className="text-gray-300 text-lg">
              15+ Specialized agents analyzing every aspect of tennis performance
            </p>
          </div>
          <AgentStatusDashboard />
        </div>
      </section>

      {/* Main Prediction Dashboard */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <PredictionDashboard 
            recentPredictions={recentPredictions}
            upcomingMatches={upcomingMatches}
            isLoading={predictionsLoading || matchesLoading}
          />
        </div>
      </section>

      {/* Luxury Features Section */}
      <LuxuryFeatures />

      {/* Premium CTA Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-5xl font-bold mb-6">
            <span className="gradient-text">Unlock Divine Predictions</span>
          </h3>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join the elite circle of tennis prediction masters. Experience the power of AI-driven insights 
            that transcend ordinary analytics and enter the realm of divine precision.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="bg-gold-gradient text-divine-black px-12 py-4 rounded-xl font-bold text-xl hover:gold-glow transition-all transform hover:scale-105">
              <i className="fas fa-crown mr-3"></i>Start Divine Trial
            </button>
            <button className="border-2 border-divine-gold text-divine-gold px-12 py-4 rounded-xl font-bold text-xl hover:bg-divine-gold hover:text-divine-black transition-all">
              <i className="fas fa-phone mr-3"></i>Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-divine-gold/20 bg-divine-black/50 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gold-gradient rounded-full flex items-center justify-center">
                  <i className="fas fa-crown text-divine-black"></i>
                </div>
                <span className="text-xl font-bold gradient-text">Divine Tennis AI</span>
              </div>
              <p className="text-gray-400 text-sm">
                Powered by Kubera's divine wisdom, bringing luxury-level tennis predictions to the elite.
              </p>
            </div>
            <div>
              <h5 className="text-divine-gold font-bold mb-4">Platform</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="/predictions" className="hover:text-divine-gold transition-colors">Predictions</a></li>
                <li><a href="/analytics" className="hover:text-divine-gold transition-colors">Analytics</a></li>
                <li><a href="#" className="hover:text-divine-gold transition-colors">AI Agents</a></li>
                <li><a href="#" className="hover:text-divine-gold transition-colors">API Access</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-divine-gold font-bold mb-4">Support</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-divine-gold transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-divine-gold transition-colors">Tutorials</a></li>
                <li><a href="#" className="hover:text-divine-gold transition-colors">Elite Support</a></li>
                <li><a href="#" className="hover:text-divine-gold transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-divine-gold font-bold mb-4">Connect</h5>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-divine-gold transition-colors">
                  <i className="fab fa-twitter text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-divine-gold transition-colors">
                  <i className="fab fa-linkedin text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-divine-gold transition-colors">
                  <i className="fab fa-youtube text-xl"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-divine-gold/20 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 Divine Tennis AI. Blessed by Kubera's divine wisdom. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
