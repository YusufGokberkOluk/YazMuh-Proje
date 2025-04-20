"use client"

import { X, ArrowRight, Sparkles, Download } from "lucide-react"
import Link from "next/link"

interface Template {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  thumbnail: string
  isFeatured: boolean
  isAIPowered: boolean
  isCustom: boolean
  createdAt: string
}

interface TemplatePreviewModalProps {
  template: Template
  onClose: () => void
}

export default function TemplatePreviewModal({ template, onClose }: TemplatePreviewModalProps) {
  // This would be fetched from an API in a real application
  const templateContent = {
    sections: [
      {
        title: "Overview",
        content: "This section provides a high-level summary of the topic or project.",
      },
      {
        title: "Key Points",
        content: "• Important point 1\n• Important point 2\n• Important point 3",
      },
      {
        title: "Details",
        content: "Expand on the key points with more detailed information and context.",
      },
      {
        title: "Action Items",
        content: "[ ] Task 1\n[ ] Task 2\n[ ] Task 3",
      },
      {
        title: "Notes",
        content: "Additional notes and thoughts can be added here.",
      },
    ],
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[#ABD1B5]/20">
          <div className="flex items-center">
            <h2 className="text-xl font-medium text-[#13262F]">{template.title}</h2>
            {template.isAIPowered && (
              <div className="ml-3 bg-[#79B791]/10 text-[#79B791] text-xs px-2 py-1 rounded-full flex items-center">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#EDF4ED] transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-[#13262F]/70" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Template Preview */}
          <div className="flex-1 overflow-y-auto p-6 border-r border-[#ABD1B5]/20">
            <div className="prose max-w-none">
              <h3 className="text-lg font-medium text-[#13262F] mb-4">Template Preview</h3>

              {templateContent.sections.map((section, index) => (
                <div key={index} className="mb-6">
                  <h4 className="text-md font-medium text-[#13262F] mb-2">{section.title}</h4>
                  <div className="bg-[#f8faf8] border border-[#ABD1B5]/20 rounded-md p-3 whitespace-pre-line">
                    {section.content}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Template Info */}
          <div className="w-full md:w-80 p-6 bg-[#f8faf8] overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-[#13262F] mb-2">About this template</h3>
              <p className="text-sm text-[#13262F]/70">{template.description}</p>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium text-[#13262F] mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-white text-[#13262F]/70 px-2 py-1 rounded-full border border-[#ABD1B5]/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {template.isAIPowered && (
              <div className="mb-6 bg-[#79B791]/10 rounded-md p-3">
                <h4 className="text-sm font-medium text-[#13262F] flex items-center mb-2">
                  <Sparkles className="h-4 w-4 mr-1 text-[#79B791]" />
                  AI Features
                </h4>
                <ul className="text-xs text-[#13262F]/70 space-y-1">
                  <li>• Automatic content suggestions</li>
                  <li>• Smart formatting assistance</li>
                  <li>• Contextual prompts based on your content</li>
                </ul>
              </div>
            )}

            <div className="space-y-3">
              <Link
                href={`/app/new?template=${template.id}`}
                className="flex items-center justify-center w-full px-4 py-2 bg-[#79B791] text-white rounded-md hover:bg-[#ABD1B5] transition-colors"
              >
                Use Template
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>

              <button className="flex items-center justify-center w-full px-4 py-2 border border-[#ABD1B5]/30 text-[#13262F] rounded-md hover:bg-[#EDF4ED] transition-colors">
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
