-- Fix the NOT NULL constraint on behavior_history.reflection_id
-- This prevents the admin_clear_all_queues() function from failing
-- when behavior requests don't have reflections yet

ALTER TABLE behavior_history 
ALTER COLUMN reflection_id DROP NOT NULL;