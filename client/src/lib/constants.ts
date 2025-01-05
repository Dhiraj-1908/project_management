import { GridColDef } from "@mui/x-data-grid";

export const taskColumns: GridColDef[] = [
  { field: "title", headerName: "Title", width: 200 },
  { field: "status", headerName: "Status", width: 150 },
  { field: "priority", headerName: "Priority", width: 150 },
  { field: "dueDate", headerName: "Due Date", width: 150 },
];

export const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];