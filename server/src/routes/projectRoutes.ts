import { Router } from "express";
import { createProject, getProjects , deleteProject, updateProject } from "../controllers/projectController";

const router = Router();

router.get("/", getProjects);
router.post("/", createProject);
router.delete('/:projectId', deleteProject);
router.patch('/:projectId', updateProject);

export default router;