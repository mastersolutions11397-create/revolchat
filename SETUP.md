# Yeti AI - Setup Instructions

## Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Setup

1. Go to [Supabase](https://supabase.com) and create a new project
2. In your project dashboard, go to Settings > API
3. Copy your Project URL and anon/public key
4. Add them to your `.env.local` file

## Authentication Setup

The authentication system is already configured to work with Supabase Auth. The following features are implemented:

- ✅ User registration with email/password
- ✅ User login with email/password
- ✅ Protected routes (dashboard, workspace, profile)
- ✅ User session management
- ✅ Sign out functionality
- ✅ User profile display with real user data

## Running the Application

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up your environment variables (see above)

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features

- **Landing Page**: Beautiful hero section with Yeti-themed design
- **Authentication**: Login and signup pages with Supabase integration
- **Workspace Selection**: Choose between Personal, Business, and Enterprise workspaces
- **Dashboard**: Complete dashboard with sidebar navigation
- **Profile Management**: User profile settings and preferences
- **Pricing Plans**: Comprehensive pricing page with Free, Pro, and Enterprise tiers

## Authentication Flow

1. User visits the landing page
2. Clicks "Get Started" or "Sign Up" to create an account
3. Fills out the signup form with personal information
4. Receives email verification (handled by Supabase)
5. After verification, can log in and access protected routes
6. Dashboard and workspace pages are protected and require authentication

## Next Steps

- Set up your Supabase project
- Add your environment variables
- Test the authentication flow
- Customize the branding and content as needed
