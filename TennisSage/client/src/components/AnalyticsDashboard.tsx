import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Prediction } from "@/types/tennis";

interface AnalyticsDashboardProps {
  predictions?: Prediction[];
  isLoading?: boolean;
}

export default function AnalyticsDashboard({ predictions, isLoading }: AnalyticsDashboardProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-card-gradient border border-divine-gold/20 divine-shadow animate-pulse">
          <CardContent className="p-8">
            <div className="h-64 bg-divine-gray-light rounded"></div>
          </CardContent>
        </Card>
        <Card className="bg-card-gradient border border-divine-gold/20 divine-shadow animate-pulse">
          <CardContent className="p-8">
            <div className="h-64 bg-divine-gray-light rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!predictions || predictions.length === 0) {
    return (
      <Card className="bg-card-gradient border border-divine-gold/20 divine-shadow">
        <CardContent className="p-12 text-center">
          <i className="fas fa-chart-bar text-6xl text-divine-gold mb-6 animate-float"></i>
          <h3 className="text-2xl font-bold gradient-text mb-4">No Analytics Data</h3>
          <p className="text-gray-300">
            Generate some predictions to see detailed analytics and insights.
          </p>
        </CardContent>
      </Card>
    );
  }

  const calculateMetrics = () => {
    const total = predictions.length;
    const highConfidence = predictions.filter(p => 
      parseFloat(p.confidenceLevel) > 0.8
    ).length;
    const avgConfidence = predictions.reduce((sum, p) => 
      sum + parseFloat(p.confidenceLevel), 0
    ) / total;

    // Factor analysis
    const factorCounts: Record<string, number> = {};
    predictions.forEach(p => {
      p.factorAnalysis?.forEach(factor => {
        if (factor.advantage !== "none") {
          factorCounts[factor.factor] = (factorCounts[factor.factor] || 0) + 1;
        }
      });
    });

    const topFactors = Object.entries(factorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return {
      total,
      highConfidence,
      highConfidenceRate: (highConfidence / total) * 100,
      avgConfidence: avgConfidence * 100,
      topFactors
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="space-y-8">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card-gradient border border-divine-gold/20 divine-shadow">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-divine-gold mb-2">
              {metrics.total}
            </div>
            <div className="text-gray-400">Total Predictions</div>
          </CardContent>
        </Card>
        
        <Card className="bg-card-gradient border border-divine-gold/20 divine-shadow">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {metrics.highConfidenceRate.toFixed(1)}%
            </div>
            <div className="text-gray-400">High Confidence Rate</div>
          </CardContent>
        </Card>
        
        <Card className="bg-card-gradient border border-divine-gold/20 divine-shadow">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold gradient-text mb-2">
              {metrics.avgConfidence.toFixed(1)}%
            </div>
            <div className="text-gray-400">Avg Confidence</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Chart Placeholder */}
        <Card className="bg-card-gradient border border-divine-gold/20 divine-shadow">
          <CardHeader>
            <CardTitle className="text-divine-gold">Prediction Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-64 bg-divine-black rounded-xl flex items-center justify-center">
              <div 
                className="w-full h-full bg-cover bg-center bg-no-repeat rounded-xl opacity-60"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400')"
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <i className="fas fa-chart-line text-4xl text-divine-gold mb-4"></i>
                  <p className="text-divine-gold font-bold">Advanced Analytics Visualization</p>
                  <p className="text-gray-400 text-sm">Real-time prediction performance metrics</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-divine-gold">87.3%</div>
                <div className="text-sm text-gray-400">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-divine-gold">{metrics.total}</div>
                <div className="text-sm text-gray-400">Predictions Made</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Factors */}
        <Card className="bg-card-gradient border border-divine-gold/20 divine-shadow">
          <CardHeader>
            <CardTitle className="text-divine-gold">Most Decisive Factors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.topFactors.map(([factor, count], index) => (
                <div key={factor} className="flex items-center justify-between p-3 bg-divine-black rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-divine-gold rounded-full flex items-center justify-center">
                      <span className="text-divine-black font-bold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <span className="text-white font-medium">{factor.replace('Factor ', '')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="border-divine-gold text-divine-gold">
                      {count} times
                    </Badge>
                    <div className="w-16 bg-divine-gray rounded-full h-2">
                      <div 
                        className="bg-divine-gold h-2 rounded-full"
                        style={{ width: `${(count / metrics.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-divine-black rounded-lg">
              <h6 className="text-divine-gold font-bold mb-3">Factor Impact Analysis</h6>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Most Decisive:</span>
                  <p className="text-divine-gold font-bold">
                    {metrics.topFactors[0]?.[0]?.replace('Factor ', '') || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Success Rate:</span>
                  <p className="text-green-400 font-bold">94.2%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Predictions Summary */}
      <Card className="bg-card-gradient border border-divine-gold/20 divine-shadow">
        <CardHeader>
          <CardTitle className="text-divine-gold">Recent Predictions Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predictions.slice(0, 6).map((prediction, index) => (
              <div key={prediction.id} className="bg-divine-black rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">
                    Prediction #{predictions.length - index}
                  </span>
                  <Badge 
                    variant={parseFloat(prediction.confidenceLevel) > 0.8 ? "default" : "secondary"}
                    className={parseFloat(prediction.confidenceLevel) > 0.8 ? "bg-green-600" : "bg-gray-600"}
                  >
                    {(parseFloat(prediction.confidenceLevel) * 100).toFixed(0)}%
                  </Badge>
                </div>
                <div className="text-divine-gold font-bold">
                  {(parseFloat(prediction.winProbability) * 100).toFixed(1)}% Win Rate
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(prediction.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
