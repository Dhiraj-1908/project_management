import { PrismaClient, Prisma } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const getProjects = async (req: Request, res: Response) => {
  try {
    const completed = req.query.completed === 'true';
    
    const projects = await prisma.project.findMany({
      where: {
        actualEndDate: completed ? { not: null } : null
      },
      include: {
        tasks: true,
      },
      
    });
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Error fetching projects" });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, description, startDate, endDate } = req.body;
    const project = await prisma.project.create({
      data: {
        name,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: "Error creating project" });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    await prisma.project.delete({
      where: {
        id: parseInt(projectId),
      },
    });
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting project" });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { name, description, startDate, endDate, actualEndDate } = req.body;

    const updateData: Prisma.ProjectUpdateInput = {
      ...(name && { name }),
      ...(description && { description }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
      ...(actualEndDate && { actualEndDate: new Date(actualEndDate) }),
    };

    const project = await prisma.project.update({
      where: { id: parseInt(projectId) },
      data: updateData,
    });
    res.json(project);
  } catch (error) {
    if (error instanceof Error) {
      // TypeScript now knows that 'error' is of type 'Error'
      console.error("Error updating project:", error.message);
      res.status(500).json({ error: "Error updating project", details: error.message });
    } else {
      // Handle non-Error cases (e.g., primitives, null)
      console.error("Unexpected error:", error);
      res.status(500).json({ error: "Unexpected error occurred." });
    }
  }
};


