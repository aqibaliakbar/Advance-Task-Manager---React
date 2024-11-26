// pages/projects/[projectId].jsx
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useGetProjectQuery } from "../../store/services/api";
import ProjectBoard from "../../components/projects/ProjectBoard";
import LoadingSpinner from "../../components/shared/LoadingSpinner";


const ProjectPage = () => {
  const { projectId } = useParams();
  const {
    data: project,
    isLoading,
    error,
    refetch,
  } = useGetProjectQuery(projectId);

  
  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold text-red-600">
          Error loading project
        </h1>
        <p className="text-gray-600">{error.message}</p>
      </div>
    );
  if (!project)
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Project not found</h1>
      </div>
    );

  return (
    <div className="h-full">
      <ProjectBoard project={project} projectId={projectId} />
    </div>
  );
};

export default ProjectPage;
