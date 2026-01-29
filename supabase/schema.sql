-- CLEANUP: Clear everything to start fresh
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
DROP TABLE IF EXISTS public.daily_logs CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE public.users (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  email text,
  office_days text[], -- e.g. ['Wed', 'Thu']
  custom_habits jsonb DEFAULT '[{"name": "Gym", "icon": "dumbbell"}, {"name": "Wordle", "icon": "hash"}]'::jsonb,
  custom_affirmations jsonb DEFAULT '["I am disciplined and focused.", "I build quietly and consistently.", "Action over anxiety."]'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. DAILY LOGS TABLE
CREATE TABLE public.daily_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) NOT NULL,
  date date NOT NULL,
  
  -- Flexible habits stored as JSONB array of {name: string, done: boolean}
  habits jsonb DEFAULT '[]'::jsonb,
  
  -- Content
  word_of_day text,
  today_goal text,
  selected_affirmations jsonb DEFAULT '[]'::jsonb,
  song_link text,
  note text,
  mood int,
  
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(user_id, date)
);

-- RLS for Logs
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own logs" ON public.daily_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own logs" ON public.daily_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own logs" ON public.daily_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- 3. TRIGGER: Auto-create user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. BACKFILL: Create user records for existing auth users
INSERT INTO public.users (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;
