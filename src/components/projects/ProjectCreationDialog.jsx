import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  useCreateProjectMutation,
  useCreateSectionMutation,
  useGetTeamsQuery,
} from "../../store/services/api";
import { useToast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";

const DEFAULT_SECTIONS = [
  { name: "To Do", position: 0 },
  { name: "In Progress", position: 1 },
  { name: "Done", position: 2 },
];

const ProjectCreationDialog = ({ isOpen, onClose }) => {
    const { session } = useSelector((state) => state.user);
    const user = session?.user;
  const { toast } = useToast();
  const [createProject] = useCreateProjectMutation();
  const [createSection] = useCreateSectionMutation();
  const { data: teams = [] } = useGetTeamsQuery();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    privacy: "Private",
    team_id: "",
    created_by: user?.id,
    created_at: new Date().toISOString(),
  });

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    // Create the project first
    const newProject = await createProject(formData).unwrap();
    const projectId = newProject[0].id;

    // Create all sections in a single request
    await createSection(
      DEFAULT_SECTIONS.map((section) => ({
        name: section.name,
        project_id: projectId,
        position: section.position,
        created_at: new Date().toISOString(),
      }))
    ).unwrap();

    toast("Project created successfully");
    onClose();
    setFormData({
      name: "",
      privacy: "Private",
      team_id: "",
      created_by: user?.id,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Project creation error:", error);
    toast(error.message || "Failed to create project");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Project Name</label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter project name"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Privacy</label>
            <Select
              value={formData.privacy}
              onValueChange={(value) =>
                setFormData({ ...formData, privacy: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select privacy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Private">Private</SelectItem>
                <SelectItem value="Public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Team</label>
            <Select
              value={formData.team_id}
              onValueChange={(value) =>
                setFormData({ ...formData, team_id: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Project"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectCreationDialog;
