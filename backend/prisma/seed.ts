import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Role and Status Constants
export const Role = {
  PROJECT_OWNER: 'PROJECT_OWNER',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  ARCHITECT: 'ARCHITECT',
  ENGINEER: 'ENGINEER',
  CONTRACTOR: 'CONTRACTOR',
  SITE_SUPERVISOR: 'SITE_SUPERVISOR',
  SUPPLIER: 'SUPPLIER',
  INSPECTOR: 'INSPECTOR',
} as const;

export const ProjectStatus = {
  PLANNING: 'PLANNING',
  IN_PROGRESS: 'IN_PROGRESS',
  ON_HOLD: 'ON_HOLD',
  COMPLETED: 'COMPLETED',
} as const;

export const TaskStatus = {
  BACKLOG: 'BACKLOG',
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  IN_REVIEW: 'IN_REVIEW',
  DONE: 'DONE',
} as const;

export const Priority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export const DesignStatus = {
  DRAFT: 'DRAFT',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export const MaterialStatus = {
  REQUESTED: 'REQUESTED',
  ORDERED: 'ORDERED',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  DELAYED: 'DELAYED',
} as const;

export const InspectionResult = {
  PASSED: 'PASSED',
  FAILED: 'FAILED',
  PENDING: 'PENDING',
} as const;

export const IssueSeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

export const IssueStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
} as const;

