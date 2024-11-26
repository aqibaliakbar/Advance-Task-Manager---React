import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  useGetProjectsQuery,
  useGetTeamsQuery,
  useDeleteProjectMutation,
  useDeleteTeamMutation,
} from "../../store/services/api";
import { CheckSquare, Home, Inbox, Users, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
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

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: projects = [] } = useGetProjectsQuery();
  const { data: teams = [] } = useGetTeamsQuery();
  const [deleteProject] = useDeleteProjectMutation();
  const [deleteTeam] = useDeleteTeamMutation();

  // State for delete confirmations
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    type: null, // 'project' or 'team'
    id: null,
    name: "",
  });

  const handleDelete = async () => {
    try {
      if (deleteConfirmation.type === "project") {
        await deleteProject(deleteConfirmation.id).unwrap();
        toast({
          title: "Success",
          description: "Project deleted successfully",
        });
        if (location.pathname.includes(`/projects/${deleteConfirmation.id}`)) {
          navigate("/");
        }
      } else if (deleteConfirmation.type === "team") {
        await deleteTeam(deleteConfirmation.id).unwrap();
        toast({
          title: "Success",
          description: "Team deleted successfully",
        });
        if (location.pathname.includes(`/teams/${deleteConfirmation.id}`)) {
          navigate("/");
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete ${deleteConfirmation.type}`,
        variant: "destructive",
      });
    } finally {
      setDeleteConfirmation({ isOpen: false, type: null, id: null, name: "" });
    }
  };

  return (
    <>
      <aside
        className={cn(
          "min-w-64 w-64 flex-shrink-0 border-r bg-white h-full transition-all duration-300",
          "fixed top-14 left-0 bottom-0",
          "lg:relative lg:top-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "z-30"
        )}
      >
        <nav className="p-4 space-y-6 h-full overflow-y-auto">
          <div className="space-y-1">
            <Link to="/">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  location.pathname === "/" && "bg-gray-100"
                )}
              >
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
            <Link to="/tasks">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  location.pathname === "/tasks" && "bg-gray-100"
                )}
              >
                <CheckSquare className="mr-2 h-4 w-4" />
                My Tasks
              </Button>
            </Link>
            <Link to="/inbox">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  location.pathname === "/inbox" && "bg-gray-100"
                )}
              >
                <Inbox className="mr-2 h-4 w-4" />
                Inbox
              </Button>
            </Link>
          </div>

          <div className="space-y-1">
            <h3 className="px-2 text-sm font-medium text-gray-500">Projects</h3>
            {projects.map((project) => (
              <div key={project.id} className="flex items-center group">
                <Link to={`/projects/${project.id}`} className="flex-1">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      location.pathname === `/projects/${project.id}` &&
                        "bg-gray-100"
                    )}
                  >
                    {project.name}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 h-8 w-8"
                  onClick={(e) => {
                    e.preventDefault();
                    setDeleteConfirmation({
                      isOpen: true,
                      type: "project",
                      id: project.id,
                      name: project.name,
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <h3 className="px-2 text-sm font-medium text-gray-500">Teams</h3>
            {teams.map((team) => (
              <div key={team.id} className="flex items-center group">
                <Link to={`/teams/${team.id}`} className="flex-1">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      location.pathname === `/teams/${team.id}` && "bg-gray-100"
                    )}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    {team.name}
                    {team.team_members?.length > 0 && (
                      <span className="ml-2 text-xs text-gray-500">
                        ({team.team_members.length})
                      </span>
                    )}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 h-8 w-8"
                  onClick={(e) => {
                    e.preventDefault();
                    setDeleteConfirmation({
                      isOpen: true,
                      type: "team",
                      id: team.id,
                      name: team.name,
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
                </Button>
              </div>
            ))}
          </div>
        </nav>
      </aside>

      <AlertDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete{" "}
              {deleteConfirmation.type === "project" ? "Project" : "Team"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirmation.name}"?
              {deleteConfirmation.type === "project"
                ? " This will permanently remove all associated tasks and sections."
                : " This will remove all team members and associated projects."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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

export default Sidebar;
