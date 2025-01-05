import { useAppSelector } from "@/app/redux";
import { useGetTasksQuery } from "@/state/api";
import { DisplayOption, Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import React, { useMemo, useState } from "react";

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

type TaskTypeItems = "task" | "milestone" | "project";

const Timeline = ({ id, setIsModalNewTaskOpen }: Props) => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const {
    data: tasks,
    error,
    isLoading,
  } = useGetTasksQuery({ projectId: Number(id) });

  const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: "en-US",
  });

  // Add custom CSS to override Gantt styles in dark mode
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      ${isDarkMode ? `
        /* Fixed column headers */
        .gantt-table-header-cell span,
        .gantt-table-header-cell div,
        .gantt-table-header-cell-text,
        .gantt-table-header-label {
          color: #f5942c !important;
        }

        /* Fixed column cell content */
        .gantt-table-cell span,
        .gantt-table-cell div,
        .gantt-list-task-cell,
        .gantt-list-task-cell div,
        .gantt-list-task-cell span {
          color: #ffffff !important;
        }

        /* Task names and details in the fixed column */
        .gantt-list-task-row-text,
        .gantt-task-row .gantt-task-row-text {
          color: #ffffff !important;
        }
      ` : ""}
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [isDarkMode]);

  const ganttTasks = useMemo(() => {
    return (
      tasks?.map((task) => ({
        start: new Date(task.startDate as string),
        end: new Date(task.dueDate as string),
        name: task.title,
        id: `Task-${task.id}`,
        type: "task" as TaskTypeItems,
        progress: task.points ? (task.points / 10) * 100 : 0,
        isDisabled: false,
      })) || []
    );
  }, [tasks]);

  const handleViewModeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setDisplayOptions((prev) => ({
      ...prev,
      viewMode: event.target.value as ViewMode,
    }));
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );

  if (error || !tasks)
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        <span className="text-lg">An error occurred while fetching tasks</span>
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Project Tasks Timeline
        </h1>
        <div className="relative">
          <select
            className="w-64 px-4 py-2 text-sm rounded-lg border border-gray-200 bg-white shadow-sm 
                       focus:border-orange-500 focus:ring-2 focus:ring-orange-200 
                       dark:border-gray-600 dark:bg-gray-700 dark:text-white 
                       transition-all duration-200 ease-in-out"
            value={displayOptions.viewMode}
            onChange={handleViewModeChange}
          >
            <option value={ViewMode.Day}>Daily View</option>
            <option value={ViewMode.Week}>Weekly View</option>
            <option value={ViewMode.Month}>Monthly View</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-lg dark:bg-gray-800 overflow-hidden">
        <div className="timeline p-4">
          <Gantt
            tasks={ganttTasks}
            {...displayOptions}
            columnWidth={displayOptions.viewMode === ViewMode.Month ? 150 : 100}
            listCellWidth="180px"
            barBackgroundColor={isDarkMode ? "#f57d14" : "#2fb9f5"}
            barBackgroundSelectedColor={isDarkMode ? "#41f0ca" : "#2315e8"}
            barProgressColor={isDarkMode ? "#f59c2f" : "#253bfa"}
            projectBackgroundColor={isDarkMode ? "#374151" : "#FFEDD5"}
            rtl={false}
            todayColor={isDarkMode ? "rgba(249, 115, 22, 0.1)" : "rgba(249, 115, 22, 0.1)"}
            rowHeight={50}
            fontFamily="Inter, system-ui, -apple-system, sans-serif"
          />
        </div>
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
          <button
            className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white 
                       bg-sky-500 hover:bg-sky-600 rounded-lg
                       dark:bg-orange-500 dark:hover:bg-orange-600
                       transition-colors duration-200 ease-in-out"
            onClick={() => setIsModalNewTaskOpen(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default Timeline;