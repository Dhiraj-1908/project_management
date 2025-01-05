import React, { useState } from 'react';
import { useUpdateProjectMutation } from '@/state/api';
import { Calendar } from 'lucide-react';
import type { Project } from '@/state/api';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

interface CompletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  projectId: number;
  endDate?: string;
}

const CompletionDialog = ({ isOpen, onClose, projectName, projectId, endDate }: CompletionDialogProps) => {
  const [updateProject] = useUpdateProjectMutation();
  const [completionDate, setCompletionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    if (!projectId || isSubmitting) return;
    setIsSubmitting(true);
  
    try {
      await updateProject({
        id: projectId,
        actualEndDate: completionDate
      }).unwrap();
      onClose();
    } catch (err) {
      const error = err as FetchBaseQueryError | SerializedError;
      const errorMessage = 'data' in error 
        ? JSON.stringify(error.data)
        : (error as SerializedError).message ?? 'Unknown error';
      
      console.error('Failed to complete project:', {
        projectId,
        error: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Complete Project: {projectName}
        </h2>
        
        <div className="space-y-4">
          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Completion Date
            </label>
            <input
              type="date"
              value={completionDate}
              onChange={(e) => setCompletionDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
              disabled={isSubmitting}
            />
          </div>
          
          {endDate && new Date(completionDate) > new Date(endDate) && (
            <div className="text-yellow-600 dark:text-yellow-400 flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
              <Calendar className="h-4 w-4" />
              <span>Note: After planned end date ({new Date(endDate).toLocaleDateString()})</span>
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Completing...' : 'Complete Project'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompletionDialog;