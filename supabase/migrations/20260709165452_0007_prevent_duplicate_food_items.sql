CREATE UNIQUE INDEX IF NOT EXISTS idx_fh_food_items_family_name_unique
  ON family_hub.food_items (family_id, name)
  WHERE (family_id IS NOT NULL AND deleted_at IS NULL);
