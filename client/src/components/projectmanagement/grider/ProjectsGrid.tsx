import React, { useState } from 'react';
import { Project, Task, Status, useGetProjectsQuery, useCreateProjectMutation, useDeleteProjectMutation, useUpdateProjectMutation, useGetTasksQuery } from "@/state/api";
import { Trash2, CheckSquare, Plus, Grid, List, LayoutGrid, X, Maximize2, Calendar, Clock } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import CompletionDialog from '@/components/Completion/CompletionDialog';


interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'danger';
  className?: string;
  children: React.ReactNode;
}

interface ProjectProgressProps {
  tasks: Task[];
}

interface AddProjectDialogProps {
  onClose: () => void;
  isOpen: boolean;
  onProjectAdded: () => void;
}

interface ProjectFormData {
  name: string;
  description: string;
  startDate: string;
}

interface TaskStatusData {
  name: Status;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: Status;
    value: number;
    payload: {
      name: Status;
      value: number;
    };
  }>;
}




const CHART_COLORS = {
  [Status.ToDo]: '#3B82F6',        // Blue
  [Status.Completed]: '#10B981',    // Green
  [Status.WorkInProgress]: '#F59E0B',   // Yellow
  [Status.UnderReview]: '#F97316'   // Orange
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'default', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-md font-medium transition-colors duration-200";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
    outline: "border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800",
    danger: "bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
  } as const;

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const ProjectProgress: React.FC<ProjectProgressProps> = ({ tasks }) => {
  const calculateProgress = () => {
    if (!tasks?.length) return 0;
    const completedTasks = tasks.filter(task => task.status === Status.Completed).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const progress = calculateProgress();

  return (
    <div className="mt-4">
      <div className="mb-2 flex justify-between text-gray-700 dark:text-gray-200">
        <span className="text-sm font-medium">Progress</span>
        <span className="text-sm font-medium">{progress}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
        <div 
          className="h-2 rounded-full bg-blue-500 transition-all duration-300" 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

const AddProjectDialog: React.FC<AddProjectDialogProps> = ({ onClose, isOpen, onProjectAdded }) => {
  const [createProject] = useCreateProjectMutation();
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject(formData).unwrap();
      onProjectAdded();
      onClose();
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">Project Name</label>
          <input
            type="text"
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">Description</label>
          <textarea
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">Start Date</label>
          <input
            type="date"
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>
        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1">Create Project</Button>
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
        </div>
      </form>
    </Modal>
  );
};


const TaskStatusChart: React.FC<{ projectId: number }> = ({ projectId }) => {
  const { data: tasks = [] } = useGetTasksQuery({ projectId });
  
  const statusCounts = tasks.reduce((acc, task) => {
    const status = task.status || Status.ToDo;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data: TaskStatusData[] = Object.values(Status).map(status => ({
    name: status,
    value: statusCounts[status] || 0
  }));

  // Custom tooltip with proper TypeScript types
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-white rounded-lg shadow-lg p-3 border border-gray-200">
          <p className="text-gray-800 font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label
          >
            {data.map((entry) => (
              <Cell 
                key={`cell-${entry.name}`} 
                fill={CHART_COLORS[entry.name] || '#6366F1'}
              />
            ))}
          </Pie>
          <Tooltip 
            content={<CustomTooltip />}
            wrapperStyle={{ outline: 'none' }}
          />
          <Legend 
            formatter={(value) => (
              <span className="text-gray-800 dark:text-gray-200">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};


const ProjectsGrid: React.FC = () => {
  const [viewType, setViewType] = useState<'grid' | 'table' | 'tiles'>('grid');
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  // Remove the completed parameter from the query
  const { data: projects = [], isLoading: isProjectsLoading } = useGetProjectsQuery();

  // Filter completed projects in the component instead
  //const activeProjects = projects.filter(project => !project.completed);

  

  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [completionDialog, setCompletionDialog] = useState<{
    isOpen: boolean;
    project: Project | null;
  }>({
    isOpen: false,
    project: null
  });

  const handleMarkCompleted = async (project: Project, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCompletionDialog({
      isOpen: true,
      project
    });
  };

  const handleDeleteProject = async (projectId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setProjectToDelete(projects.find(p => p.id === projectId) || null);
  };

  const confirmDelete = async () => {
    if (projectToDelete) {
      try {
        await deleteProject(projectToDelete.id).unwrap();
        setProjectToDelete(null);
      } catch (error) {
        console.error("Failed to delete project:", error);
      }
    }
  };

 



  const renderDeleteModal = () => (
    projectToDelete && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
          <h3 className="text-lg font-semibold mb-2">Delete Project</h3>
          <p className="mb-4">
            Are you sure you want to delete &quot;{projectToDelete.name}&quot;? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setProjectToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </div>
    )
  );

  const renderViewControls = () => (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant={viewType === 'grid' ? "default" : "outline"}
          onClick={() => setViewType('grid')}
          className="p-2"
        >
          <Grid className="h-4 w-4" />
        </Button>
        <Button
          variant={viewType === 'table' ? "default" : "outline"}
          onClick={() => setViewType('table')}
          className="p-2"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant={viewType === 'tiles' ? "default" : "outline"}
          onClick={() => setViewType('tiles')}
          className="p-2"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
      </div>
      <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        New Project
      </Button>
    </div>
  );

  const renderGridView = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects?.map((project) => (
        <div
          key={project.id}
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{project.name}</h2>
            <div className="flex gap-2">
              <button
                onClick={(e) => handleDeleteProject(project.id, e)}
                className="rounded-md p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => handleMarkCompleted(project, e)}
                className="rounded-md p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                <CheckSquare className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">{project.description}</p>
          <ProjectProgress tasks={project.tasks || []} />
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
              className="text-gray-700 dark:text-gray-300"
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              {expandedProject === project.id ? 'Collapse' : 'Expand'}
            </Button>
          </div>
          {expandedProject === project.id && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <TaskStatusChart projectId={project.id} />
            </div>
          )}
        </div>
      ))}
    </div>
  );

const renderTableView = () => (
  <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
    <table className="w-full table-auto">
      <thead className="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Name</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Description</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Start Date</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Progress</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
        {projects?.map((project) => {
          const progress = project.tasks ? 
            Math.round((project.tasks.filter(task => task.status === Status.Completed).length / project.tasks.length) * 100) : 0;
          const isExpanded = expandedProject === project.id;
          
          return (
            <React.Fragment key={project.id}>
              <tr className="bg-white dark:bg-gray-800">
                <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{project.name}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{project.description}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                  {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
                </td>
                <td className="px-6 py-4">
                  <Button 
                    variant="outline" 
                    className={`w-24 text-center transition-colors duration-200 ${
                      isExpanded ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''
                    }`}
                    onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                  >
                    {progress}%
                  </Button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={(e) => handleMarkCompleted(project, e)}
                    >
                      <CheckSquare className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="danger"
                      onClick={(e) => handleDeleteProject(project.id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
              <tr className={`transition-all duration-300 ease-in-out ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                <td colSpan={5} className="px-6 py-4">
                  <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm transform transition-transform duration-300 ease-in-out">
                    <TaskStatusChart projectId={project.id} />
                  </div>
                </td>
              </tr>
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  </div>
);
  const renderTilesView = () => (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {projects?.map((project) => {
        const progress = project.tasks ? 
          Math.round((project.tasks.filter(task => task.status === Status.Completed).length / project.tasks.length) * 100) : 0;
        
        return (
          <div
            key={project.id}
            className="flex flex-col justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm"
          >
            <div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">{project.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{project.description}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                <Calendar className="h-4 w-4" />
                <span>{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span>Progress: {progress}%</span>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" className="flex items-center gap-1">
                <CheckSquare className="h-4 w-4" />
                Complete
              </Button>
              <Button variant="danger" className="flex items-center gap-1">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );

  if (isProjectsLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="container p-8 bg-white dark:bg-black">
      {renderViewControls()}
      {viewType === 'grid' && renderGridView()}
      {viewType === 'table' && renderTableView()}
      {viewType === 'tiles' && renderTilesView()}
      {renderDeleteModal()}
      
      <CompletionDialog
        isOpen={completionDialog.isOpen}
        onClose={() => setCompletionDialog({ isOpen: false, project: null })}
        projectName={completionDialog.project?.name || ''}
        projectId={completionDialog.project?.id || 0}
        endDate={completionDialog.project?.endDate}
      />
      <AddProjectDialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProjectAdded={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};

export default ProjectsGrid;