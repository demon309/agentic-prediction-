import { Link, useLocation } from "wouter";

export default function Navigation() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="border-b border-divine-gold/20 backdrop-blur-sm bg-divine-black/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gold-gradient rounded-full flex items-center justify-center animate-float">
              <i className="fas fa-crown text-divine-black text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Divine Tennis AI</h1>
              <p className="text-xs text-divine-gold/80">Powered by Kubera's Oracle</p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link 
              href="/analytics" 
              className={`flex items-center space-x-2 transition-colors hover:text-divine-gold-light ${
                isActive('/analytics') ? 'text-divine-gold' : 'text-divine-gold/70'
              }`}
            >
              <i className="fas fa-chart-line"></i>
              <span>Analytics</span>
            </Link>
            
            <Link 
              href="/predictions" 
              className={`flex items-center space-x-2 transition-colors hover:text-divine-gold-light ${
                isActive('/predictions') ? 'text-divine-gold' : 'text-divine-gold/70'
              }`}
            >
              <i className="fas fa-brain"></i>
              <span>AI Predictions</span>
            </Link>
            
            <Link 
              href="/" 
              className={`flex items-center space-x-2 transition-colors hover:text-divine-gold-light ${
                isActive('/') ? 'text-divine-gold' : 'text-divine-gold/70'
              }`}
            >
              <i className="fas fa-trophy"></i>
              <span>Dashboard</span>
            </Link>
            
            <button className="bg-gold-gradient text-divine-black px-4 py-2 rounded-lg hover:gold-glow transition-all transform hover:scale-105 font-bold">
              <i className="fas fa-user mr-2"></i>
              Account
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
