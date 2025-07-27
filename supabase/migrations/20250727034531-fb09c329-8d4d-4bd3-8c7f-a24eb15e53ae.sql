-- Enable real-time functionality for all tables
-- Set REPLICA IDENTITY FULL for complete row data during updates
ALTER TABLE public.behavior_requests REPLICA IDENTITY FULL;
ALTER TABLE public.reflections REPLICA IDENTITY FULL;
ALTER TABLE public.kiosks REPLICA IDENTITY FULL;
ALTER TABLE public.user_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.students REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.behavior_history REPLICA IDENTITY FULL;

-- Add all tables to the supabase_realtime publication for real-time functionality
ALTER PUBLICATION supabase_realtime ADD TABLE public.behavior_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reflections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.kiosks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.students;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.behavior_history;