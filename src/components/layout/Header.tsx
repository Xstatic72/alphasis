"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/students", label: "Students" },
    { href: "/teachers", label: "Teachers" },
    { href: "/classes", label: "Classes" },
    { href: "/subjects", label: "Subjects" },
    { href: "/payments", label: "Payments" },
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm sticky top-0 z-50"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#ff4e00]/5 via-[#8ea604]/5 to-[#f5bb00]/5 animate-gradient"></div>

      <div className="container mx-auto px-6 relative">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <h1 className="text-2xl font-bold gradient-text">AlphaSIS</h1>
              <motion.div
                className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-[#ff4e00] to-[#8ea604] origin-left"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </Link>

          <nav className="flex space-x-1">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <Link
                    href={item.href}
                    className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-300 hover-lift ${
                      isActive
                        ? "text-white bg-gradient-to-r from-[#ff4e00] to-[#8ea604] shadow-lg"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                    }`}
                  >
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className="relative z-10"
                    >
                      {item.label}
                    </motion.span>

                    {/* Hover effect */}
                    {!isActive && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-[#ff4e00]/10 to-[#8ea604]/10 rounded-lg"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </div>
      </div>
    </motion.header>
  );
}
