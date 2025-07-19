"use client"

import {
  X,
  Sparkles,
  CheckCircle,
  Languages,
  Heading,
  FileText,
  Calendar,
  Brain,
  Wand2,
  MessageSquarePlus,
} from "lucide-react"
import { useState } from "react"
import apiClient from "../lib/api"

interface AiActionsPopupProps {
  onClose: () => void
  position?: { top: number; left: number } | null
  selectedText?: string
  onTextReplace?: (newText: string) => void
}

export default function AiActionsPopup({ onClose, position = null, selectedText = "", onTextReplace }: AiActionsPopupProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAction = async (action: string) => {
    if (!selectedText.trim()) {
      setError("Please select some text first")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      let response
      switch (action) {
        case "Smart Writing":
          response = await apiClient.completeText(selectedText)
          if (response.success && onTextReplace) {
            onTextReplace(response.data.fullText)
          }
          break
        case "Check Grammar":
          response = await apiClient.checkGrammar(selectedText)
          if (response.success && onTextReplace) {
            onTextReplace(response.data.correctedText)
          }
          break
        case "Translate":
          response = await apiClient.translateText(selectedText, "Turkish")
          if (response.success && onTextReplace) {
            onTextReplace(response.data.translatedText)
          }
          break
        case "Suggest Title":
          response = await apiClient.suggestTitle(selectedText)
          if (response.success && onTextReplace) {
            onTextReplace(response.data.suggestedTitle)
          }
          break
        case "Calendar Sync":
          response = await apiClient.calendarSync(selectedText)
          if (response.success) {
            // You could implement a calendar component here
            console.log('Calendar events extracted:', response.data.calendarData)
            alert(`Found ${response.data.calendarData?.events?.length || 0} calendar events`)
          }
          break
        default:
          console.log(`Action not implemented: ${action}`)
      }
      onClose()
    } catch (error) {
      console.error(`AI Action failed: ${action}`, error)
      setError("AI service is currently unavailable")
    } finally {
      setIsLoading(false)
    }
  }

  // If position is provided, use it for absolute positioning
  // Otherwise, center the popup as a modal
  const positionStyles = position ? { top: `${position.top}px`, left: `${position.left}px` } : {}

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${position ? "" : "bg-black/30"}`}
      onClick={(e) => {
        // Close when clicking outside the popup
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className={`bg-white rounded-lg shadow-lg overflow-hidden ${position ? "absolute" : "max-w-md w-full"}`}
        style={positionStyles}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#ABD1B5]/30">
          <div className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-[#79B791]" />
            <h2 className="text-lg font-medium text-[#13262F]">AI Assistant</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#ABD1B5]/20 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-[#13262F]" />
          </button>
        </div>

        <div className="p-2">
          <div className="p-3 mb-2 bg-[#EDF4ED] rounded-md">
            <p className="text-sm text-[#13262F]/80">
              {selectedText.trim() ? "What would you like AI to help you with?" : "Select some text first"}
            </p>
            {error && (
              <p className="text-sm text-red-600 mt-1">{error}</p>
            )}
          </div>

          <ul className="divide-y divide-[#ABD1B5]/30">
            <li>
              <button
                onClick={() => handleAction("Smart Writing")}
                disabled={isLoading || !selectedText.trim()}
                className={`flex items-center w-full p-3 text-left rounded-md transition-colors ${
                  isLoading || !selectedText.trim() 
                    ? "opacity-50 cursor-not-allowed" 
                    : "hover:bg-[#ABD1B5]/10"
                }`}
              >
                <Wand2 className="h-5 w-5 mr-3 text-[#79B791]" />
                <div>
                  <p className="font-medium text-[#13262F]">Complete Text</p>
                  <p className="text-sm text-[#13262F]/70">Let AI complete or improve your writing</p>
                </div>
              </button>
            </li>

            <li>
              <button
                onClick={() => handleAction("Check Grammar")}
                className="flex items-center w-full p-3 text-left hover:bg-[#ABD1B5]/10 rounded-md transition-colors"
              >
                <CheckCircle className="h-5 w-5 mr-3 text-[#79B791]" />
                <div>
                  <p className="font-medium text-[#13262F]">Grammar Check</p>
                  <p className="text-sm text-[#13262F]/70">Fix spelling and grammar issues</p>
                </div>
              </button>
            </li>

            <li>
              <button
                onClick={() => handleAction("Translate")}
                className="flex items-center w-full p-3 text-left hover:bg-[#ABD1B5]/10 rounded-md transition-colors"
              >
                <Languages className="h-5 w-5 mr-3 text-[#79B791]" />
                <div>
                  <p className="font-medium text-[#13262F]">Translate</p>
                  <p className="text-sm text-[#13262F]/70">Translate your text to different languages</p>
                </div>
              </button>
            </li>

            <li>
              <button
                onClick={() => handleAction("Suggest Title")}
                className="flex items-center w-full p-3 text-left hover:bg-[#ABD1B5]/10 rounded-md transition-colors"
              >
                <Heading className="h-5 w-5 mr-3 text-[#79B791]" />
                <div>
                  <p className="font-medium text-[#13262F]">Suggest Title</p>
                  <p className="text-sm text-[#13262F]/70">Generate titles based on your content</p>
                </div>
              </button>
            </li>

            <li>
              <button
                onClick={() => handleAction("Summarize")}
                className="flex items-center w-full p-3 text-left hover:bg-[#ABD1B5]/10 rounded-md transition-colors"
              >
                <Brain className="h-5 w-5 mr-3 text-[#79B791]" />
                <div>
                  <p className="font-medium text-[#13262F]">Summarize</p>
                  <p className="text-sm text-[#13262F]/70">Create a concise summary of your text</p>
                </div>
              </button>
            </li>

            <li>
              <button
                onClick={() => handleAction("Chat")}
                className="flex items-center w-full p-3 text-left hover:bg-[#ABD1B5]/10 rounded-md transition-colors"
              >
                <MessageSquarePlus className="h-5 w-5 mr-3 text-[#79B791]" />
                <div>
                  <p className="font-medium text-[#13262F]">Ask AI</p>
                  <p className="text-sm text-[#13262F]/70">Chat with AI about anything</p>
                </div>
              </button>
            </li>

            <li>
              <button
                onClick={() => handleAction("OCR Image")}
                className="flex items-center w-full p-3 text-left hover:bg-[#ABD1B5]/10 rounded-md transition-colors"
              >
                <FileText className="h-5 w-5 mr-3 text-[#79B791]" />
                <div>
                  <p className="font-medium text-[#13262F]">Extract Text from Image</p>
                  <p className="text-sm text-[#13262F]/70">Extract text from images (OCR)</p>
                </div>
              </button>
            </li>

            <li>
              <button
                onClick={() => handleAction("Calendar Sync")}
                className="flex items-center w-full p-3 text-left hover:bg-[#ABD1B5]/10 rounded-md transition-colors"
              >
                <Calendar className="h-5 w-5 mr-3 text-[#79B791]" />
                <div>
                  <p className="font-medium text-[#13262F]">Calendar Sync</p>
                  <p className="text-sm text-[#13262F]/70">Add dates from your notes to your calendar</p>
                </div>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
