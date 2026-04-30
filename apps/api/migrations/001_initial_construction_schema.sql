create table if not exists public.construction_projects (
  project_id text primary key,
  project_name text not null,
  source_meta jsonb not null default '{}'::jsonb,
  project_structure jsonb not null default '{}'::jsonb,
  summary jsonb not null default '[]'::jsonb,
  generated_at timestamptz,
  imported_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.construction_workpoints (
  project_id text not null references public.construction_projects(project_id) on delete cascade,
  workpoint_id text not null,
  source_id text,
  discipline text,
  kind text,
  name text not null,
  base_name text,
  side text,
  prev_workpoint text,
  gap_days numeric not null default 0,
  manual_start text,
  mile numeric,
  unit_count integer,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (project_id, workpoint_id)
);

create table if not exists public.construction_structure_templates (
  project_id text not null references public.construction_projects(project_id) on delete cascade,
  workpoint_id text not null,
  template jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (project_id, workpoint_id)
);

create table if not exists public.construction_resources (
  project_id text not null references public.construction_projects(project_id) on delete cascade,
  subject_id text not null,
  team_id text not null,
  team_name text not null,
  crew_id text,
  crew_name text,
  subject_type text not null default '队伍',
  display_name text not null,
  enabled boolean not null default true,
  note text,
  updated_at timestamptz not null default now(),
  primary key (project_id, subject_id),
  constraint construction_resources_subject_type_chk check (subject_type in ('队伍', '队伍-班组'))
);

create table if not exists public.construction_assignments (
  project_id text not null references public.construction_projects(project_id) on delete cascade,
  node_id text not null,
  parent_id text,
  workpoint_id text,
  workpoint_name text,
  planned_workpoint_id text,
  planned_workpoint_name text,
  name text not null,
  node_type text,
  level_no integer,
  code text,
  is_leaf boolean not null default false,
  construction_unit_id text,
  team_id text,
  team_name text,
  subject_id text,
  subject_name text,
  sync_status text,
  validation text,
  raw_path text,
  source_order integer,
  updated_at timestamptz not null default now(),
  primary key (project_id, node_id)
);

create table if not exists public.construction_workgroup_directions (
  project_id text not null references public.construction_projects(project_id) on delete cascade,
  direction_id text not null,
  planned_workpoint_id text,
  planned_workpoint_name text,
  subject_id text,
  subject_name text,
  team_id text,
  team_name text,
  scope text,
  content text,
  direction text not null default '从小到大',
  sync_status text,
  note text,
  updated_at timestamptz not null default now(),
  primary key (project_id, direction_id),
  constraint construction_workgroup_directions_direction_chk check (direction in ('从小到大', '从大到小'))
);

create table if not exists public.construction_beam_directions (
  project_id text not null references public.construction_projects(project_id) on delete cascade,
  beam_direction_id text not null,
  name text not null,
  start_pier text,
  end_pier text,
  resource text,
  transfer_days numeric not null default 0,
  prev_direction text,
  planned_start text,
  enabled boolean not null default true,
  sync_status text,
  validation text,
  note text,
  updated_at timestamptz not null default now(),
  primary key (project_id, beam_direction_id)
);

create table if not exists public.construction_productivity (
  project_id text not null references public.construction_projects(project_id) on delete cascade,
  productivity_id text not null,
  discipline text,
  structure_type text not null,
  procedure_name text,
  craft text,
  productivity numeric,
  productivity_unit text,
  quantity_unit text,
  keywords text,
  enabled boolean not null default true,
  note text,
  updated_at timestamptz not null default now(),
  primary key (project_id, productivity_id)
);

create table if not exists public.construction_workpoint_orders (
  project_id text not null references public.construction_projects(project_id) on delete cascade,
  workpoint_id text not null,
  discipline text,
  name text,
  prev_workpoint text,
  gap_days numeric not null default 0,
  manual_start text,
  order_no integer,
  sync_status text,
  note text,
  updated_at timestamptz not null default now(),
  primary key (project_id, workpoint_id)
);

create table if not exists public.construction_schedule_tasks (
  project_id text not null references public.construction_projects(project_id) on delete cascade,
  config_id text not null,
  workpoint_id text,
  workpoint_name text,
  structure_id text not null,
  structure_name text,
  task_order integer not null default 1,
  name text not null,
  prev_task text,
  relation text not null default 'FS',
  gap_days numeric not null default 0,
  quantity text,
  unit text,
  craft text,
  productivity_metric text,
  crew text,
  duration text,
  sync_status text,
  note text,
  updated_at timestamptz not null default now(),
  primary key (project_id, config_id),
  constraint construction_schedule_tasks_relation_chk check (relation in ('FS'))
);

create table if not exists public.construction_config_snapshots (
  id bigserial primary key,
  project_id text not null references public.construction_projects(project_id) on delete cascade,
  action text not null default 'save',
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.construction_projects enable row level security;
alter table public.construction_workpoints enable row level security;
alter table public.construction_structure_templates enable row level security;
alter table public.construction_resources enable row level security;
alter table public.construction_assignments enable row level security;
alter table public.construction_workgroup_directions enable row level security;
alter table public.construction_beam_directions enable row level security;
alter table public.construction_productivity enable row level security;
alter table public.construction_workpoint_orders enable row level security;
alter table public.construction_schedule_tasks enable row level security;
alter table public.construction_config_snapshots enable row level security;

create index if not exists idx_construction_assignments_workpoint on public.construction_assignments(project_id, planned_workpoint_id);
create index if not exists idx_construction_assignments_subject on public.construction_assignments(project_id, subject_id);
create index if not exists idx_construction_directions_workpoint on public.construction_workgroup_directions(project_id, planned_workpoint_id);
create index if not exists idx_construction_tasks_structure on public.construction_schedule_tasks(project_id, structure_id, task_order);
create index if not exists idx_construction_tasks_workpoint on public.construction_schedule_tasks(project_id, workpoint_id, task_order);
create index if not exists idx_construction_config_snapshots_project on public.construction_config_snapshots(project_id, created_at desc);
