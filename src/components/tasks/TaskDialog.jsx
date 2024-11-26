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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  useCreateTaskMutation,
  useGetSectionsQuery,
} from "@/store/services/api";
import { useSelector } from "react-redux";
import { toast } from "sonner";

const TaskDialog = ({ isOpen, onClose, projectId, sectionId }) => {
  const { session } = useSelector((state) => state.user);
  const user = session?.user;
  const [createTask] = useCreateTaskMutation();
  const { data: sections = [] } = useGetSectionsQuery(projectId);
  const [formData, setFormData] = useState({
    description: "",
    priority: "",
    due_date: "",
    section_id: sectionId,
    project_id: projectId,
    created_by: user?.id,
    created_at: new Date().toISOString(),
    completed: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }
    try {
      await createTask(formData).unwrap();
      toast.success("Task created successfully");
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to create task");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Create Task
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Task description"
              className="resize-none h-24"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Section</Label>
            <Select
              value={formData.section_id}
              onValueChange={(value) =>
                setFormData({ ...formData, section_id: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="To Do" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) =>
                setFormData({ ...formData, priority: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select issue priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Task due date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.due_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.due_date ? (
                    format(new Date(formData.due_date), "PPP")
                  ) : (
                    <span>Pick due date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={
                    formData.due_date ? new Date(formData.due_date) : undefined
                  }
                  onSelect={(date) =>
                    setFormData({
                      ...formData,
                      due_date: date ? date.toISOString() : "",
                    })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button type="submit" className="w-full mt-6">
            Create
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDialog;
