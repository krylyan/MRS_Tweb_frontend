import { Apple, Dumbbell, Heart, Target, TrendingUp, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import AuthUtils from "../utils/authUtils";

export default function Home() {
  const navigate = useNavigate();

  const goToFaq = (): void => {
    navigate("/faq");
  };

  const handleLogout = (): void => {
    AuthUtils.logout();
    navigate("/signin", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <nav className="flex items-center justify-between border-b border-white/10 p-6 md:px-12 md:py-8">
        <Link to="/home" className="flex items-center space-x-3 transition-opacity duration-200 hover:opacity-80">
          <div className="rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 p-2">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold">FitLife</span>
        </Link>

        <div className="hidden items-center space-x-8 md:flex">
          <a href="#programs" className="text-gray-300 transition-colors hover:text-white">
            Programs
          </a>
          <a href="#features" className="text-gray-300 transition-colors hover:text-white">
            Features
          </a>
          <a href="#about" className="text-gray-300 transition-colors hover:text-white">
            About
          </a>
          <Link to="/faq" className="text-gray-300 transition-colors hover:text-white">
            FAQ
          </Link>
          <Link to="/profile" className="text-gray-300 transition-colors hover:text-white">
            Profile
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-[rgba(248,113,113,0.35)] bg-[rgba(220,38,38,0.45)] px-6 py-2 font-medium text-white transition-all duration-300"
          >
            Log out
          </button>
        </div>
      </nav>

      <section className="px-6 py-16 text-center md:px-12 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-gray-300">Transform Your Life Today</span>
          </div>

          <h1 className="mb-6 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-5xl font-bold text-transparent md:text-7xl">
            Your Personal Health
            <br />
            & Fitness Platform
          </h1>

          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-300 md:text-2xl">
            Create customized nutrition and workout programs tailored to your goals. Track progress,
            stay motivated, and achieve results.
          </p>
        </div>
      </section>

      <section id="programs" className="px-6 pb-24 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
            <Card className="group relative overflow-hidden border border-emerald-500/30 bg-gradient-to-br from-emerald-900/40 to-green-900/40 transition-all duration-300 hover:-translate-y-2 hover:border-emerald-400/60 hover:shadow-2xl hover:shadow-emerald-500/20">
              <div className="relative h-64 overflow-hidden rounded-t-lg">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                  alt="Outdoor training"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
              </div>

              <div className="p-8 md:p-10">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-500/20 transition-colors group-hover:bg-emerald-500/30">
                  <Apple className="h-8 w-8 text-emerald-400" />
                </div>

                <h2 className="mb-4 text-3xl font-bold text-emerald-50 md:text-4xl">Antrenament Afara</h2>

                <p className="mb-8 text-lg leading-relaxed text-gray-300">
                  Antrenamente in aer liber cu exercitii de greutate corporala, alergare si calistenie.
                  Durabilitate, flexibilitate si conexiune cu natura.
                </p>

                <div className="mb-8 space-y-3">
                  <div className="flex items-center gap-3 text-emerald-300">
                    <TrendingUp className="h-5 w-5" />
                    <span>Programe de calistenie si greutate corporala</span>
                  </div>
                  <div className="flex items-center gap-3 text-emerald-300">
                    <Target className="h-5 w-5" />
                    <span>Antrenamente de alergare si rezistenta</span>
                  </div>
                  <div className="flex items-center gap-3 text-emerald-300">
                    <Heart className="h-5 w-5" />
                    <span>Alimentatie pentru activitati outdoor</span>
                  </div>
                </div>

                <Button
                  onClick={goToFaq}
                  className="w-full border-0 bg-gradient-to-r from-emerald-500 to-green-600 py-6 text-lg font-semibold text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-green-700"
                >
                  Creaza Plan Outdoor
                </Button>
              </div>
            </Card>

            <Card className="group relative overflow-hidden border border-blue-500/30 bg-gradient-to-br from-blue-900/40 to-red-900/40 transition-all duration-300 hover:-translate-y-2 hover:border-blue-400/60 hover:shadow-2xl hover:shadow-blue-500/20">
              <div className="relative h-64 overflow-hidden rounded-t-lg">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                  alt="Gym training"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
              </div>

              <div className="p-8 md:p-10">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-blue-500/20 transition-colors group-hover:bg-blue-500/30">
                  <Dumbbell className="h-8 w-8 text-blue-400" />
                </div>

                <h2 className="mb-4 text-3xl font-bold text-blue-50 md:text-4xl">Antrenament la Sala</h2>

                <p className="mb-8 text-lg leading-relaxed text-gray-300">
                  Antrenamente structurate cu greutati si echipament profesional. Dezvoltare musculara,
                  forta si rezistenta prin programe progresive.
                </p>

                <div className="mb-8 space-y-3">
                  <div className="flex items-center gap-3 text-blue-300">
                    <TrendingUp className="h-5 w-5" />
                    <span>Programe de forta si hipertrofie</span>
                  </div>
                  <div className="flex items-center gap-3 text-blue-300">
                    <Target className="h-5 w-5" />
                    <span>Antrenamente cu progresie structurata</span>
                  </div>
                  <div className="flex items-center gap-3 text-blue-300">
                    <Zap className="h-5 w-5" />
                    <span>Alimentatie pentru dezvoltare musculara</span>
                  </div>
                </div>

                <Button
                  onClick={goToFaq}
                  className="w-full border-0 bg-gradient-to-r from-blue-500 to-red-600 py-6 text-lg font-semibold text-white shadow-lg shadow-blue-500/30 hover:from-blue-600 hover:to-red-700"
                >
                  Creaza Plan Sala
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section id="features" className="bg-white/5 px-6 py-24 backdrop-blur-sm md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">Everything You Need to Succeed</h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-300">
              Comprehensive tools and features to support your health and fitness journey
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 transition-colors hover:bg-white/10">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-purple-500/20">
                <TrendingUp className="h-7 w-7 text-purple-400" />
              </div>
              <h3 className="mb-3 text-2xl font-bold">Smart Analytics</h3>
              <p className="leading-relaxed text-gray-400">
                Track your progress with detailed analytics and insights that help you stay on course.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 transition-colors hover:bg-white/10">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-orange-500/20">
                <Target className="h-7 w-7 text-orange-400" />
              </div>
              <h3 className="mb-3 text-2xl font-bold">Goal Setting</h3>
              <p className="leading-relaxed text-gray-400">
                Set achievable goals and track milestones with our intelligent goal management system.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 transition-colors hover:bg-white/10">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-pink-500/20">
                <Heart className="h-7 w-7 text-pink-400" />
              </div>
              <h3 className="mb-3 text-2xl font-bold">Health Monitoring</h3>
              <p className="leading-relaxed text-gray-400">
                Monitor your overall health metrics and get personalized recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 md:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-4xl font-bold md:text-5xl">Ready to Start Your Journey?</h2>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-gray-300">
            Join thousands who have transformed their lives with personalized nutrition and fitness
            programs.
          </p>
          <Link
            to="/signup"
            className="inline-block rounded-md border-0 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 px-12 py-6 text-lg font-semibold text-white shadow-xl shadow-blue-500/30 transition-all duration-300 hover:from-emerald-600 hover:via-blue-600 hover:to-purple-700"
          >
            Get Started Today
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 p-6 md:p-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between md:flex-row">
          <Link
            to="/home"
            className="mb-4 flex items-center space-x-3 transition-opacity duration-200 hover:opacity-80 md:mb-0"
          >
            <div className="rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 p-2">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">FitLife</span>
          </Link>

          <div className="flex items-center space-x-6 text-sm">
            <a href="#privacy" className="text-gray-400 transition-colors hover:text-white">
              Privacy Policy
            </a>
            <a href="#terms" className="text-gray-400 transition-colors hover:text-white">
              Terms of Service
            </a>
            <Link to="/faq" className="text-gray-400 transition-colors hover:text-white">
              FAQ
            </Link>
            <div className="text-gray-400">Â© 2026 FitLife. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

