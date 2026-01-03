"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Search, ShoppingCart, ChevronDown, Shield, User, LogOut } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { User as SupabaseUser } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/woocommerce"
import { GB, US, ES, PT, BR, CN } from "country-flag-icons/react/3x2"

const ADMIN_EMAIL = "cisco@periospot.com"

const FlagIcon = ({
  code,
  className = "w-5 h-3.5",
}: {
  code: string
  className?: string
}) => {
  const flags: Record<string, React.ComponentType<{ className?: string }>> = {
    GB,
    US,
    ES,
    PT,
    BR,
    CN,
  }

  if (code.includes(",")) {
    const codes = code.split(",")
    return (
      <span className="flex items-center gap-0.5">
        {codes.map((item) => {
          const Flag = flags[item.trim()]
          return Flag ? <Flag key={item} className={className} /> : null
        })}
      </span>
    )
  }

  const Flag = flags[code]
  return Flag ? <Flag className={className} /> : null
}

interface NavItem {
  label: string
  path?: string
  children?: { label: string; path: string; flagCode?: string }[]
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const { itemCount } = useCart()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setIsAdmin(user?.email === ADMIN_EMAIL)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsAdmin(session?.user?.email === ADMIN_EMAIL)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
    router.push("/")
    router.refresh()
  }

  const navItems: NavItem[] = [
    {
      label: "Articles",
      children: [
        { label: "English", path: "/blog", flagCode: "GB,US" },
        { label: "Español", path: "/blog/es", flagCode: "ES" },
        { label: "Português", path: "/blog/pt", flagCode: "PT,BR" },
        { label: "中文", path: "/blog/zh", flagCode: "CN" },
      ],
    },
    {
      label: "Library",
      children: [
        { label: "English", path: "/library", flagCode: "GB,US" },
        { label: "Español", path: "/library/es", flagCode: "ES" },
        { label: "Português", path: "/library/pt", flagCode: "PT,BR" },
        { label: "中文", path: "/library/zh", flagCode: "CN" },
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
    // Online Learning hidden - no content yet
    { label: "Team & Contact", path: "/team" },
  ]

  const handleMouseEnter = (label: string) => {
    setOpenDropdown(label)
  }

  const handleMouseLeave = () => {
    setOpenDropdown(null)
  }

  const handleDropdownToggle = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label)
  }

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
              href="/"
              className="font-display text-lg font-semibold text-foreground px-3 py-1.5"
            >
              <span className="text-primary relative top-[1px]">◉</span> periospot
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
                    href={item.path!}
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
                          href={child.path}
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
          <div className="hidden md:flex items-center gap-1 ml-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Link
                href="/search"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-colors inline-flex"
                aria-label="Search"
              >
                <Search size={18} />
              </Link>
            </motion.div>

            {/* Admin Icon - Only for cisco@periospot.com */}
            {isAdmin && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.52, duration: 0.5 }}
              >
                <Link
                  href="/admin"
                  className="p-2 text-purple-500 hover:text-purple-600 hover:bg-purple-500/10 rounded-full transition-colors inline-flex"
                  aria-label="Admin Dashboard"
                  title="Admin Dashboard"
                >
                  <Shield size={18} />
                </Link>
              </motion.div>
            )}

            {user ? (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.55, duration: 0.5 }}
                >
                  <Link
                    href="/dashboard"
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-colors inline-flex"
                    aria-label="Dashboard"
                  >
                    <User size={18} />
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.57, duration: 0.5 }}
                >
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-colors"
                    aria-label="Sign Out"
                  >
                    <LogOut size={18} />
                  </button>
                </motion.div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.55, duration: 0.5 }}
              >
                <Link href="/login">
                  <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                    Log In
                  </Button>
                </Link>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.58, duration: 0.5 }}
            >
              <Link
                href="/cart"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-colors relative inline-flex"
                aria-label="Cart"
              >
                <ShoppingCart size={18} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center bg-primary text-primary-foreground">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
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
                                href={child.path}
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
                    href={item.path!}
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-3 px-4 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-xl transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}

            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border/50">
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 bg-purple-500/10 text-purple-600 border border-purple-500/30 rounded-full transition-colors"
                >
                  <Shield size={18} />
                  <span className="text-sm font-medium">Admin Dashboard</span>
                </Link>
              )}
              <div className="flex items-center gap-2">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full rounded-full">
                        <User size={18} className="mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut()
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center justify-center gap-2 py-2.5 px-4 text-muted-foreground hover:text-foreground border border-border rounded-full transition-colors"
                    >
                      <LogOut size={18} />
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex-1"
                  >
                    <Button className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                      Log In
                    </Button>
                  </Link>
                )}
                <Link
                  href="/cart"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 text-muted-foreground hover:text-foreground border border-border rounded-full transition-colors"
                >
                  <ShoppingCart size={18} />
                  <span className="text-sm">{itemCount}</span>
                </Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

export default Header
