-- Drop existing problematic policies for group_members
DROP POLICY IF EXISTS "Users can view group members of their groups" ON public.group_members;

-- Create new non-recursive policies for group_members
CREATE POLICY "Users can view group members of their groups" ON public.group_members
  FOR SELECT USING (
    user_id = auth.uid() OR -- Users can always see their own memberships
    EXISTS (
      SELECT 1 FROM public.groups g 
      WHERE g.id = group_members.group_id AND g.created_by = auth.uid()
    ) -- Group creators can see all members
  );

-- Add missing INSERT policy for group_members
CREATE POLICY "Group creators can add members" ON public.group_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.groups g 
      WHERE g.id = group_id AND g.created_by = auth.uid()
    ) OR
    user_id = auth.uid() -- Users can add themselves when accepting invitations
  );

-- Add UPDATE policy for group_members
CREATE POLICY "Group creators can update member roles" ON public.group_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.groups g 
      WHERE g.id = group_id AND g.created_by = auth.uid()
    )
  );

-- Add DELETE policy for group_members
CREATE POLICY "Group creators and users can remove memberships" ON public.group_members
  FOR DELETE USING (
    user_id = auth.uid() OR -- Users can remove themselves
    EXISTS (
      SELECT 1 FROM public.groups g 
      WHERE g.id = group_id AND g.created_by = auth.uid()
    ) -- Group creators can remove any member
  );

-- Add missing INSERT policy for users table (needed for profile creation)
CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
