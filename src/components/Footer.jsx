const Footer = () => {
  return (
    <footer className="bg-black text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* TOP GRID */}
        <div className="grid gap-12 md:grid-cols-4">
          
          {/* BRAND */}
          <div>
            <h3 className="text-2xl font-bold text-white">
              Travel <span className="text-sky-400">साथी</span>
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Your trusted travel companion to find like-minded travelers,
              plan trips together, and explore the world safely.
            </p>
          </div>

          {/* COMPANY */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Company
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-white cursor-pointer">About Us</li>
              <li className="hover:text-white cursor-pointer">How it Works</li>
              <li className="hover:text-white cursor-pointer">Careers</li>
              <li className="hover:text-white cursor-pointer">Blog</li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Support
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-white cursor-pointer">Help Center</li>
              <li className="hover:text-white cursor-pointer">Safety & Trust</li>
              <li className="hover:text-white cursor-pointer">Community Rules</li>
              <li className="hover:text-white cursor-pointer">Contact Us</li>
            </ul>
          </div>

          {/* EXPLORE */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Explore
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-white cursor-pointer">Find Travelers</li>
              <li className="hover:text-white cursor-pointer">Popular Trips</li>
              <li className="hover:text-white cursor-pointer">Destinations</li>
              <li className="hover:text-white cursor-pointer">Travel Stories</li>
            </ul>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="my-10 h-px bg-slate-700" />

        {/* BOTTOM BAR */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Travel Sathi. All rights reserved.
          </p>

          <div className="flex gap-6 text-slate-400">
            <span className="cursor-pointer hover:text-white">Privacy</span>
            <span className="cursor-pointer hover:text-white">Terms</span>
            <span className="cursor-pointer hover:text-white">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;