"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  AlignLeft,
  Plus,
  X,
  Check,
  AlertCircle,
  ImagePlus,
  Undo,
  Redo,
  Share2,
  Sparkles,
  ListOrdered,
  ListChecks,
  Link,
  Code,
  Keyboard,
} from "lucide-react"
import ShareModal from "./share-modal"
import AiActionsPopup from "./ai-actions-popup"

// Create a simple Tooltip component at the top of the file
function Tooltip({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-[#13262F] text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        {label}
      </div>
    </div>
  )
}

type SaveStatus = "idle" | "saving" | "saved" | "error"

interface EditorProps {
  title: string
  pageId: string
  initialContent?: string
  initialTags?: string[]
  saveStatus?: SaveStatus
  onChange?: (content: string) => void
  onTagsChange?: (tags: string[]) => void
  loading?: boolean
}

export default function Editor({
  title,
  pageId,
  initialContent = "",
  initialTags = [],
  saveStatus = "idle",
  onChange,
  onTagsChange,
  loading = false,
}: EditorProps) {
  const [content, setContent] = useState(initialContent)
  const [tags, setTags] = useState<string[]>(initialTags)
  const [newTag, setNewTag] = useState("")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isAiActionsOpen, setIsAiActionsOpen] = useState(false)
  const [aiPosition, setAiPosition] = useState<{ top: number; left: number } | null>(null)

  useEffect(() => {
    setContent(initialContent)
  }, [initialContent])

  useEffect(() => {
    setTags(initialTags)
  }, [initialTags])

  // Handle save status changes
  useEffect(() => {
    if (saveStatus === "saved") {
      setHasUnsavedChanges(false)
      setShowSaved(true)
      const timer = setTimeout(() => {
        setShowSaved(false)
      }, 2000) // Hide "Saved" message after 2 seconds
      return () => clearTimeout(timer)
    }
  }, [saveStatus])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    setHasUnsavedChanges(true)
    onChange?.(newContent)
  }

  const handleUndo = () => {
    console.log("Undo action")
  }

  const handleRedo = () => {
    console.log("Redo action")
  }

  const handleBold = () => {
    console.log("Apply Bold style")
  }

  const handleItalic = () => {
    console.log("Apply Italic style")
  }

  const handleH1 = () => {
    console.log("Apply H1 style")
  }

  const handleH2 = () => {
    console.log("Apply H2 style")
  }

  const handleParagraph = () => {
    console.log("Apply Paragraph style")
  }

  const handleAddImage = () => {
    console.log("Open image uploader")
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()]
      setTags(updatedTags)
      setNewTag("")
      setHasUnsavedChanges(true)
      console.log("Add tag:", newTag.trim())
      onTagsChange?.(updatedTags)
    }
  }

  const handleTagClick = (tag: string) => {
    console.log("Filter by tag:", tag)
  }

  const handleRemoveTag = (e: React.MouseEvent, tagToRemove: string) => {
    e.stopPropagation() // Prevent triggering the tag click
    const updatedTags = tags.filter((tag) => tag !== tagToRemove)
    setTags(updatedTags)
    setHasUnsavedChanges(true)
    console.log("Remove tag:", tagToRemove)
    onTagsChange?.(updatedTags)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleShare = () => {
    console.log("Open Share Modal for page:", pageId)
    setIsShareModalOpen(true)
  }

  const handleCloseShareModal = () => {
    setIsShareModalOpen(false)
  }

  const handleOpenAiActions = (e: React.MouseEvent) => {
    console.log("Open AI Actions for page:", pageId)
    // Get the position of the button to position the popup
    const button = e.currentTarget as HTMLButtonElement
    const rect = button.getBoundingClientRect()
    setAiPosition({ top: rect.bottom + 5, left: rect.left })
    setIsAiActionsOpen(true)
  }

  const handleCloseAiActions = () => {
    setIsAiActionsOpen(false)
    setAiPosition(null)
  }

  // Render save status indicator
  const renderSaveStatus = () => {
    switch (saveStatus) {
      case "saving":
        return (
          <div className="flex items-center text-blue-400 text-xs">
            <span className="animate-pulse">Saving...</span>
          </div>
        )
      case "saved":
        return showSaved ? (
          <div className="flex items-center text-[#79B791] text-xs">
            <Check className="h-3.5 w-3.5 mr-1" />
            <span>Saved</span>
          </div>
        ) : null
      case "error":
        return (
          <div className="flex items-center text-red-400 text-xs">
            <AlertCircle className="h-3.5 w-3.5 mr-1" />
            <span>Error saving</span>
          </div>
        )
      case "idle":
        return hasUnsavedChanges ? (
          <div className="flex items-center text-[#13262F]/50 text-xs">
            <span>Unsaved changes</span>
          </div>
        ) : null
      default:
        return null
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard shortcuts with modifier keys
      if (!(e.ctrlKey || e.metaKey)) return

      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault()
          handleBold()
          break
        case "i":
          e.preventDefault()
          handleItalic()
          break
        case "s":
          e.preventDefault()
          // Save action
          onChange?.(content)
          break
        case "/":
          e.preventDefault()
          // Show command palette (could be implemented later)
          console.log("Command palette requested")
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [content, onChange])

  // Add this inside the Editor component
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        const message = "You have unsaved changes. Are you sure you want to leave?"
        e.returnValue = message
        return message
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  return (
    <div className="h-full w-full bg-white text-[#13262F] rounded-md shadow-sm overflow-hidden flex flex-col">
      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-[#79B791] border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-sm text-[#13262F]/70">Loading document...</p>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#ABD1B5]/20">
        <input
          type="text"
          value={title}
          readOnly
          className="text-xl font-medium bg-transparent border-none focus:outline-none w-full"
          placeholder="Untitled"
        />
        <div className="flex items-center space-x-3">
          <div className="text-sm font-medium">{renderSaveStatus()}</div>
          {saveStatus === "error" && (
            <div id="save-error" className="sr-only">
              There was an error saving your changes. Please try again.
            </div>
          )}
          <button
            onClick={handleShare}
            className="flex items-center px-2.5 py-1 bg-[#79B791]/10 text-[#79B791] rounded-md hover:bg-[#79B791]/20 transition-colors"
          >
            <Share2 className="h-3.5 w-3.5 mr-1.5" />
            <span className="text-sm">Share</span>
          </button>
        </div>
      </div>

      {/* Tags Section */}
      <div className="px-4 py-2 border-b border-[#ABD1B5]/20">
        <div className="flex flex-wrap items-center gap-1.5">
          {tags.map((tag) => (
            <div
              key={tag}
              onClick={() => handleTagClick(tag)}
              className="flex items-center bg-[#EDF4ED] text-[#13262F] text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-[#ABD1B5]/20 transition-colors"
            >
              <span>{tag}</span>
              <button
                onClick={(e) => handleRemoveTag(e, tag)}
                className="ml-1 rounded-full hover:bg-[#13262F]/10 p-0.5"
                aria-label={`Remove ${tag} tag`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <div className="flex items-center">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add tag..."
              className="bg-transparent text-[#13262F] text-xs px-2 py-1 border border-transparent focus:border-[#ABD1B5]/30 rounded-md focus:outline-none focus:ring-0 w-20 sm:w-24"
            />
            <button
              onClick={handleAddTag}
              disabled={!newTag.trim()}
              className="flex items-center justify-center text-[#79B791] p-1 rounded-md hover:bg-[#79B791]/10 disabled:opacity-50 disabled:hover:bg-transparent"
              aria-label="Add tag"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center px-4 py-1.5 border-b border-[#ABD1B5]/20">
        <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
          {/* Undo/Redo Buttons */}
          <button
            onClick={handleUndo}
            className="p-1.5 rounded-md hover:bg-[#ABD1B5]/10 transition-colors group"
            aria-label="Undo"
            title="Undo"
          >
            <Undo className="h-4 w-4 text-[#13262F]/70 group-hover:text-[#13262F]" />
          </button>
          <button
            onClick={handleRedo}
            className="p-1.5 rounded-md hover:bg-[#ABD1B5]/10 transition-colors group"
            aria-label="Redo"
            title="Redo"
          >
            <Redo className="h-4 w-4 text-[#13262F]/70 group-hover:text-[#13262F]" />
          </button>

          <div className="h-5 w-px bg-[#ABD1B5]/30 mx-1"></div>

          {/* Text Formatting Buttons */}
          <Tooltip label="Bold (Ctrl+B)">
            <button
              onClick={handleBold}
              className="p-1.5 rounded-md hover:bg-[#ABD1B5]/10 transition-colors"
              aria-label="Bold"
            >
              <Bold className="h-4 w-4 text-[#13262F]/70" />
            </button>
          </Tooltip>
          <Tooltip label="Italic (Ctrl+I)">
            <button
              onClick={handleItalic}
              className="p-1.5 rounded-md hover:bg-[#ABD1B5]/10 transition-colors group"
              aria-label="Italic"
              title="Italic"
            >
              <Italic className="h-4 w-4 text-[#13262F]/70 group-hover:text-[#13262F]" />
            </button>
          </Tooltip>
          <button
            onClick={() => console.log("Add link")}
            className="p-1.5 rounded-md hover:bg-[#ABD1B5]/10 transition-colors group"
            aria-label="Add Link"
            title="Add Link"
          >
            <Link className="h-4 w-4 text-[#13262F]/70 group-hover:text-[#13262F]" />
          </button>
          <button
            onClick={() => console.log("Add code")}
            className="p-1.5 rounded-md hover:bg-[#ABD1B5]/10 transition-colors group"
            aria-label="Add Code"
            title="Add Code"
          >
            <Code className="h-4 w-4 text-[#13262F]/70 group-hover:text-[#13262F]" />
          </button>

          <div className="h-5 w-px bg-[#ABD1B5]/30 mx-1"></div>

          {/* Heading Buttons */}
          <button
            onClick={handleH1}
            className="p-1.5 rounded-md hover:bg-[#ABD1B5]/10 transition-colors group flex items-center"
            aria-label="Heading 1"
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4 text-[#13262F]/70 group-hover:text-[#13262F]" />
          </button>
          <button
            onClick={handleH2}
            className="p-1.5 rounded-md hover:bg-[#ABD1B5]/10 transition-colors group flex items-center"
            aria-label="Heading 2"
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4 text-[#13262F]/70 group-hover:text-[#13262F]" />
          </button>
          <button
            onClick={handleParagraph}
            className="p-1.5 rounded-md hover:bg-[#ABD1B5]/10 transition-colors group flex items-center"
            aria-label="Paragraph"
            title="Paragraph"
          >
            <AlignLeft className="h-4 w-4 text-[#13262F]/70 group-hover:text-[#13262F]" />
          </button>

          <div className="h-5 w-px bg-[#ABD1B5]/30 mx-1"></div>

          {/* Lists */}
          <button
            onClick={() => console.log("Add ordered list")}
            className="p-1.5 rounded-md hover:bg-[#ABD1B5]/10 transition-colors group flex items-center"
            aria-label="Ordered List"
            title="Ordered List"
          >
            <ListOrdered className="h-4 w-4 text-[#13262F]/70 group-hover:text-[#13262F]" />
          </button>
          <button
            onClick={() => console.log("Add checklist")}
            className="p-1.5 rounded-md hover:bg-[#ABD1B5]/10 transition-colors group flex items-center"
            aria-label="Checklist"
            title="Checklist"
          >
            <ListChecks className="h-4 w-4 text-[#13262F]/70 group-hover:text-[#13262F]" />
          </button>

          <div className="h-5 w-px bg-[#ABD1B5]/30 mx-1"></div>

          {/* Media Buttons */}
          <button
            onClick={handleAddImage}
            className="p-1.5 rounded-md hover:bg-[#ABD1B5]/10 transition-colors group flex items-center"
            aria-label="Add Image"
            title="Add Image"
          >
            <ImagePlus className="h-4 w-4 text-[#13262F]/70 group-hover:text-[#13262F]" />
          </button>

          <div className="h-5 w-px bg-[#ABD1B5]/30 mx-1"></div>

          {/* AI Actions Button */}
          <button
            onClick={handleOpenAiActions}
            className="p-1.5 rounded-md hover:bg-[#ABD1B5]/10 transition-colors group flex items-center"
            aria-label="AI Actions"
            title="AI Actions"
          >
            <Sparkles className="h-4 w-4 text-[#79B791] group-hover:text-[#13262F]" />
          </button>

          <div className="h-5 w-px bg-[#ABD1B5]/30 mx-1"></div>
          <button
            onClick={() => console.log("Show keyboard shortcuts")}
            className="p-1.5 rounded-md hover:bg-[#ABD1B5]/10 transition-colors flex items-center"
            aria-label="Keyboard Shortcuts"
            title="Keyboard Shortcuts"
          >
            <Keyboard className="h-4 w-4 text-[#13262F]/70" />
          </button>
        </div>
      </div>

      <textarea
        value={content}
        onChange={handleChange}
        className="flex-1 w-full p-4 text-[#13262F] bg-white resize-none focus:outline-none focus:ring-0 border-0"
        placeholder="Type '/' for commands"
        aria-label={`Edit ${title}`}
        aria-describedby={saveStatus === "error" ? "save-error" : undefined}
      />

      {isShareModalOpen && <ShareModal pageId={pageId} onClose={handleCloseShareModal} />}
      {isAiActionsOpen && <AiActionsPopup onClose={handleCloseAiActions} position={aiPosition} />}
    </div>
  )
}
