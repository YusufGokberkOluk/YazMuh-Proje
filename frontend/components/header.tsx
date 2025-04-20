"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronDown,
  Settings,
  LogOut,
  Search,
  Bell,
  Sparkles,
  HelpCircle,
  Menu,
  MessageSquare,
  FileText,
  Users,
  Clock,
  X,
  Check,
  ExternalLink,
  AlertCircle,
} from "lucide-react"
import AiActionsPopup from "./ai-actions-popup"

// Sample notification data
interface Notification {
  id: string
  type: "message" | "document" | "mention" | "reminder" | "error"
  content: string
  time: string
  read: boolean
  link?: string
}

// Add these props to the Header component
interface HeaderProps {
  toggleTheme?: () => void
  theme?: "light" | "dark"
}

export default function Header({ toggleTheme, theme = "light" }: HeaderProps) {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAiActionsOpen, setIsAiActionsOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)
  // Inside the Header component, add this state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  // Add state for search functionality
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Sample notifications data
  useEffect(() => {
    // Simulate API call
    const fetchNotifications = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 800))

        setNotifications([
          {
            id: "1",
            type: "message",
            content: "John commented on your document",
            time: "2 hours ago",
            read: false,
            link: "/app?document=123&comment=456",
          },
          {
            id: "2",
            type: "document",
            content: "Sarah shared a document with you",
            time: "5 hours ago",
            read: false,
            link: "/app?document=789",
          },
          {
            id: "3",
            type: "mention",
            content: "You were mentioned in Project Notes",
            time: "Yesterday",
            read: true,
            link: "/app?document=456&mention=123",
          },
          {
            id: "4",
            type: "reminder",
            content: "Meeting with the design team in 30 minutes",
            time: "30 minutes ago",
            read: false,
          },
        ])
        setHasError(false)
      } catch (error) {
        console.error("Error fetching notifications:", error)
        setHasError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  // Count of unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length

  // Handle click outside to close notification panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showNotifications])

  // Focus search input when search is opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  // Keyboard accessibility
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (showNotifications) {
          setShowNotifications(false)
        }
        if (isSearchOpen) {
          setIsSearchOpen(false)
          setSearchQuery("")
        }
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [showNotifications, isSearchOpen])

  // Determine login status based on the current path
  useEffect(() => {
    // Consider user logged in if they're in the app section
    const loggedInPaths = ["/app", "/settings", "/templates"]
    const isInAuthenticatedArea = loggedInPaths.some((path) => pathname?.startsWith(path))
    setIsLoggedIn(isInAuthenticatedArea)
  }, [pathname])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleOpenAiActions = () => {
    setIsAiActionsOpen(true)
  }

  const handleCloseAiActions = () => {
    setIsAiActionsOpen(false)
  }

  // Update the handleSignOut function
  const handleSignOut = () => {
    console.log("Sign out initiated")
    // Clear the login state
    localStorage.removeItem("isLoggedIn")
    // Close the menu
    setIsMenuOpen(false)
    // Redirect to home page
    window.location.href = "/"
  }

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
  }

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
    if (isSearchOpen) {
      setSearchQuery("")
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Searching for:", searchQuery)
    // In a real app, this would trigger a search
  }

  const markAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const markAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const dismissNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read when clicked
    if (!notification.read) {
      setNotifications(notifications.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))
    }

    // Navigate to the relevant page if link exists
    if (notification.link) {
      console.log(`Navigating to: ${notification.link}`)
      // In a real app, this would use router.push
      // router.push(notification.link)
    }

    // Close the panel on mobile
    if (window.innerWidth < 768) {
      setShowNotifications(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-4 w-4 text-blue-400" />
      case "document":
        return <FileText className="h-4 w-4 text-green-400" />
      case "mention":
        return <Users className="h-4 w-4 text-purple-400" />
      case "reminder":
        return <Clock className="h-4 w-4 text-orange-400" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-400" />
      default:
        return <Bell className="h-4 w-4 text-[#79B791]" />
    }
  }

  return (
    <header className="w-full py-3 px-4 bg-[#13262F] border-b border-[#79B791]/10 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        {/* Left section: Logo and navigation */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            className="p-1.5 rounded-md hover:bg-[#79B791]/10 text-[#EDF4ED]/70 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Site Logo - Always go to /app when logged in */}
          <Link href={isLoggedIn ? "/app" : "/"} className="text-xl font-bold flex items-center">
            <div className="mr-1 text-[#79B791] font-semibold relative">
              <span className="inline-block rounded-full bg-[#79B791] text-white px-2 py-0.5">é</span>
            </div>
            <span className="text-white">étude</span>
          </Link>

          {/* Desktop Navigation */}
          {isLoggedIn && (
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                href="/app"
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  pathname?.startsWith("/app")
                    ? "bg-[#79B791]/20 text-white"
                    : "text-[#EDF4ED]/80 hover:bg-[#79B791]/10 hover:text-white"
                }`}
              >
                Home
              </Link>
              <Link
                href="/templates"
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  pathname?.startsWith("/templates")
                    ? "bg-[#79B791]/20 text-white"
                    : "text-[#EDF4ED]/80 hover:bg-[#79B791]/10 hover:text-white"
                }`}
              >
                Templates
              </Link>
            </nav>
          )}
        </div>

        {/* Right section: Search, AI, Notifications, User */}
        <div className="flex items-center space-x-2">
          {isLoggedIn && (
            <>
              {/* Search button and expandable search bar */}
              <div className="relative">
                {isSearchOpen ? (
                  <form onSubmit={handleSearchSubmit} className="absolute right-0 top-0 z-10">
                    <div className="flex items-center bg-white rounded-md overflow-hidden shadow-md">
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="py-1.5 pl-3 pr-8 w-64 text-[#13262F] focus:outline-none text-sm"
                      />
                      <button
                        type="button"
                        onClick={toggleSearch}
                        className="absolute right-2 text-[#13262F]/60 hover:text-[#13262F]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={toggleSearch}
                    className="p-1.5 rounded-md hover:bg-[#79B791]/10 text-[#EDF4ED]/70 hover:text-white transition-colors"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* AI Assistant button - Prominent */}
              <button
                onClick={handleOpenAiActions}
                className="flex items-center px-2.5 py-1.5 bg-[#79B791] text-white rounded-md hover:bg-[#ABD1B5] transition-colors"
              >
                <Sparkles className="h-4 w-4 mr-1.5" />
                <span className="text-sm hidden sm:inline">AI Assistant</span>
              </button>

              {/* Notifications - With hover and click dropdown panel */}
              <div
                className="relative"
                ref={notificationRef}
                onMouseEnter={() => setShowNotifications(true)}
                onMouseLeave={() => setShowNotifications(false)}
              >
                <button
                  onClick={toggleNotifications}
                  className="p-1.5 rounded-md hover:bg-[#79B791]/10 text-[#EDF4ED]/70 hover:text-white transition-colors"
                  aria-label={unreadCount > 0 ? `${unreadCount} notifications` : "No notifications"}
                  aria-expanded={showNotifications}
                  aria-controls="notification-panel"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      toggleNotifications()
                    }
                  }}
                  tabIndex={0}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#13262F]">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Panel */}
                {showNotifications && (
                  <div
                    id="notification-panel"
                    className="absolute right-0 mt-1 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20 border border-[#ABD1B5]/20 animate-in fade-in slide-in-from-top-5 duration-200"
                    role="dialog"
                    aria-label="Notifications"
                  >
                    <div className="flex items-center justify-between p-3 border-b border-[#ABD1B5]/20 bg-[#f8faf8]">
                      <h3 className="font-medium text-[#13262F]">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-[#79B791] hover:text-[#ABD1B5] font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-[300px] overflow-y-auto">
                      {isLoading ? (
                        <div className="p-6 flex flex-col items-center justify-center">
                          <div className="w-6 h-6 border-2 border-[#79B791] border-t-transparent rounded-full animate-spin mb-2"></div>
                          <p className="text-sm text-[#13262F]/60">Loading notifications...</p>
                        </div>
                      ) : hasError ? (
                        <div className="p-6 text-center">
                          <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                          <p className="text-sm text-[#13262F]/80">Could not load notifications</p>
                          <button className="mt-2 text-xs text-[#79B791] hover:text-[#ABD1B5] font-medium">
                            Try again
                          </button>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-6 text-center">
                          <Bell className="h-6 w-6 text-[#13262F]/30 mx-auto mb-2" />
                          <p className="text-sm text-[#13262F]/60">No notifications</p>
                          <p className="text-xs text-[#13262F]/50 mt-1">
                            We'll notify you when something important happens
                          </p>
                        </div>
                      ) : (
                        <div>
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              onClick={(e) => handleNotificationClick(notification)}
                              className={`p-3 border-b border-[#ABD1B5]/10 hover:bg-[#f8faf8] transition-colors cursor-pointer group ${
                                !notification.read ? "bg-[#EDF4ED]/50" : ""
                              }`}
                            >
                              <div className="flex items-start">
                                <div className="flex-shrink-0 mt-0.5 mr-3">
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm text-[#13262F] ${!notification.read ? "font-medium" : ""}`}>
                                    {notification.content}
                                  </p>
                                  <div className="flex items-center mt-0.5">
                                    <p className="text-xs text-[#13262F]/60">{notification.time}</p>
                                    {notification.link && <ExternalLink className="h-3 w-3 ml-1 text-[#13262F]/40" />}
                                  </div>
                                </div>
                                <div className="ml-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {!notification.read && (
                                    <button
                                      onClick={(e) => markAsRead(notification.id, e)}
                                      className="p-0.5 rounded-full hover:bg-[#EDF4ED] text-[#13262F]/50 hover:text-[#79B791]"
                                      aria-label="Mark as read"
                                      title="Mark as read"
                                    >
                                      <Check className="h-3 w-3" />
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => dismissNotification(notification.id, e)}
                                    className="p-0.5 rounded-full hover:bg-[#EDF4ED] text-[#13262F]/50 hover:text-red-500"
                                    aria-label="Dismiss notification"
                                    title="Dismiss"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                                {!notification.read && <div className="ml-2 h-2 w-2 bg-[#79B791] rounded-full"></div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-2 border-t border-[#ABD1B5]/20 bg-[#f8faf8]">
                      <Link
                        href="/notifications"
                        className="block text-center text-xs text-[#79B791] hover:text-[#ABD1B5] font-medium p-1"
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Help */}
              <button className="p-1.5 rounded-md hover:bg-[#79B791]/10 text-[#EDF4ED]/70 hover:text-white transition-colors hidden sm:flex">
                <HelpCircle className="h-5 w-5" />
              </button>
            </>
          )}

          {/* User Authentication */}
          <div className="flex items-center">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={toggleMenu}
                  className="flex items-center space-x-2 py-1.5 px-2.5 rounded-md hover:bg-[#79B791]/10 text-white transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      toggleMenu()
                    }
                  }}
                  tabIndex={0}
                >
                  <div className="w-6 h-6 rounded-full bg-[#79B791] flex items-center justify-center text-white text-xs font-medium">
                    J
                  </div>
                  <span className="text-sm hidden sm:inline">John Doe</span>
                  <ChevronDown
                    className={`h-4 w-4 text-[#EDF4ED]/70 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-[#ABD1B5]/20">
                    <div className="px-4 py-2 border-b border-[#ABD1B5]/20">
                      <p className="text-sm font-medium text-[#13262F]">John Doe</p>
                      <p className="text-xs text-[#13262F]/60">john.doe@example.com</p>
                    </div>
                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-[#13262F] hover:bg-[#EDF4ED] transition-colors"
                    >
                      <Settings className="h-4 w-4 mr-2 text-[#13262F]/70" />
                      Account Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-[#13262F] hover:bg-[#EDF4ED] transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2 text-[#13262F]/70" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="py-1.5 px-3 text-[#EDF4ED]/90 text-sm hover:bg-[#79B791]/10 hover:text-white rounded-md transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="py-1.5 px-3 bg-[#79B791] text-white text-sm rounded-md hover:bg-[#ABD1B5] transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* AI Actions Popup */}
      {isAiActionsOpen && <AiActionsPopup onClose={handleCloseAiActions} />}
      {isMobileMenuOpen && isLoggedIn && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="fixed inset-y-0 left-0 w-64 bg-[#13262F] border-r border-[#79B791]/20 overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#79B791]/20">
              <div className="flex items-center">
                <div className="mr-1 text-[#79B791] font-semibold relative">
                  <span className="inline-block rounded-full bg-[#79B791] text-white px-2 py-0.5">é</span>
                </div>
                <span className="text-white">étude</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-md hover:bg-[#79B791]/10 text-[#EDF4ED]/70"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              <Link
                href="/app"
                className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                  pathname?.startsWith("/app")
                    ? "bg-[#79B791]/20 text-white"
                    : "text-[#EDF4ED]/80 hover:bg-[#79B791]/10 hover:text-white"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/templates"
                className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                  pathname?.startsWith("/templates")
                    ? "bg-[#79B791]/20 text-white"
                    : "text-[#EDF4ED]/80 hover:bg-[#79B791]/10 hover:text-white"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Templates
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
