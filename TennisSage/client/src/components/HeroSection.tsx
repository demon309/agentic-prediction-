import { Link } from "wouter";

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden">
      {/* Tennis court background with divine lighting */}
      <div className="absolute inset-0 bg-gradient-to-br from-divine-black via-divine-gray to-divine-gray-light">
        <div 
          className="w-full h-full opacity-30 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-divine-black/80 via-transparent to-divine-black/40" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="text-center fade-in">
          <h2 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text animate-glow">Divine Predictions</span><br />
            <span className="text-white">Powered by AI Oracle</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto slide-in-right">
            Harness the power of 15+ specialized AI agents working in harmony to predict tennis match outcomes 
            with divine precision. Experience wealth-level insights that transcend ordinary analytics.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 scale-in">
            <Link href="/predictions">
              <button className="bg-gold-gradient text-divine-black px-8 py-4 rounded-xl font-bold text-lg hover:gold-glow transition-all transform hover:scale-105">
                <i className="fas fa-magic mr-2"></i>Start Prediction
              </button>
            </Link>
            <button className="border-2 border-divine-gold text-divine-gold px-8 py-4 rounded-xl font-bold text-lg hover:bg-divine-gold hover:text-divine-black transition-all">
              <i className="fas fa-play mr-2"></i>Watch Demo
            </button>
          </div>
        </div>
      </div>
      
      {/* Floating elements for luxury feel */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-divine-gold rounded-full animate-float opacity-60"></div>
      <div className="absolute top-40 right-20 w-3 h-3 bg-divine-gold rounded-full animate-float opacity-40" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-20 left-1/4 w-1 h-1 bg-divine-gold rounded-full animate-float opacity-80" style={{ animationDelay: '2s' }}></div>
    </div>
  );
}
