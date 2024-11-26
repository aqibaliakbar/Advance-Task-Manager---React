// components/pages/Dashboard.jsx
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useGetProjectsQuery,
  useGetTasksQuery,
  useGetTeamsQuery,
  useGetProjectTasksQuery,
} from "../../store/services/api";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProjectList from "@/components/projects/ProjectList";
import TaskList from "@/components/tasks/TaskList";
import ProjectCreationDialog from "@/components/projects/ProjectCreationDialog";
import { useSelector } from "react-redux";

const Dashboard = () => {
  const navigate = useNavigate();
    const { session } = useSelector((state) => state.user);
    const user = session?.user;
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const { data: projects = [] } = useGetProjectsQuery();
  const { data: allTasks = [] } = useGetTasksQuery();
  const { data: projectTasks = [] } = useGetProjectTasksQuery(
    selectedProjectId,
    {
      skip: selectedProjectId === "all",
    }
  );
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);

  // Get current date
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const getStats = () => {
    if (selectedProjectId === "all") {
      return {
        tasksCompleted: allTasks.filter((t) => t.sections?.name === "Done")
          .length,
        collaborators: new Set(
          allTasks.map((t) => t.assigned_to).filter(Boolean)
        ).size,
        projectName: "All Projects",
      };
    } else {
      const selectedProject = projects.find((p) => p.id === selectedProjectId);
      const projectTeamMembers = selectedProject?.teams?.team_members || [];
      return {
        tasksCompleted: projectTasks.filter((t) => t.sections?.name === "Done")
          .length,
        collaborators: projectTeamMembers.length,
        projectName: selectedProject?.name,
      };
    }
  };

  const stats = getStats();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <p className="text-gray-600">{currentDate}</p>
        <h1 className="text-2xl font-semibold">
          Hello, {user?.user_metadata?.full_name}
        </h1>
      </div>

      {/* Stats Bar */}
      <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center gap-8">
        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold">
              {stats.tasksCompleted}
            </span>
            <span className="text-sm text-gray-600">tasks Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold">
              {stats.collaborators}
            </span>
            <span className="text-sm text-gray-600">collaborators</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Projects Section */}
        <Card className="p-6">
          <ProjectList
            onNewProject={() => setIsProjectDialogOpen(true)}
            selectedProjectId={selectedProjectId}
          />
        </Card>

        {/* Tasks Section */}
        <Card className="p-6">
          <TaskList
            selectedProjectId={selectedProjectId}
            projectName={stats.projectName}
          />
        </Card>
      </div>

      <ProjectCreationDialog
        isOpen={isProjectDialogOpen}
        onClose={() => setIsProjectDialogOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
