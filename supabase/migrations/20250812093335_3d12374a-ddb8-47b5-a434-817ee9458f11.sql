
-- 1) Add first_name and last_name to public.profiles
alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text;

-- 2) Create a trigger function to fill name parts from full_name/email when missing
create or replace function public.profiles_fill_name_parts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  tokens text[];
  token_count int;
  email_user text;
begin
  -- Normalize inputs
  tokens := regexp_split_to_array(coalesce(trim(new.full_name), ''), '\s+');
  token_count := coalesce(array_length(tokens, 1), 0);
  email_user := split_part(coalesce(new.email, ''), '@', 1);

  -- Fill first_name if empty or null
  if coalesce(new.first_name, '') = '' then
    if token_count > 1 then
      new.first_name := array_to_string(tokens[1:token_count-1], ' ');
    elsif token_count = 1 then
      new.first_name := tokens[1];
    else
      -- Fallback to email user part before dot
      new.first_name := nullif(split_part(email_user, '.', 1), '');
    end if;
  end if;

  -- Fill last_name if empty or null
  if coalesce(new.last_name, '') = '' then
    if token_count > 1 then
      new.last_name := tokens[token_count];
    elsif token_count = 1 then
      -- Fallback to email user part after dot
      new.last_name := nullif(split_part(email_user, '.', 2), '');
    else
      new.last_name := null;
    end if;
  end if;

  return new;
end;
$$;

-- 3) Attach trigger to public.profiles
drop trigger if exists trg_profiles_fill_name_parts on public.profiles;
create trigger trg_profiles_fill_name_parts
before insert or update on public.profiles
for each row
execute function public.profiles_fill_name_parts();

-- 4) Backfill existing rows where first_name/last_name are null or empty
with parts as (
  select
    id,
    regexp_split_to_array(coalesce(trim(full_name), ''), '\s+') as tokens,
    coalesce(email, '') as email
  from public.profiles
)
update public.profiles p
set
  first_name = case
    when coalesce(p.first_name, '') <> '' then p.first_name
    else case
      when array_length(parts.tokens, 1) > 1 then array_to_string(parts.tokens[1:array_length(parts.tokens,1)-1], ' ')
      when array_length(parts.tokens, 1) = 1 then parts.tokens[1]
      else nullif(split_part(split_part(parts.email,'@',1), '.', 1), '')
    end end,
  last_name = case
    when coalesce(p.last_name, '') <> '' then p.last_name
    else case
      when array_length(parts.tokens, 1) > 1 then parts.tokens[array_length(parts.tokens,1)]
      when array_length(parts.tokens, 1) = 1 then nullif(split_part(split_part(parts.email,'@',1), '.', 2), '')
      else null
    end end
from parts
where p.id = parts.id;

-- 5) Update the existing new-user handler to include first_name/last_name (falls back via trigger)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role, first_name, last_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'teacher'),
    nullif(new.raw_user_meta_data->>'first_name', ''),
    nullif(new.raw_user_meta_data->>'last_name', '')
  );
  return new;
end;
$$;
