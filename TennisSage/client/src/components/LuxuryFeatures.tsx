export default function LuxuryFeatures() {
  const features = [
    {
      icon: "fas fa-crown",
      title: "Royal Predictions",
      description: "Access to exclusive insights reserved for tennis royalty. Premium predictions with 95%+ accuracy rates.",
      image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
    },
    {
      icon: "fas fa-magic",
      title: "Divine Interface",
      description: "Handcrafted golden interface inspired by Kubera's divine wealth. Every detail designed for luxury.",
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
    },
    {
      icon: "fas fa-chart-line",
      title: "Elite Analytics",
      description: "Multi-dimensional analysis covering every aspect of professional tennis. From grass to clay, every surface mastered.",
      image: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="bg-card-gradient rounded-3xl border border-divine-gold/30 divine-shadow p-12">
        <div className="text-center mb-12 fade-in">
          <h3 className="text-4xl font-bold gradient-text mb-4">Divine Wealth Features</h3>
          <p className="text-gray-300 text-lg">Experience tennis prediction at the highest level of luxury</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="text-center p-6 bg-divine-black rounded-2xl border border-divine-gold/20 hover:gold-glow transition-all transform hover:scale-105 slide-in-right"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="relative mb-6">
                <div 
                  className="w-20 h-20 mx-auto rounded-full object-cover border-2 border-divine-gold"
                  style={{
                    backgroundImage: `url(${feature.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-divine-gold rounded-full flex items-center justify-center">
                  <i className={`${feature.icon} text-divine-black text-lg`}></i>
                </div>
              </div>
              <h4 className="text-xl font-bold text-divine-gold mb-3">{feature.title}</h4>
              <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Additional luxury elements */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-divine-black rounded-2xl p-6 border border-divine-gold/20">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-divine-gold rounded-full flex items-center justify-center">
                <i className="fas fa-shield-alt text-divine-black text-xl"></i>
              </div>
              <div>
                <h5 className="text-xl font-bold text-divine-gold">Divine Guarantee</h5>
                <p className="text-gray-400 text-sm">Kubera's blessing on every prediction</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Our AI oracle is blessed with divine wisdom, ensuring that each prediction carries the weight of celestial knowledge and the precision of divine mathematics.
            </p>
          </div>

          <div className="bg-divine-black rounded-2xl p-6 border border-divine-gold/20">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-divine-gold rounded-full flex items-center justify-center">
                <i className="fas fa-infinity text-divine-black text-xl"></i>
              </div>
              <div>
                <h5 className="text-xl font-bold text-divine-gold">Eternal Wisdom</h5>
                <p className="text-gray-400 text-sm">Ever-evolving intelligence</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Our multi-agent system continuously learns and evolves, drawing from the infinite well of tennis knowledge to provide ever more accurate predictions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
