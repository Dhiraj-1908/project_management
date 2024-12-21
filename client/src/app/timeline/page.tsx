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
import { FaProjectDiagram, FaCalendarAlt, FaClock, FaChartLine } from "react-icons/fa";

interface Project {
  id: string | number;
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  progress?: number;
}

interface ColorConfig {
  projectBackground: string;
  projectProgress: string;
  projectProgressSelected: string;
  text: string;
  border: string;
}

const Timeline: React.FC = () => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const { data: projectsData, isLoading, isError } = useGetProjectsQuery();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollAnimationRef = useRef<number | undefined>(undefined);
  const lastScrollPosition = useRef<number>(0);
  const isMouseDown = useRef<boolean>(false);

  const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: "en-US",
  });

  // Enhanced smooth scrolling with animation frame and boundary check
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    let startX: number;
    let scrollLeft: number;
    let currentVelocity = 0;
    const friction = 0.85;
    const velocityScale = 0.8;

    const animate = () => {
      if (!scrollContainer) return;

      if (Math.abs(currentVelocity) > 0.1) {
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        const newScrollLeft = scrollContainer.scrollLeft + currentVelocity;

        // Check if we're at the boundaries
        if (newScrollLeft >= 0 && newScrollLeft <= maxScroll) {
          scrollContainer.scrollLeft = newScrollLeft;
          currentVelocity *= friction;
          scrollAnimationRef.current = requestAnimationFrame(animate);
        } else {
          // Stop animation at boundaries
          currentVelocity = 0;
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (scrollContainer) {
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        const newScrollLeft = scrollContainer.scrollLeft + (e.deltaX || e.deltaY);

        // Only update velocity if we're not at the boundaries
        if (newScrollLeft >= 0 && newScrollLeft <= maxScroll) {
          if (scrollAnimationRef.current) {
            cancelAnimationFrame(scrollAnimationRef.current);
          }
          
          currentVelocity = (e.deltaX || e.deltaY) * velocityScale;
          scrollAnimationRef.current = requestAnimationFrame(animate);
        }
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      isMouseDown.current = true;
      startX = e.pageX - scrollContainer.offsetLeft;
      scrollLeft = scrollContainer.scrollLeft;
      
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current);
      }
      
      document.body.style.userSelect = 'none';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown.current) return;
      
      const x = e.pageX - scrollContainer.offsetLeft;
      const walk = (x - startX) * 1.5;
      const newScrollLeft = scrollLeft - walk;
      
      // Check boundaries before scrolling
      const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
      scrollContainer.scrollLeft = Math.max(0, Math.min(newScrollLeft, maxScroll));
    };

    const handleMouseUp = () => {
      isMouseDown.current = false;
      document.body.style.userSelect = '';
    };

    const handleMouseLeave = () => {
      isMouseDown.current = false;
      document.body.style.userSelect = '';
    };

    scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
    scrollContainer.addEventListener('mousedown', handleMouseDown);
    scrollContainer.addEventListener('mousemove', handleMouseMove);
    scrollContainer.addEventListener('mouseup', handleMouseUp);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current);
      }
      scrollContainer.removeEventListener('wheel', handleWheel);
      scrollContainer.removeEventListener('mousedown', handleMouseDown);
      scrollContainer.removeEventListener('mousemove', handleMouseMove);
      scrollContainer.removeEventListener('mouseup', handleMouseUp);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Memoized Gantt tasks
  const ganttTasks = useMemo(() => {
    return (
      (projectsData as Project[])?.map((projectItem) => {
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
        } as GanttTask & { customTooltip?: any };
      }) || []
    );
  }, [projectsData]);

  const handleViewModeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setDisplayOptions((prev) => ({
      ...prev,
      viewMode: event.target.value as ViewMode,
    }));
  };

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
      <header className="mb-6 flex items-center justify-between">
        <Header name="Projects Timeline" />
        <div className="relative inline-block w-64">
          <select
            className={`
              pl-4 pr-8 py-2 w-full rounded-md border-2 transition duration-300 appearance-none
              focus:outline-none focus:ring-2
              ${isDarkMode 
                ? "bg-gray-800 text-white border-gray-600 hover:border-gray-500" 
                : "bg-white text-black border-gray-300 hover:border-gray-400"
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
      </header>

      <div
        ref={scrollContainerRef}
        className="overflow-x-auto rounded-md shadow-lg will-change-transform"
        style={{
          backgroundColor: currentColors.projectBackground,
          color: currentColors.text,
          scrollbarWidth: 'thin',
          scrollbarColor: `${isDarkMode ? '#4B5563 #1F2937' : '#CBD5E1 #F1F5F9'}`,
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          perspective: '1000px',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
      >
        <style jsx>{`
          div {
            -webkit-transform: translateZ(0);
            -moz-transform: translateZ(0);
            -ms-transform: translateZ(0);
            -o-transform: translateZ(0);
            transform: translateZ(0);
            -webkit-backface-visibility: hidden;
            -moz-backface-visibility: hidden;
            -ms-backface-visibility: hidden;
            backface-visibility: hidden;
            scroll-behavior: smooth;
          }
          div::-webkit-scrollbar {
            height: 8px;
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
              const customTooltip = (task as any).customTooltip;
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