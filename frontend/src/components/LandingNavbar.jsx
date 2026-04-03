import { Clock, Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui";

export function LandingNavbar({ handleStart }) {
    const [isOpen, setIsOpen] = useState(false);
    const [theme, setTheme] = useState("light");

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
          localStorage.setItem("theme", newTheme);
        document.documentElement.classList.toggle("dark");
    };

    

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
            <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">

                <div className="flex items-center gap-2 cursor-pointer group">
                    <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center transition-transform duration-300 group-hover:rotate-6">
                        <Clock className="w-5 h-5 text-background" />
                    </div>
                    <span className="font-semibold text-foreground group-hover:text-accent transition">
                        Trackora
                    </span>
                </div>

                <div className="hidden md:flex items-center gap-8">
                    <a href="#hero" className="text-sm text-muted-foreground hover:text-foreground transition hover:text-blue-400">
                        Home
                    </a>
                    <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition hover:text-blue-400">
                        Features
                    </a>
                    <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition hover:text-blue-400">
                        About
                    </a>
                    <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition hover:text-blue-400">
                        Contact Us
                    </a>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <Button
                        onClick={handleStart}
                        size="sm"
                        className=" py-4 px-4 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 rounded-xl bg-blue-600 text-white hover:bg-blue-800 "
                    >
                        Login 
                    </Button>

                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-md transition-all duration-300 hover:bg-muted hover:scale-110 active:scale-95"
                    >
                        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                </div>

                <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {isOpen && (
                <div className="md:hidden px-4 py-6 space-y-4 bg-background border-t border-border shadow-xl">
                    <a href="#features" onClick={() => setIsOpen(false)} className="block text-sm text-muted-foreground">Features</a>
                    <a href="#users" onClick={() => setIsOpen(false)} className="block text-sm text-muted-foreground">Pricing</a>
                    <a href="#about" onClick={() => setIsOpen(false)} className="block text-sm text-muted-foreground">About</a>
                    <a href="#contact" onClick={() => setIsOpen(false)} className="block text-sm text-muted-foreground">Contact Us</a>

                    <div className="pt-4 border-t border-border space-y-3">
                       
                        <Button onClick={() => { handleStart(); setIsOpen(false); }} className="w-full rounded-xl bg-blue-600 text-white hover:bg-blue-800 transition-all duration-300">

                            Login
                        </Button>

                        <button onClick={toggleTheme} className="flex items-center gap-2 text-sm pt-2">
                            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                            Switch Theme
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}