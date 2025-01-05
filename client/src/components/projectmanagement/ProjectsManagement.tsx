"use client";

import React, { useState } from 'react';
import {
  Project,
  useGetProjectsQuery,
  useCreateProjectMutation,
  useDeleteProjectMutation,
} from "@/state/api";
import { 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { 
  DataGrid, 
  GridColDef,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import { format } from 'date-fns';

interface ProjectRow extends Project {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

const ProjectsManagement = () => {
  const [open, setOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  const { data: projects, isLoading } = useGetProjectsQuery();
  const [createProject] = useCreateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const handleCreateProject = async () => {
    await createProject(newProject);
    setOpen(false);
    setNewProject({ name: '', description: '', startDate: '', endDate: '' });
  };

  const handleDeleteProject = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await deleteProject(id);
    }
  };

  

  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    return format(new Date(date), 'MM/dd/yyyy');
  };

  const columns: GridColDef<ProjectRow>[] = [
    { 
      field: 'name', 
      headerName: 'Name', 
      width: 200 
    },
    { 
      field: 'description', 
      headerName: 'Description', 
      width: 300 
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      width: 150,
      renderCell: (params) => formatDate(params.row.startDate)
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      width: 150,
      renderCell: (params) => formatDate(params.row.endDate)
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => params.row.endDate ? 'Completed' : 'Active'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params: GridRenderCellParams<ProjectRow>) => (
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => handleDeleteProject(params.row.id)}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white dark:bg-dark-secondary rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold dark:text-white">Project Management</h2>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add Project
        </Button>
      </div>

      <div style={{ height: 400, width: '100%' }}>
        <DataGrid<ProjectRow>
          rows={projects || []}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
          }}
          className="bg-white dark:bg-dark-secondary"
          getRowId={(row) => row.id}
        />
      </div>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        className="dark:bg-dark-primary"
      >
        <DialogTitle className="dark:text-white">Create New Project</DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            <TextField
              fullWidth
              label="Project Name"
              value={newProject.name}
              onChange={(e) => setNewProject({...newProject, name: e.target.value})}
              className="dark:bg-dark-secondary dark:text-white"
              required
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={newProject.description}
              onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              className="dark:bg-dark-secondary dark:text-white"
            />
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              InputLabelProps={{ shrink: true }}
              value={newProject.startDate}
              onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
              className="dark:bg-dark-secondary dark:text-white"
            />
            <TextField
              fullWidth
              type="date"
              label="End Date"
              InputLabelProps={{ shrink: true }}
              value={newProject.endDate}
              onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
              className="dark:bg-dark-secondary dark:text-white"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateProject} 
            variant="contained" 
            color="primary"
            disabled={!newProject.name}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProjectsManagement;