import React, { useState } from "react";
import Modal from "@/components/Modal";
import { Priority, Status, useCreateTaskMutation } from "@/state/api";
import { formatISO } from "date-fns";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  id?: string | null;
};

const ModalNewTask = ({ isOpen, onClose, id = null }: Props) => {
  const [createTask, { isLoading }] = useCreateTaskMutation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>(Status.ToDo);
  const [priority, setPriority] = useState<Priority>(Priority.Backlog);
  const [tags, setTags] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [authorUserId, setAuthorUserId] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [projectId, setProjectId] = useState("");

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    try {
      const formattedStartDate = startDate ? formatISO(new Date(startDate)) : undefined;
      const formattedDueDate = dueDate ? formatISO(new Date(dueDate)) : undefined;

      await createTask({
        title,
        description,
        status,
        priority,
        tags,
        startDate: formattedStartDate,
        dueDate: formattedDueDate,
        authorUserId: parseInt(authorUserId),
        assignedUserId: assignedUserId ? parseInt(assignedUserId) : undefined,
        projectId: id !== null ? Number(id) : Number(projectId),
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const isFormValid = () => {
    return Boolean(
      title && 
      authorUserId && 
      (id !== null || projectId)
    );
  };

  const inputStyles = `
    w-full rounded-lg border bg-white px-4 py-2.5 text-gray-700
    transition-colors duration-200 ease-in-out
    focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
    dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200
    dark:focus:border-blue-400 dark:focus:ring-blue-400/20
  `;

  const selectStyles = `
    ${inputStyles}
    appearance-none bg-no-repeat
    bg-[right_1rem_center]
    bg-[length:1em_1em]
    bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")]
    dark:bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%239CA3AF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")]
  `;

  return (
    <Modal isOpen={isOpen} onClose={onClose} name="Create New Task">
      <form 
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Title
          </label>
          <input
            type="text"
            className={inputStyles}
            placeholder="Enter task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            className={`${inputStyles} min-h-[100px] resize-y`}
            placeholder="Enter task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              className={selectStyles}
              value={status}
              onChange={(e) => setStatus(Status[e.target.value as keyof typeof Status])}
            >
              {Object.values(Status).map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {statusOption.replace(/([A-Z])/g, ' $1').trim()}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Priority
            </label>
            <select
              className={selectStyles}
              value={priority}
              onChange={(e) => setPriority(Priority[e.target.value as keyof typeof Priority])}
            >
              {Object.values(Priority).map((priorityOption) => (
                <option key={priorityOption} value={priorityOption}>
                  {priorityOption}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tags
          </label>
          <input
            type="text"
            className={inputStyles}
            placeholder="Enter tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Start Date
            </label>
            <input
              type="date"
              className={inputStyles}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Due Date
            </label>
            <input
              type="date"
              className={inputStyles}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Author User ID
          </label>
          <input
            type="number"
            className={inputStyles}
            placeholder="Enter author user ID"
            value={authorUserId}
            onChange={(e) => setAuthorUserId(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Assigned User ID
          </label>
          <input
            type="number"
            className={inputStyles}
            placeholder="Enter assigned user ID"
            value={assignedUserId}
            onChange={(e) => setAssignedUserId(e.target.value)}
          />
        </div>

        {id === null && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Project ID
            </label>
            <input
              type="number"
              className={inputStyles}
              placeholder="Enter project ID"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
            />
          </div>
        )}

        <button
          type="submit"
          className={`
            mt-6 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white
            transition-all duration-200 ease-in-out
            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400
            ${(!isFormValid() || isLoading) ? 'cursor-not-allowed opacity-50' : ''}
          `}
          disabled={!isFormValid() || isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating...
            </span>
          ) : (
            'Create Task'
          )}
        </button>
      </form>
    </Modal>
  );
};

export default ModalNewTask;