-- =============================================================================
-- Migración de unificación: todo el esquema de Family Hub vive en su propio
-- schema (family_hub), completamente aislado de "public" (usado por human).
-- No se toca ninguna tabla, tipo, función ni policy existente de human.
-- =============================================================================

create schema if not exists family_hub;
create schema if not exists family_hub_private;

create type family_hub.family_role as enum ('creator', 'administrator', 'parent', 'caregiver', 'guest');
create type family_hub.reaction_severity as enum ('none', 'mild', 'moderate', 'severe');

create table family_hub.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table family_hub.family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references family_hub.families(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  role family_hub.family_role not null default 'parent',
  invited_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (family_id, user_id)
);

create table family_hub.family_invites (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references family_hub.families(id) on delete cascade,
  code text not null unique,
  role family_hub.family_role not null default 'parent',
  created_by uuid not null references auth.users(id),
  expires_at timestamptz not null default (now() + interval '7 days'),
  used_by uuid references auth.users(id),
  used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table family_hub.babies (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references family_hub.families(id) on delete cascade,
  first_name text not null,
  birth_date date not null,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table family_hub.allergens (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  source_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table family_hub.food_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  min_age_days integer not null,
  source_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table family_hub.food_allergens (
  food_item_id uuid not null references family_hub.food_items(id) on delete cascade,
  allergen_id uuid not null references family_hub.allergens(id) on delete cascade,
  primary key (food_item_id, allergen_id)
);

create table family_hub.feeding_events (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references family_hub.babies(id) on delete cascade,
  food_item_id uuid not null references family_hub.food_items(id),
  occurred_at timestamptz not null default now(),
  reaction family_hub.reaction_severity not null default 'none',
  notes text,
  photo_url text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

