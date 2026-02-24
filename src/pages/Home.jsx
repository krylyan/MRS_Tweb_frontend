import { Button } from "../components/ui/button.jsx";
import { Card } from "../components/ui/card.jsx";
import { ImageWithFallback } from "../components/figma/ImageWithFallback.jsx";
import { Apple, Dumbbell, TrendingUp, Target, Heart, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

/**
 * Home Page - FitLife landing page with all features
 * Matches DESIGN_SPECIFICATION.md completely
 */
export default function Home() {
  const navigate = useNavigate();

  const goToSignIn = () => {
    navigate("/signin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 md:px-12 md:py-8 border-b border-white/10">
        <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200">
          <div className="bg-gradient-to-br from-emerald-400 to-blue-500 p-2 rounded-lg">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold">FitLife</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <a href="#programs" className="text-gray-300 hover:text-white transition-colors">
            Programs
          </a>
          <a href="#features" className="text-gray-300 hover:text-white transition-colors">
            Features
          </a>
          <a href="#about" className="text-gray-300 hover:text-white transition-colors">
            About
          </a>
          <Link
            to="/signin"
            className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-medium px-6 py-2 rounded-md transition-all duration-300 border-0"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 md:px-12 py-16 md:py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-300">Transform Your Life Today</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Your Personal Health
            <br />
            & Fitness Platform
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Create customized nutrition and workout programs tailored to your goals.
            Track progress, stay motivated, and achieve results.
          </p>
        </div>
      </section>

      {/* Main Program Cards */}
      <section id="programs" className="px-6 md:px-12 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Outdoor Training Card */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-900/40 to-green-900/40 border-emerald-500/30 hover:border-emerald-400/60 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-2">
              <div className="relative h-64 overflow-hidden rounded-t-lg">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                  alt="Outdoor training"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
              </div>
              
              <div className="p-8 md:p-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-xl mb-6 group-hover:bg-emerald-500/30 transition-colors">
                  <Apple className="w-8 h-8 text-emerald-400" />
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-emerald-50">
                  Antrenament Afară
                </h2>
                
                <p className="text-gray-300 text-lg leading-relaxed mb-8">
                  Antrenamente în aer liber cu exerciții de greutate corporală, alergare și calistenie. 
                  Durabilitate, flexibilitate și conexiune cu natura. Programe adaptate pentru fitness outdoor profesional.
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-emerald-300">
                    <TrendingUp className="w-5 h-5" />
                    <span>Programe de calistenie și greutate corporală</span>
                  </div>
                  <div className="flex items-center gap-3 text-emerald-300">
                    <Target className="w-5 h-5" />
                    <span>Antrenamente de alergare și rezistență</span>
                  </div>
                  <div className="flex items-center gap-3 text-emerald-300">
                    <Heart className="w-5 h-5" />
                    <span>Alimentație pentru activități outdoor</span>
                  </div>
                </div>
                
                <Button 
                  onClick={goToSignIn}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-6 text-lg border-0 shadow-lg shadow-emerald-500/30">
                  Crează Plan Outdoor
                </Button>
              </div>
            </Card>

            {/* Gym Training Card */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-900/40 to-red-900/40 border-blue-500/30 hover:border-blue-400/60 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2">
              <div className="relative h-64 overflow-hidden rounded-t-lg">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                  alt="Gym training"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
              </div>
              
              <div className="p-8 md:p-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-xl mb-6 group-hover:bg-blue-500/30 transition-colors">
                  <Dumbbell className="w-8 h-8 text-blue-400" />
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-blue-50">
                  Antrenament la Sală
                </h2>
                
                <p className="text-gray-300 text-lg leading-relaxed mb-8">
                  Antrenamente structurate cu greutăți și echipament profesional. 
                  Dezvoltare musculară, forță și rezistență prin programe progressive. 
                  Rezultate optime cu programe personalizate la sală.
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-blue-300">
                    <TrendingUp className="w-5 h-5" />
                    <span>Programe de forță și hipertrofie</span>
                  </div>
                  <div className="flex items-center gap-3 text-blue-300">
                    <Target className="w-5 h-5" />
                    <span>Antrenamente cu progresie structurată</span>
                  </div>
                  <div className="flex items-center gap-3 text-blue-300">
                    <Zap className="w-5 h-5" />
                    <span>Alimentație pentru dezvoltare musculară</span>
                  </div>
                </div>
                
                <Button 
                  onClick={goToSignIn}
                  className="w-full bg-gradient-to-r from-blue-500 to-red-600 hover:from-blue-600 hover:to-red-700 text-white font-semibold py-6 text-lg border-0 shadow-lg shadow-blue-500/30">
                  Crează Plan Sală
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 md:px-12 py-24 bg-white/5 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-gray-300 text-xl max-w-2xl mx-auto">
              Comprehensive tools and features to support your health and fitness journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Smart Analytics</h3>
              <p className="text-gray-400 leading-relaxed">
                Track your progress with detailed analytics and insights that help you stay on course.
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 bg-orange-500/20 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Goal Setting</h3>
              <p className="text-gray-400 leading-relaxed">
                Set achievable goals and track milestones with our intelligent goal management system.
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 bg-pink-500/20 rounded-xl flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Health Monitoring</h3>
              <p className="text-gray-400 leading-relaxed">
                Monitor your overall health metrics and get personalized recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 md:px-12 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-gray-300 text-xl mb-10 max-w-2xl mx-auto">
            Join thousands who have transformed their lives with personalized nutrition and fitness programs.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 hover:from-emerald-600 hover:via-blue-600 hover:to-purple-700 text-white font-semibold px-12 py-6 text-lg border-0 rounded-md shadow-xl shadow-blue-500/30 transition-all duration-300"
          >
            Get Started Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 p-6 md:p-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 mb-4 md:mb-0 hover:opacity-80 transition-opacity duration-200">
            <div className="bg-gradient-to-br from-emerald-400 to-blue-500 p-2 rounded-lg">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">FitLife</span>
          </Link>
          
          <div className="flex items-center space-x-6 text-sm">
            <a href="#privacy" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </a>
            <div className="text-gray-400">
              © 2026 FitLife. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
