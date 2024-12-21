import React from 'react';
import { Project } from "@/state/api";
import { format } from "date-fns";

type ProjectCardProps = {
  project: Project;
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

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const getProjectStatus = () => {
    const now = new Date();
    if (!project.startDate || !project.endDate) return 'Not Started';
    
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);

    if (now < startDate) return 'Not Started';
    if (now > endDate) return 'Completed';
    return 'In Progress';
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'not started':
        return 'bg-gray-100 text-gray-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const status = getProjectStatus();

  return (
    <div
      className="relative rounded-lg p-6 shadow-md border-l-4 transform transition-all duration-200 
                 hover:scale-[1.02] hover:shadow-xl hover:-translate-y-1 ml-2"
      style={{
        backgroundColor: '#f0f9ff',
        borderColor: '#3b82f6',
        minHeight: '300px',
        maxWidth: '350px'
      }}
    >
      <div className="absolute top-4 right-4">
        <Badge className={`${getStatusBadgeStyle(status)} font-medium px-3 py-1`}>
          {status}
        </Badge>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-bold mb-3 text-gray-900">{project.name}</h3>

        <div className="mb-4 bg-white bg-opacity-50 rounded-md p-3">
          <h4 className="font-semibold text-gray-700 mb-1">Description:</h4>
          <p className="text-sm text-gray-600">
            {project.description || "No description provided"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div className="space-y-2">
            <p className="flex items-center gap-2">
              <span className="font-semibold">Start Date:</span>
              <span className="text-gray-700">
                {project.startDate ? format(new Date(project.startDate), "MMM d, yyyy") : "Not set"}
              </span>
            </p>
            
            <p className="flex items-center gap-2">
              <span className="font-semibold">End Date:</span>
              <span className="text-gray-700">
                {project.endDate ? format(new Date(project.endDate), "MMM d, yyyy") : "Not set"}
              </span>
            </p>
          </div>

          <div className="space-y-2">
            <p className="flex items-center gap-2">
              <span className="font-semibold">Status:</span>
              <span className="text-gray-700">{status}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;