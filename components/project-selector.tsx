"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface Project {
  id: string
  name: string
  status: string
  progress: number
}

interface ProjectSelectorProps {
  projects: Project[]
  selectedProject: string
  onProjectChange: (projectId: string) => void
}

export default function ProjectSelector({ projects, selectedProject, onProjectChange }: ProjectSelectorProps) {
  const currentProject = projects.find((p) => p.id === selectedProject)

  return (
    <Select value={selectedProject} onValueChange={onProjectChange}>
      <SelectTrigger className="w-64">
        <SelectValue>
          <div className="flex items-center justify-between w-full">
            <span>{currentProject?.name}</span>
            <Badge variant={currentProject?.status === "active" ? "default" : "secondary"} className="ml-2">
              {currentProject?.status === "active" ? "进行中" : "规划中"}
            </Badge>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {projects.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            <div className="flex items-center justify-between w-full">
              <span>{project.name}</span>
              <Badge variant={project.status === "active" ? "default" : "secondary"} className="ml-2">
                {project.status === "active" ? "进行中" : "规划中"}
              </Badge>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
