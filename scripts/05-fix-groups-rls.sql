-- Fix infinite recursion in groups table RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view groups they belong to" ON public.groups;
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;

-- Create new policies that avoid recursion
-- Allow users to see groups they created (no recursion needed)
CREATE POLICY "Users can view groups they created" ON public.groups
  FOR SELECT USING (auth.uid() = created_by);

-- Allow users to see groups where they are members (but avoid recursion by using a simpler check)
CREATE POLICY "Users can view groups they are members of" ON public.groups
  FOR SELECT USING (
    id IN (
      SELECT DISTINCT group_id 
      FROM public.group_members 
      WHERE user_id = auth.uid()
    )
  );

-- Allow users to create groups (they become the creator)
CREATE POLICY "Users can create groups" ON public.groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Allow group creators to update their groups
CREATE POLICY "Group creators can update their groups" ON public.groups
  FOR UPDATE USING (auth.uid() = created_by);

-- Allow group creators to delete their groups
CREATE POLICY "Group creators can delete their groups" ON public.groups
  FOR DELETE USING (auth.uid() = created_by);
