import React from "react";
import {
  Clock,
  Grid3X3,
  FolderKanban,
  Users,
  BarChart3,
  Globe,
} from "lucide-react";

const featuresList = [
  {
    icon: Clock,
    title: "Effortless Time Tracking",
    description:
      "Track work instantly with a real-time timer or manual entry—no more spreadsheets.",
  },
  {
    icon: Grid3X3,
    title: "Smart Weekly Timesheets",
    description:
      "Manage weekly logs with an intuitive grid built for speed and accuracy.",
  },
  {
    icon: FolderKanban,
    title: "Project-Based Tracking",
    description:
      "Organize tasks by projects and track exactly where your time goes.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Collaborate with your team, assign tasks, and monitor productivity easily.",
  },
  {
    icon: BarChart3,
    title: "Reports & Insights",
    description:
      "Analyze time usage and performance with detailed visual reports.",
  },
  {
    icon: Globe,
    title: "Access Anywhere",
    description:
      "Use it on any device, anytime. Your data stays synced and secure.",
  },
];

export function Features() {
  return (
    <section 
      id="features" 
      className="py-5 px-4 m-0 sm:px-6 bg-muted/30"
      aria-labelledby="features-heading" 
    >
      <div className="max-w-6xl mx-auto text-center mb-20">
        <h2 
          id="features-heading" 
          className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 leading-tight"
        >
          Everything you need to
          <br />
          <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
            manage time efficiently
          </span>
        </h2>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Powerful tools designed to simplify your workflow, improve productivity,
          and help your team stay focused on what truly matters.
        </p>
      </div>

     
      <ul className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuresList.map((feature) => {
          const Icon = feature.icon;

          return (
            <li 
              key={feature.title}
              className="group relative bg-card/80 backdrop-blur-xl p-6 rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-2"
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-br from-blue-500/10 to-cyan-400/10 blur-xl" 
                aria-hidden="true" 
              />

              <div 
                className="relative z-10 w-12 h-12 flex items-center justify-center rounded-xl bg-muted mb-4 group-hover:bg-accent/20 transition"
                aria-hidden="true" 
              >
                <Icon className="w-6 h-6 text-foreground group-hover:text-accent transition" />
              </div>

         
              <h3 className="relative z-10 text-lg font-semibold mb-2">
                {feature.title}
              </h3>

              <p className="relative z-10 text-sm text-muted-foreground">
                {feature.description}
              </p>

              <div 
                className="absolute bottom-0 left-0 w-0 h-[2px] bg-accent transition-all duration-300 group-hover:w-full" 
                aria-hidden="true" 
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default Features;
