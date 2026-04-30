import { z } from "zod";

export const SourceMetaSchema = z
  .object({
    projectId: z.string().optional(),
    projectName: z.string().optional(),
    generatedAt: z.string().optional(),
    database: z.string().optional(),
  })
  .passthrough();

export const ResourceSchema = z
  .object({
    subjectId: z.string(),
    teamId: z.string(),
    teamName: z.string(),
    crewId: z.string().optional().default(""),
    crewName: z.string().optional().default(""),
    type: z.string().optional().default("队伍"),
    displayName: z.string(),
    enabled: z.string().optional().default("是"),
    note: z.string().optional().default(""),
  })
  .passthrough();

export const AssignmentSchema = z
  .object({
    nodeId: z.string(),
    parentId: z.string().optional().default(""),
    workpointId: z.string().optional().default(""),
    workpointName: z.string().optional().default(""),
    plannedWorkpointId: z.string().optional().default(""),
    plannedWorkpointName: z.string().optional().default(""),
    name: z.string(),
    type: z.string().optional().default(""),
    level: z.union([z.string(), z.number()]).optional().default(""),
    code: z.string().optional().default(""),
    isLeaf: z.string().optional().default("否"),
    constructionUnitId: z.string().optional().default(""),
    teamId: z.string().optional().default(""),
    teamName: z.string().optional().default(""),
    subjectId: z.string().optional().default(""),
    subjectName: z.string().optional().default(""),
    syncStatus: z.string().optional().default(""),
    validation: z.string().optional().default(""),
    rawPath: z.string().optional().default(""),
  })
  .passthrough();

export const DirectionSchema = z
  .object({
    directionId: z.string(),
    plannedWorkpointId: z.string().optional().default(""),
    plannedWorkpointName: z.string().optional().default(""),
    subjectId: z.string().optional().default(""),
    subjectName: z.string().optional().default(""),
    teamId: z.string().optional().default(""),
    teamName: z.string().optional().default(""),
    scope: z.string().optional().default(""),
    content: z.string().optional().default(""),
    direction: z.string().optional().default("从小到大"),
    syncStatus: z.string().optional().default(""),
    note: z.string().optional().default(""),
  })
  .passthrough();

export const BeamLineSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    startPier: z.string().optional().default(""),
    endPier: z.string().optional().default(""),
    resource: z.string().optional().default(""),
    transfer: z.union([z.string(), z.number()]).optional().default("0"),
    prev: z.string().optional().default(""),
    startTime: z.string().optional().default(""),
  })
  .passthrough();

export const ProductivitySchema = z
  .object({
    productivityId: z.string(),
    discipline: z.string().optional().default(""),
    structureType: z.string().optional().default(""),
    procedure: z.string().optional().default(""),
    craft: z.string().optional().default(""),
    productivity: z.union([z.string(), z.number()]).optional().default(""),
    productivityUnit: z.string().optional().default(""),
    quantityUnit: z.string().optional().default(""),
    keywords: z.string().optional().default(""),
    enabled: z.string().optional().default("是"),
    note: z.string().optional().default(""),
  })
  .passthrough();

export const WorkpointOrderSchema = z
  .object({
    workpointId: z.string(),
    discipline: z.string().optional().default(""),
    name: z.string().optional().default(""),
    prev: z.string().optional().default(""),
    gap: z.union([z.string(), z.number()]).optional().default("0"),
    start: z.string().optional().default(""),
    order: z.union([z.string(), z.number()]).optional().default(""),
    syncStatus: z.string().optional().default(""),
    note: z.string().optional().default(""),
  })
  .passthrough();

export const ScheduleTaskSchema = z
  .object({
    configId: z.string(),
    workpointId: z.string().optional().default(""),
    workpointName: z.string().optional().default(""),
    structureId: z.string(),
    structureName: z.string().optional().default(""),
    taskOrder: z.union([z.string(), z.number()]).optional().default("1"),
    name: z.string(),
    prev: z.string().optional().default(""),
    relation: z.string().optional().default("FS"),
    gap: z.union([z.string(), z.number()]).optional().default("0"),
    qty: z.union([z.string(), z.number()]).optional().default(""),
    unit: z.string().optional().default(""),
    craft: z.string().optional().default(""),
    metric: z.string().optional().default(""),
    crew: z.string().optional().default(""),
    duration: z.string().optional().default(""),
    syncStatus: z.string().optional().default(""),
    note: z.string().optional().default(""),
  })
  .passthrough();

export const ResponsibilityPayloadSchema = z
  .object({
    source: SourceMetaSchema.optional().default({}),
    resources: z.array(ResourceSchema).optional().default([]),
    teams: z.array(ResourceSchema).optional().default([]),
    subjects: z.array(ResourceSchema).optional().default([]),
    assignments: z.array(AssignmentSchema).optional().default([]),
    directions: z.array(DirectionSchema).optional().default([]),
    beamLines: z.array(BeamLineSchema).optional().default([]),
    productivity: z.array(ProductivitySchema).optional().default([]),
    workpointOrder: z.array(WorkpointOrderSchema).optional().default([]),
    scheduleTasks: z.array(ScheduleTaskSchema).optional().default([]),
  })
  .passthrough();

export const ProjectStructureSchema = z
  .object({
    source: SourceMetaSchema.optional().default({}),
    tree: z.array(z.unknown()).optional().default([]),
    workpoints: z.array(z.record(z.string(), z.unknown())).optional().default([]),
    pierOptions: z.array(z.string()).optional().default([]),
    beamLines: z.array(BeamLineSchema).optional().default([]),
    resources: z.array(z.string()).optional().default([]),
    structureTemplates: z.record(z.string(), z.unknown()).optional().default({}),
    structureTemplatesByWorkpoint: z.record(z.string(), z.unknown()).optional().default({}),
    summary: z.array(z.record(z.string(), z.unknown())).optional().default([]),
  })
  .passthrough();

export const BootstrapResponseSchema = z.object({
  ok: z.boolean(),
  projectId: z.string(),
  projectStructure: ProjectStructureSchema,
  config: ResponsibilityPayloadSchema,
});

export type Resource = z.infer<typeof ResourceSchema>;
export type Assignment = z.infer<typeof AssignmentSchema>;
export type Direction = z.infer<typeof DirectionSchema>;
export type BeamLine = z.infer<typeof BeamLineSchema>;
export type Productivity = z.infer<typeof ProductivitySchema>;
export type WorkpointOrder = z.infer<typeof WorkpointOrderSchema>;
export type ScheduleTask = z.infer<typeof ScheduleTaskSchema>;
export type ResponsibilityPayload = z.infer<typeof ResponsibilityPayloadSchema>;
export type ProjectStructure = z.infer<typeof ProjectStructureSchema>;
export type BootstrapResponse = z.infer<typeof BootstrapResponseSchema>;
