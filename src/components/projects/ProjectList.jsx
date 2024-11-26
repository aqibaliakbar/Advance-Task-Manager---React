// components/projects/ProjectList.jsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Users, MoreHorizontal, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useGetProjectsQuery,
  useDeleteProjectMutation,
} from "../../store/services/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ProjectList = ({ onNewProject, selectedProjectId }) => {
  const navigate = useNavigate();
  const { data: projects = [] } = useGetProjectsQuery();
  const [deleteProject] = useDeleteProjectMutation();
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    projectId: null,
    projectName: "",
  });

  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const handleDeleteClick = async () => {
    try {
      await deleteProject(deleteConfirmation.projectId).unwrap();
      toast.success("Project deleted successfully");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    } finally {
      setDeleteConfirmation({
        isOpen: false,
        projectId: null,
        projectName: "",
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Projects</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onNewProject}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="space-y-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className={cn(
              "p-4 border rounded-lg hover:bg-gray-50 group relative",
              selectedProjectId === project.id && "bg-gray-50 border-gray-400"
            )}
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => handleProjectClick(project.id)}
            >
              <div>
                <h3 className="font-medium">{project.name}</h3>
                <p className="text-sm text-gray-500">
                  Created {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {project.teams?.team_members?.length || 0} members
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 flex gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmation({
                          isOpen: true,
                          projectId: project.id,
                          projectName: project.name,
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirmation.projectName}
              "? This action cannot be undone and will remove all associated
              tasks and sections.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClick}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProjectList;
