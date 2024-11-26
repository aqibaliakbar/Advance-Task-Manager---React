import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  useGetTasksQuery,
  useGetProjectTasksQuery,
} from "../../store/services/api";

import { useSelector } from "react-redux";

const TaskList = ({ selectedProjectId, projectName }) => {
    const { session } = useSelector((state) => state.user);
    const user = session?.user;
  const { data: allTasks = [] } = useGetTasksQuery();
  const { data: projectTasks = [] } = useGetProjectTasksQuery(
    selectedProjectId,
    {
      skip: selectedProjectId === "all",
    }
  );

  // Filter tasks assigned to current user
  const filterUserTasks = (tasks) => {
    return tasks.filter((task) => task.assigned_to === user?.id);
  };

  const getFilteredTasks = (status) => {
    let tasksToFilter;

    if (selectedProjectId === "all") {
      // When no project is selected, show only user's tasks
      tasksToFilter = filterUserTasks(allTasks);
    } else {
      // When project is selected, show all project tasks
      tasksToFilter = projectTasks;
    }

    switch (status) {
      case "upcoming":
        return tasksToFilter.filter(
          (task) =>
            !task.completed &&
            task.due_date &&
            new Date(task.due_date) >= new Date()
        );
      case "overdue":
        return tasksToFilter.filter(
          (task) =>
            !task.completed &&
            task.due_date &&
            new Date(task.due_date) < new Date()
        );
      case "completed":
        return tasksToFilter.filter(
          (task) => task.completed || task.sections?.name === "Done"
        );
      default:
        return tasksToFilter;
    }
  };

  const renderTask = (task) => (
    <div
      key={task.id}
      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
    >
      <div className="flex flex-col">
        <span className="font-medium">{task.description}</span>
        {task.is_subtask && (
          <span className="text-sm text-gray-500">
            Subtask of: {task?.description}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {task.due_date && (
          <span className="text-sm text-gray-500">
            {new Date(task.due_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
        <span
          className={`px-2 py-1 text-sm rounded ${
            task.priority === "High"
              ? "bg-red-100 text-red-700"
              : task.priority === "Medium"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {task.priority}
        </span>
        {selectedProjectId === "all" && (
          <span className="px-2 py-1 text-sm bg-gray-900 text-white rounded">
            {task.project?.name}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <>
      <h2 className="text-xl font-semibold mb-6">
        {selectedProjectId === "all" ? "My Tasks" : `Tasks - ${projectName}`}
      </h2>
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        {["upcoming", "overdue", "completed"].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {getFilteredTasks(status).map(renderTask)}
            {getFilteredTasks(status).length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No {status} tasks{" "}
                {selectedProjectId === "all"
                  ? "assigned to you"
                  : "in this project"}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
};

export default TaskList;
