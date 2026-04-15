import { useNavigate } from "react-router-dom";
import { Features } from "./Features";
import { LandingNavbar } from "./LandingNavbar";
import {
  Zap,
  Shield,
  Globe,
} from "lucide-react";
import { Footer } from "./Footer";
import { Button } from "../ui/Button";

const STATS_DATA = [
  { label: "Hours", value: "32.5h" },
  { label: "Projects", value: "8" },
  { label: "Team", value: "12" },
  { label: "Tasks", value: "47" },
];

export function LandingPage() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar handleStart={handleStart} />

      <main id="main-content" className="pt-16">
        
        <section
          id="hero"
          className="relative pt-24 pb-24 px-6 text-center overflow-hidden"
          aria-labelledby="hero-title"
        >
          <div className="absolute inset-0 -z-10 flex justify-center" aria-hidden="true">
            <div className="w-[600px] h-[600px] bg-gradient-to-r from-blue-500/20 to-cyan-400/20 blur-[120px] rounded-full" />
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted text-sm text-muted-foreground mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
              Built for modern teams
            </div>

            <h1 id="hero-title" className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6">
              Track time.
              <br />
              <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                Work smarter.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              A simple yet powerful timesheet platform to manage projects, track
              productivity, and help your team focus on what really matters.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Button
                size="lg"
                onClick={handleStart}
                className="px-8 gap-2 transition-all duration-300 rounded-xl bg-blue-600 text-white hover:scale-105 
                           hover:bg-blue-800 hover:shadow-lg hover:shadow-blue-500/20"
              >
                Login
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="pt-8 pb-20 px-6 bg-muted/30">
          <Features />
        </section>

        <section className="relative px-4 sm:px-6 pb-20 overflow-hidden" aria-label="Quick Statistics">
          <div className="absolute inset-0 -z-10 flex justify-center" aria-hidden="true">
            <div className="w-[500px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full" />
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 overflow-hidden">
              {/* Decorative Window Controls */}
              <div className="bg-muted/40 px-4 py-3 border-b flex items-center gap-2" aria-hidden="true">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>

              <div className="p-5 sm:p-6 md:p-10">
                {/* A11Y: Grid content marked as list for better structure */}
                <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                  {STATS_DATA.map((stat) => (
                    <div
                      key={stat.label}
                      className="group relative p-5 rounded-xl border bg-background/70 backdrop-blur-md transition-all duration-300 hover:scale-[1.04] hover:shadow-lg hover:border-accent"
                    >
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-blue-500/10 to-cyan-400/10 blur-xl" aria-hidden="true" />
                      <dt className="text-xs sm:text-sm text-muted-foreground mb-1 relative z-10">
                        {stat.label}
                      </dt>
                      <dd className="text-lg sm:text-xl md:text-2xl font-bold text-foreground relative z-10 group-hover:text-accent transition">
                        {stat.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section
          id="about"
          className="py-24 px-6 bg-muted/30 dark:bg-background"
          aria-labelledby="about-title"
        >
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center md:justify-center relative">
              {/* PERFORMANCE & A11Y: Added loading="lazy", width/height, and descriptive alt */}
              <img
                src="https://i.pinimg.com/1200x/54/c8/77/54c87715239a0ecae5c76df51b22b6d1.jpg"
                alt="Professional workspace showing the Trackora ethos of productivity"
                loading="lazy"
                width="448"
                height="550"
                className="h-[550px] w-full max-w-md object-cover rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-105"
              />
              <div className="absolute -z-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-cyan-300/20 rounded-full blur-3xl top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2" aria-hidden="true" />
            </div>

            <div className="text-center md:text-left">
              <div className="inline-block px-4 py-1 rounded-full bg-accent/10 text-accent font-semibold mb-4">
                About Us
              </div>
              <h2 id="about-title" className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-snug">
                Trackora — The smarter way to track time and productivity
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg mb-6">
                At Trackora, we believe that managing your time should be
                effortless, intuitive, and insightful.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3">
                  <span className="text-accent text-2xl" aria-hidden="true">🚀</span>
                  <p className="text-sm text-muted-foreground">
                    Boost productivity with real-time tracking
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-accent text-2xl" aria-hidden="true">🔒</span>
                  <p className="text-sm text-muted-foreground">
                    Enterprise-grade security for your data
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}