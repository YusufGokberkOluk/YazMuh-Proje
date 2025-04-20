"use client"

import type React from "react"

import { useState } from "react"
import { X, Copy, Users, Link, Globe, Lock } from "lucide-react"

interface ShareModalProps {
  pageId: string
  onClose: () => void
}

type AccessLevel = "restricted" | "view" | "edit"

export default function ShareModal({ pageId, onClose }: ShareModalProps) {
  const [email, setEmail] = useState("")
  const [accessLevel, setAccessLevel] = useState<AccessLevel>("view")
  const shareLink = `https://example.com/share/${pageId}`

  const handleInvite = () => {
    if (email.trim()) {
      console.log("Invite user:", email, "to page:", pageId)
      setEmail("")
    }
  }

  const handleCopyLink = () => {
    console.log("Copy share link for page:", pageId)
    // In a real implementation, this would copy the link to clipboard
    // navigator.clipboard.writeText(shareLink)
  }

  const handleAccessChange = (level: AccessLevel) => {
    setAccessLevel(level)
    console.log("Set link access to:", level, "for page:", pageId)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleInvite()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#EDF4ED] rounded-lg shadow-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#13262F]">Share</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[#ABD1B5]/20" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Share with people */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-[#13262F] mb-2 flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Share with people
          </h3>
          <div className="flex">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter email address"
              className="flex-1 px-3 py-2 border border-[#ABD1B5] rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#79B791] focus:border-transparent"
            />
            <button
              onClick={handleInvite}
              disabled={!email.trim()}
              className="px-4 py-2 bg-[#79B791] text-white rounded-r-md hover:bg-[#ABD1B5] disabled:opacity-50 disabled:hover:bg-[#79B791] transition-colors"
            >
              Invite
            </button>
          </div>
        </div>

        {/* General access */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-[#13262F] mb-2 flex items-center">
            <Link className="h-4 w-4 mr-2" />
            General access
          </h3>
          <div className="flex items-center justify-between p-3 bg-white rounded-md border border-[#ABD1B5] mb-4">
            <span className="text-sm text-[#13262F] truncate flex-1">{shareLink}</span>
            <button
              onClick={handleCopyLink}
              className="ml-2 p-1.5 rounded hover:bg-[#ABD1B5]/20 transition-colors"
              aria-label="Copy link"
              title="Copy link"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2 p-2 rounded hover:bg-[#ABD1B5]/10 cursor-pointer">
              <input
                type="radio"
                name="access"
                checked={accessLevel === "restricted"}
                onChange={() => handleAccessChange("restricted")}
                className="h-4 w-4 text-[#79B791] border-[#ABD1B5] focus:ring-[#79B791]"
              />
              <div className="flex items-center">
                <Lock className="h-4 w-4 mr-2 text-[#13262F]" />
                <div>
                  <p className="text-sm font-medium text-[#13262F]">Restricted</p>
                  <p className="text-xs text-[#13262F]/70">Only people you invite can access</p>
                </div>
              </div>
            </label>

            <label className="flex items-center space-x-2 p-2 rounded hover:bg-[#ABD1B5]/10 cursor-pointer">
              <input
                type="radio"
                name="access"
                checked={accessLevel === "view"}
                onChange={() => handleAccessChange("view")}
                className="h-4 w-4 text-[#79B791] border-[#ABD1B5] focus:ring-[#79B791]"
              />
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-2 text-[#13262F]" />
                <div>
                  <p className="text-sm font-medium text-[#13262F]">Anyone with the link can view</p>
                  <p className="text-xs text-[#13262F]/70">Anyone with the link can view this page</p>
                </div>
              </div>
            </label>

            <label className="flex items-center space-x-2 p-2 rounded hover:bg-[#ABD1B5]/10 cursor-pointer">
              <input
                type="radio"
                name="access"
                checked={accessLevel === "edit"}
                onChange={() => handleAccessChange("edit")}
                className="h-4 w-4 text-[#79B791] border-[#ABD1B5] focus:ring-[#79B791]"
              />
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-2 text-[#13262F]" />
                <div>
                  <p className="text-sm font-medium text-[#13262F]">Anyone with the link can edit</p>
                  <p className="text-xs text-[#13262F]/70">Anyone with the link can edit this page</p>
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#79B791] text-white rounded-md hover:bg-[#ABD1B5] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
