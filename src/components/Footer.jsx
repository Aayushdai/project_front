import contentLogo from "../assets/content.png";
import "./Footer.css";

const FOOTER_SECTIONS = {
  company: {
    title: "Company",
    items: ["About Us", "How it Works", "Careers", "Blog"]
  },
  support: {
    title: "Support",
    items: ["Help Center", "Safety & Trust", "Community Rules", "Contact Us"]
  },
  explore: {
    title: "Explore",
    items: ["Find Travelers", "Popular Trips", "Destinations", "Travel Stories"]
  }
};

const FOOTER_LINKS = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Cookies", href: "#" }
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="text-slate-300" style={{
      backgroundColor: 'var(--footer-bg, #000000)',
    }}>
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* TOP GRID */}
        <div className="grid gap-12 md:grid-cols-4">
          
          {/* BRAND */}
          <div>
            <img src={contentLogo} alt="Travel Companion" className="h-16" />
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Your trusted travel companion to find like-minded travelers,
              plan trips together, and explore the world safely.
            </p>
          </div>

          {/* DYNAMIC SECTIONS */}
          {Object.values(FOOTER_SECTIONS).map(section => (
            <div key={section.title}>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                {section.title}
              </h4>
              <ul className="space-y-3 text-sm text-slate-400">
                {section.items.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* DIVIDER */}
        <div className="my-10 h-px bg-slate-700" />

        {/* BOTTOM BAR */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-slate-400">
            © {currentYear} All rights reserved.
          </p>

          <div className="flex gap-6 text-slate-400 text-sm">
            {FOOTER_LINKS.map(link => (
              <a key={link.label} href={link.href} className="hover:text-white transition">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;