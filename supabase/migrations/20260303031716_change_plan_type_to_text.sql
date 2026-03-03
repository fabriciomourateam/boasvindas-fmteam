-- Update student_pages plan type to text
ALTER TABLE student_pages 
  ALTER COLUMN plan TYPE text,
  ALTER COLUMN plan DROP DEFAULT;

-- Update templates plan type to text if it exists (in objective we usually put plan, let's check templates later, but for now we only know student_pages has 'plan' definitively from types.ts)
-- Assuming we want to drop the enum if nothing else uses it
-- DROP TYPE IF EXISTS plan_type;
