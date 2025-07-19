"use client"

import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import Sidebar from "./sidebar"
import Editor from "./editor"

type SaveStatus = "idle" | "saving" | "saved" | "error"

interface Page {
  id: string
  title: string
  isFavorite: boolean
  content: string
  tags: string[]
}

export default function AppLayout() {
  // Sample data with content and tags included
  const [pages, setPages] = useState<Page[]>([
    {
      id: "1",
      title: "Ana Sayfa",
      isFavorite: true,
      content: "Bu ana sayfa içeriğidir. Buraya önemli notlar ekleyebilirsiniz.",
      tags: ["home", "important"],
    },
    {
      id: "2",
      title: "Proje Notları",
      isFavorite: false,
      content: "Proje notları burada görüntülenecek. Projelerinizle ilgili tüm detayları burada tutabilirsiniz.",
      tags: ["project", "work"],
    },
    {
      id: "3",
      title: "Günlük Plan",
      isFavorite: true,
      content: "Günlük planınızı buraya yazabilirsiniz. Yapılacaklar listesi ve programınızı düzenleyin.",
      tags: ["daily", "todo"],
    },
  ])

  const [selectedPageId, setSelectedPageId] = useState("1")
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const [saveTimer, setSaveTimer] = useState<NodeJS.Timeout | null>(null)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Find the currently selected page
  const selectedPage = pages.find((page) => page.id === selectedPageId) || pages[0]

  // Simulate auto-save functionality
  const triggerSave = () => {
    // Clear any existing timer
    if (saveTimer) {
      clearTimeout(saveTimer)
    }

    // Set a new timer to save after a delay
    const timer = setTimeout(() => {
      setSaveStatus("saving")

      // Simulate API call delay
      setTimeout(() => {
        // Simulate successful save 95% of the time
        if (Math.random() > 0.05) {
          setSaveStatus("saved")
        } else {
          setSaveStatus("error")
        }
      }, 1000)
    }, 500)

    setSaveTimer(timer)
    setSaveStatus("idle")
  }

  // Handle navigation between pages
  const handleNavigate = (pageId: string) => {
    setSelectedPageId(pageId)
  }

  // Handle toggling favorite status
  const handleToggleFavorite = (pageId: string) => {
    setPages(pages.map((page) => (page.id === pageId ? { ...page, isFavorite: !page.isFavorite } : page)))
  }

  // Handle content changes
  const handleContentChange = (newContent: string) => {
    setPages(pages.map((page) => (page.id === selectedPageId ? { ...page, content: newContent } : page)))
    triggerSave()
  }

  // Handle tags changes
  const handleTagsChange = (newTags: string[]) => {
    setPages(pages.map((page) => (page.id === selectedPageId ? { ...page, tags: newTags } : page)))
    triggerSave()
  }

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimer) {
        clearTimeout(saveTimer)
      }
    }
  }, [saveTimer])

  // Update the return statement to handle mobile responsiveness better
  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Mobile Header */}
      <div className="md:hidden bg-[#13262F] text-white p-4 flex items-center justify-between">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 hover:bg-white/10 rounded-md"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold truncate">{selectedPage.title}</h1>
        <div className="w-9" /> {/* Spacer for alignment */}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            pages={pages}
            selectedPageId={selectedPageId}
            onNavigate={handleNavigate}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div 
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-[#13262F] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-[#79B791]/20">
                <h2 className="text-lg font-semibold text-white">Menu</h2>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-md text-white"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <Sidebar
                pages={pages}
                selectedPageId={selectedPageId}
                onNavigate={(pageId) => {
                  handleNavigate(pageId);
                  setIsMobileSidebarOpen(false);
                }}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-[#f8faf8]">
          <div className="p-2 md:p-4">
            <Editor
              title={selectedPage.title}
              pageId={selectedPage.id}
              initialContent={selectedPage.content}
              initialTags={selectedPage.tags}
              saveStatus={saveStatus}
              onChange={handleContentChange}
              onTagsChange={handleTagsChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
