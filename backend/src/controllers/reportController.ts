import { Request, Response } from 'express';
import { prisma } from '../db.js';

// Traceability: FR-10 (Generate Reports & Analytics)
export async function getReportsData(req: Request, res: Response) {
  try {
    const { projectId } = req.query;
    const whereProject = projectId ? { id: projectId as string } : {};
    const whereRel = projectId ? { projectId: projectId as string } : {};

    const projects = await prisma.project.findMany({
      where: whereProject,
      include: {
        _count: {
          select: {
            tasks: true,
            designs: true,
            materialRequests: true,
            inspections: true,
            issues: true,
          },
        },
      },
    });

    const tasks = await prisma.task.findMany({
      where: whereRel,
      include: { assignee: true, project: true },
    });

    const materials = await prisma.material.findMany({
      where: whereRel,
      include: { requests: true, project: true },
    });

    const inspections = await prisma.inspection.findMany({
      where: whereRel,
      include: { inspector: true, project: true },
    });

    const issues = await prisma.issue.findMany({
      where: whereRel,
      include: { reportedBy: true, assignedTo: true, project: true },
    });

    // Summary calculations
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'DONE').length;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const totalInspections = inspections.length;
    const passedInspections = inspections.filter((i) => i.result === 'PASSED').length;
    const inspectionPassRate = totalInspections > 0 ? Math.round((passedInspections / totalInspections) * 100) : 0;

    const totalMaterialCost = materials.reduce((sum, m) => sum + m.totalQuantity * m.unitCost, 0);

    const resolvedIssues = issues.filter((i) => i.status === 'RESOLVED').length;
    const issueResolutionRate = issues.length > 0 ? Math.round((resolvedIssues / issues.length) * 100) : 0;

    res.json({
      success: true,
      data: {
        summary: {
          totalProjects: projects.length,
          totalTasks,
          completedTasks,
          taskCompletionRate,
          totalInspections,
          passedInspections,
          inspectionPassRate,
          totalMaterialCost,
          totalIssues: issues.length,
          resolvedIssues,
          issueResolutionRate,
          generatedAt: new Date().toISOString(),
        },
        projects,
        tasks,
        materials,
        inspections,
        issues,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to generate reports' });
  }
}
