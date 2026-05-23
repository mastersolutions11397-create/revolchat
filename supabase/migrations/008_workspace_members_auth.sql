-- Workspace ownership, invitations, and per-bot member permissions.

ALTER TABLE public.workspaces
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

UPDATE public.workspaces
SET owner_id = user_id
WHERE owner_id IS NULL AND user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.yetti_workspace_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  allowed_bot_ids UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(workspace_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.yetti_workspace_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  token TEXT NOT NULL UNIQUE,
  allowed_bot_ids UUID[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked')),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

UPDATE public.agents a
SET workspace_id = w.id
FROM public.workspaces w
WHERE a.workspace_id IS NULL
  AND a.user_id IS NOT NULL
  AND (w.owner_id::text = a.user_id::text OR w.user_id::text = a.user_id::text);

INSERT INTO public.yetti_workspace_members (workspace_id, user_id, email, role)
SELECT id, COALESCE(owner_id, user_id), NULL, 'owner'
FROM public.workspaces
WHERE COALESCE(owner_id, user_id) IS NOT NULL
ON CONFLICT (workspace_id, user_id) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_yetti_workspace_members_user ON public.yetti_workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_yetti_workspace_members_workspace ON public.yetti_workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_yetti_workspace_invitations_token ON public.yetti_workspace_invitations(token);
CREATE INDEX IF NOT EXISTS idx_yetti_workspace_invitations_email ON public.yetti_workspace_invitations(email);
CREATE INDEX IF NOT EXISTS idx_agents_workspace_id ON public.agents(workspace_id);

ALTER TABLE public.yetti_workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yetti_workspace_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view their memberships" ON public.yetti_workspace_members;
CREATE POLICY "Members can view their memberships" ON public.yetti_workspace_members
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owners can manage workspace members" ON public.yetti_workspace_members;
CREATE POLICY "Owners can manage workspace members" ON public.yetti_workspace_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.yetti_workspace_members owner_member
      WHERE owner_member.workspace_id = yetti_workspace_members.workspace_id
      AND owner_member.user_id = auth.uid()
      AND owner_member.role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Invited users can view their invitations" ON public.yetti_workspace_invitations;
CREATE POLICY "Invited users can view their invitations" ON public.yetti_workspace_invitations
  FOR SELECT USING (email = (auth.jwt() ->> 'email'));

DROP TRIGGER IF EXISTS update_yetti_workspace_members_updated_at ON public.yetti_workspace_members;
CREATE TRIGGER update_yetti_workspace_members_updated_at
  BEFORE UPDATE ON public.yetti_workspace_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_yetti_workspace_invitations_updated_at ON public.yetti_workspace_invitations;
CREATE TRIGGER update_yetti_workspace_invitations_updated_at
  BEFORE UPDATE ON public.yetti_workspace_invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

GRANT ALL ON public.yetti_workspace_members TO authenticated;
GRANT ALL ON public.yetti_workspace_invitations TO authenticated;
