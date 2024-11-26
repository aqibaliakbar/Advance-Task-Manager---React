import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Lock, Globe, X } from "lucide-react";

import { toast } from "sonner";
import {
  useGetTeamMembersQuery,
  useGetProjectsQuery,
  useAddTeamMemberMutation,
  useCreateProjectMutation,
} from "@/store/services/api";
import { useSelector } from "react-redux";

// Team Member Dialog Component
const TeamMemberDialog = ({ teamId, onClose }) => {
     const { session } = useSelector((state) => state.user);
     const user = session?.user;
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [addTeamMember] = useAddTeamMemberMutation();

  const handleAddMember = async () => {
    if (!newMemberEmail) {
      toast.error("Email is required");
      return;
    }

    try {
      await addTeamMember({
        team_id: teamId,
        email: newMemberEmail,
      }).unwrap();

      toast.success("Team member added successfully");
      setNewMemberEmail("");
      onClose();
    } catch (error) {
      toast.error("Failed to add team member");
      console.error("Error adding team member:", error);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Add Team Member</DialogTitle>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Add member by email"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
          />
          <Button onClick={handleAddMember}>Add</Button>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
      </div>
    </DialogContent>
  );
};

// New Project Dialog Component
const ProjectDialog = ({ teamId, onClose }) => {
  const [projectName, setProjectName] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [createProject] = useCreateProjectMutation();

  const handleCreateProject = async () => {
    if (!projectName) {
      toast.error("Project name is required");
      return;
    }

    try {
      await createProject({
        name: projectName,
        team_id: teamId,
        visibility: visibility,
      }).unwrap();

      toast.success("Project created successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to create project");
      console.error("Error creating project:", error);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Create New Project</DialogTitle>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div>
          <Input
            placeholder="Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant={visibility === "private" ? "default" : "outline"}
            onClick={() => setVisibility("private")}
            className="flex items-center"
          >
            <Lock className="h-4 w-4 mr-2" />
            Private
          </Button>
          <Button
            variant={visibility === "public" ? "default" : "outline"}
            onClick={() => setVisibility("public")}
            className="flex items-center"
          >
            <Globe className="h-4 w-4 mr-2" />
            Public
          </Button>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button onClick={handleCreateProject}>Create Project</Button>
      </div>
    </DialogContent>
  );
};

// Main Teams Page Component
const TeamsPage = () => {
  const { teamId } = useParams();
  const { data: members = [], isLoading, error } = useGetTeamMembersQuery(teamId);
  const { data: projects = [] } = useGetProjectsQuery();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

  // Filter projects for current team
  const teamProjects = projects.filter((project) => project.team_id === teamId);

  const renderMembers = () => {
    if (isLoading) return <div>Loading members...</div>;
    if (error) {
      console.error('Members error:', error);
      return <div>Error loading members: {error.message}</div>;
    }
    if (!members?.length) return <div>No members found for team ID: {teamId}</div>;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <div 
            key={member.id} 
            className="flex items-center gap-2 p-3 bg-white rounded-lg border"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {member.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {member.users?.full_name || member.email}
              </span>
              <span className="text-xs text-gray-500">{member.email}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Members Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Members ({members?.length || 0})
          </h2>
          <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <TeamMemberDialog
              teamId={teamId}
              onClose={() => setIsAddMemberOpen(false)}
            />
          </Dialog>
        </div>

        {renderMembers()}
      </div>

      {/* Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Projects ({teamProjects.length})
          </h2>
          <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <ProjectDialog
              teamId={teamId}
              onClose={() => setIsNewProjectOpen(false)}
            />
          </Dialog>
        </div>

        <div className="space-y-2">
          {teamProjects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="font-medium">{project.name}</span>
                  <div className="flex items-center text-sm text-gray-500 gap-1">
                    {project.visibility === "private" ? (
                      <Lock className="h-3 w-3" />
                    ) : (
                      <Globe className="h-3 w-3" />
                    )}
                    <span>
                      {project.visibility === "private" ? "Private" : "Public"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit Project</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      Delete Project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamsPage;


