// TaskCard.jsx
import React, { useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, User, Calendar, X } from "lucide-react";
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useGetTeamMembersQuery,
  useGetProjectQuery,
} from "@/store/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TaskCard = ({ task, index, onDelete, projectId, userId }) => {
  const [updateTask] = useUpdateTaskMutation();
  const [createTask] = useCreateTaskMutation();
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [newSubtaskDescription, setNewSubtaskDescription] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Get project data to access team_id
  const { data: project } = useGetProjectQuery(projectId);
  // Get team members for assignment
  const { data: teamMembers = [] } = useGetTeamMembersQuery(project?.team_id, {
    skip: !project?.team_id,
  });

  const handleComplete = async () => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      await updateTask({
        taskId: task.id,
        completed: !task.completed,
        project_id: projectId,
      }).unwrap();
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskDescription.trim() || isUpdating) return;

    setIsUpdating(true);
    try {
      await createTask({
        description: newSubtaskDescription,
        project_id: projectId,
        section_id: task.section_id,
        parent_task_id: task.id,
        is_subtask: true,
        created_by: userId,
        priority: task.priority,
        created_at: new Date().toISOString(),
        completed: false,
      }).unwrap();

      setNewSubtaskDescription("");
      setShowSubtaskInput(false);
      toast.success("Subtask added successfully");
    } catch (error) {
      console.error("Error creating subtask:", error);
      toast.error("Failed to create subtask");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubtaskComplete = async (subtaskId, currentCompleted) => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      await updateTask({
        taskId: subtaskId,
        completed: !currentCompleted,
        project_id: projectId,
      }).unwrap();
    } catch (error) {
      console.error("Error updating subtask:", error);
      toast.error("Failed to update subtask");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignUser = async (selectedUserId) => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      await updateTask({
        taskId: task.id,
        assigned_to: selectedUserId,
        project_id: projectId,
      }).unwrap();
      toast.success("Task assigned successfully");
    } catch (error) {
      console.error("Error assigning task:", error);
      toast.error("Failed to assign task");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "bg-white rounded-lg border p-3 mb-2 select-none",
            snapshot.isDragging ? "shadow-lg" : "hover:shadow-sm",
            isUpdating && "opacity-70 pointer-events-none"
          )}
        >
          {/* Priority and Menu */}
          <div className="flex justify-between items-start mb-2">
            <Badge
              variant="outline"
              className={cn(
                "font-normal",
                task.priority === "Low"
                  ? "bg-emerald-50 text-emerald-500 border-emerald-200"
                  : task.priority === "Medium"
                  ? "bg-yellow-50 text-yellow-500 border-yellow-200"
                  : "bg-red-50 text-red-500 border-red-200"
              )}
            >
              {task.priority}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onDelete(task.id)}
                  className="text-red-600"
                >
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Task Description */}
          <h3
            className={cn(
              "font-medium mb-2",
              task.completed && "line-through text-gray-500"
            )}
          >
            {task.description}
          </h3>

          {/* Task Actions */}
          <div className="flex items-center justify-between text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-xs">
                {task.subtasks?.filter((st) => st.completed).length || 0}/
                {task.subtasks?.length || 0}
              </span>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    {task.assigned_to ? (
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>
                          {task.users?.full_name?.charAt(0).toUpperCase() ||
                            "?"}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-52 p-2">
                  <div className="space-y-2">
                    {teamMembers.map((member) => (
                      <div
                        key={member.user_id}
                        onClick={() => handleAssignUser(member.user_id)}
                        className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>
                            {member.users?.full_name?.charAt(0).toUpperCase() ||
                              "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {member.users?.full_name || member.email}
                        </span>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleComplete}
                disabled={isUpdating}
              >
                <Checkbox checked={task.completed} />
              </Button>
            </div>

            {task.due_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  {new Date(task.due_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Subtasks */}
          {task.subtasks?.map((subtask) => (
            <div
              key={subtask.id}
              className="flex items-center justify-between mt-2 pl-4 group hover:bg-gray-50 rounded-sm py-1"
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`subtask-${subtask.id}`}
                  checked={subtask.completed}
                  disabled={isUpdating}
                  onCheckedChange={() =>
                    handleSubtaskComplete(subtask.id, subtask.completed)
                  }
                />
                <label
                  htmlFor={`subtask-${subtask.id}`}
                  className={cn(
                    "text-sm cursor-pointer",
                    subtask.completed && "line-through text-gray-500"
                  )}
                >
                  {subtask.description}
                </label>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                disabled={isUpdating}
                onClick={() => onDelete(subtask.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {/* Add Subtask */}
          {showSubtaskInput ? (
            <form onSubmit={handleAddSubtask} className="mt-2">
              <Input
                value={newSubtaskDescription}
                onChange={(e) => setNewSubtaskDescription(e.target.value)}
                placeholder="Add subtask..."
                className="text-sm"
                disabled={isUpdating}
                autoFocus
                onBlur={() => {
                  if (!newSubtaskDescription.trim()) {
                    setShowSubtaskInput(false);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setShowSubtaskInput(false);
                    setNewSubtaskDescription("");
                  }
                }}
              />
            </form>
          ) : (
            <Button
              variant="ghost"
              className="w-full mt-2 justify-start text-gray-500 text-sm hover:text-gray-900"
              disabled={isUpdating}
              onClick={() => setShowSubtaskInput(true)}
            >
              + Add SubTask
            </Button>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
