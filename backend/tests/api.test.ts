import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';
import { prisma } from '../src/db.js';

describe('BUILDFlow Backend API Integration Tests', () => {
  beforeAll(async () => {
    // Ensure DB connection is active
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('1. Health check endpoint responds with healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('2. Auth: Retrieves demo users for role switcher', async () => {
    const res = await request(app).get('/api/auth/demo-users');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(8);
  });

  it('3. Projects: Fetches projects and creates a new project (FR-01)', async () => {
    const listRes = await request(app).get('/api/projects');
    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);

    const newProj = {
      name: 'Automated Test Plaza',
      description: 'Plaza created during automated test cycle',
      location: 'Sector 4B Test City',
      clientName: 'Test Corp',
      budget: 5000000,
    };

    const createRes = await request(app)
      .post('/api/projects')
      .set('x-user-id', 'u-pm')
      .send(newProj);

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.name).toBe(newProj.name);
  });

  it('4. Tasks: Creates a task, transitions status, and verifies progress (FR-02, FR-03)', async () => {
    const newTask = {
      title: 'Structural Integrity Check',
      description: 'Run load test on column C-4',
      projectId: 'prj-101',
      assigneeId: 'u-contractor',
      priority: 'HIGH',
      status: 'TODO',
    };

    const createRes = await request(app)
      .post('/api/tasks')
      .set('x-user-id', 'u-pm')
      .send(newTask);

    expect(createRes.status).toBe(201);
    const taskId = createRes.body.data.id;

    // Move task to IN_PROGRESS
    const moveRes = await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .set('x-user-id', 'u-contractor')
      .send({ status: 'IN_PROGRESS' });

    expect(moveRes.status).toBe(200);
    expect(moveRes.body.data.status).toBe('IN_PROGRESS');
  });

  it('5. Design Review: Submits and approves a design document (FR-04, FR-05)', async () => {
    // Check design D-102 (UNDER_REVIEW)
    const reviewRes = await request(app)
      .post('/api/designs/d-102/review')
      .set('x-user-id', 'u-eng')
      .send({
        status: 'APPROVED',
        remarks: 'All MEP clearances have been verified and satisfy HVAC specifications.',
      });

    expect(reviewRes.status).toBe(200);
    expect(reviewRes.body.data.status).toBe('APPROVED');
  });

  it('6. Materials: Updates delivery status to DELAYED (FR-06)', async () => {
    const updateRes = await request(app)
      .patch('/api/materials/requests/mr-101/status')
      .set('x-user-id', 'u-supplier')
      .send({
        status: 'DELAYED',
        notes: 'Delayed due to logistics bottleneck at port terminal',
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.status).toBe('DELAYED');
  });

  it('7. Issues: Creates an issue and verifies severity tracking (FR-08)', async () => {
    const newIssue = {
      projectId: 'prj-101',
      title: 'Hydraulic Oil Leak in Tower Crane #2',
      description: 'Minor hydraulic pressure drop detected during boom elevation',
      severity: 'HIGH',
      assignedToId: 'u-contractor',
    };

    const createRes = await request(app)
      .post('/api/issues')
      .set('x-user-id', 'u-site')
      .send(newIssue);

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.severity).toBe('HIGH');
  });

  it('8. Dashboard Stats: Aggregates project, task, and material KPIs (FR-09)', async () => {
    const statsRes = await request(app).get('/api/dashboard/stats');
    expect(statsRes.status).toBe(200);
    expect(statsRes.body.data.kpis).toBeDefined();
    expect(statsRes.body.data.kpis.totalProjects).toBeGreaterThanOrEqual(1);
    expect(statsRes.body.data.charts).toBeDefined();
  });
});
