"use client"
import React, { useMemo } from "react";
import { Priority, useGetProjectsQuery } from "@/state/api";
import Header from "@/components/Header";
import ProjectsGrid from "@/components/projectmanagement/grider/ProjectsGrid";
import ProjectTasksHistogram from "@/components/histogram/ProjectTasksHistogram";
import {
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar
} from "recharts";
import { useAppSelector } from "../redux";
import { useState } from 'react';
import ProjectHistory from '@/components/projectmanagement/grider/projecthistory';
import { ChevronDown } from 'lucide-react';  // Added this import

const HomePage = () => {
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const { data: projects, isLoading: isProjectsLoading } = useGetProjectsQuery();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  // Calculate priority distribution
  const priorityDistribution = useMemo(() => {
    if (!projects) return [];
    
    const allTasks = projects.flatMap(project => project.tasks || []);
    return Object.values(Priority).map(priority => ({
      name: priority,
      count: allTasks.filter(task => task.priority === priority).length
    }));
  }, [projects]);

  // Calculate project status
  const projectStatus = useMemo(() => [
    {
      name: "Active",
      count: projects?.filter(p => !p.endDate).length || 0
    },
    {
      name: "Completed",
      count: projects?.filter(p => p.endDate).length || 0
    }
  ], [projects]);

  if (isProjectsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg font-semibold">Loading dashboard...</div>
      </div>
    );
  }

  if (!projects) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg font-semibold text-red-500">Error fetching data</div>
      </div>
    );
  }

  const chartColors = {
    background: isDarkMode ? "#dfe5ed" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#000000",
    grid: isDarkMode ? "#374151" : "#E5E7EB"
  };

  return (
    <div className={`min-h-screen w-full p-8 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <Header name="Project Management Dashboard" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="col-span-full">
          <ProjectTasksHistogram />
        </div>

        <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <h3 className="mb-4 text-xl font-bold dark:text-white">
            Task Priority Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="name" stroke={chartColors.text} />
              <YAxis stroke={chartColors.text} />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartColors.background,
                  border: "none",
                  borderRadius: "8px"
                }}
              />
              <Bar dataKey="count" fill="#4A90E2" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <h3 className="mb-4 text-xl font-bold dark:text-white">
            Project Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={projectStatus}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {projectStatus.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? "#4A90E2" : "#2ECC71"}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: chartColors.background,
                  border: "none",
                  borderRadius: "8px"
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-full rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold dark:text-white">
              Your Projects
            </h3>
          </div>
          <ProjectsGrid />
        </div>

        <div className="col-span-full rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
          >
            <h3 className="text-xl font-bold dark:text-white">
              Project History
            </h3>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <ChevronDown 
                className={`h-5 w-5 transform transition-transform ${
                  isHistoryExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>
          {isHistoryExpanded && projects && (
            <div className="mt-4">
              <ProjectHistory projects={projects} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;