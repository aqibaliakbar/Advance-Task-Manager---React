import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCreateSectionMutation,
  useDeleteSectionMutation,
} from "@/store/services/api";
import { toast } from "sonner";

const SectionDialog = ({
  isOpen,
  onClose,
  projectId,
  mode = "create",
  sectionToDelete = null,
}) => {
  const [sectionName, setSectionName] = useState("");
  const [createSection] = useCreateSectionMutation();
  const [deleteSection] = useDeleteSectionMutation();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateSection = async () => {
    if (!sectionName.trim()) {
      toast.error("Section name is required");
      return;
    }
    setIsLoading(true);
    try {
      await createSection({
        name: sectionName.trim(),
        project_id: projectId,
        created_at: new Date().toISOString(),
      }).unwrap();
      toast.success("Section created successfully");
      setSectionName("");
      onClose();
    } catch (error) {
      console.error("Error creating section:", error);
      toast.error(error.message || "Failed to create section");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSection = async () => {
    if (!sectionToDelete) return;

    setIsLoading(true);
    try {
      await deleteSection(sectionToDelete.id).unwrap();
      toast.success("Section deleted successfully");
      onClose();
    } catch (error) {
      console.error("Error deleting section:", error);
      toast.error(error.message || "Failed to delete section");
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (mode === "delete") {
      return (
        <>
          <DialogHeader>
            <DialogTitle>Delete Section</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{sectionToDelete?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSection}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </>
      );
    }

    return (
      <>
        <DialogHeader>
          <DialogTitle>Add New Section</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Input
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
            placeholder="Enter section name"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isLoading) {
                handleCreateSection();
              }
            }}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleCreateSection} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>{renderContent()}</DialogContent>
    </Dialog>
  );
};

export default SectionDialog;
