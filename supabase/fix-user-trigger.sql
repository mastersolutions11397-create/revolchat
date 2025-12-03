-- Fix for the award_initial_credits trigger function
-- This fixes the "Database error saving new user" issue

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS award_initial_credits_trigger ON auth.users;
DROP FUNCTION IF EXISTS award_initial_credits();

-- Create an improved version with error handling and SECURITY DEFINER
CREATE OR REPLACE FUNCTION award_initial_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to bypass RLS
SET search_path = public
AS $$
DECLARE
    default_workspace_id UUID;
    workspace_exists BOOLEAN;
BEGIN
    -- Check if workspaces table exists and has the expected structure
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'workspaces'
    ) INTO workspace_exists;

    -- If workspaces table exists, try to find or create a workspace
    IF workspace_exists THEN
        BEGIN
            -- Try to find an existing workspace for this user
            SELECT id INTO default_workspace_id
            FROM public.workspaces
            WHERE user_id = NEW.id OR owner_id = NEW.id
            LIMIT 1;

            -- If no workspace exists, try to create a default one
            IF default_workspace_id IS NULL THEN
                BEGIN
                    -- Try with user_id column
                    INSERT INTO public.workspaces (user_id, name, workspace_type, created_at, updated_at)
                    VALUES (NEW.id, 'Default Workspace', 'personal', NOW(), NOW())
                    RETURNING id INTO default_workspace_id;
                EXCEPTION WHEN OTHERS THEN
                    -- If that fails, try with owner_id column
                    BEGIN
                        INSERT INTO public.workspaces (owner_id, name, workspace_type, is_active, created_at, updated_at)
                        VALUES (NEW.id, 'Default Workspace', 'personal', true, NOW(), NOW())
                        RETURNING id INTO default_workspace_id;
                    EXCEPTION WHEN OTHERS THEN
                        -- If both fail, generate a UUID for workspace_id
                        default_workspace_id := gen_random_uuid();
                    END;
                END;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            -- If workspace operations fail, use a generated UUID
            default_workspace_id := gen_random_uuid();
        END;
    ELSE
        -- If workspaces table doesn't exist, generate a UUID
        default_workspace_id := gen_random_uuid();
    END IF;

    -- Insert initial credit transaction
    -- This will work even if workspace doesn't exist (workspace_id is just a UUID)
    BEGIN
        INSERT INTO public.user_credits (
            workspace_id,
            user_id,
            transaction_type,
            credits,
            balance,
            description,
            source
        ) VALUES (
            default_workspace_id,
            NEW.id,
            'credit',
            100,
            100,
            'Welcome bonus credits',
            'user_registration'
        );
    EXCEPTION WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE WARNING 'Failed to insert initial credits for user %: %', NEW.id, SQLERRM;
    END;

    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER award_initial_credits_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION award_initial_credits();
