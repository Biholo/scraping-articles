"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutGrid,
  BarChart2,
  Users,
  MessageCircle,
  Bookmark,
  Bell,
  HelpCircle,
  Settings,
  ChevronLeft,
  Rocket,
} from "lucide-react"
import type React from "react"

interface SidebarItem {
  icon: React.ReactNode
  label: string
  href: string
}

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true)

  const menuItems: SidebarItem[] = [
    { icon: <LayoutGrid size={20} />, label: "Dashboard", href: "#" },
    { icon: <BarChart2 size={20} />, label: "Analytics", href: "#" },
    { icon: <Users size={20} />, label: "Customers", href: "#" },
    { icon: <MessageCircle size={20} />, label: "Chats", href: "#" },
    { icon: <Bookmark size={20} />, label: "Subscriptions", href: "#" },
    { icon: <Bell size={20} />, label: "Notification", href: "#" },
    { icon: <HelpCircle size={20} />, label: "Support", href: "#" },
    { icon: <Settings size={20} />, label: "Settings", href: "#" },
  ]

  return (
    <motion.div
      animate={{ width: isExpanded ? "240px" : "70px" }}
      transition={{ duration: 0.3 }}
      className="h-screen relative bg-gradient-to-b from-[#0A0A29] to-[#0A0A1F] text-white p-4 flex flex-col"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-8 bg-blue-600 p-1.5 rounded-full text-white hover:bg-blue-700 transition-colors"
      >
        <motion.div animate={{ rotate: isExpanded ? 0 : 180 }} transition={{ duration: 0.3 }}>
          <ChevronLeft size={16} />
        </motion.div>
      </button>

      {/* Profile Section */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src=""
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col"
            >
              <div className="flex items-center gap-1">
                <span className="font-semibold">Hello</span>
                <span className="text-yellow-500">👋</span>
              </div>
              <span className="text-sm text-gray-300">Dhrumin S.</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Items */}
      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="flex items-center gap-4 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-colors group"
          >
            <span className="flex-shrink-0 group-hover:text-blue-400 transition-colors">{item.icon}</span>
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-sm whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </a>
        ))}
      </nav>

      {/* Pro Access Button */}
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4"
          >
            <h3 className="font-semibold mb-1">Become Pro Access</h3>
            <p className="text-sm text-blue-100 mb-3">Try your experience for using more features.</p>
            <button className="bg-white text-blue-600 w-full rounded-lg py-2 text-sm font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
              <Rocket size={16} />
              Upgrade Pro
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-2 bg-blue-600 rounded-lg w-full flex items-center justify-center hover:bg-blue-700 transition-colors"
          >
            <Rocket size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

