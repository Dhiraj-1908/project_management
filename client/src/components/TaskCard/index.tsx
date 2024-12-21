import React from 'react';
import { Task, Priority } from "@/state/api";
import { format } from "date-fns";
import Image from 'next/image';

type TaskCardProps = {
    task: Task;
};

type TaskListProps = {
    tasks: Task[];
};

const Badge: React.FC<{ children: React.ReactNode; className?: string; variant?: 'outline' | 'filled' }> = ({ 
  children, 
  className = '', 
  variant = 'filled' 
}) => {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  const variantStyles = variant === 'outline' ? 'border border-current bg-transparent' : '';
  
  return (
    <span className={`${baseStyles} ${variantStyles} ${className}`}>
      {children}
    </span>
  );
};

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const getCardStyles = (priority?: Priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return {
          backgroundColor: '#fef2f2',
          borderColor: '#ef4444',
          badgeColor: 'bg-red-100 text-red-800'
        };
      case 'high':
        return {
          backgroundColor: '#fff7ed',
          borderColor: '#f97316',
          badgeColor: 'bg-orange-100 text-orange-800'
        };
      case 'medium':
        return {
          backgroundColor: '#fefce8',
          borderColor: '#facc15',
          badgeColor: 'bg-yellow-100 text-yellow-800'
        };
      case 'low':
        return {
          backgroundColor: '#f0fdf4',
          borderColor: '#22c55e',
          badgeColor: 'bg-green-100 text-green-800'
        };
      case 'backlog':
        return {
          backgroundColor: '#f9fafb',
          borderColor: '#9ca3af',
          badgeColor: 'bg-gray-100 text-gray-800'
        };
      default:
        return {
          backgroundColor: '#f0f9ff',
          borderColor: '#3b82f6',
          badgeColor: 'bg-blue-100 text-blue-800'
        };
    }
  };

  const getStatusBadgeStyle = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'todo':
        return 'bg-slate-100 text-slate-800';
      case 'in progress':
      case 'work in progress':
        return 'bg-blue-100 text-blue-800';
      case 'under review':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const styles = getCardStyles(task.priority);

  return (
    <div
      className="relative rounded-lg p-6 shadow-md border-l-4 transform transition-all duration-200 
                 hover:scale-[1.02] hover:shadow-xl hover:-translate-y-1 ml-2"
      style={{
        backgroundColor: styles.backgroundColor,
        borderColor: styles.borderColor,
        minHeight: '300px',
        maxWidth: '350px'
      }}
    >
      <div className="absolute top-4 right-4">
        <Badge className={`${getStatusBadgeStyle(task.status)} font-medium px-3 py-1`}>
          {task.status || 'No Status'}
        </Badge>
      </div>

      <div className="mt-6">
        {task.attachments && task.attachments.length > 0 && (
          <div className="mb-4">
            <Image
              src={`/${task.attachments[0].fileURL}`}
              alt={task.attachments[0].fileName}
              width={400}
              height={200}
              className="rounded-md shadow-sm object-cover w-full h-32"
            />
          </div>
        )}

        <h3 className="text-xl font-bold mb-3 text-gray-900">{task.title}</h3>

        {/* Task Description Section */}
        <div className="mb-4 bg-white bg-opacity-50 rounded-md p-3">
          <h4 className="font-semibold text-gray-700 mb-1">Description:</h4>
          <p className="text-sm text-gray-600">
            {task.description || "No description provided"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div className="space-y-2">
            <Badge className={styles.badgeColor}>
              {task.priority || 'No Priority'} Priority
            </Badge>
            
            <p className="flex items-center gap-2">
              <span className="font-semibold">Assignee:</span>
              <span className="text-gray-700">{task.assignee?.username || "Unassigned"}</span>
            </p>
            
            <p className="flex items-center gap-2">
              <span className="font-semibold">Author:</span>
              <span className="text-gray-700">{task.author?.username || "Unknown"}</span>
            </p>
          </div>

          <div className="space-y-2">
            <p className="flex items-center gap-2">
              <span className="font-semibold">Start:</span>
              <span className="text-gray-700">{task.startDate ? format(new Date(task.startDate), "MMM d") : "Not set"}</span>
            </p>
            
            <p className="flex items-center gap-2">
              <span className="font-semibold">Due:</span>
              <span className="text-gray-700">{task.dueDate ? format(new Date(task.dueDate), "MMM d") : "Not set"}</span>
            </p>
            
            {task.tags && (
              <div className="flex flex-wrap gap-1">
                {task.tags.split(',').map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs text-gray-600">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Task List</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

export { TaskCard, TaskList };