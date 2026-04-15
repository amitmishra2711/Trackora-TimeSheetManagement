import { useState } from "react";
import { Instagram, Linkedin, Twitter, Mail, ArrowRight } from "lucide-react";
import emailjs from "@emailjs/browser";
import toast from "react-hot-toast";

// PERFORMANCE: Extracted static regex patterns outside the component 
// so they aren't recompiled on every single render/keystroke.
const NAME_REGEX = /^[A-Za-z ]+$/;
const EMAIL_REGEX = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.com$/;
const PHONE_REGEX = /^[0-9]{10}$/;

// PERFORMANCE: Extracted static styles so they aren't recreated on every render.
const INPUT_STYLES =
  "w-full p-3 rounded-xl border border-border bg-background text-foreground " +
  "placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-accent/50 " +
  "focus:border-accent outline-none transition-all dark:bg-muted/20 dark:text-white";

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
    if (!NAME_REGEX.test(form.name)) err.name = "Only alphabets allowed";
    if (!EMAIL_REGEX.test(form.email))
      err.email = "Lowercase email ending with .com";
    if (!PHONE_REGEX.test(form.number))
      err.number = "Enter valid 10 digit number";
    if (!form.reason) err.reason = "Select a reason";
    if (form.message.length < 10)
      err.message = "Minimum 10 characters required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      emailjs.send(
        "service_ypiwxdk",
        "template_wqnpotr",
        {
          name: form.name,
          email: form.email,
          number: form.number,
          reason: form.reason,
          message: form.message,
        },
        "2OK2FiCOhd_CifmNo",
      );

      toast.success(
        "Thank you for reaching out! We'll get back to you soon.💗",
      );
      
      // Optional: Clear form after successful submit
      setForm({ name: "", email: "", number: "", reason: "", message: "" });
      setErrors({});
    }
  };

  return (
    <footer
      id="contact"
      className="border-t bg-muted/30 py-16 px-6 relative overflow-hidden"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">Contact and Footer Information</h2>
      
      <div className="absolute top-0 right-0 -z-10 translate-x-1/2 -translate-y-1/2" aria-hidden="true">
        <div className="w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 relative z-10">
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold">Trackora</h3>
            <p className="text-muted-foreground text-sm mt-2">
              Smart time tracking for modern teams 🚀
            </p>
          </div>

          <nav aria-label="Footer Navigation" className="flex flex-col gap-2 text-sm">
            <a href="#hero" className="transition hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
              Home
            </a>
            <a href="#features" className="transition hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
              Features
            </a>
            <a href="#about" className="transition hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
              About
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/amitmishra__27"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit our Instagram profile"
              className="p-2 rounded-xl bg-background border border-border hover:text-accent transition-all duration-300 hover:bg-pink-400 hover:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              <Instagram size={18} aria-hidden="true" />
            </a>
            <a
              href="https://www.linkedin.com/in/amit-mishraaa"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit our LinkedIn profile"
              className="p-2 rounded-xl bg-background border border-border hover:text-accent transition-all duration-300 hover:bg-blue-400 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <Linkedin size={18} aria-hidden="true" />
            </a>
            <a
              href="https://www.linkedin.com/in/amit-mishraaa"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit our Twitter profile"
              className="p-2 rounded-xl bg-background border border-border hover:text-accent transition-all duration-300 hover:bg-blue-400 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <Twitter size={18} aria-hidden="true" />
            </a>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=amittttt12233221@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Send us an email"
              className="p-2 rounded-xl bg-background border border-border hover:text-accent transition-all duration-300 hover:bg-red-500 hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <Mail size={18} aria-hidden="true" />
            </a>
          </div>

          <p className="text-xs text-muted-foreground">
            Built with 💻 for productivity coders.
          </p>
        </div>

        <div className="group relative bg-card/70 backdrop-blur-xl p-8 rounded-2xl border border-border shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 overflow-hidden">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-blue-500/5 to-cyan-400/5 blur-2xl -z-10" aria-hidden="true" />

          <h3 className="font-bold mb-6 text-xl bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent inline-block">
            Contact Us
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10" noValidate>
            <div>
              <input
                id="contact-name"
                type="text"
                placeholder="Name"
                aria-label="Name"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                className={INPUT_STYLES}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {errors.name && (
                <p id="name-error" role="alert" className="text-red-500 text-xs mt-1 ml-1 font-medium">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <input
                id="contact-email"
                type="email"
                placeholder="Email"
                aria-label="Email Address"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={INPUT_STYLES}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {errors.email && (
                <p id="email-error" role="alert" className="text-red-500 text-xs mt-1 ml-1 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  id="contact-phone"
                  type="tel"
                  placeholder="Phone"
                  aria-label="Phone Number"
                  aria-invalid={!!errors.number}
                  aria-describedby={errors.number ? "phone-error" : undefined}
                  className={INPUT_STYLES}
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                />
                {errors.number && (
                  <p id="phone-error" role="alert" className="text-red-500 text-xs mt-1 ml-1 font-medium">
                    {errors.number}
                  </p>
                )}
              </div>
              <div>
                <select
                  id="contact-reason"
                  aria-label="Select a reason for contacting"
                  aria-invalid={!!errors.reason}
                  aria-describedby={errors.reason ? "reason-error" : undefined}
                  className="w-full px-3 py-3 border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded-xl"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                >
                  <option value="" style={{ color: "black", backgroundColor: "white" }}>
                    Reason
                  </option>
                  <option value="general" style={{ color: "black", backgroundColor: "white" }}>
                    General
                  </option>
                  <option value="bug" style={{ color: "black", backgroundColor: "white" }}>
                    Bug
                  </option>
                </select>
                {errors.reason && (
                  <p id="reason-error" role="alert" className="text-red-500 text-xs mt-1 ml-1 font-medium">
                    {errors.reason}
                  </p>
                )}
              </div>
            </div>

            <div>
              <textarea
                id="contact-message"
                placeholder="Message"
                aria-label="Message"
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "message-error" : undefined}
                rows="3"
                className={INPUT_STYLES + " resize-none"}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
              {errors.message && (
                <p id="message-error" role="alert" className="text-red-500 text-xs mt-1 ml-1 font-medium">
                  {errors.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all duration-300 bg-blue-500 hover:bg-blue-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-background"
            >
              Submit <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>

          <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-gradient-to-r from-blue-500 to-cyan-400 group-hover:w-full transition-all duration-700" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-12 text-center text-sm text-muted-foreground border-t border-border/50 pt-8">
        © 2026 Trackora. All rights reserved.
      </div>
    </footer>
  );
}