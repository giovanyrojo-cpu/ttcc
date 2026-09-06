-- TOP TEN COMMAND CENTER — schema inicial
-- MVP de un solo usuario (Director), preparado para roles futuros
-- (admin, director, asesor, asistente, solo_lectura) sin rehacer la BD.

create type pipeline_stage as enum (
  'Nuevo','Investigado','Listo para contactar','Contactado',
  'Se mandó y no contestó','Contestó y no hay interés','No es WhatsApp',
  'Interesado','Cita','Visita','Propuesta','Negociación','Cerrado',
  'Perdido','Follow-up'
);

create type score_priority as enum ('A','B','C','Nurture');
create type comision_tipo as enum ('porcentaje','monto_fijo');
create type comision_estatus as enum ('potencial','pactada','facturada','cobrada','repartida');
create type property_tipo as enum ('Industrial','Terreno','Oficina','Residencial','Otro');
create type user_role as enum ('admin','director','asesor','asistente','solo_lectura');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role user_role not null default 'director',
  created_at timestamptz not null default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) default auth.uid(),
  empresa_o_persona text not null,
  giro text,
  ubicacion text,
  contacto text,
  cargo text,
  telefono text,
  whatsapp text,
  email text,
  linkedin text,
  website text,
  instagram text,
  senal_intencion text,
  fuente text,
  fecha_captura timestamptz not null default now(),
  propiedad_recomendada text,
  motivo_encaje text,
  score int check (score between 0 and 100),
  prioridad score_priority,
  estatus_crm pipeline_stage not null default 'Nuevo',
  ultimo_contacto timestamptz,
  proximo_seguimiento timestamptz,
  next_best_action text,
  notas text,
  razon_perdida text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) default auth.uid(),
  tipo property_tipo not null,
  titulo text not null,
  ubicacion text not null,
  superficie_m2 numeric,
  precio numeric,
  moneda text not null default 'MXN',
  kva numeric,
  anden boolean,
  uso_de_suelo text,
  notas text,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table comisiones (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) default auth.uid(),
  lead_id uuid references leads(id) on delete set null,
  propiedad text,
  tipo comision_tipo not null,
  valor numeric not null,
  monto_estimado numeric not null,
  reparto_asesor text,
  reparto_porcentaje numeric,
  iva_aplica boolean not null default true,
  estatus comision_estatus not null default 'potencial',
  fecha_estimada_cierre date,
  fecha_cobro date,
  notas text,
  created_at timestamptz not null default now()
);

create table metas (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) default auth.uid(),
  periodo text not null,
  metrica text not null,
  objetivo numeric not null,
  actual numeric not null default 0,
  updated_at timestamptz not null default now()
);

create table interactions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) default auth.uid(),
  lead_id uuid not null references leads(id) on delete cascade,
  canal text not null,
  resumen text not null,
  fecha timestamptz not null default now()
);

-- Índices
create index idx_leads_estatus on leads(estatus_crm);
create index idx_leads_owner on leads(owner_id);
create index idx_comisiones_estatus on comisiones(estatus);
create index idx_interactions_lead on interactions(lead_id);

-- Row Level Security: cada usuario solo ve/edita sus propios registros.
-- (En MVP de un solo usuario esto ya aísla la cuenta; con roles futuros
-- se añaden políticas adicionales para admin/director sobre su equipo.)

alter table profiles enable row level security;
alter table leads enable row level security;
alter table properties enable row level security;
alter table comisiones enable row level security;
alter table metas enable row level security;
alter table interactions enable row level security;

create policy "profiles_self" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "leads_owner" on leads
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "properties_owner" on properties
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "comisiones_owner" on comisiones
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "metas_owner" on metas
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "interactions_owner" on interactions
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
