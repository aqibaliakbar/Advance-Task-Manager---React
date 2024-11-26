import React from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal } from "lucide-react";
import TaskCard from "../tasks/TaskCard";

const DroppableSection = ({
  section,
  index,
  tasks = [],
  onAddTask,
  onDeleteTask,
  onDeleteSection,
  projectId,
  userId,
}) => {
  return (
    <Draggable draggableId={section.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="w-[300px] flex-shrink-0"
        >
          <div className="flex flex-col bg-white rounded-lg p-4">
            <div
              className="flex items-center justify-between mb-3"
              {...provided.dragHandleProps}
            >
              <div className="flex items-center gap-2">
                <h2 className="font-medium">{section.name}</h2>
                <Badge variant="secondary">{tasks.length}</Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onAddTask(section.id)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit Section</DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDeleteSection(section)}
                    >
                      Delete Section
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <Droppable droppableId={section.id} type="TASK">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 min-h-[200px] rounded-lg transition-colors ${
                    snapshot.isDraggingOver ? "bg-gray-50" : ""
                  }`}
                >
                  {tasks.map((task, index) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={index}
                      onDelete={onDeleteTask}
                      projectId={projectId}
                      userId={userId}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default DroppableSection;
