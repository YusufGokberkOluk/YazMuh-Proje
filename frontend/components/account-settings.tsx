"use client"

import { useState } from "react"

export default function AccountSettings() {
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleDeleteRequest = () => {
    console.log("Request delete account confirmation")
    setShowConfirmation(true)
  }

  const handleCancelDelete = () => {
    setShowConfirmation(false)
  }

  const handleConfirmDelete = () => {
    console.log("Account deletion confirmed")
    setShowConfirmation(false)
    // In a real app, this would call an API to delete the account
  }

  return (
    <div className="min-h-screen bg-[#EDF4ED] text-[#13262F] p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

        {/* Profile Information */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                defaultValue="John Doe"
                className="w-full px-3 py-2 border border-[#ABD1B5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#79B791]"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                defaultValue="john.doe@example.com"
                className="w-full px-3 py-2 border border-[#ABD1B5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#79B791]"
              />
            </div>
          </div>
        </section>

        {/* Account Preferences */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Account Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="darkMode"
                defaultChecked
                className="h-4 w-4 text-[#79B791] border-[#ABD1B5] rounded focus:ring-[#79B791]"
              />
              <label htmlFor="darkMode" className="ml-2 block text-sm">
                Enable Dark Mode
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoSave"
                defaultChecked
                className="h-4 w-4 text-[#79B791] border-[#ABD1B5] rounded focus:ring-[#79B791]"
              />
              <label htmlFor="autoSave" className="ml-2 block text-sm">
                Auto-save notes while typing
              </label>
            </div>
          </div>
        </section>

        {/* Notification Settings */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="emailNotifications"
                defaultChecked
                className="h-4 w-4 text-[#79B791] border-[#ABD1B5] rounded focus:ring-[#79B791]"
              />
              <label htmlFor="emailNotifications" className="ml-2 block text-sm">
                Email Notifications
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="reminderNotifications"
                className="h-4 w-4 text-[#79B791] border-[#ABD1B5] rounded focus:ring-[#79B791]"
              />
              <label htmlFor="reminderNotifications" className="ml-2 block text-sm">
                Reminder Notifications
              </label>
            </div>
          </div>
        </section>

        {/* Delete Account */}
        <section className="border-2 border-red-300 bg-red-50 rounded-lg p-6 mt-12">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Delete Account</h2>
          <p className="mb-4 text-[#13262F]/80">
            Deleting your account is permanent and cannot be undone. All your data, including notes, settings, and
            personal information will be permanently removed from our systems.
          </p>
          <p className="mb-6 text-[#13262F]/80">
            Before proceeding, we recommend downloading any important data or notes you wish to keep.
          </p>
          <button
            onClick={handleDeleteRequest}
            className="px-4 py-2 bg-white border-2 border-red-500 text-red-600 font-medium rounded-md hover:bg-red-500 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Delete My Account Permanently
          </button>
        </section>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-red-600 mb-4">Confirm Account Deletion</h3>
            <p className="mb-6">
              Are you absolutely sure you want to delete your account? This action cannot be undone and all your data
              will be permanently lost.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
              >
                Yes, Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
