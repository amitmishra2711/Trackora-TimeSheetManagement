import { useState } from "react";
import {
    Instagram,
    Linkedin,
    Twitter,
    Mail,
    ArrowRight,
} from "lucide-react";

export function Footer() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        number: "",
        reason: "",
        message: "",
    });

    const [errors, setErrors] = useState({});

    const validate = () => {
        let err = {};
        if (!/^[A-Za-z ]+$/.test(form.name)) err.name = "Only alphabets allowed";
        if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.com$/.test(form.email)) err.email = "Lowercase email ending with .com";
        if (!/^[0-9]{10}$/.test(form.number)) err.number = "Enter valid 10 digit number";
        if (!form.reason) err.reason = "Select a reason";
        if (form.message.length < 10) err.message = "Minimum 10 characters required";
        setErrors(err);
        return Object.keys(err).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            alert("Submitted ✅");
            setForm({
                name: "",
                email: "",
                number: "",
                reason: "",
                message: "",
            });
        }
    };

    const inputStyles = "w-full p-3 rounded-xl border border-border bg-background text-foreground " +
        "placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-accent/50 " +
        "focus:border-accent outline-none transition-all dark:bg-muted/20 dark:text-white";

    return (
        <footer id="contact" className="border-t bg-muted/30 py-16 px-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -z-10 translate-x-1/2 -translate-y-1/2">
                <div className="w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full" />
            </div>

            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 relative z-10">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold">Trackora</h2>
                        <p className="text-muted-foreground text-sm mt-2">
                            Smart time tracking for modern teams 🚀
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 text-sm">
                        <a href="#hero" className="hover:text-accent transition  hover:text-blue-600">Home</a>

                        <a href="#features" className="hover:text-accent transition hover:text-blue-600">Features</a>
                        <a href="#about" className="hover:text-accent transition  hover:text-blue-600">About</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <a href="#" className="p-2 rounded-lg bg-background border border-border hover:bg-accent/10 hover:border-accent hover:text-accent transition-all duration-300 rounded-xl hover:bg-pink-400  hover:border-pink-400 ">
                            <Instagram size={18} />
                        </a>
                        <a href="#" className="p-2 rounded-lg bg-background border border-border hover:bg-accent/10 hover:border-accent hover:text-accent transition-all duration-300  rounded-xl hover:bg-blue-400  hover:border-blue-400 ">
                            <Linkedin size={18} />
                        </a>
                        <a href="#" className="p-2 rounded-lg bg-background border border-border hover:bg-accent/10 hover:border-accent hover:text-accent transition-all duration-300  rounded-xl hover:bg-blue-400  hover:border-blue-600 ">
                            <Twitter size={18} />
                        </a>
                        <a href="mailto:trackora@gmail.com" className="p-2 rounded-lg bg-background border border-border hover:bg-accent/10 hover:border-accent hover:text-accent transition-all duration-300  rounded-xl hover:bg-red-500  hover:border-red-500 ">
                            <Mail size={18} />
                        </a>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Built with 💻 for productivity coders.
                    </p>
                </div>

                <div className={"group relative bg-card/70 backdrop-blur-xl p-8 rounded-2xl border border-border shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 overflow-hidden"}>

                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-blue-500/5 to-cyan-400/5 blur-2xl -z-10" />

                    <h3 className="font-bold mb-6 text-xl bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent inline-block">
                        Contact Us
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                        <div>
                            <input
                                type="text"
                                placeholder="Name"
                                className={inputStyles}
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                            {errors.name && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.name}</p>}
                        </div>

                        <div>
                            <input
                                type="text"
                                placeholder="Email"
                                className={inputStyles}
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                            />
                            {errors.email && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.email}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Phone"
                                    className={inputStyles}
                                    value={form.number}
                                    onChange={(e) => setForm({ ...form, number: e.target.value })}
                                />
                                {errors.number && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.number}</p>}
                            </div>
                            <div>
                                <select
                                    className={inputStyles}
                                    value={form.reason}
                                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                                >
                                    <option value="" className="bg-background text-foreground">Reason</option>
                                    <option className="bg-background text-foreground">General</option>
                                    <option className="bg-background text-foreground">Bug</option>
                                </select>
                                {errors.reason && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.reason}</p>}
                            </div>
                        </div>

                        <div>
                            <textarea
                                placeholder="Message"
                                rows="3"
                                className={inputStyles + " resize-none"}
                                value={form.message}
                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                            />
                            {errors.message && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.message}</p>}
                        </div>

                        <button
                            type="submit"
                            className={"w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all duration-300 bg-blue-500 hover:bg-blue-800"}
                        >
                            Submit <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-gradient-to-r from-blue-500 to-cyan-400 group-hover:w-full transition-all duration-700" />
                </div>
            </div>

            <div className="mt-12 text-center text-sm text-muted-foreground border-t border-border/50 pt-8">
                © 2026 Trackora. All rights reserved.
            </div>
        </footer>
    );
}