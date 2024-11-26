import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import {
  useGetProjectQuery,
  useGetSectionsQuery,
  useGetProjectTasksQuery,
  useMoveTaskMutation,
  useDeleteTaskMutation,
  useUpdateSectionMutation,
} from "@/store/services/api";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import DroppableSection from "./DroppableSection";
import TaskDialog from "../tasks/TaskDialog";
import SectionDialog from "./SectionDialog";

const ProjectBoard = () => {
  const { projectId } = useParams();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [sectionToDelete, setSectionToDelete] = useState(null);

  const { session } = useSelector((state) => state.user);
  const userId = session?.user?.id;

  const { data: project } = useGetProjectQuery(projectId);
  const { data: sections = [], isLoading: isLoadingSections } =
    useGetSectionsQuery(projectId, {
      skip: !projectId,
    });
  const { data: tasks = [], isLoading: isLoadingTasks } =
    useGetProjectTasksQuery(projectId, {
      skip: !projectId,
    });

  const [moveTask] = useMoveTaskMutation();
  const [updateSection] = useUpdateSectionMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const tasksBySection = useMemo(() => {
    const mainTasks = tasks.filter((task) => !task.is_subtask);
    return sections.reduce((acc, section) => {
      acc[section.id] = mainTasks.filter(
        (task) => task.section_id === section.id
      );
      return acc;
    }, {});
  }, [tasks, sections]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    try {
      if (type === "section") {
        const newSections = Array.from(sections);
        const [removed] = newSections.splice(source.index, 1);
        newSections.splice(destination.index, 0, removed);

        const updates = newSections.map((section, index) =>
          updateSection({
            sectionId: section.id,
            position: index,
            project_id: projectId,
          })
        );

        await Promise.all(updates);
      } else {
        await moveTask({
          taskId: draggableId,
          sectionId: destination.droppableId,
          project_id: projectId,
        }).unwrap();
      }
    } catch (error) {
      console.error("Error during drag and drop:", error);
      toast.error("Failed to update position");
    }
  };

  const handleAddTask = (sectionId) => {
    setSelectedSection(sectionId);
    setIsTaskDialogOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask({
        taskId,
        project_id: projectId,
      }).unwrap();
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const handleDeleteSection = (section) => {
    setSectionToDelete(section);
    setIsSectionDialogOpen(true);
  };

  if (isLoadingSections || isLoadingTasks) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">{project?.name}</h1>
          <Badge variant="secondary">{project?.privacy}</Badge>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" type="section" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="p-6 flex gap-4 overflow-x-auto min-h-[calc(100vh-4rem)]"
            >
              {sections.map((section, index) => (
                <DroppableSection
                  key={section.id}
                  section={section}
                  index={index}
                  tasks={tasksBySection[section.id] || []}
                  onAddTask={handleAddTask}
                  onDeleteTask={handleDeleteTask}
                  onDeleteSection={handleDeleteSection}
                  projectId={projectId}
                  userId={userId}
                />
              ))}
              {provided.placeholder}

              <Button
                variant="outline"
                className="flex items-center gap-2 h-10 whitespace-nowrap"
                onClick={() => {
                  setSectionToDelete(null);
                  setIsSectionDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Add Section
              </Button>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {isTaskDialogOpen && (
        <TaskDialog
          isOpen={isTaskDialogOpen}
          onClose={() => {
            setIsTaskDialogOpen(false);
            setSelectedSection(null);
          }}
          projectId={projectId}
          sectionId={selectedSection}
          userId={userId}
        />
      )}

      <SectionDialog
        isOpen={isSectionDialogOpen}
        onClose={() => {
          setIsSectionDialogOpen(false);
          setSectionToDelete(null);
        }}
        projectId={projectId}
        mode={sectionToDelete ? "delete" : "create"}
        sectionToDelete={sectionToDelete}
      />
    </div>
  );
};

export default ProjectBoard;
