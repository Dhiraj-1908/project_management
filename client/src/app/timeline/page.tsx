"use client";

import { useAppSelector } from "@/app/redux";
import Header from "@/components/Header";
import { useGetProjectsQuery } from "@/state/api";
import { 
  DisplayOption, 
  Gantt, 
  ViewMode, 
  Task as GanttTask 
} from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import React, { useMemo, useState, useRef, useEffect } from "react";
import { FaCalendarAlt, FaClock, FaChartLine } from "react-icons/fa";

interface Project {
  id: string | number;
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  progress?: number;
}

interface CustomTooltipData {
  name: string;
  startDate: string;
  endDate: string;
  duration: string;
  progress: string;
}

interface GanttTaskWithTooltip extends GanttTask {
  customTooltip?: CustomTooltipData;
}

const Timeline: React.FC = () => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const { data: projectsData, isLoading, isError } = useGetProjectsQuery();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  
  const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: "en-US",
  });

  const ganttTasks = useMemo(() => {
    return (projectsData as Project[])?.map((projectItem) => {
      const startDate = new Date(projectItem.startDate);
      const endDate = new Date(projectItem.endDate);
      const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));

      return {
        start: startDate,
        end: endDate,
        name: projectItem.name,
        id: `Project-${projectItem.id}`,
        type: "project",
        progress: projectItem.progress ?? 50,
        isDisabled: false,
        customTooltip: {
          name: projectItem.name,
          startDate: startDate.toLocaleDateString(),
          endDate: endDate.toLocaleDateString(),
          duration: `${duration} days`,
          progress: `${projectItem.progress ?? 50}%`
        }
      } as GanttTaskWithTooltip;
    }) || [];
  }, [projectsData]);

  const calculateScrollPosition = (date: Date, container: HTMLDivElement): number => {
    if (!ganttTasks.length) return 0;
    
    const ganttElement = container.querySelector('.gantt-container');
    if (!ganttElement) return 0;

    const ganttStartDate = new Date(Math.min(...ganttTasks.map(task => task.start.getTime())));
    const ganttEndDate = new Date(Math.max(...ganttTasks.map(task => task.end.getTime())));
    
    const totalDays = Math.ceil((ganttEndDate.getTime() - ganttStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysFromStart = Math.ceil((date.getTime() - ganttStartDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let columnWidth = 150;
    switch (displayOptions.viewMode) {
      case ViewMode.Year:
        columnWidth = 200;
        break;
      case ViewMode.Month:
      case ViewMode.Week:
      case ViewMode.Day:
        columnWidth = 150;
        break;
    }

    const listWidth = 161;
    const datePosition = (daysFromStart / totalDays) * (totalDays * columnWidth);
    let scrollPosition = listWidth + datePosition - (container.clientWidth / 2);
    
    return Math.max(0, Math.min(scrollPosition, container.scrollWidth - container.clientWidth));
  };

  const scrollToDate = (date: Date) => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || !ganttTasks.length) return;

    requestAnimationFrame(() => {
      const scrollPosition = calculateScrollPosition(date, scrollContainer);
      scrollContainer.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    });
  };

  // Handle initial scroll to show the full range
  useEffect(() => {
    if (ganttTasks.length > 0) {
      const timer = setTimeout(() => {
        const earliestDate = new Date(Math.min(...ganttTasks.map(task => task.start.getTime())));
        scrollToDate(earliestDate);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [ganttTasks.length]);

  const handleViewModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newViewMode = event.target.value as ViewMode;
    setDisplayOptions(prev => ({
      ...prev,
      viewMode: newViewMode
    }));
  };

  // New click handler for the container
  const handleContainerClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const taskRow = target.closest('.gantt-task-row');
    
    if (taskRow) {
      const taskId = taskRow.getAttribute('data-task-id');
      const task = ganttTasks.find(t => t.id === taskId);
      if (task) {
        scrollToDate(task.start);
      }
    }
  };

  useEffect(() => {
    // Add click event listeners to task rows after component mounts
    const container = scrollContainerRef.current;
    if (container) {
      const observer = new MutationObserver(() => {
        const taskRows = container.querySelectorAll('.gantt-task-row');
        taskRows.forEach(row => {
          if (!row.getAttribute('data-click-handler-attached')) {
            row.setAttribute('data-click-handler-attached', 'true');
            row.addEventListener('click', (e) => {
              const taskId = row.getAttribute('data-task-id');
              const task = ganttTasks.find(t => t.id === taskId);
              if (task) {
                scrollToDate(task.start);
              }
            });
          }
        });
      });

      observer.observe(container, {
        childList: true,
        subtree: true
      });

      return () => observer.disconnect();
    }
  }, [ganttTasks]);

  const colorConfig = {
    light: {
      projectBackground: "#3b82f6",
      projectProgress: "#134994",
      projectProgressSelected: "#2563eb",
      text: "#1f2937",
      border: "#e5e7eb",
    },
    dark: {
      projectBackground: "#517078",
      projectProgress: "#f7a50f",
      projectProgressSelected: "#059669",
      text: "#f9fafb",
      border: "#374151",
    },
  };

  const currentColors = isDarkMode ? colorConfig.dark : colorConfig.light;

  if (isLoading) return <div className="text-center text-xl">Loading...</div>;
  if (isError || !projectsData)
    return <div className="text-center text-xl text-red-500">An error occurred while fetching projects</div>;

  return (
    <div className="max-w-full p-8 bg-gray-50 dark:bg-gray-900">
      <header className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <Header name="Projects Timeline" />
        <div className="flex items-center gap-4">
          <div className="relative inline-block w-48">
            <select
              className={`
                pl-4 pr-8 py-2 w-full rounded-md border-2 transition duration-300 appearance-none
                focus:outline-none focus:ring-2
                ${isDarkMode 
                  ? "bg-gray-800 text-white border-gray-600 hover:border-gray-500 focus:border-blue-500" 
                  : "bg-white text-black border-gray-300 hover:border-gray-400 focus:border-blue-600"
                }
              `}
              value={displayOptions.viewMode}
              onChange={handleViewModeChange}
            >
              <option value={ViewMode.Day}>Day</option>
              <option value={ViewMode.Week}>Week</option>
              <option value={ViewMode.Month}>Month</option>
              <option value={ViewMode.Year}>Year</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      <div
        ref={scrollContainerRef}
        className="overflow-x-auto rounded-md shadow-lg"
        onClick={handleContainerClick}
        style={{
          backgroundColor: currentColors.projectBackground,
          color: currentColors.text,
          scrollbarWidth: 'thin',
          scrollbarColor: `${isDarkMode ? '#4B5563 #1F2937' : '#CBD5E1 #F1F5F9'}`,
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            height: 8px;
            width: 8px;
          }
          div::-webkit-scrollbar-track {
            background: ${isDarkMode ? '#1F2937' : '#F1F5F9'};
            border-radius: 4px;
          }
          div::-webkit-scrollbar-thumb {
            background: ${isDarkMode ? '#4B5563' : '#CBD5E1'};
            border-radius: 4px;
          }
          div::-webkit-scrollbar-thumb:hover {
            background: ${isDarkMode ? '#6B7280' : '#94A3B8'};
          }

          .gantt-task-row {
            cursor: pointer;
          }

          .gantt-task-row:hover {
            background-color: ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
          }
        `}</style>
        <div className="timeline min-w-[1200px]">
          <Gantt
            tasks={ganttTasks}
            viewMode={displayOptions.viewMode}
            locale={displayOptions.locale}
            columnWidth={
              displayOptions.viewMode === ViewMode.Year
                ? 200
                : displayOptions.viewMode === ViewMode.Month
                ? 150
                : 150
            }
            listCellWidth="161px"
            projectBackgroundColor={currentColors.projectBackground}
            projectProgressColor={currentColors.projectProgress}
            projectProgressSelectedColor={currentColors.projectProgressSelected}
            headerHeight={50}
            rowHeight={40}
            ganttHeight={500}
            TooltipContent={({ task }) => {
              const customTooltip = (task as GanttTaskWithTooltip).customTooltip;
              if (!customTooltip) return null;

              return (
                <div className={`
                  p-4 rounded-lg shadow-xl 
                  ${isDarkMode 
                    ? 'bg-gray-800 text-white border-gray-700' 
                    : 'bg-white text-gray-800 border-gray-200'
                  } border`}
                >
                  <div className="text-lg font-bold mb-3 flex items-center">
                    <span className="mr-2 text-white">🔷</span>
                    {customTooltip.name}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-2 text-blue-500" />
                      <span>From: {customTooltip.startDate}</span>
                    </div>
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-2 text-blue-500" />
                      <span>To: {customTooltip.endDate}</span>
                    </div>
                    <div className="flex items-center">
                      <FaClock className="mr-2 text-green-500" />
                      <span>Duration: {customTooltip.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <FaChartLine className="mr-2 text-purple-500" />
                      <span>Progress: {customTooltip.progress}</span>
                    </div>
                  </div>
                </div>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Timeline;