-- IMPORTANT: Run this entire script in your Supabase SQL Editor!

-- 1. Create the reports table securely linked to auth.users
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  ticket_id TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'reported' CHECK (status IN ('reported', 'in_progress', 'resolved')),
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  images TEXT[] DEFAULT '{}',
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: If table already exists, run:
-- ALTER TABLE reports ADD COLUMN upvotes INTEGER DEFAULT 0;

-- 2. Create the status history tracking table
CREATE TABLE status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  actor TEXT NOT NULL,
  note TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Set up Row Level Security (RLS) for the reports table
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

-- 4. Policies:
-- Anyone can view all reports (so the Community Feed works)
CREATE POLICY "Public profiles are viewable by everyone" ON reports FOR SELECT USING (true);
CREATE POLICY "History is viewable by everyone" ON status_history FOR SELECT USING (true);

-- Users can only insert their own reports
CREATE POLICY "Users can insert their own reports" ON reports FOR INSERT WITH CHECK (auth.uid() = user_id);
-- 5. Create the comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id), -- Optional for guest comments
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Update RLS for everyone (Public/Anon/Auth) for the demo
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Select: Everyone can see comments
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
-- Insert: Anyone can post comments for the demo
CREATE POLICY "Anyone can post comments" ON comments FOR INSERT WITH CHECK (true);

-- FINAL PERMISSIVE POLICIES FOR HACKATHON DEMO:
-- Ensure reports and history also allow anon updates/inserts if not already set
DROP POLICY IF EXISTS "Enable update for all" ON reports;
CREATE POLICY "Enable update for all" ON reports FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable insert for all" ON status_history;
CREATE POLICY "Enable insert for all" ON status_history FOR INSERT WITH CHECK (true);

-- Storage (Optional but recommended):
-- Go to Storage -> Create a new public bucket named "issue_images"
-- We will handle uploads from the frontend immediately into this bucket!
