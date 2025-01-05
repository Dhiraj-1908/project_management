import React from 'react';
import { Project, Status, useGetCompletedProjectsQuery } from "@/state/api";
import { Calendar, Clock, CheckCircle } from "lucide-react";

interface ProjectHistoryProps {
  projects: Project[];
}

const ProjectHistory: React.FC<ProjectHistoryProps> = () => {
  const { data: completedProjects = [] } = useGetCompletedProjectsQuery();
  
  const projectsWithEndDate = completedProjects
    .filter(project => project.actualEndDate)
    .sort((a, b) => new Date(b.actualEndDate || '').getTime() - new Date(a.actualEndDate || '').getTime());

  // Rest of the component remains the same
  const formatDate = (date: string | undefined) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString();
  };

  const isDelayed = (project: Project) => {
    if (!project.endDate || !project.actualEndDate) return false;
    return new Date(project.actualEndDate) > new Date(project.endDate);
  };

  return (
    <div className="space-y-6">
      {projectsWithEndDate.map((project) => (
        <div key={project.id} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {project.name}
                </h3>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                {project.description}
              </p>
            </div>
            <div className="text-right space-y-2">
              <div className="flex items-center justify-end gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>Started: {formatDate(project.startDate)}</span>
              </div>
              <div className="flex items-center justify-end gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                <Clock className="h-4 w-4" />
                <span>Planned End: {formatDate(project.endDate)}</span>
              </div>
              <div className={`flex items-center justify-end gap-2 text-sm ${
                isDelayed(project) ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
              }`}>
                <CheckCircle className="h-4 w-4" />
                <span>Actual Completion: {formatDate(project.actualEndDate)}</span>
              </div>
            </div>
          </div>

          {project.tasks && (
            <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  Completed Tasks: {project.tasks.filter(task => task.status === Status.Completed).length} / {project.tasks.length}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  Completion Rate: {Math.round((project.tasks.filter(task => task.status === Status.Completed).length / project.tasks.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-green-500 h-2.5 rounded-full"
                  style={{
                    width: `${(project.tasks.filter(task => task.status === Status.Completed).length / project.tasks.length) * 100}%`
                  }}
                />
              </div>
            </div>
          )}

          {isDelayed(project) && (
            <div className="mt-4 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">
                This project was completed after its planned end date.
              </p>
            </div>
          )}
        </div>
      ))}
      
      {projectsWithEndDate.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-gray-500 dark:text-gray-400">
            No completed projects found
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectHistory;