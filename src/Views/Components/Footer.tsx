import { Link, useLocation } from "react-router-dom";
import { Sparkles, Github, Instagram, Linkedin, Twitter } from "lucide-react";
import AnimatedGrass from "./AnimatedGrass";

const allQuickLinks = [
  { label: "Pasar", to: "/market" },
  { label: "Peta", to: "/map" },
  { label: "Komunitasku", to: "/communities" },
  { label: "Jualanku", to: "/thrifts" },
  { label: "Pesanan", to: "/orders" },
  { label: "Chatku", to: "/chats" },
  { label: "Profilku", to: "/profile" },
  { label: "Daftar", to: "/register" },
];

const publicQuickLinks = [
  { label: "Homepage", to: "/" },
  { label: "Login", to: "/login" },
  { label: "Daftar", to: "/register" },
];

const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com/JeshuaMatthew",
    icon: Github,
  },
  {
    label: "Instagram",
    href: "https://instagram.com/",
    icon: Instagram,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/",
    icon: Linkedin,
  },
  {
    label: "Twitter / X",
    href: "https://twitter.com/",
    icon: Twitter,
  },
];

const Footer = () => {
  const location = useLocation();
  const isPublicRoute =
    location.pathname === "/" || location.pathname.startsWith("/login");
  const quickLinks = isPublicRoute ? publicQuickLinks : allQuickLinks;

  return (
    // 1. Hapus bg-tx-primary dan text-white dari tag footer ini
    <footer className="w-full font-questrial">
      {/* 2. Hapus bg-bg-clean, ubah style ke Tailwind class -mb-[1px] untuk mencegah garis putih (gap rendering) */}
      <div className="w-full leading-none z-30 relative -mb-px">
        <svg
          className="w-full h-4 sm:h-5 md:h-6 text-tx-primary block"
          preserveAspectRatio="none"
          viewBox="0 0 100 10"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* The path draws stamp edges with curved inner valleys and flat tops. */}
          <path d="M 0 10 L 0 5 C 0,5 0.25,6 0.5,5 L 1.25,0 L 1.75,0 L 2.5,5 C 2.5,5 2.75,6 3,5 L 3.75,0 L 4.25,0 L 5,5 C 5,5 5.25,6 5.5,5 L 6.25,0 L 6.75,0 L 7.5,5 C 7.5,5 7.75,6 8,5 L 8.75,0 L 9.25,0 L 10,5 C 10,5 10.25,6 10.5,5 L 11.25,0 L 11.75,0 L 12.5,5 C 12.5,5 12.75,6 13,5 L 13.75,0 L 14.25,0 L 15,5 C 15,5 15.25,6 15.5,5 L 16.25,0 L 16.75,0 L 17.5,5 C 17.5,5 17.75,6 18,5 L 18.75,0 L 19.25,0 L 20,5 C 20,5 20.25,6 20.5,5 L 21.25,0 L 21.75,0 L 22.5,5 C 22.5,5 22.75,6 23,5 L 23.75,0 L 24.25,0 L 25,5 C 25,5 25.25,6 25.5,5 L 26.25,0 L 26.75,0 L 27.5,5 C 27.5,5 27.75,6 28,5 L 28.75,0 L 29.25,0 L 30,5 C 30,5 30.25,6 30.5,5 L 31.25,0 L 31.75,0 L 32.5,5 C 32.5,5 32.75,6 33,5 L 33.75,0 L 34.25,0 L 35,5 C 35,5 35.25,6 35.5,5 L 36.25,0 L 36.75,0 L 37.5,5 C 37.5,5 37.75,6 38,5 L 38.75,0 L 39.25,0 L 40,5 C 40,5 40.25,6 40.5,5 L 41.25,0 L 41.75,0 L 42.5,5 C 42.5,5 42.75,6 43,5 L 43.75,0 L 44.25,0 L 45,5 C 45,5 45.25,6 45.5,5 L 46.25,0 L 46.75,0 L 47.5,5 C 47.5,5 47.75,6 48,5 L 48.75,0 L 49.25,0 L 50,5 C 50,5 50.25,6 50.5,5 L 51.25,0 L 51.75,0 L 52.5,5 C 52.5,5 52.75,6 53,5 L 53.75,0 L 54.25,0 L 55,5 C 55,5 55.25,6 55.5,5 L 56.25,0 L 56.75,0 L 57.5,5 C 57.5,5 57.75,6 58,5 L 58.75,0 L 59.25,0 L 60,5 C 60,5 60.25,6 60.5,5 L 61.25,0 L 61.75,0 L 62.5,5 C 62.5,5 62.75,6 63,5 L 63.75,0 L 64.25,0 L 65,5 C 65,5 65.25,6 65.5,5 L 66.25,0 L 66.75,0 L 67.5,5 C 67.5,5 67.75,6 68,5 L 68.75,0 L 69.25,0 L 70,5 C 70,5 70.25,6 70.5,5 L 71.25,0 L 71.75,0 L 72.5,5 C 72.5,5 72.75,6 73,5 L 73.75,0 L 74.25,0 L 75,5 C 75,5 75.25,6 75.5,5 L 76.25,0 L 76.75,0 L 77.5,5 C 77.5,5 77.75,6 78,5 L 78.75,0 L 79.25,0 L 80,5 C 80,5 80.25,6 80.5,5 L 81.25,0 L 81.75,0 L 82.5,5 C 82.5,5 82.75,6 83,5 L 83.75,0 L 84.25,0 L 85,5 C 85,5 85.25,6 85.5,5 L 86.25,0 L 86.75,0 L 87.5,5 C 87.5,5 87.75,6 88,5 L 88.75,0 L 89.25,0 L 90,5 C 90,5 90.25,6 90.5,5 L 91.25,0 L 91.75,0 L 92.5,5 C 92.5,5 92.75,6 93,5 L 93.75,0 L 94.25,0 L 95,5 C 95,5 95.25,6 95.5,5 L 96.25,0 L 96.75,0 L 97.5,5 C 97.5,5 97.75,6 98,5 L 98.75,0 L 99.25,0 L 100,5 L 100 10 Z"></path>
        </svg>
      </div>

      {/* 3. Bungkus seluruh isi footer dengan div ber-background tx-primary */}
      <div className="bg-tx-primary text-white w-full">
        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand column */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              <Link to="/" className="w-fit">
                <img
                  src="/src/Assets/def/logo-large.webp"
                  alt="ThriftThrough Logo"
                  className="h-12 object-contain brightness-[4]"
                />
              </Link>

              <p className="text-slate-400 leading-relaxed text-sm max-w-xs">
                Platform jual-beli dan tukar-tambah elektronik bekas berbasis
                komunitas lokal. Bersama, kita kurangi jejak e-waste satu
                transaksi di satu waktu.
              </p>

              {/* Gemini AI badge */}
              <div className="flex items-center gap-2 text-xs text-slate-500 border border-slate-700 rounded-full px-3 py-1.5 w-fit">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Powered by Google Gemini AI</span>
              </div>
            </div>

            {/* Quick Links column */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-slate-500">
                Quick Links
              </h4>
              <ul className="flex flex-col gap-2.5">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Media Creator column */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-slate-500">
                Social Media
              </h4>
              <ul className="flex flex-col gap-3">
                {socialLinks.map(({ label, href, icon: Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-white transition-colors duration-200 group"
                    >
                      <Icon className="w-4 h-4 shrink-0 group-hover:text-bg-vermillion transition-colors duration-200" />
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar with full-width animated grass */}
        <div className="relative overflow-hidden w-full">
          {/* Full width animated grass background */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col mb-3 sm:flex-row items-center justify-between gap-3 text-xs text-bg-vermillion relative z-10">
            <p>
              &copy; {new Date().getFullYear()} ThriftThrough. Hak cipta
              dilindungi.
            </p>
            <p className="text-center">
              Foto pendukung oleh{" "}
              <a
                href="https://unsplash.com"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-slate-400 transition-colors"
              >
                Unsplash
              </a>
              . Fitur AI didukung oleh{" "}
              <a
                href="https://ai.google.dev/"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-slate-400 transition-colors"
              >
                Google Gemini
              </a>
              .
            </p>
          </div>
          <AnimatedGrass />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
