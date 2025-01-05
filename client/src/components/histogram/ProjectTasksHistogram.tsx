import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Status, useGetProjectsQuery } from "@/state/api";

interface TaskCount {
  [Status.ToDo]: number;
  [Status.WorkInProgress]: number;
  [Status.UnderReview]: number;
  [Status.Completed]: number;
}

interface ProjectData {
  name: string;
  total: number;
  [Status.ToDo]: number;
  [Status.WorkInProgress]: number;
  [Status.UnderReview]: number;
  [Status.Completed]: number;
}

interface ProjectWithTasks {
  id: number;
  name: string;
  tasks: Array<{
    id: number;
    status: Status;
  }>;
}

const ProjectTasksHistogram = () => {
  const { data: projects, isLoading } = useGetProjectsQuery();
  const [hideEmptyProjects, setHideEmptyProjects] = useState(false);
  const [hideCompletedProjects, setHideCompletedProjects] = useState(false);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-lg p-4 dark:bg-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  if (!projects) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-lg p-4 dark:bg-gray-800">
        <span className="text-gray-600 dark:text-gray-300">No data available</span>
      </div>
    );
  }

  const processedData: ProjectData[] = (projects as ProjectWithTasks[]).map(project => {
    const taskCounts: TaskCount = {
      [Status.ToDo]: 0,
      [Status.WorkInProgress]: 0,
      [Status.UnderReview]: 0,
      [Status.Completed]: 0
    };

    project.tasks?.forEach((task) => {
      if (task.status) {
        taskCounts[task.status] = (taskCounts[task.status] || 0) + 1;
      }
    });

    return {
      name: project.name,
      total: project.tasks?.length || 0,
      [Status.ToDo]: taskCounts[Status.ToDo],
      [Status.WorkInProgress]: taskCounts[Status.WorkInProgress],
      [Status.UnderReview]: taskCounts[Status.UnderReview],
      [Status.Completed]: taskCounts[Status.Completed]
    };
  });

  const filteredData = processedData.filter(project => {
    if (hideEmptyProjects && project.total === 0) return false;
    if (hideCompletedProjects && 
        project.total > 0 && 
        project[Status.ToDo] === 0 && 
        project[Status.WorkInProgress] === 0 && 
        project[Status.UnderReview] === 0 && 
        project[Status.Completed] > 0) {
      return false;
    }
    return true;
  });

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800 transition-all duration-300 hover:shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
          Tasks Distribution by Project
        </h3>
        <div className="flex gap-6">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hide-empty"
              checked={hideEmptyProjects}
              onChange={(e) => setHideEmptyProjects(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 transition-colors duration-200"
            />
            <label 
              htmlFor="hide-empty" 
              className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
            >
              Hide Empty Projects
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hide-completed"
              checked={hideCompletedProjects}
              onChange={(e) => setHideCompletedProjects(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 transition-colors duration-200"
            />
            <label 
              htmlFor="hide-completed" 
              className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
            >
              Hide Completed Projects
            </label>
          </div>
        </div>
      </div>
      
      <div className="h-96 overflow-x-auto">
        <div style={{ 
          minWidth: `${Math.max(800, filteredData.length * 100)}px`, 
          height: "100%" 
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#374151"
                opacity={0.1}
              />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickLine={{ stroke: '#6B7280' }}
              />
              <YAxis
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickLine={{ stroke: '#6B7280' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.95)',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#E5E7EB'
                }}
                cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                labelStyle={{ color: '#E5E7EB' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => <span className="text-gray-700 dark:text-gray-300">{value}</span>}
              />
              <Bar 
                dataKey={Status.ToDo} 
                stackId="a" 
                fill="#87CEEB"
                name="To Do" 
                animationDuration={500}
              />
              <Bar 
                dataKey={Status.WorkInProgress} 
                stackId="a" 
                fill="#FF9800"
                name="In Progress" 
                animationDuration={500}
              />
              <Bar 
                dataKey={Status.UnderReview} 
                stackId="a" 
                fill="#EF4444"
                name="Under Review" 
                animationDuration={500}
              />
              <Bar 
                dataKey={Status.Completed} 
                stackId="a" 
                fill="#10B981"
                name="Completed" 
                animationDuration={500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProjectTasksHistogram;