-- Fix the handle_new_user function to properly handle first_name and last_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  full_name_text text;
  first_name_text text;
  last_name_text text;
  email_user text;
BEGIN
  -- Get values from user metadata
  full_name_text := COALESCE(new.raw_user_meta_data->>'full_name', new.email);
  first_name_text := new.raw_user_meta_data->>'first_name';
  last_name_text := new.raw_user_meta_data->>'last_name';
  email_user := split_part(COALESCE(new.email, ''), '@', 1);

  -- If first_name and last_name are provided in metadata, use them directly
  IF first_name_text IS NOT NULL AND last_name_text IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, full_name, role, first_name, last_name)
    VALUES (
      new.id,
      new.email,
      full_name_text,
      COALESCE(new.raw_user_meta_data->>'role', 'teacher'),
      first_name_text,
      last_name_text
    );
  ELSE
    -- Fallback: parse full_name or use email parts
    DECLARE
      tokens text[];
      token_count int;
    BEGIN
      tokens := regexp_split_to_array(COALESCE(TRIM(full_name_text), ''), '\s+');
      token_count := COALESCE(array_length(tokens, 1), 0);

      -- Parse first and last name from full name
      IF token_count > 1 THEN
        first_name_text := array_to_string(tokens[1:token_count-1], ' ');
        last_name_text := tokens[token_count];
      ELSIF token_count = 1 THEN
        first_name_text := tokens[1];
        last_name_text := NULL;
      ELSE
        -- Use email parts as fallback
        first_name_text := NULLIF(split_part(email_user, '.', 1), '');
        last_name_text := NULLIF(split_part(email_user, '.', 2), '');
      END IF;

      INSERT INTO public.profiles (id, email, full_name, role, first_name, last_name)
      VALUES (
        new.id,
        new.email,
        full_name_text,
        COALESCE(new.raw_user_meta_data->>'role', 'teacher'),
        first_name_text,
        last_name_text
      );
    END;
  END IF;

  RETURN new;
END;
$$;

-- Fix existing corrupted profile records where email is in first_name
UPDATE public.profiles 
SET 
  first_name = CASE 
    WHEN first_name LIKE '%@%' THEN 
      COALESCE(NULLIF(split_part(split_part(first_name, '@', 1), '.', 1), ''), split_part(first_name, '@', 1))
    ELSE first_name 
  END,
  last_name = CASE 
    WHEN first_name LIKE '%@%' THEN 
      NULLIF(split_part(split_part(first_name, '@', 1), '.', 2), '')
    ELSE last_name 
  END,
  updated_at = now()
WHERE first_name LIKE '%@%';