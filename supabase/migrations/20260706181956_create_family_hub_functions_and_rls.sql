-- Función núcleo de RLS, en schema no expuesto (mismo patrón que ADR 0003).
create or replace function family_hub_private.is_family_member(_family_id uuid)
returns boolean as $$
  select exists (
    select 1 from family_hub.family_members
    where family_id = _family_id
      and user_id = auth.uid()
      and deleted_at is null
  );
$$ language sql security definer stable set search_path = family_hub, pg_temp;

grant usage on schema family_hub_private to authenticated;
grant execute on function family_hub_private.is_family_member(uuid) to authenticated;

-- Trigger genérico de updated_at, propio del schema family_hub (no reutiliza
-- el de "human" para mantener independencia total entre apps).
create or replace function family_hub.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = family_hub, pg_temp;

-- RLS: families
alter table family_hub.families enable row level security;
create policy "families_select_members" on family_hub.families
  for select using (family_hub_private.is_family_member(id));
create policy "families_insert_own" on family_hub.families
  for insert with check (created_by = (select auth.uid()));
create policy "families_update_admins" on family_hub.families
  for update using (
    exists (select 1 from family_hub.family_members where family_id = family_hub.families.id and user_id = (select auth.uid()) and role in ('creator','administrator') and deleted_at is null)
  );

-- RLS: family_members
alter table family_hub.family_members enable row level security;
create policy "family_members_isolation" on family_hub.family_members
  for select using (family_hub_private.is_family_member(family_id));
create policy "family_members_insert" on family_hub.family_members
  for insert with check (
    (role = 'creator' and user_id = (select auth.uid()) and exists (select 1 from family_hub.families f where f.id = family_hub.family_members.family_id and f.created_by = (select auth.uid())))
    or exists (select 1 from family_hub.family_members fm where fm.family_id = family_hub.family_members.family_id and fm.user_id = (select auth.uid()) and fm.role in ('creator','administrator') and fm.deleted_at is null)
  );

-- RLS: family_invites
alter table family_hub.family_invites enable row level security;
create policy "family_invites_select_members" on family_hub.family_invites
  for select using (family_hub_private.is_family_member(family_id));
create policy "family_invites_insert_admins" on family_hub.family_invites
  for insert with check (
    exists (select 1 from family_hub.family_members fm where fm.family_id = family_hub.family_invites.family_id and fm.user_id = (select auth.uid()) and fm.role in ('creator','administrator') and fm.deleted_at is null)
  );

-- RLS: babies
alter table family_hub.babies enable row level security;
create policy "babies_isolation" on family_hub.babies
  for all using (family_hub_private.is_family_member(family_id));

-- RLS: catálogo (solo lectura autenticada)
alter table family_hub.allergens enable row level security;
create policy "allergens_read_authenticated" on family_hub.allergens
  for select using ((select auth.uid()) is not null);

alter table family_hub.food_items enable row level security;
create policy "food_items_read_authenticated" on family_hub.food_items
  for select using ((select auth.uid()) is not null);

alter table family_hub.food_allergens enable row level security;
create policy "food_allergens_read_authenticated" on family_hub.food_allergens
  for select using ((select auth.uid()) is not null);

-- RLS: feeding_events
alter table family_hub.feeding_events enable row level security;
create policy "feeding_events_isolation" on family_hub.feeding_events
  for all using (
    family_hub_private.is_family_member((select family_id from family_hub.babies where babies.id = family_hub.feeding_events.baby_id))
  );

-- Función accept_family_invite (security definer acotado, ver ADR 0004)
create or replace function family_hub.accept_family_invite(_code text)
returns uuid as $$
declare
  _invite family_hub.family_invites%rowtype;
begin
  select * into _invite from family_hub.family_invites
  where code = _code and deleted_at is null and used_at is null and expires_at > now()
  for update;

  if not found then
    raise exception 'INVALID_OR_EXPIRED_INVITE';
  end if;

  insert into family_hub.family_members (family_id, user_id, role, invited_by)
  values (_invite.family_id, auth.uid(), _invite.role, _invite.created_by)
  on conflict (family_id, user_id) do nothing;

  update family_hub.family_invites set used_by = auth.uid(), used_at = now() where id = _invite.id and used_at is null;

  return _invite.family_id;
end;
$$ language plpgsql security definer set search_path = family_hub, pg_temp;

revoke all on function family_hub.accept_family_invite(text) from public;
revoke execute on function family_hub.accept_family_invite(text) from anon;
grant execute on function family_hub.accept_family_invite(text) to authenticated;

-- Índices (mismo patrón que ADR 0003)
create index idx_fh_babies_family_id on family_hub.babies(family_id);
create index idx_fh_families_created_by on family_hub.families(created_by);
create index idx_fh_family_invites_created_by on family_hub.family_invites(created_by);
create index idx_fh_family_invites_family_id on family_hub.family_invites(family_id);
create index idx_fh_family_invites_used_by on family_hub.family_invites(used_by);
create index idx_fh_family_members_invited_by on family_hub.family_members(invited_by);
create index idx_fh_family_members_user_id on family_hub.family_members(user_id);
create index idx_fh_food_allergens_allergen_id on family_hub.food_allergens(allergen_id);
create index idx_fh_feeding_events_baby_id on family_hub.feeding_events(baby_id);
create index idx_fh_feeding_events_food_item_id on family_hub.feeding_events(food_item_id);
create index idx_fh_feeding_events_created_by on family_hub.feeding_events(created_by);
create index idx_fh_feeding_events_baby_occurred on family_hub.feeding_events(baby_id, occurred_at desc);

-- Triggers de updated_at
create trigger families_set_updated_at before update on family_hub.families for each row execute function family_hub.set_updated_at();
create trigger family_members_set_updated_at before update on family_hub.family_members for each row execute function family_hub.set_updated_at();
create trigger family_invites_set_updated_at before update on family_hub.family_invites for each row execute function family_hub.set_updated_at();
create trigger babies_set_updated_at before update on family_hub.babies for each row execute function family_hub.set_updated_at();
create trigger food_items_set_updated_at before update on family_hub.food_items for each row execute function family_hub.set_updated_at();
create trigger allergens_set_updated_at before update on family_hub.allergens for each row execute function family_hub.set_updated_at();
create trigger feeding_events_set_updated_at before update on family_hub.feeding_events for each row execute function family_hub.set_updated_at();

