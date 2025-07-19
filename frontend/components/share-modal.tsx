"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Copy, Users, Link, Globe, Lock, Check } from "lucide-react"
import apiClient from "../lib/api"

interface ShareModalProps {
  pageId: string
  onClose: () => void
}

type AccessLevel = "restricted" | "view" | "edit"

export default function ShareModal({ pageId, onClose }: ShareModalProps) {
  const [email, setEmail] = useState("")
  const [accessLevel, setAccessLevel] = useState<AccessLevel>("view")
  const [shareLink, setShareLink] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [error, setError] = useState("")
  const [invitedUsers, setInvitedUsers] = useState<any[]>([])

  // Load page share settings
  useEffect(() => {
    const loadPageData = async () => {
      try {
        const response = await apiClient.getPage(pageId)
        if (response.success) {
          const page = response.data
          setShareLink(page.permissions?.shareLink 
            ? `${window.location.origin}/shared/${pageId}?token=${page.permissions.shareLink}`
            : "")
          setInvitedUsers(page.permissions?.invitedUsers || [])
        }
      } catch (error) {
        console.error('Failed to load page data:', error)
      }
    }
    loadPageData()
  }, [pageId])

  const handleInvite = async () => {
    if (!email.trim()) return
    
    setIsLoading(true)
    setError("")
    
    try {
      const response = await apiClient.sharePage(pageId, { 
        email: email.trim(), 
        role: accessLevel === "edit" ? "editor" : "viewer" 
      })
      
      if (response.success) {
        setInvitedUsers(response.data)
        setEmail("")
      }
    } catch (error: any) {
      setError(error.message || "Failed to invite user")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLink = async () => {
    if (!shareLink) {
      // Generate share link first
      try {
        setIsLoading(true)
        const response = await apiClient.updatePage(pageId, { 
          permissions: { publicAccess: "read-only" } 
        })
        
        if (response.success && response.data.permissions?.shareLink) {
          const newLink = `${window.location.origin}/shared/${pageId}?token=${response.data.permissions.shareLink}`
          setShareLink(newLink)
          await navigator.clipboard.writeText(newLink)
          setCopySuccess(true)
          setTimeout(() => setCopySuccess(false), 2000)
        }
      } catch (error) {
        setError("Failed to generate share link")
      } finally {
        setIsLoading(false)
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareLink)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      } catch (error) {
        setError("Failed to copy link")
      }
    }
  }

  const handleAccessChange = async (level: AccessLevel) => {
    setAccessLevel(level)
    
    try {
      setIsLoading(true)
      const publicAccess = level === "restricted" ? "none" : "read-only"
      await apiClient.updatePage(pageId, { 
        permissions: { publicAccess } 
      })
    } catch (error) {
      setError("Failed to update access level")
    } finally {
      setIsLoading(false)
    }
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
              disabled={!email.trim() || isLoading}
              className="px-4 py-2 bg-[#79B791] text-white rounded-r-md hover:bg-[#ABD1B5] disabled:opacity-50 disabled:hover:bg-[#79B791] transition-colors"
            >
              {isLoading ? "Inviting..." : "Invite"}
            </button>
          </div>
          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}
        </div>

        {/* Invited Users */}
        {invitedUsers.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-[#13262F] mb-2">Invited Users</h4>
            <div className="space-y-2">
              {invitedUsers.map((user: any) => (
                <div key={user.user._id} className="flex items-center justify-between p-2 bg-white rounded border border-[#ABD1B5]/30">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-[#79B791] text-white rounded-full flex items-center justify-center text-xs">
                      {user.user.username[0].toUpperCase()}
                    </div>
                    <span className="ml-2 text-sm text-[#13262F]">{user.user.email}</span>
                  </div>
                  <span className="text-xs text-[#13262F]/70 capitalize">{user.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}

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
              disabled={isLoading}
              className={`ml-2 p-1.5 rounded transition-colors ${
                copySuccess 
                  ? "text-green-600" 
                  : "hover:bg-[#ABD1B5]/20"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              aria-label={copySuccess ? "Copied!" : "Copy link"}
              title={copySuccess ? "Copied!" : "Copy link"}
            >
              {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
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
