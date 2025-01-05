import React, { useState } from 'react';
import Header from "@/components/Header";
import { TaskCard } from "@/components/TaskCard";
import { Task, useGetTasksQuery, useDeleteTaskMutation } from "@/state/api";

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

type ViewType = 'grid' | 'list';

const ListView = ({ id, setIsModalNewTaskOpen }: Props) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewType, setViewType] = useState<ViewType>('grid');
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  
    const {
      data: tasks,
      error,
      isLoading,
    } = useGetTasksQuery({ projectId: Number(id) });
  
    const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();
  
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    };
  
    const handleDeleteTask = async () => {
      if (taskToDelete) {
        try {
          await deleteTask(taskToDelete.id).unwrap();
          setTaskToDelete(null);
        } catch (err) {
          console.error('Failed to delete task:', err);
        }
      }
    };

  const filteredTasks = tasks?.filter((task: Task) =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        An error occurred while fetching tasks
      </div>
    );
  }

  return (
    <div className="px-4 pb-8 xl:px-6">
      <div className="pt-5">
        <Header
          name="Tasks"
          buttonComponent={
            <button
              onClick={() => setIsModalNewTaskOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Add Task
            </button>
          }
          isSmallText
        />
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-64">
          <svg className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-8 w-full rounded border border-gray-300 p-2"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            className={`p-2 rounded ${viewType === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setViewType('grid')}
          >
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </button>
          <button
            className={`p-2 rounded ${viewType === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setViewType('list')}
          >
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {viewType === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {filteredTasks?.map((task: Task) => (
            <div key={task.id} className="relative group">
              <TaskCard task={task} />
              <button
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setTaskToDelete(task)}
              >
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks?.map((task: Task) => (
            <div key={task.id} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
              <div className="flex-grow">
                <h3 className="font-semibold">{task.title}</h3>
                <p className="text-sm text-gray-500">{task.description}</p>
              </div>
              <button
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
                onClick={() => setTaskToDelete(task)}
              >
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {taskToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Task</h3>
            <p className="mb-4">
              Are you sure you want to delete &quot;{taskToDelete.title}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 border rounded hover:bg-gray-50"
                onClick={() => setTaskToDelete(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                onClick={handleDeleteTask}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListView;