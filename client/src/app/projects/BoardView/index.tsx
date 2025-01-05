import React, { useState, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Task as TaskType , useGetTasksQuery, useUpdateTaskStatusMutation } from "@/state/api";
import { EllipsisVertical, MessageSquareMore, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import ProjectDialog from '@/components/dialogBox/dialogproject';

type BoardProps = {
    id: string;
    setIsModalNewTaskOpen: (isOpen: boolean) => void;
    onAddTask?: (status: string) => void;
};

const taskStatus = ["To Do", "Work In Progress", "Under Review", "Completed"];

const BoardView = ({ id, setIsModalNewTaskOpen, onAddTask }: BoardProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const {
        data: tasks,
        isLoading,
        error,
    } = useGetTasksQuery({ projectId: Number(id) });
    const [updateTaskStatus] = useUpdateTaskStatusMutation();

    const moveTask = (taskId: number, toStatus: string) => {
        updateTaskStatus({ taskId, status: toStatus });
    };

    const handleNewTask = (status: string) => {
        // Pass the status to the parent component
        if (onAddTask) {
            onAddTask(status);
        }
        setIsModalNewTaskOpen(true);
    };

    if (isLoading) return (
        <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
    
    if (error) return (
        <div className="flex h-96 items-center justify-center">
            <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-red-600 dark:text-red-400">An error occurred while fetching tasks</p>
            </div>
        </div>
    );

    return (
        <>
            <DndProvider backend={HTML5Backend}>
                <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 xl:grid-cols-4">
                    {taskStatus.map((status) => (
                        <TaskColumn
                            key={status}
                            status={status}
                            tasks={tasks || []}
                            moveTask={moveTask}
                            onNewTask={() => handleNewTask(status)}
                        />
                    ))}
                </div>
            </DndProvider>
            
            <ProjectDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
            />
        </>
    );
};

type TaskColumnProps = {
    status: string;
    tasks: TaskType[];
    moveTask: (taskId: number, toStatus: string) => void;
    onNewTask: () => void;
}

const TaskColumn = ({
    status,
    tasks,
    moveTask,
    onNewTask,
}: TaskColumnProps) => {
    const columnRef = useRef<HTMLDivElement>(null);
    const [{ isOver }, drop] = useDrop({
        accept: "task",
        drop: (item: { id: number }) => moveTask(item.id, status),
        collect: (monitor) => ({
            isOver: !!monitor.isOver()
        }),
    });

    drop(columnRef);

    const taskCount = tasks.filter((task) => task.status === status).length;

    const statusColor: Record<string, string> = {
        "To Do": "#2563EB",
        "Work In Progress": "#059669",
        "Under Review": "#D97706",
        "Completed": "#000000"
    };

    return (
        <div
            ref={columnRef}
            className={`rounded-lg transition-colors duration-200 ${
                isOver ? "bg-blue-50 dark:bg-neutral-900" : ""
            }`}
        >
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700" style={{ borderTopWidth: '4px', borderTopColor: statusColor[status] }}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="flex items-center text-lg font-semibold dark:text-white">
                            {status}
                            <span
                                className="ml-2 inline-flex items-center justify-center w-6 h-6 text-sm text-white rounded-full"
                                style={{ backgroundColor: statusColor[status] }}
                            >
                                {taskCount}
                            </span>
                        </h3>
                        <div className="flex items-center gap-2">
                            <button className="hover:bg-gray-100 dark:hover:bg-neutral-700 p-1 rounded-full transition-colors">
                                <EllipsisVertical size={20} />
                            </button>
                            <button
                                onClick={onNewTask}
                                className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 transition-colors"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {tasks
                            .filter((task) => task.status === status)
                            .map((task) => (
                                <Task key={task.id} task={task} />
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

type TaskProps = {
    task: TaskType;
}

const Task = ({ task }: TaskProps) => {
    const taskRef = useRef<HTMLDivElement>(null);
    const [{ isDragging }, drag] = useDrag({
        type: "task",
        item: { id: task.id },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    });

    // Attach the drag ref to our task ref
    drag(taskRef);

    const taskTagsSplit = task.tags ? task.tags.split(",") : [];
    const formatDateSafely = (date: string | Date | null | undefined) => {
        if (!date) return "";
        try {
            return format(new Date(date), "PP");
        } catch (error) {
            console.error("Error formatting date:", error);
            return "";
        }
    };

    const formattedStartDate = formatDateSafely(task.startDate);
    const formattedDueDate = formatDateSafely(task.dueDate);
    const numberOfComments = (task.comments?.length) || 0;

    const PriorityTag = ({ priority }: { priority: TaskType["priority"] }) => (
        <div
            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                priority === "Urgent" ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" :
                priority === "High" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400" :
                priority === "Medium" ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" :
                priority === "Low" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" :
                "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
            }`}
        >
            {priority}
        </div>
    );

    return (
        <div
            ref={taskRef}
            className={`bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 transition-all duration-200 hover:shadow-md ${
                isDragging ? "opacity-50" : "opacity-100"
            }`}
        >
            <div className="p-4">
                {task.attachments && task.attachments.length > 0 && (
                    <div className="mb-4">
                        <Image
                            src={`/${task.attachments[0].fileURL}`}
                            alt={task.attachments[0].fileName}
                            width={300}
                            height={200}
                            className="rounded-lg w-full h-auto object-cover"
                        />
                    </div>
                )}
                <div className="space-y-4">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                            {task.priority && <PriorityTag priority={task.priority} />}
                            {taskTagsSplit.map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded-full bg-gray-100 dark:bg-neutral-700 px-2 py-1 text-xs"
                                >
                                    {tag.trim()}
                                </span>
                            ))}
                        </div>
                        <button className="hover:bg-gray-100 dark:hover:bg-neutral-700 p-1 rounded-full transition-colors">
                            <EllipsisVertical size={20} />
                        </button>
                    </div>

                    <div className="flex justify-between items-center">
                        <h4 className="text-lg font-semibold dark:text-white">{task.title}</h4>
                        {typeof task.points === "number" && (
                            <span className="text-sm font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-neutral-700 dark:text-white">
                                {task.points} pts
                            </span>
                        )}
                    </div>

                    {(formattedStartDate || formattedDueDate) && (
                        <div className="text-sm text-gray-500 dark:text-neutral-400">
                            {formattedStartDate && <span>{formattedStartDate}</span>}
                            {formattedStartDate && formattedDueDate && <span> - </span>}
                            {formattedDueDate && <span>{formattedDueDate}</span>}
                        </div>
                    )}

                    {task.description && (
                        <p className="text-sm text-gray-600 dark:text-neutral-400">
                            {task.description}
                        </p>
                    )}

                    <div className="pt-4 border-t border-gray-200 dark:border-neutral-700">
                        <div className="flex items-center justify-between">
                            <div className="flex -space-x-2">
                                {task.assignee && (
                                    <Image
                                        src={`/${task.assignee.profilePictureUrl}`}
                                        alt={task.assignee.username}
                                        width={32}
                                        height={32}
                                        className="rounded-full border-2 border-white dark:border-neutral-900"
                                    />
                                )}
                                {task.author && (
                                    <Image
                                        src={`/${task.author.profilePictureUrl}`}
                                        alt={task.author.username}
                                        width={32}
                                        height={32}
                                        className="rounded-full border-2 border-white dark:border-neutral-900"
                                    />
                                )}
                            </div>
                            <div className="flex items-center gap-1 text-gray-500 dark:text-neutral-400">
                                <MessageSquareMore size={18} />
                                <span className="text-sm">{numberOfComments}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoardView;