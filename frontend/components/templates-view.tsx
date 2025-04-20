"use client"

import { useState } from "react"
import { Search, Filter, Plus, ArrowRight, Star, Sparkles, Grid, List, ChevronDown, Check } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Template type definition
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

export default function TemplatesView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false)

  // Sample template data with more templates
  const templates: Template[] = [
    {
      id: "meeting-notes",
      title: "Meeting Notes",
      description: "Structured template for capturing meeting details, action items, and decisions.",
      category: "work",
      tags: ["meetings", "productivity", "collaboration"],
      thumbnail: "/structured-meeting-notes.png",
      isFeatured: true,
      isAIPowered: false,
      isCustom: false,
      createdAt: "2023-01-15",
    },
    {
      id: "project-plan",
      title: "Project Plan",
      description: "Comprehensive project planning template with goals, timeline, and resource allocation.",
      category: "work",
      tags: ["project", "planning", "management"],
      thumbnail: "/project-planning-overview.png",
      isFeatured: true,
      isAIPowered: false,
      isCustom: false,
      createdAt: "2023-02-10",
    },
    {
      id: "daily-journal",
      title: "Daily Journal",
      description: "Personal journal template with prompts for reflection and gratitude.",
      category: "personal",
      tags: ["journal", "reflection", "daily"],
      thumbnail: "/open-journal-flatlay.png",
      isFeatured: false,
      isAIPowered: false,
      isCustom: false,
      createdAt: "2023-03-05",
    },
    {
      id: "study-notes",
      title: "Study Notes",
      description: "Organized template for academic study with concept mapping and revision sections.",
      category: "academic",
      tags: ["study", "academic", "notes"],
      thumbnail: "/organized-study-layout.png",
      isFeatured: false,
      isAIPowered: false,
      isCustom: false,
      createdAt: "2023-04-20",
    },
    {
      id: "ai-research",
      title: "AI Research Assistant",
      description: "AI-powered template that helps organize research with automatic citations and summaries.",
      category: "academic",
      tags: ["research", "ai", "academic"],
      thumbnail: "/collaborative-ai-research.png",
      isFeatured: true,
      isAIPowered: true,
      isCustom: false,
      createdAt: "2023-05-15",
    },
    {
      id: "weekly-planner",
      title: "Weekly Planner",
      description: "Weekly planning template with goals, priorities, and reflection sections.",
      category: "productivity",
      tags: ["planning", "weekly", "productivity"],
      thumbnail: "/placeholder.svg?height=200&width=300&query=weekly%20planner",
      isFeatured: false,
      isAIPowered: false,
      isCustom: false,
      createdAt: "2023-06-10",
    },
    {
      id: "ai-content-outline",
      title: "AI Content Outline",
      description: "AI-powered template that helps create structured content outlines for articles and essays.",
      category: "writing",
      tags: ["writing", "ai", "content"],
      thumbnail: "/placeholder.svg?height=200&width=300&query=content%20outline",
      isFeatured: true,
      isAIPowered: true,
      isCustom: false,
      createdAt: "2023-07-05",
    },
    {
      id: "custom-work-log",
      title: "Work Log",
      description: "Custom template for tracking daily work activities and accomplishments.",
      category: "work",
      tags: ["work", "tracking", "custom"],
      thumbnail: "/placeholder.svg?height=200&width=300&query=work%20log",
      isFeatured: false,
      isAIPowered: false,
      isCustom: true,
      createdAt: "2023-08-20",
    },
    // New templates
    {
      id: "recipe-collection",
      title: "Recipe Collection",
      description: "Organize your favorite recipes with ingredients, instructions, and photos.",
      category: "personal",
      tags: ["cooking", "recipes", "food"],
      thumbnail: "/placeholder.svg?height=200&width=300&query=recipe%20book",
      isFeatured: false,
      isAIPowered: false,
      isCustom: false,
      createdAt: "2023-09-12",
    },
    {
      id: "travel-planner",
      title: "Travel Planner",
      description: "Plan your trips with itineraries, packing lists, and budget tracking.",
      category: "personal",
      tags: ["travel", "planning", "vacation"],
      thumbnail: "/placeholder.svg?height=200&width=300&query=travel%20planner",
      isFeatured: true,
      isAIPowered: false,
      isCustom: false,
      createdAt: "2023-10-05",
    },
    {
      id: "habit-tracker",
      title: "Habit Tracker",
      description: "Track your daily habits and build consistency with visual progress indicators.",
      category: "productivity",
      tags: ["habits", "tracking", "goals"],
      thumbnail: "/placeholder.svg?height=200&width=300&query=habit%20tracker",
      isFeatured: false,
      isAIPowered: false,
      isCustom: false,
      createdAt: "2023-11-18",
    },
    {
      id: "book-notes",
      title: "Book Notes",
      description: "Template for capturing key insights and quotes from books you're reading.",
      category: "academic",
      tags: ["reading", "books", "notes"],
      thumbnail: "/placeholder.svg?height=200&width=300&query=book%20notes",
      isFeatured: false,
      isAIPowered: false,
      isCustom: false,
      createdAt: "2023-12-01",
    },
    {
      id: "ai-language-learning",
      title: "AI Language Learning",
      description: "AI-powered template for learning new languages with vocabulary and grammar exercises.",
      category: "academic",
      tags: ["language", "learning", "ai"],
      thumbnail: "/placeholder.svg?height=200&width=300&query=language%20learning",
      isFeatured: true,
      isAIPowered: true,
      isCustom: false,
      createdAt: "2024-01-10",
    },
    {
      id: "fitness-tracker",
      title: "Fitness Tracker",
      description: "Track your workouts, nutrition, and fitness goals in one organized template.",
      category: "health",
      tags: ["fitness", "health", "workout"],
      thumbnail: "/placeholder.svg?height=200&width=300&query=fitness%20tracker",
      isFeatured: false,
      isAIPowered: false,
      isCustom: false,
      createdAt: "2024-02-15",
    },
    {
      id: "mood-journal",
      title: "Mood Journal",
      description: "Track your daily moods and emotions with reflection prompts and patterns analysis.",
      category: "health",
      tags: ["mental health", "mood", "journal"],
      thumbnail: "/placeholder.svg?height=200&width=300&query=mood%20journal",
      isFeatured: false,
      isAIPowered: false,
      isCustom: false,
      createdAt: "2024-03-20",
    },
    {
      id: "ai-creative-writing",
      title: "AI Creative Writing",
      description: "AI-powered template with prompts and structure for creative writing and storytelling.",
      category: "writing",
      tags: ["creative", "writing", "ai"],
      thumbnail: "/placeholder.svg?height=200&width=300&query=creative%20writing",
      isFeatured: true,
      isAIPowered: true,
      isCustom: false,
      createdAt: "2024-04-05",
    },
  ]

  // Categories
  const categories = [
    { id: "all", name: "All Templates" },
    { id: "featured", name: "Featured" },
    { id: "work", name: "Work" },
    { id: "personal", name: "Personal" },
    { id: "academic", name: "Academic" },
    { id: "productivity", name: "Productivity" },
    { id: "writing", name: "Writing" },
    { id: "health", name: "Health" },
    { id: "custom", name: "My Templates" },
  ]

  // Filter templates based on search query and active category
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory =
      activeCategory === "all" ||
      (activeCategory === "featured" && template.isFeatured) ||
      (activeCategory === "custom" && template.isCustom) ||
      template.category === activeCategory

    return matchesSearch && matchesCategory
  })

  const handlePreview = (template: Template) => {
    console.log("Preview template:", template.id)
  }

  const toggleCategoryDropdown = () => {
    setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
  }

  const selectCategory = (categoryId: string) => {
    setActiveCategory(categoryId)
    const category = categories.find((c) => c.id === categoryId)
    if (category) {
      setSelectedCategory(category.name)
    }
    setIsCategoryDropdownOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#f8faf8] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#13262F]">Templates</h1>
            <p className="text-[#13262F]/60 mt-1">Start with a template to save time and stay organized</p>
          </div>
          <button className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-[#79B791] text-white rounded-md hover:bg-[#ABD1B5] transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            <span>Create Template</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-[#ABD1B5]/10 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-[#13262F]/40" />
              </div>
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pl-10 pr-4 border border-[#ABD1B5]/30 rounded-md focus:outline-none focus:ring-1 focus:ring-[#79B791] text-[#13262F] text-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              {/* Category Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={toggleCategoryDropdown}
                  className="flex items-center justify-between px-3 py-2 border border-[#ABD1B5]/30 rounded-md text-[#13262F] hover:bg-[#EDF4ED] transition-colors text-sm min-w-[140px]"
                >
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2 text-[#13262F]/70" />
                    <span>{selectedCategory}</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 ml-2 transition-transform ${isCategoryDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isCategoryDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-[#ABD1B5]/20 py-1">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => selectCategory(category.id)}
                        className="flex items-center w-full px-3 py-2 text-sm text-left hover:bg-[#EDF4ED] text-[#13262F]"
                      >
                        {category.id === activeCategory && <Check className="h-4 w-4 mr-2 text-[#79B791]" />}
                        <span className={category.id === activeCategory ? "font-medium" : ""}>{category.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex rounded-md overflow-hidden border border-[#ABD1B5]/30">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors ${
                    viewMode === "grid" ? "bg-[#79B791]/20 text-[#79B791]" : "text-[#13262F]/60 hover:bg-[#EDF4ED]"
                  }`}
                  aria-label="Grid View"
                  title="Grid View"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors ${
                    viewMode === "list" ? "bg-[#79B791]/20 text-[#79B791]" : "text-[#13262F]/60 hover:bg-[#EDF4ED]"
                  }`}
                  aria-label="List View"
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-6 overflow-x-auto -mx-4 px-4">
          <div className="flex space-x-2 pb-2 min-w-max">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => selectCategory(category.id)}
                className={`px-4 py-2 rounded-md text-sm whitespace-nowrap ${
                  activeCategory === category.id
                    ? "bg-[#79B791] text-white"
                    : "bg-white text-[#13262F]/70 hover:bg-[#EDF4ED] border border-[#ABD1B5]/20"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Templates */}
        {activeCategory === "all" && (
          <div className="mb-8">
            <h2 className="text-lg font-medium text-[#13262F] mb-4">Featured Templates</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {templates
                .filter((template) => template.isFeatured)
                .slice(0, 4)
                .map((template, index) => (
                  <div
                    key={template.id}
                    className="bg-white rounded-lg shadow-sm border border-[#ABD1B5]/10 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-40 bg-[#EDF4ED]">
                      <Image
                        src={template.thumbnail || "/placeholder.svg"}
                        alt={template.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={index < 4}
                      />
                      {template.isAIPowered && (
                        <div className="absolute top-2 right-2 bg-[#79B791]/90 text-white text-xs px-2 py-1 rounded-full flex items-center z-10">
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI-Powered
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-[#13262F]">{template.title}</h3>
                      <p className="text-[#13262F]/60 text-sm mt-1 line-clamp-2">{template.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs bg-[#EDF4ED] text-[#13262F]/70 px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <button
                          onClick={() => handlePreview(template)}
                          className="text-[#79B791] text-sm font-medium hover:text-[#ABD1B5] transition-colors"
                        >
                          Preview
                        </button>
                        <Link
                          href={`/app/new?template=${template.id}`}
                          className="flex items-center text-[#13262F] text-sm font-medium hover:text-[#79B791] transition-colors"
                        >
                          Use Template
                          <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* All Templates */}
        <div>
          <h2 className="text-lg font-medium text-[#13262F] mb-4">
            {activeCategory === "all" ? "All Templates" : categories.find((c) => c.id === activeCategory)?.name}
          </h2>

          {filteredTemplates.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-[#ABD1B5]/10 p-8 text-center">
              <p className="text-[#13262F]/60">No templates found matching your criteria.</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white rounded-lg shadow-sm border border-[#ABD1B5]/10 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative h-40 bg-[#EDF4ED]">
                    <Image
                      src={template.thumbnail || "/placeholder.svg"}
                      alt={template.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {template.isAIPowered && (
                      <div className="absolute top-2 right-2 bg-[#79B791]/90 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI-Powered
                      </div>
                    )}
                    {template.isCustom && (
                      <div className="absolute top-2 left-2 bg-[#13262F]/70 text-white text-xs px-2 py-1 rounded-full">
                        Custom
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-[#13262F]">{template.title}</h3>
                      <button className="text-[#13262F]/40 hover:text-[#79B791]">
                        <Star className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-[#13262F]/60 text-sm mt-1 line-clamp-2">{template.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-xs bg-[#EDF4ED] text-[#13262F]/70 px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                      {template.tags.length > 2 && (
                        <span className="text-xs bg-[#EDF4ED] text-[#13262F]/70 px-2 py-0.5 rounded-full">
                          +{template.tags.length - 2}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <button
                        onClick={() => handlePreview(template)}
                        className="text-[#79B791] text-sm font-medium hover:text-[#ABD1B5] transition-colors"
                      >
                        Preview
                      </button>
                      <Link
                        href={`/app/new?template=${template.id}`}
                        className="flex items-center text-[#13262F] text-sm font-medium hover:text-[#79B791] transition-colors"
                      >
                        Use
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white rounded-lg shadow-sm border border-[#ABD1B5]/10 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex">
                    <div className="relative w-32 h-32 bg-[#EDF4ED] flex-shrink-0">
                      <Image
                        src={template.thumbnail || "/placeholder.svg"}
                        alt={template.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 128px"
                      />
                      {template.isAIPowered && (
                        <div className="absolute top-2 right-2 bg-[#79B791]/90 text-white text-xs px-2 py-1 rounded-full flex items-center">
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI
                        </div>
                      )}
                      {template.isCustom && (
                        <div className="absolute top-2 left-2 bg-[#13262F]/70 text-white text-xs px-2 py-1 rounded-full">
                          Custom
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-[#13262F]">{template.title}</h3>
                        <button className="text-[#13262F]/40 hover:text-[#79B791]">
                          <Star className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-[#13262F]/60 text-sm mt-1">{template.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-[#EDF4ED] text-[#13262F]/70 px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handlePreview(template)}
                            className="text-[#79B791] text-sm font-medium hover:text-[#ABD1B5] transition-colors"
                          >
                            Preview
                          </button>
                          <span className="text-xs text-[#13262F]/40">{template.category}</span>
                        </div>
                        <Link
                          href={`/app/new?template=${template.id}`}
                          className="flex items-center text-[#13262F] text-sm font-medium hover:text-[#79B791] transition-colors"
                        >
                          Use Template
                          <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
