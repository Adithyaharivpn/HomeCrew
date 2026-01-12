import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "../Utils/Themeprovider";

const Footer = () => {
  const { theme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Matches the Hero colors precisely
  const footerStyle = {
    background: isDark
      ? "#000000" // Pure Black for Dark Mode
      : "linear-gradient(to bottom right, #1d4ed8, #1e40af)", // Deep Blue for Light Mode
  };

  return (
    <footer 
      style={footerStyle} 
      className="text-white transition-all duration-500 border-t border-white/10 dark:border-zinc-900 mt-auto"
    >
      <div className="container mx-auto px-4 py-12 md:py-16">
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">HomeCrew</h2>
            <p className={`text-sm leading-relaxed max-w-xs transition-colors duration-500 ${
              isDark ? "text-zinc-500" : "text-blue-100"
            }`}>
              Connecting you with trusted local professionals for all your home repair and maintenance needs. Fast, secure, and reliable.
            </p>
            <div className="flex gap-4 pt-2">
              <SocialIcon icon={<Facebook className="h-5 w-5" />} href="#" isDark={isDark} />
              <SocialIcon icon={<Twitter className="h-5 w-5" />} href="#" isDark={isDark} />
              <SocialIcon icon={<Instagram className="h-5 w-5" />} href="#" isDark={isDark} />
              <SocialIcon icon={<Linkedin className="h-5 w-5" />} href="#" isDark={isDark} />
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Company</h3>
            <ul className={`space-y-2 text-sm transition-colors duration-500 ${
              isDark ? "text-zinc-500" : "text-blue-100/80"
            }`}>
              <li><FooterLink to="/about" isDark={isDark}>About Us</FooterLink></li>
              <li><FooterLink to="/careers" isDark={isDark}>Careers</FooterLink></li>
              <li><FooterLink to="/blog" isDark={isDark}>Blog</FooterLink></li>
              <li><FooterLink to="/contact" isDark={isDark}>Contact Support</FooterLink></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Services</h3>
            <ul className={`space-y-2 text-sm transition-colors duration-500 ${
              isDark ? "text-zinc-500" : "text-blue-100/80"
            }`}>
              <li><FooterLink to="/dashboard/jobs?category=Plumbing" isDark={isDark}>Plumbing</FooterLink></li>
              <li><FooterLink to="/dashboard/jobs?category=Electrical" isDark={isDark}>Electrical</FooterLink></li>
              <li><FooterLink to="/dashboard/jobs?category=Cleaning" isDark={isDark}>Home Cleaning</FooterLink></li>
              <li><FooterLink to="/dashboard/jobs?category=Carpentry" isDark={isDark}>Carpentry</FooterLink></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Contact Us</h3>
            <ul className={`space-y-4 text-sm transition-colors duration-500 ${
              isDark ? "text-zinc-500" : "text-blue-100/80"
            }`}>
              <li className="flex items-start gap-3">
                <MapPin className={`h-5 w-5 shrink-0 ${isDark ? "text-blue-500" : "text-blue-200"}`} />
                <span>123 Tech Park, Kakkanad,<br />Kochi, Kerala 682030</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className={`h-5 w-5 shrink-0 ${isDark ? "text-blue-500" : "text-blue-200"}`} />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className={`h-5 w-5 shrink-0 ${isDark ? "text-blue-500" : "text-blue-200"}`} />
                <span>support@homecrew.com</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className={`my-8 transition-colors duration-500 ${
          isDark ? "bg-zinc-800" : "bg-white/10"
        }`} />

        <div className={`flex flex-col items-center justify-between gap-4 md:flex-row text-xs transition-colors duration-500 ${
          isDark ? "text-zinc-600" : "text-blue-200/60"
        }`}>
          <p>© 2026 HomeCrew Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialIcon = ({ icon, href, isDark }) => (
  <a 
    href={href} 
    className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
      isDark 
        ? "bg-zinc-900 text-zinc-500 hover:bg-blue-600 hover:text-white" 
        : "bg-white/10 text-white hover:bg-white hover:text-blue-700"
    }`}
  >
    {icon}
  </a>
);

const FooterLink = ({ to, children, isDark }) => (
  <Link 
    to={to} 
    className={`block w-fit transition-all duration-200 hover:translate-x-1 ${
      isDark ? "hover:text-blue-400" : "hover:text-white"
    }`}
  >
    {children}
  </Link>
);

export default Footer;