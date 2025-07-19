"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
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
import { useUndoRedo } from "../hooks/use-undo-redo"
import { useSocket } from "../hooks/use-socket"
import apiClient from "../lib/api"

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
  token?: string
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
  token,
}: EditorProps) {
  const [tags, setTags] = useState<string[]>(initialTags)
  const [newTag, setNewTag] = useState("")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isAiActionsOpen, setIsAiActionsOpen] = useState(false)
  const [aiPosition, setAiPosition] = useState<{ top: number; left: number } | null>(null)
  const [localSaveStatus, setLocalSaveStatus] = useState<SaveStatus>("idle")
  const [selectedText, setSelectedText] = useState("")
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [activeUsers, setActiveUsers] = useState<{[key: string]: any}>({})
  const [userCursors, setUserCursors] = useState<{[key: string]: {position: number, username: string, color: string}}>({})
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())

  // Undo/Redo functionality
  const {
    state: content,
    canUndo,
    canRedo,
    undo,
    redo,
    setDebounced: setContentDebounced,
    set: setContent
  } = useUndoRedo({
    initialState: initialContent,
    maxHistorySize: 100
  })

  // Socket for real-time collaboration
  const socket = useSocket({ token })

  useEffect(() => {
    if (initialContent !== content) {
      setContent(initialContent, false) // Don't add to history
    }
  }, [initialContent, content, setContent])

  useEffect(() => {
    setTags(initialTags)
  }, [initialTags])

  // Handle save status changes
  useEffect(() => {
    const currentStatus = saveStatus || localSaveStatus
    if (currentStatus === "saved") {
      setHasUnsavedChanges(false)
      setShowSaved(true)
      const timer = setTimeout(() => {
        setShowSaved(false)
      }, 2000) // Hide "Saved" message after 2 seconds
      return () => clearTimeout(timer)
    }
  }, [saveStatus, localSaveStatus])

  // Auto-save functionality
  const saveContent = useCallback(async (contentToSave: string) => {
    try {
      setLocalSaveStatus("saving")
      await apiClient.updatePage(pageId, { content: contentToSave })
      setLocalSaveStatus("saved")
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Auto-save failed:', error)
      setLocalSaveStatus("error")
    }
  }, [pageId])

  // Join page for real-time collaboration
  useEffect(() => {
    if (socket.isConnected && pageId) {
      socket.joinPage(pageId)

      // Listen for real-time events
      const handleUserJoined = (data: any) => {
        setActiveUsers(prev => ({
          ...prev,
          [data.user.id]: data.user
        }))
      }

      const handleUserLeft = (data: any) => {
        setActiveUsers(prev => {
          const updated = { ...prev }
          delete updated[data.user.id]
          return updated
        })
        setUserCursors(prev => {
          const updated = { ...prev }
          delete updated[data.user.id]
          return updated
        })
      }

      const handleCursorMoved = (data: any) => {
        if (data.user.id !== socket.socket?.id) {
          setUserCursors(prev => ({
            ...prev,
            [data.user.id]: {
              position: data.cursor.position,
              username: data.user.username,
              color: `hsl(${data.user.id.slice(-6)}, 70%, 50%)`
            }
          }))
        }
      }

      const handleUserTyping = (data: any) => {
        setTypingUsers(prev => {
          const updated = new Set(prev)
          if (data.isTyping) {
            updated.add(data.user.username)
          } else {
            updated.delete(data.user.username)
          }
          return updated
        })
      }

      socket.on('user-joined-page', handleUserJoined)
      socket.on('user-left-page', handleUserLeft)
      socket.on('cursor-moved', handleCursorMoved)
      socket.on('user-typing', handleUserTyping)
      
      return () => {
        socket.leavePage(pageId)
        socket.off('user-joined-page', handleUserJoined)
        socket.off('user-left-page', handleUserLeft)
        socket.off('cursor-moved', handleCursorMoved)
        socket.off('user-typing', handleUserTyping)
      }
    }
  }, [socket.isConnected, pageId, socket])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContentDebounced(newContent) // Use debounced version for typing
    setHasUnsavedChanges(true)
    onChange?.(newContent)
    
    // Send typing indicator
    if (socket.isConnected && pageId) {
      socket.startTyping(pageId)
      
      // Stop typing after 1 second of inactivity
      setTimeout(() => {
        socket.stopTyping(pageId)
      }, 1000)
    }
    
    // Auto-save after 2 seconds of inactivity
    setTimeout(() => saveContent(newContent), 2000)
  }

  // Handle cursor position changes
  const handleCursorMove = useCallback((e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    if (socket.isConnected && pageId && textareaRef) {
      const position = textareaRef.selectionStart
      socket.moveCursor(pageId, { position })
    }
  }, [socket.isConnected, pageId, textareaRef, socket])

  const handleUndo = () => {
    if (canUndo) {
      undo()
      setHasUnsavedChanges(true)
    }
  }

  const handleRedo = () => {
    if (canRedo) {
      redo()
      setHasUnsavedChanges(true)
    }
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

  const uploadImageFile = async (file: File) => {
    try {
      setLocalSaveStatus("saving")
      const response = await apiClient.uploadFile(file)
      if (response.success) {
        // Insert image markdown at cursor position
        const imageMarkdown = `![${file.name}](${response.data.url})\n`
        const newContent = content + imageMarkdown
        setContent(newContent, true) // Add to history
        onChange?.(newContent)
        setLocalSaveStatus("saved")
        // Auto-save
        setTimeout(() => saveContent(newContent), 500)
      }
    } catch (error) {
      console.error('Image upload failed:', error)
      setLocalSaveStatus("error")
    }
  }

  const handleAddImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        await uploadImageFile(file)
      }
    }
    input.click()
  }

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith('image/')) {
        await uploadImageFile(file)
      }
    }
  }, [uploadImageFile])

  const handleAddTag = async () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()]
      setTags(updatedTags)
      setNewTag("")
      setHasUnsavedChanges(true)
      onTagsChange?.(updatedTags)
      
      // Save tag to backend
      try {
        await apiClient.updatePage(pageId, { tags: updatedTags })
      } catch (error) {
        console.error('Failed to save tag:', error)
      }
    }
  }

  const handleTagClick = (tag: string) => {
    console.log("Filter by tag:", tag)
  }

  const handleRemoveTag = async (e: React.MouseEvent, tagToRemove: string) => {
    e.stopPropagation() // Prevent triggering the tag click
    const updatedTags = tags.filter((tag) => tag !== tagToRemove)
    setTags(updatedTags)
    setHasUnsavedChanges(true)
    onTagsChange?.(updatedTags)
    
    // Save updated tags to backend
    try {
      await apiClient.updatePage(pageId, { tags: updatedTags })
    } catch (error) {
      console.error('Failed to remove tag:', error)
    }
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
    // Get selected text from textarea
    if (textareaRef) {
      const start = textareaRef.selectionStart
      const end = textareaRef.selectionEnd
      const selected = content.substring(start, end)
      setSelectedText(selected)
    }
    
    // Get the position of the button to position the popup
    const button = e.currentTarget as HTMLButtonElement
    const rect = button.getBoundingClientRect()
    setAiPosition({ top: rect.bottom + 5, left: rect.left })
    setIsAiActionsOpen(true)
  }

  const handleCloseAiActions = () => {
    setIsAiActionsOpen(false)
    setAiPosition(null)
    setSelectedText("")
  }

  const handleTextReplace = (newText: string) => {
    if (textareaRef) {
      const start = textareaRef.selectionStart
      const end = textareaRef.selectionEnd
      const beforeSelection = content.substring(0, start)
      const afterSelection = content.substring(end)
      const updatedContent = beforeSelection + newText + afterSelection
      
      setContent(updatedContent, true) // Add to history
      onChange?.(updatedContent)
      
      // Auto-save
      setTimeout(() => saveContent(updatedContent), 500)
    }
  }

  // Render save status indicator
  const renderSaveStatus = () => {
    const currentStatus = saveStatus || localSaveStatus
    switch (currentStatus) {
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
      // Handle undo/redo shortcuts
      if ((e.ctrlKey || e.metaKey)) {
        switch (e.key.toLowerCase()) {
          case "z":
            e.preventDefault()
            if (e.shiftKey) {
              handleRedo() // Ctrl+Shift+Z for redo
            } else {
              handleUndo() // Ctrl+Z for undo
            }
            break
          case "y":
            e.preventDefault()
            handleRedo() // Ctrl+Y for redo
            break
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
            saveContent(content)
            break
          case "/":
            e.preventDefault()
            // Show command palette (could be implemented later)
            console.log("Command palette requested")
            break
        }
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
    <div 
      className={`h-full w-full bg-white text-[#13262F] rounded-md shadow-sm overflow-hidden flex flex-col relative ${
        dragActive ? "border-2 border-dashed border-[#79B791] bg-[#EDF4ED]" : ""
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {dragActive && (
        <div className="absolute inset-0 bg-[#79B791]/10 border-2 border-dashed border-[#79B791] rounded-lg flex items-center justify-center z-20">
          <div className="text-center">
            <ImagePlus className="h-12 w-12 mx-auto text-[#79B791] mb-2" />
            <p className="text-[#79B791] font-medium">Drop image here to upload</p>
          </div>
        </div>
      )}
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
            disabled={!canUndo}
            className={`p-1.5 rounded-md transition-colors group ${
              canUndo 
                ? "hover:bg-[#ABD1B5]/10 cursor-pointer" 
                : "cursor-not-allowed opacity-40"
            }`}
            aria-label="Undo"
            title="Undo (Ctrl+Z)"
          >
            <Undo className={`h-4 w-4 ${canUndo ? "text-[#13262F]/70 group-hover:text-[#13262F]" : "text-[#13262F]/30"}`} />
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-md transition-colors group ${
              canRedo 
                ? "hover:bg-[#ABD1B5]/10 cursor-pointer" 
                : "cursor-not-allowed opacity-40"
            }`}
            aria-label="Redo"
            title="Redo (Ctrl+Y)"
          >
            <Redo className={`h-4 w-4 ${canRedo ? "text-[#13262F]/70 group-hover:text-[#13262F]" : "text-[#13262F]/30"}`} />
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

      <div className="flex-1 relative">
        <textarea
          ref={setTextareaRef}
          value={content}
          onChange={handleChange}
          onSelect={handleCursorMove}
          onClick={handleCursorMove}
          onKeyUp={handleCursorMove}
          className="w-full h-full p-4 text-[#13262F] bg-white resize-none focus:outline-none focus:ring-0 border-0"
          placeholder="Type '/' for commands"
          aria-label={`Edit ${title}`}
          aria-describedby={saveStatus === "error" ? "save-error" : undefined}
        />
        
        {/* Active users indicator */}
        {Object.keys(activeUsers).length > 0 && (
          <div className="absolute top-2 right-2 flex space-x-1">
            {Object.values(activeUsers).map((user: any) => (
              <div
                key={user.id}
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-medium"
                style={{ backgroundColor: `hsl(${user.id.slice(-6)}, 70%, 50%)` }}
                title={user.username}
              >
                {user.username[0].toUpperCase()}
              </div>
            ))}
          </div>
        )}
        
        {/* Typing indicator */}
        {typingUsers.size > 0 && (
          <div className="absolute bottom-2 left-4 text-xs text-[#13262F]/60">
            {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
          </div>
        )}
      </div>

      {isShareModalOpen && <ShareModal pageId={pageId} onClose={handleCloseShareModal} />}
      {isAiActionsOpen && (
        <AiActionsPopup 
          onClose={handleCloseAiActions} 
          position={aiPosition} 
          selectedText={selectedText}
          onTextReplace={handleTextReplace}
        />
      )}
    </div>
  )
}