async function main() {
  console.log('🌱 Starting BuildFlow database seeding...');

  // Clean existing tables in reverse order of dependencies
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.inspection.deleteMany();
  await prisma.materialRequest.deleteMany();
  await prisma.material.deleteMany();
  await prisma.designComment.deleteMany();
  await prisma.designReview.deleteMany();
  await prisma.designDocument.deleteMany();
  await prisma.taskDependency.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Demo Users
  console.log('👤 Seeding Users...');
  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: 'u-owner',
        email: 'arthur.owner@buildflow.dev',
        name: 'Arthur Pendelton',
        role: Role.PROJECT_OWNER,
        title: 'Managing Director & Investor',
        department: 'Executive Board',
        phone: '+1 (555) 201-9001',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      }
    }),
    prisma.user.create({
      data: {
        id: 'u-pm',
        email: 'alex.pm@buildflow.dev',
        name: 'Alex Vance',
        role: Role.PROJECT_MANAGER,
        title: 'Senior Project Director',
        department: 'Project Management Office',
        phone: '+1 (555) 342-8819',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      }
    }),
    prisma.user.create({
      data: {
        id: 'u-arch',
        email: 'sophia.arch@buildflow.dev',
        name: 'Sophia Chen',
        role: Role.ARCHITECT,
        title: 'Principal Architectural Designer',
        department: 'Design & Engineering',
        phone: '+1 (555) 489-1120',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      }
    }),
    prisma.user.create({
      data: {
        id: 'u-eng',
        email: 'marcus.eng@buildflow.dev',
        name: 'Marcus Brody',
        role: Role.ENGINEER,
        title: 'Lead Structural Engineer (PE)',
        department: 'Structural Engineering',
        phone: '+1 (555) 782-3401',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
      }
    }),
    prisma.user.create({
      data: {
        id: 'u-contractor',
        email: 'david.contractor@buildflow.dev',
        name: 'David Miller',
        role: Role.CONTRACTOR,
        title: 'General Construction Contractor',
        department: 'Prime Contracting Ltd.',
        phone: '+1 (555) 891-2300',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
      }
    }),
    prisma.user.create({
      data: {
        id: 'u-site',
        email: 'carlos.site@buildflow.dev',
        name: 'Carlos Mendez',
        role: Role.SITE_SUPERVISOR,
        title: 'Chief Site Operations Superintendent',
        department: 'Site Execution',
        phone: '+1 (555) 671-4450',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
      }
    }),
    prisma.user.create({
      data: {
        id: 'u-supplier',
        email: 'elena.supplier@buildflow.dev',
        name: 'Elena Rostova',
        role: Role.SUPPLIER,
        title: 'Key Account Logistics Director',
        department: 'Apex Materials & Steel Supply',
        phone: '+1 (555) 902-7711',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
      }
    }),
    prisma.user.create({
      data: {
        id: 'u-inspector',
        email: 'frank.inspector@buildflow.dev',
        name: 'Frank Reynolds',
        role: Role.INSPECTOR,
        title: 'Senior Municipal Safety & Quality Inspector',
        department: 'Department of Building Inspection',
        phone: '+1 (555) 554-1290',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
      }
    }),
    prisma.user.create({
      data: {
        id: 'u-mep',
        email: 'raj.mep@buildflow.dev',
        name: 'Raj Patel',
        role: Role.ENGINEER,
        title: 'Senior MEP Systems Engineer',
        department: 'Mechanical & Electrical',
        phone: '+1 (555) 301-4499',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
      }
    }),
    prisma.user.create({
      data: {
        id: 'u-arch2',
        email: 'maya.arch@buildflow.dev',
        name: 'Maya Lin',
        role: Role.ARCHITECT,
        title: 'BIM & Facade Specialist',
        department: 'Design & Engineering',
        phone: '+1 (555) 912-3321',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
      }
    })
  ]);

  // 2. Create Realistic Projects
  console.log('🏗️ Seeding Projects...');
  const [project1, project2, project3] = await Promise.all([
    prisma.project.create({
      data: {
        id: 'prj-101',
        code: 'PRJ-101',
        name: 'Skyline Pinnacle Tower - Phase 2',
        description: '54-story mixed-use commercial tower featuring high-efficiency curtain walls, subterranean parking, and LEED Platinum certification.',
        location: '742 Metropolis Blvd, Financial District',
        clientName: 'Metropolis Global Investments',
        budget: 84500000,
        startDate: new Date('2026-01-15'),
        endDate: new Date('2027-11-30'),
        status: ProjectStatus.IN_PROGRESS,
        progress: 68,
        managerId: 'u-pm',
        ownerId: 'u-owner'
      }
    }),
    prisma.project.create({
      data: {
        id: 'prj-102',
        code: 'PRJ-102',
        name: 'Harborview Cable-Stayed Overpass',
        description: 'Multi-lane municipal transit bridge linking the North Terminal cargo docks with State Expressway 101, designed for heavy freight.',
        location: 'Pier 42 Maritime Corridor, North Harbor',
        clientName: 'Port Authority & Transit Commission',
        budget: 32000000,
        startDate: new Date('2026-03-01'),
        endDate: new Date('2027-08-15'),
        status: ProjectStatus.IN_PROGRESS,
        progress: 42,
        managerId: 'u-pm',
        ownerId: 'u-owner'
      }
    }),
    prisma.project.create({
      data: {
        id: 'prj-103',
        code: 'PRJ-103',
        name: 'Greenfield Eco-Residential Enclave',
        description: '120-unit net-zero residential community featuring modular mass-timber framing, solar arrays, and onsite greywater recycling.',
        location: 'Greenfield Valley Sector 9',
        clientName: 'Horizon Sustainable Living LLC',
        budget: 18200000,
        startDate: new Date('2026-06-01'),
        endDate: new Date('2027-12-20'),
        status: ProjectStatus.PLANNING,
        progress: 15,
        managerId: 'u-pm',
        ownerId: 'u-owner'
      }
    })
  ]);

  // 3. Create Tasks
  console.log('📋 Seeding Tasks...');
  const tasksData = [
    {
      id: 't-101',
      code: 'TSK-101',
      title: 'Excavation and Deep Caisson Foundation',
      description: 'Complete 30m depth bedrock caisson drilling and pile cap casting.',
      projectId: project1.id,
      assigneeId: 'u-contractor',
      priority: Priority.URGENT,
      status: TaskStatus.DONE,
      progress: 100,
      startDate: new Date('2026-01-20'),
      dueDate: new Date('2026-03-15'),
      completedAt: new Date('2026-03-12')
    },
    {
      id: 't-102',
      code: 'TSK-102',
      title: 'Substructure Concrete Core Slipforming (L1 - L10)',
      description: 'Continuous vertical slipforming of the central reinforced concrete elevator and stair core.',
      projectId: project1.id,
      assigneeId: 'u-site',
      priority: Priority.HIGH,
      status: TaskStatus.DONE,
      progress: 100,
      startDate: new Date('2026-03-16'),
      dueDate: new Date('2026-05-10'),
      completedAt: new Date('2026-05-08')
    },
    {
      id: 't-103',
      code: 'TSK-103',
      title: 'Structural Steel Decking & Rebar Cage (L11 - L20)',
      description: 'Erect steel perimeter columns and assemble Grade 60 rebar meshes before floor pour.',
      projectId: project1.id,
      assigneeId: 'u-contractor',
      priority: Priority.HIGH,
      status: TaskStatus.IN_PROGRESS,
      progress: 75,
      startDate: new Date('2026-05-12'),
      dueDate: new Date('2026-09-15')
    },
    {
      id: 't-104',
      code: 'TSK-104',
      title: 'MEP Riser & HVAC Ducting Integration (L12 - L16)',
      description: 'Install main mechanical air ducts, chilled water supply risers, and high-voltage bus ducts.',
      projectId: project1.id,
      assigneeId: 'u-mep',
      priority: Priority.MEDIUM,
      status: TaskStatus.TODO,
      progress: 0,
      startDate: new Date('2026-08-25'),
      dueDate: new Date('2026-10-30')
    },
    {
      id: 't-105',
      code: 'TSK-105',
      title: 'Curtain Wall Unitized Glazing Installation',
      description: 'Mount pre-glazed double-laminated thermal glass panels to floor perimeter anchors.',
      projectId: project1.id,
      assigneeId: 'u-arch2',
      priority: Priority.HIGH,
      status: TaskStatus.BACKLOG,
      progress: 0,
      startDate: new Date('2026-10-01'),
      dueDate: new Date('2027-02-15')
    },
    {
      id: 't-106',
      code: 'TSK-106',
      title: 'Fire Protection Sprinkler Grid Inspection Prep',
      description: 'Pressure test CPVC and black steel pipe loop for 200 PSI 2-hour hydro hold.',
      projectId: project1.id,
      assigneeId: 'u-eng',
      priority: Priority.URGENT,
      status: TaskStatus.IN_REVIEW,
      progress: 90,
      startDate: new Date('2026-08-01'),
      dueDate: new Date('2026-08-28')
    },
    {
      id: 't-107',
      code: 'TSK-107',
      title: 'Elevator Hoistway Machine-Roomless Equipment Install',
      description: 'Mount traction hoist motors, governor tensioning assemblies, and guide rails.',
      projectId: project1.id,
      assigneeId: 'u-contractor',
      priority: Priority.MEDIUM,
      status: TaskStatus.TODO,
      progress: 0,
      startDate: new Date('2026-09-01'),
      dueDate: new Date('2026-11-20')
    },
    {
      id: 't-108',
      code: 'TSK-108',
      title: 'Emergency Generator & ATS Switchgear Commissioning',
      description: 'Install 1500kVA backup diesel generator and dual automatic transfer switches in B2.',
      projectId: project1.id,
      assigneeId: 'u-mep',
      priority: Priority.MEDIUM,
      status: TaskStatus.BACKLOG,
      progress: 0,
      startDate: new Date('2026-11-15'),
      dueDate: new Date('2027-01-10')
    },

    // Project 2 Tasks (Bridge)
    {
      id: 't-201',
      code: 'TSK-201',
      title: 'Subsea Cofferdam Construction & Dewatering',
      description: 'Drive interlocked sheet piles into harbor floor and pump dry for Pier 1 & 2 bases.',
      projectId: project2.id,
      assigneeId: 'u-contractor',
      priority: Priority.URGENT,
      status: TaskStatus.DONE,
      progress: 100,
      startDate: new Date('2026-03-05'),
      dueDate: new Date('2026-05-15'),
      completedAt: new Date('2026-05-10')
    },
    {
      id: 't-202',
      code: 'TSK-202',
      title: 'Pylon 1 & 2 Concrete Tower Casting',
      description: 'Slipform twin 75m high architectural diamond pylons with post-tensioned cable anchors.',
      projectId: project2.id,
      assigneeId: 'u-site',
      priority: Priority.HIGH,
      status: TaskStatus.IN_PROGRESS,
      progress: 55,
      startDate: new Date('2026-05-20'),
      dueDate: new Date('2026-10-15')
    },
    {
      id: 't-203',
      code: 'TSK-203',
      title: 'Stay Cable Stay Installation & Tensioning',
      description: 'String epoxy-coated 7-wire high strength steel strands and tension via hydraulic jacks.',
      projectId: project2.id,
      assigneeId: 'u-eng',
      priority: Priority.HIGH,
      status: TaskStatus.TODO,
      progress: 0,
      startDate: new Date('2026-10-01'),
      dueDate: new Date('2027-01-30')
    },
    {
      id: 't-204',
      code: 'TSK-204',
      title: 'Bridge Deck Orthotropic Steel Box Girder Erection',
      description: 'Barge floating crane lifting and welding of 45-meter deck segments.',
      projectId: project2.id,
      assigneeId: 'u-contractor',
      priority: Priority.URGENT,
      status: TaskStatus.BACKLOG,
      progress: 0,
      startDate: new Date('2026-11-01'),
      dueDate: new Date('2027-04-15')
    },
    {
      id: 't-205',
      code: 'TSK-205',
      title: 'Bridge Scour & Seismic Sensor Network Calibration',
      description: 'Embed fiber-optic strain gauges and triaxial accelerometers into bridge piers.',
      projectId: project2.id,
      assigneeId: 'u-mep',
      priority: Priority.LOW,
      status: TaskStatus.BACKLOG,
      progress: 0,
      startDate: new Date('2027-02-01'),
      dueDate: new Date('2027-05-01')
    },

    // Project 3 Tasks (Eco-Residences)
    {
      id: 't-301',
      code: 'TSK-301',
      title: 'Geotechnical Soil Sampling & Grading Plan',
      description: 'Complete borehole sampling, soil compaction test, and earthwork grading permits.',
      projectId: project3.id,
      assigneeId: 'u-eng',
      priority: Priority.HIGH,
      status: TaskStatus.DONE,
      progress: 100,
      startDate: new Date('2026-06-05'),
      dueDate: new Date('2026-07-20'),
      completedAt: new Date('2026-07-18')
    },
    {
      id: 't-302',
      code: 'TSK-302',
      title: 'Mass Timber Engineered CLT Slabs Procurement',
      description: 'Finalize shop drawings with supplier for pre-fabricated cross-laminated timber floor cassettes.',
      projectId: project3.id,
      assigneeId: 'u-arch',
      priority: Priority.MEDIUM,
      status: TaskStatus.IN_PROGRESS,
      progress: 40,
      startDate: new Date('2026-07-25'),
      dueDate: new Date('2026-09-30')
    },
    {
      id: 't-303',
      code: 'TSK-303',
      title: 'Underground Geothermal Heat Pump Loops Drilling',
      description: 'Drill 24 vertical boreholes at 120m depth for closed-loop ground source heat pumps.',
      projectId: project3.id,
      assigneeId: 'u-site',
      priority: Priority.MEDIUM,
      status: TaskStatus.TODO,
      progress: 0,
      startDate: new Date('2026-09-10'),
      dueDate: new Date('2026-11-15')
    },
    {
      id: 't-304',
      code: 'TSK-304',
      title: 'Solar PV Microgrid & Battery Storage Infrastructure',
      description: 'Install 450kW rooftop bifacial PV arrays and 1.2MWh Tesla Megapack container.',
      projectId: project3.id,
      assigneeId: 'u-mep',
      priority: Priority.LOW,
      status: TaskStatus.BACKLOG,
      progress: 0,
      startDate: new Date('2026-12-01'),
      dueDate: new Date('2027-03-30')
    }
  ];

  for (const t of tasksData) {
    await prisma.task.create({ data: t });
  }

  // 4. Task Dependencies
  console.log('🔗 Seeding Task Dependencies...');
  await prisma.taskDependency.createMany({
    data: [
      { taskId: 't-102', prerequisiteId: 't-101' },
      { taskId: 't-103', prerequisiteId: 't-102' },
      { taskId: 't-104', prerequisiteId: 't-103' },
      { taskId: 't-105', prerequisiteId: 't-103' },
      { taskId: 't-202', prerequisiteId: 't-201' },
      { taskId: 't-203', prerequisiteId: 't-202' },
      { taskId: 't-204', prerequisiteId: 't-203' },
      { taskId: 't-302', prerequisiteId: 't-301' },
      { taskId: 't-303', prerequisiteId: 't-301' }
    ]
  });

  // 5. Design Documents & Reviews
  console.log('📐 Seeding Design Documents...');
  const design1 = await prisma.designDocument.create({
    data: {
      id: 'd-101',
      code: 'DSG-101',
      title: 'Subterranean Caisson Foundation & Piling Structural Plan',
      description: 'Complete structural calculation package and rebar arrangement for 30m caissons.',
      category: 'Structural',
      version: '1.4',
      fileUrl: '/drawings/PRJ101_Foundation_v1.4.pdf',
      fileSize: '18.4 MB',
      status: DesignStatus.APPROVED,
      projectId: project1.id,
      uploadedById: 'u-arch',
      reviewerId: 'u-eng',
      approvedAt: new Date('2026-02-10')
    }
  });

  await prisma.designReview.create({
    data: {
      designId: design1.id,
      reviewerId: 'u-eng',
      status: DesignStatus.APPROVED,
      remarks: 'Seismic shear load factors and soil bearing capacities verified according to ASCE 7-22 standard.',
      reviewedAt: new Date('2026-02-10')
    }
  });

  // TARGET FOR DEMO REVIEW WORKFLOW!
  const design2 = await prisma.designDocument.create({
    data: {
      id: 'd-102',
      code: 'DSG-102',
      title: 'Level 12-24 HVAC & MEP Layouts (Revised Duct Clearance)',
      description: 'Updated branch duct routing avoiding structural transfer girders with revised VAV box placements.',
      category: 'MEP',
      version: '2.1',
      fileUrl: '/drawings/PRJ101_MEP_L12-24_v2.1.pdf',
      fileSize: '24.2 MB',
      status: DesignStatus.UNDER_REVIEW,
      projectId: project1.id,
      uploadedById: 'u-arch',
      reviewerId: 'u-eng'
    }
  });

  await prisma.designComment.create({
    data: {
      designId: design2.id,
      userId: 'u-arch',
      message: 'Updated sheet M-104 to increase drop ceiling clearance above corridor 14B by 150mm. Ready for PE review.'
    }
  });

  const design3 = await prisma.designDocument.create({
    data: {
      id: 'd-103',
      code: 'DSG-103',
      title: 'Curtain Wall Unitized Facade Framing & Thermal Break Details',
      description: 'Wind tunnel pressure coefficients and custom extruded aluminum transom profiles.',
      category: 'Architectural',
      version: '1.0',
      fileUrl: '/drawings/PRJ101_Facade_v1.0.pdf',
      fileSize: '31.0 MB',
      status: DesignStatus.DRAFT,
      projectId: project1.id,
      uploadedById: 'u-arch2'
    }
  });

  const design4 = await prisma.designDocument.create({
    data: {
      id: 'd-104',
      code: 'DSG-104',
      title: 'Cable Pylon Anchorage Head & High-Tensile Steel Strands',
      description: 'Fatigue stress analysis and damping saddle details for 24-stay bundle.',
      category: 'Structural',
      version: '3.0',
      fileUrl: '/drawings/PRJ102_Pylon_Anchors_v3.0.pdf',
      fileSize: '45.1 MB',
      status: DesignStatus.APPROVED,
      projectId: project2.id,
      uploadedById: 'u-arch',
      reviewerId: 'u-eng',
      approvedAt: new Date('2026-04-12')
    }
  });

  const design5 = await prisma.designDocument.create({
    data: {
      id: 'd-105',
      code: 'DSG-105',
      title: 'Mass Timber CLT Wall-to-Floor Connection Matrix',
      description: 'Self-tapping screw patterns and elastomeric acoustic isolation strip specification.',
      category: 'Civil',
      version: '1.2',
      fileUrl: '/drawings/PRJ103_CLT_Connections_v1.2.pdf',
      fileSize: '14.8 MB',
      status: DesignStatus.UNDER_REVIEW,
      projectId: project3.id,
      uploadedById: 'u-arch',
      reviewerId: 'u-eng'
    }
  });

  // 6. Materials & Delivery Requests
  console.log('📦 Seeding Materials & Requests...');
  const mat1 = await prisma.material.create({
    data: {
      id: 'm-201',
      code: 'MAT-201',
      name: 'Grade 60 Deformed High-Yield Steel Rebar (#8 & #10)',
      category: 'Steel',
      unit: 'Metric Tons',
      totalQuantity: 450,
      unitCost: 880,
      supplierName: 'Apex Materials & Steel Supply',
      supplierContact: 'elena.supplier@buildflow.dev',
      projectId: project1.id
    }
  });

  // TARGET FOR DEMO: DELAYED MATERIAL
  await prisma.materialRequest.create({
    data: {
      id: 'mr-101',
      code: 'REQ-101',
      materialId: mat1.id,
      projectId: project1.id,
      quantity: 120,
      supplierId: 'u-supplier',
      requestedDate: new Date('2026-08-01'),
      expectedDelivery: new Date('2026-08-18'), // Past deadline -> Delayed
      status: MaterialStatus.DELAYED,
      notes: 'Cargo vessel holding at Port Terminal Berth 4 due to customs documentation hold. Expected release in 4 days.'
    }
  });

  const mat2 = await prisma.material.create({
    data: {
      id: 'm-202',
      code: 'MAT-202',
      name: 'Ready-Mix C40/50 Self-Consolidating High Strength Concrete',
      category: 'Concrete',
      unit: 'Cubic Meters (m³)',
      totalQuantity: 1800,
      unitCost: 145,
      supplierName: 'Metro Ready-Mix Corp',
      supplierContact: 'dispatch@metroreadymix.com',
      projectId: project1.id
    }
  });

  await prisma.materialRequest.create({
    data: {
      id: 'mr-102',
      code: 'REQ-102',
      materialId: mat2.id,
      projectId: project1.id,
      quantity: 350,
      supplierId: 'u-supplier',
      requestedDate: new Date('2026-07-15'),
      expectedDelivery: new Date('2026-07-28'),
      actualDelivery: new Date('2026-07-27'),
      status: MaterialStatus.DELIVERED,
      notes: 'Delivered in 42 transit mixer batches. Slump flow test passed at 680mm.'
    }
  });

  const mat3 = await prisma.material.create({
    data: {
      id: 'm-203',
      code: 'MAT-203',
      name: 'Type X 5/8" Fire-Rated Acoustic Gypsum Wallboard',
      category: 'Finishing',
      unit: 'Panels (4x8 ft)',
      totalQuantity: 4200,
      unitCost: 22.5,
      supplierName: 'Apex Materials & Steel Supply',
      supplierContact: 'elena.supplier@buildflow.dev',
      projectId: project1.id
    }
  });

  await prisma.materialRequest.create({
    data: {
      id: 'mr-103',
      code: 'REQ-103',
      materialId: mat3.id,
      projectId: project1.id,
      quantity: 1200,
      supplierId: 'u-supplier',
      requestedDate: new Date('2026-08-10'),
      expectedDelivery: new Date('2026-08-25'),
      status: MaterialStatus.IN_TRANSIT,
      notes: 'Freight convoy in route from regional manufacturing center. GPS Tracking Active.'
    }
  });

  const mat4 = await prisma.material.create({
    data: {
      id: 'm-204',
      code: 'MAT-204',
      name: 'High-Density Polyethylene Stay Cable Sheathing',
      category: 'Specialty',
      unit: 'Linear Meters',
      totalQuantity: 2400,
      unitCost: 115,
      supplierName: 'Vandermeer Cable Systems',
      supplierContact: 'sales@vandermeercable.eu',
      projectId: project2.id
    }
  });

  await prisma.materialRequest.create({
    data: {
      id: 'mr-104',
      code: 'REQ-104',
      materialId: mat4.id,
      projectId: project2.id,
      quantity: 800,
      supplierId: 'u-supplier',
      requestedDate: new Date('2026-08-14'),
      expectedDelivery: new Date('2026-09-10'),
      status: MaterialStatus.ORDERED,
      notes: 'Manufactured with UV stabilizers and helical ribbing for aerodynamic vortex shedding.'
    }
  });

  // 7. Inspections
  console.log('🔍 Seeding Inspections...');
  await prisma.inspection.createMany({
    data: [
      {
        id: 'ins-01',
        code: 'INS-001',
        projectId: project1.id,
        inspectorId: 'u-inspector',
        inspectionDate: new Date('2026-03-14'),
        area: 'Foundation Bedrock & Piling Cluster Zone A-C',
        checkCategory: 'Structural',
        result: InspectionResult.PASSED,
        notes: 'Ultrasonic cross-hole sonic logging confirmed zero voiding in 30m caissons. Core integrity verified 100%.',
        checklistItems: JSON.stringify([
          { item: 'Borehole depth compliance', passed: true },
          { item: 'Rebar cage clear cover > 75mm', passed: true },
          { item: 'Tremie concrete pour slump check', passed: true }
        ])
      },
      {
        id: 'ins-02',
        code: 'INS-002',
        projectId: project1.id,
        inspectorId: 'u-inspector',
        inspectionDate: new Date('2026-08-12'),
        area: 'Level 8 Mechanical Chase & Fire Barriers',
        checkCategory: 'Safety',
        result: InspectionResult.FAILED,
        notes: 'Intumescent fire sealant penetration collars missing on 3 conduit penetrations in Sector B riser room. Immediate remediation required before L9 pour.',
        checklistItems: JSON.stringify([
          { item: '2-hour fire-rated barrier continuity', passed: false },
          { item: 'Smoke damper damper actuator power', passed: true },
          { item: 'Emergency egress signage spacing', passed: true }
        ])
      },
      {
        id: 'ins-03',
        code: 'INS-003',
        projectId: project1.id,
        inspectorId: 'u-inspector',
        inspectionDate: new Date('2026-07-29'),
        area: 'Level 10 Floor Slab Post-Tensioning Anchors',
        checkCategory: 'Structural',
        result: InspectionResult.PASSED,
        notes: 'Hydraulic jack elongation records within 4.2% of engineering calculations. Grouting completed without air traps.',
        checklistItems: JSON.stringify([
          { item: 'Strand elongation measurement', passed: true },
          { item: 'Anchorage wedge seating depth', passed: true },
          { item: 'Non-shrink grout strength test', passed: true }
        ])
      },
      {
        id: 'ins-04',
        code: 'INS-004',
        projectId: project2.id,
        inspectorId: 'u-inspector',
        inspectionDate: new Date('2026-06-18'),
        area: 'Harbor Pylon Pier 1 Submerged Rebar Cage',
        checkCategory: 'Structural',
        result: InspectionResult.PASSED,
        notes: 'Epoxy coating thickness > 300 microns for marine saltwater exposure. Cathodic protection anodes connected.',
        checklistItems: JSON.stringify([
          { item: 'Marine epoxy coating holiday test', passed: true },
          { item: 'Sacrificial zinc anode electrical continuity', passed: true }
        ])
      },
      {
        id: 'ins-05',
        code: 'INS-005',
        projectId: project1.id,
        inspectorId: 'u-inspector',
        inspectionDate: new Date('2026-08-26'),
        area: 'Level 14 Emergency Stairwell Pressurization Fan',
        checkCategory: 'MEP',
        result: InspectionResult.PENDING,
        notes: 'Scheduled differential air pressure test (50 Pa criteria across closed doors).',
        checklistItems: JSON.stringify([
          { item: 'Fan airflow velocity calibration', passed: false },
          { item: 'Door opening force < 133 N under pressure', passed: false }
        ])
      }
    ]
  });

  // 8. Issues
  console.log('⚠️ Seeding Issues...');
  await prisma.issue.createMany({
    data: [
      {
        id: 'iss-01',
        code: 'ISS-001',
        projectId: project1.id,
        title: 'Rebar Delivery Port Customs Delay (Affecting L14 Pour Schedule)',
        description: 'Shipment REQ-101 of Grade 60 rebar is held at East Harbor berth due to clearance audit. Site stock sufficient for only 3 days.',
        severity: IssueSeverity.CRITICAL,
        status: IssueStatus.OPEN,
        reportedById: 'u-site',
        assignedToId: 'u-pm'
      },
      {
        id: 'iss-02',
        code: 'ISS-002',
        projectId: project1.id,
        title: 'Level 8 Sector B Fire Damper Seal Deficiency',
        description: 'Failed inspection INS-002. Three MEP penetration collars lack 2-hr intumescent wrap.',
        severity: IssueSeverity.HIGH,
        status: IssueStatus.IN_PROGRESS,
        reportedById: 'u-inspector',
        assignedToId: 'u-mep'
      },
      {
        id: 'iss-03',
        code: 'ISS-003',
        projectId: project1.id,
        title: 'Heavy Rain Sump Pump Sediment Accumulation in Basement 2',
        description: 'Runoff during weekend storm caused mud silt build-up in dewatering pit #2. Float switch stuck.',
        severity: IssueSeverity.MEDIUM,
        status: IssueStatus.OPEN,
        reportedById: 'u-site',
        assignedToId: 'u-contractor'
      },
      {
        id: 'iss-04',
        code: 'ISS-004',
        projectId: project1.id,
        title: 'MEP Chilled Water Pipe Clearance Clash with Elevator Structural Beam',
        description: 'Draft drawing D-102 showed 50mm clash between 200mm chilled water loop and elevator header beam at grid C-4.',
        severity: IssueSeverity.HIGH,
        status: IssueStatus.IN_PROGRESS,
        reportedById: 'u-eng',
        assignedToId: 'u-arch'
      },
      {
        id: 'iss-05',
        code: 'ISS-005',
        projectId: project2.id,
        title: 'Tide Surge Warning at Pier 2 Construction Barge',
        description: 'Seasonal high king tide may exceed freeboard limits by 0.4m on August 24.',
        severity: IssueSeverity.MEDIUM,
        status: IssueStatus.RESOLVED,
        reportedById: 'u-site',
        assignedToId: 'u-pm',
        resolvedAt: new Date('2026-08-16'),
        resolutionNotes: 'Reinforced extra anchor mooring lines and elevated electrical power distribution panel by 1.2 meters.'
      }
    ]
  });

  // 9. Notifications
  console.log('🔔 Seeding Notifications...');
  await prisma.notification.createMany({
    data: [
      {
        userId: 'u-pm',
        type: 'MATERIAL',
        title: 'Material Shipment Delayed',
        message: 'Material REQ-101 (Grade 60 Steel Rebar) is flagged DELAYED at port.',
        linkUrl: '/materials',
        read: false
      },
      {
        userId: 'u-eng',
        type: 'DESIGN',
        title: 'Design Review Requested',
        message: 'Sophia Chen submitted DSG-102 (Level 12-24 HVAC & MEP Layouts) for your approval.',
        linkUrl: '/designs',
        read: false
      },
      {
        userId: 'u-pm',
        type: 'INSPECTION',
        title: 'Inspection Failed',
        message: 'Inspection INS-002 on Level 8 Fire Barriers was marked FAILED by Frank Reynolds.',
        linkUrl: '/inspections',
        read: false
      },
      {
        userId: 'u-contractor',
        type: 'TASK',
        title: 'Task Assigned',
        message: 'You were assigned to TSK-103 (Structural Steel Decking & Rebar Cage).',
        linkUrl: '/tasks',
        read: true
      },
      {
        userId: 'u-site',
        type: 'ISSUE',
        title: 'Critical Issue Logged',
        message: 'ISS-001 (Rebar Delivery Port Customs Delay) logged for Skyline Tower.',
        linkUrl: '/issues',
        read: true
      }
    ]
  });

  // 10. Activity Logs
  console.log('📜 Seeding Activity Logs...');
  await prisma.activityLog.createMany({
    data: [
      {
        userId: 'u-arch',
        projectId: project1.id,
        action: 'UPLOADED_DESIGN',
        entityType: 'DESIGN',
        entityId: 'd-102',
        details: 'Uploaded revision v2.1 of Level 12-24 HVAC & MEP Layouts for PE approval',
        createdAt: new Date('2026-08-18T10:30:00Z')
      },
      {
        userId: 'u-inspector',
        projectId: project1.id,
        action: 'RECORDED_INSPECTION',
        entityType: 'INSPECTION',
        entityId: 'ins-02',
        details: 'Logged FAILED inspection on Level 8 Fire Barriers (3 collar seals missing)',
        createdAt: new Date('2026-08-18T14:15:00Z')
      },
      {
        userId: 'u-supplier',
        projectId: project1.id,
        action: 'UPDATED_MATERIAL',
        entityType: 'MATERIAL',
        entityId: 'mr-101',
        details: 'Updated REQ-101 status to DELAYED due to customs clearance hold',
        createdAt: new Date('2026-08-19T08:45:00Z')
      },
      {
        userId: 'u-site',
        projectId: project1.id,
        action: 'LOGGED_ISSUE',
        entityType: 'ISSUE',
        entityId: 'iss-01',
        details: 'Logged CRITICAL severity issue regarding rebar inventory supply risk',
        createdAt: new Date('2026-08-19T09:20:00Z')
      },
      {
        userId: 'u-contractor',
        projectId: project1.id,
        action: 'UPDATED_TASK_PROGRESS',
        entityType: 'TASK',
        entityId: 't-103',
        details: 'Updated progress on TSK-103 (Structural Steel Decking) to 75%',
        createdAt: new Date('2026-08-20T11:00:00Z')
      },
      {
        userId: 'u-pm',
        projectId: project1.id,
        action: 'ASSIGNED_TASK',
        entityType: 'TASK',
        entityId: 't-104',
        details: 'Assigned TSK-104 (MEP Riser & HVAC Ducting) to Raj Patel',
        createdAt: new Date('2026-08-20T14:00:00Z')
      }
    ]
  });

  console.log('✅ BuildFlow database successfully seeded with realistic construction project data!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
