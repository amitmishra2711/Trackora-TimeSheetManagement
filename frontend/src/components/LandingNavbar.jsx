import { Clock, Menu, Moon, Sun, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../ui/Button";

export function LandingNavbar({ handleStart }) {
  const [isOpen, setIsOpen] = useState(false);
  // Initialize theme based on localStorage or system preference for better performance
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "light";
    }
    return "light";
  });

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark");
  };

  // Close mobile menu when resizing to desktop to prevent hidden layout issues
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border"
      aria-label="Main Navigation"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        
        {/* Logo - Changed to a button for keyboard accessibility */}
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
          aria-label="Trackora Home"
        >
          <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center transition-transform duration-300 group-hover:rotate-6">
            <Clock className="w-5 h-5 text-background" aria-hidden="true" />
          </div>
          <span className="font-semibold text-foreground group-hover:text-accent transition">
            Trackora
          </span>
        </button>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8" role="list">
          <a href="#hero" className="text-sm text-muted-foreground hover:text-foreground transition hover:text-blue-400 focus:outline-none focus:text-blue-400">
            Home
          </a>
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition hover:text-blue-400 focus:outline-none focus:text-blue-400">
            Features
          </a>
          <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition hover:text-blue-400 focus:outline-none focus:text-blue-400">
            About
          </a>
          <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition hover:text-blue-400 focus:outline-none focus:text-blue-400">
            Contact Us
          </a>
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            onClick={handleStart}
            size="sm"
            className="py-4 px-4 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 rounded-xl bg-blue-600 text-white hover:bg-blue-800"
          >
            Login
          </Button>

          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="p-2 rounded-md transition-all duration-300 hover:bg-muted hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {theme === "dark" ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md" 
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={isOpen ? "Close main menu" : "Open main menu"}
        >
          {isOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div 
          id="mobile-menu"
          className="md:hidden px-4 py-6 space-y-4 bg-background border-t border-border shadow-xl animate-in slide-in-from-top duration-200"
        >
          <a href="#features" onClick={() => setIsOpen(false)} className="block text-sm text-muted-foreground hover:text-blue-400">Features</a>
          <a href="#users" onClick={() => setIsOpen(false)} className="block text-sm text-muted-foreground hover:text-blue-400">Pricing</a>
          <a href="#about" onClick={() => setIsOpen(false)} className="block text-sm text-muted-foreground hover:text-blue-400">About</a>
          <a href="#contact" onClick={() => setIsOpen(false)} className="block text-sm text-muted-foreground hover:text-blue-400">Contact Us</a>

          <div className="pt-4 border-t border-border space-y-3">
            <Button 
              onClick={() => { handleStart(); setIsOpen(false); }} 
              className="w-full rounded-xl bg-blue-600 text-white hover:bg-blue-800 transition-all duration-300"
            >
              Login
            </Button>

            <button 
              onClick={toggleTheme} 
              className="flex items-center gap-2 text-sm pt-2 w-full text-muted-foreground hover:text-foreground focus:outline-none"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
