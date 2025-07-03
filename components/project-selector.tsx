"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, ChevronDown, Globe, Search, Twitter, MessageSquare } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import CreateProjectDialog from "./create-project-dialog"

interface ProjectSelectorProps {
  onProjectChange: (projectId: string) => void
  currentProjectId?: string
  className?: string
}

export default function ProjectSelector({ onProjectChange, currentProjectId, className }: ProjectSelectorProps) {
  const [open, setOpen] = useState(false)
  const [projects, setProjects] = useState<{
    id: string
    name: string
    description?: string
    status: string
    progress: number
    website_url?: string
    twitter_handle?: string
    telegram_handle?: string
    logo_url?: string
  }[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const loadProjects = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/projects")
      const data = await res.json()
      if (res.ok) {
        setProjects(data.projects || [])
        
        // 如果没有选择项目但有项目列表，自动选择第一个
        if (!currentProjectId && data.projects?.length > 0) {
          onProjectChange(data.projects[0].id)
        }
      }
    } catch (error) {
      console.error("Error loading projects:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const currentProject = projects.find((p) => p.id === currentProjectId)

  const filteredProjects = searchQuery 
    ? projects.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    : projects

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning": return "bg-blue-500"
      case "development": return "bg-purple-500"
      case "testing": return "bg-orange-500"
      case "active": return "bg-green-500"
      case "maintenance": return "bg-gray-500"
      case "completed": return "bg-green-600"
      default: return "bg-gray-500"
    }
  }

  const handleCreateProject = async (newProject: any) => {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      })
      
      if (res.ok) {
        const data = await res.json()
        setProjects(prev => [data.project, ...prev])
        onProjectChange(data.project.id)
        setShowCreateDialog(false)
      }
    } catch (error) {
      console.error("Error creating project:", error)
    }
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="min-w-[200px] justify-between"
          >
            {currentProject ? (
              <div className="flex items-center">
                {currentProject.logo_url ? (
                  <img 
                    src={currentProject.logo_url} 
                    alt={currentProject.name} 
                    className="w-4 h-4 rounded-full mr-2" 
                  />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-gray-300 mr-2" />
                )}
                <span className="truncate max-w-[150px]">{currentProject.name}</span>
              </div>
            ) : (
              <span>{loading ? "加载中..." : "选择项目"}</span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="搜索项目..." onValueChange={setSearchQuery} />
            <CommandList>
              <CommandEmpty>没有找到匹配的项目</CommandEmpty>
              <CommandGroup heading="项目列表">
                <ScrollArea className="h-[300px]">
                  {filteredProjects.map((project) => (
                    <CommandItem
                      key={project.id}
                      onSelect={() => {
                        onProjectChange(project.id)
                        setOpen(false)
                      }}
                      className="flex items-start py-2"
                    >
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          {project.logo_url ? (
                            <img 
                              src={project.logo_url} 
                              alt={project.name} 
                              className="w-8 h-8 rounded-full" 
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium truncate">{project.name}</p>
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />
                          </div>
                          {project.description && (
                            <p className="text-sm text-muted-foreground truncate">{project.description}</p>
                          )}
                          <div className="flex items-center space-x-2 mt-1">
                            {project.website_url && (
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Globe className="w-3 h-3 mr-1" />
                                <span className="truncate max-w-[80px]">
                                  {project.website_url.replace(/^https?:\/\//, '')}
                                </span>
                              </div>
                            )}
                            {project.twitter_handle && (
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Twitter className="w-3 h-3 mr-1" />
                                <span>{project.twitter_handle}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {project.id === currentProjectId && (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setShowCreateDialog(true)
                    setOpen(false)
                  }}
                  className="text-blue-600"
                >
                  + 创建新项目
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {currentProject && (
        <div className="hidden md:flex items-center space-x-2">
          {currentProject.website_url && (
            <a href={currentProject.website_url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Globe className="h-4 w-4" />
              </Button>
            </a>
          )}
          {currentProject.twitter_handle && (
            <a href={`https://twitter.com/${currentProject.twitter_handle}`} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Twitter className="h-4 w-4" />
              </Button>
            </a>
          )}
          {currentProject.telegram_handle && (
            <a href={`https://t.me/${currentProject.telegram_handle}`} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </a>
          )}
          <Badge 
            variant="outline" 
            className={cn(
              "capitalize",
              currentProject.status === "active" && "bg-green-50 text-green-700 border-green-200",
              currentProject.status === "planning" && "bg-blue-50 text-blue-700 border-blue-200"
            )}
          >
            {currentProject.status}
            </Badge>
          </div>
      )}

      <CreateProjectDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
        onCreateProject={handleCreateProject}
      />
            </div>
  )
}
