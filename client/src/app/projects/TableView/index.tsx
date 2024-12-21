import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useAppSelector } from '@/app/redux';
import Header from '@/components/Header';
import { useGetTasksQuery } from '@/state/api';
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";

type Props = {
    id: string;
    setIsModalNewTaskOpen: (isOpen: boolean) => void;
}

const TableView: React.FC<Props> = ({ id, setIsModalNewTaskOpen }) => {
    const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
    const {
        data: tasks,
        error,
        isLoading,
    } = useGetTasksQuery({ projectId: Number(id) });
    
    if (isLoading) return <div>Loading...</div>;
    if (error || !tasks) return <div>An error occurred while fetching tasks</div>;

    const columns: GridColDef[] = [
        { field: "title", headerName: "Title", width: 100 },
        { field: "description", headerName: "Description", width: 200 },
        {
            field: "status",
            headerName: "Status",
            width: 130,
            renderCell: (params) => {
                const statusColors: Record<string, string> = {
                    'to do': 'bg-blue-100 text-blue-800',
                    'work in progress': 'bg-green-100 text-green-800',
                    'under review': 'bg-orange-100 text-orange-800',
                    'completed': 'bg-blue-900 text-white'
                };
        
                const colorClass = statusColors[params.value.toLowerCase()] || 'bg-gray-100 text-gray-800';
        
                return (
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${colorClass}`}>
                        {params.value}
                    </span>
                );
            },
        },
        { field: "priority", headerName: "Priority", width: 75 },
        { field: "tags", headerName: "Tags", width: 130 },
        { field: "startDate", headerName: "Start Date", width: 130 },
        { field: "dueDate", headerName: "Due Date", width: 130 },
        {
            field: "author",
            headerName: "Author",
            width: 150,
            renderCell: (params) => params.value?.author || "Unknown",
        },
        {
            field: "assignee",
            headerName: "Assignee",
            width: 150,
            renderCell: (params) => params.value?.assignee || "Unassigned",
        },
    ];

    return (
        <div className='h-[540px] w-full px-4 pb-8 xl:px-6'>
            <div className='pt-5'>
                <Header 
                    name="Table"
                    buttonComponent={
                        <button 
                            className="flex items-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600"
                            onClick={() => setIsModalNewTaskOpen(true)}
                        >
                            Add Task
                        </button>
                    }
                    isSmallText
                />
            </div>
            <div className={dataGridClassNames}>
            <DataGrid
             rows={tasks || []}
             columns={columns}
             sx={dataGridSxStyles(isDarkMode)}
             initialState={{
             pagination: {
            paginationModel: { pageSize: 10, page: 0 },
        },
    }}
    pageSizeOptions={[5, 10, 20]} // Options for page sizes
    disableRowSelectionOnClick
/>

            </div>
        </div>
    );
};

export default TableView;

