import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, ShoppingCart, User, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GB, US, ES, PT, BR, CN } from "country-flag-icons/react/3x2";

// Flag component that renders multiple flags for combined regions
const FlagIcon = ({ code, className = "w-5 h-3.5" }: { code: string; className?: string }) => {
  const flags: Record<string, React.ComponentType<{ className?: string }>> = {
    GB, US, ES, PT, BR, CN
  };
  
  if (code.includes(",")) {
    const codes = code.split(",");
    return (
      <span className="flex items-center gap-0.5">
        {codes.map((c) => {
          const Flag = flags[c.trim()];
          return Flag ? <Flag key={c} className={className} /> : null;
        })}
      </span>
    );
  }
  
  const Flag = flags[code];
  return Flag ? <Flag className={className} /> : null;
};

interface NavItem {
  label: string;
  path?: string;
  children?: { label: string; path: string; flagCode?: string }[];
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const navItems: NavItem[] = [
    {
      label: "Blog",
      children: [
        { label: "English", path: "/blog", flagCode: "GB,US" },
        { label: "Español", path: "/articles/spanish", flagCode: "ES" },
        { label: "Português", path: "/articles/portuguese", flagCode: "PT,BR" },
        { label: "中文", path: "/articles/chinese", flagCode: "CN" },
      ],
    },
    {
      label: "Library",
      children: [
        { label: "English", path: "/library", flagCode: "GB,US" },
        { label: "Español", path: "/library/spanish", flagCode: "ES" },
        { label: "Português", path: "/library/portuguese", flagCode: "PT,BR" },
        { label: "中文", path: "/library/chinese", flagCode: "CN" },
      ],
    },
    {
      label: "Resources Center",
      children: [
        { label: "Cisco's Workstation", path: "/resources/workstation" },
        { label: "Apps & Software", path: "/resources/apps" },
        { label: "Periospot Patrons", path: "/resources/patrons" },
        { label: "Webinars Toolkit", path: "/resources/webinars-toolkit" },
      ],
    },
    { label: "Online Learning", path: "/online-learning" },
    { label: "Team & Contact", path: "/team" },
  ];

  const handleDropdownToggle = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const handleMouseEnter = (label: string) => {
    setOpenDropdown(label);
  };

  const handleMouseLeave = () => {
    setOpenDropdown(null);
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4"
    >
      {/* Floating pill navigation */}
      <nav className="bg-background/90 backdrop-blur-xl border border-border/50 rounded-full px-3 py-2 shadow-elevated">
        <div className="flex items-center">
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Link
              to="/"
              className="font-display text-lg font-semibold text-foreground px-3 py-1.5"
            >
              <span className="text-primary">◉</span> periospot
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center">
            {navItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                className="relative"
                onMouseEnter={() => item.children && handleMouseEnter(item.label)}
                onMouseLeave={handleMouseLeave}
              >
                {item.children ? (
                  <button
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors duration-300 text-sm font-medium px-3 py-1.5 rounded-full hover:bg-secondary/50"
                    onClick={() => handleDropdownToggle(item.label)}
                  >
                    {item.label}
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        openDropdown === item.label ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                ) : (
                  <Link
                    to={item.path!}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300 text-sm font-medium px-3 py-1.5 rounded-full hover:bg-secondary/50"
                  >
                    {item.label}
                  </Link>
                )}

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {item.children && openDropdown === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-elevated py-2 min-w-[180px]"
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                        >
                          {child.flagCode && <FlagIcon code={child.flagCode} />}
                          {child.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Action Icons */}
          <div className="hidden md:flex items-center gap-2 ml-2">
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-colors"
              aria-label="Search"
            >
              <Search size={18} />
            </motion.button>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55, duration: 0.5 }}
            >
              <Link to="/shop">
                <Button variant="secondary" className="gap-2 rounded-full">
                  Shop
                  <ShoppingCart size={16} />
                </Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.58, duration: 0.5 }}
            >
              <Link to="/auth/signin">
                <Button className="gap-2 rounded-full">
                  Log in
                  <User size={16} />
                </Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.62, duration: 0.5 }}
            >
              <Link
                to="/cart"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-colors relative inline-flex"
                aria-label="Cart"
              >
                <ShoppingCart size={18} />
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  0
                </span>
              </Link>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-foreground p-2 ml-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="lg:hidden absolute top-full mt-3 left-4 right-4 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl p-4 shadow-elevated"
          >
            {/* Search bar in mobile */}
            <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-xl mb-3">
              <Search size={18} className="text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {navItems.map((item) => (
              <div key={item.label}>
                {item.children ? (
                  <div className="mb-2">
                    <button
                      onClick={() => handleDropdownToggle(item.label)}
                      className="flex items-center justify-between w-full py-3 px-4 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-xl transition-colors"
                    >
                      {item.label}
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${
                          openDropdown === item.label ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {openDropdown === item.label && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-4 py-1">
                            {item.children.map((child) => (
                              <Link
                                key={child.path}
                                to={child.path}
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-2 py-2.5 px-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {child.flagCode && <FlagIcon code={child.flagCode} />}
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    to={item.path!}
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-3 px-4 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-xl transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}

            <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
              <Link
                to="/auth/signin"
                onClick={() => setIsMenuOpen(false)}
                className="block"
              >
                <Button className="w-full gap-2">
                  Log in
                  <User size={18} />
                </Button>
              </Link>
              <Link
                to="/shop"
                onClick={() => setIsMenuOpen(false)}
                className="block"
              >
                <Button variant="secondary" className="w-full gap-2">
                  Shop
                  <ShoppingCart size={18} />
                </Button>
              </Link>
              <Link
                to="/cart"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-full border border-border py-2.5 px-4 text-muted-foreground transition-colors hover:text-foreground"
              >
                <ShoppingCart size={18} />
                <span className="text-sm">0</span>
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
