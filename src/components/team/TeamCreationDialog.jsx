import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import {
  useCreateTeamMutation,
  useAddTeamMemberMutation,
} from "../../store/services/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const TeamCreationDialog = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [createTeam] = useCreateTeamMutation();
  const [addTeamMember] = useAddTeamMemberMutation();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Team name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Create team
      const result = await createTeam({
        name: formData.name.trim(),
        created_by: user.id,
      }).unwrap();

      if (result?.[0]?.id) {
        // Add creator as team member
        await addTeamMember({
          team_id: result[0].id,
          user_id: user.id,
          email: user.email,
        }).unwrap();

        toast({
          title: "Success",
          description: "Team created successfully",
        });
        onClose();
        setFormData({ name: "" });
      }
    } catch (error) {
      console.error("Team creation error:", error);
      toast({
        title: "Error",
        description:
          error.message ===
          'infinite recursion detected in policy for relation "team_members"'
            ? "Error creating team. Please try again."
            : error.message || "Failed to create team",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Team Name</label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter team name"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Team"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TeamCreationDialog;
