# Admin Setup Instructions

## Creating Your First Admin Account

Since the database and authentication system are now fully set up, follow these steps to create your admin account:

### Step 1: Sign Up
1. Go to the `/auth` page on your website
2. Click on the "Sign Up" tab
3. Create an account with your email and password
4. You'll be automatically logged in after signup

### Step 2: Get Your User ID
After signing up, you need to find your user ID to assign admin privileges. You can find it in two ways:

**Option A: From Cloud Backend**
1. Click "View Backend" button
2. Go to "Database" → "profiles" table
3. Find your profile and copy the `user_id`

**Option B: From Browser Console**
1. While logged in, open browser console (F12)
2. Run: `await supabase.auth.getUser()`
3. Copy the `id` from the response

### Step 3: Assign Admin Role
Once you have your user ID, run this SQL query in the Cloud Backend:

```sql
-- Replace 'YOUR_USER_ID_HERE' with your actual user ID
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID_HERE', 'admin');
```

### Step 4: Access Admin Panel
1. Refresh your browser
2. Navigate to `/admin`
3. You now have full admin access!

## Default Test Credentials (For Development)

For quick testing, you can create a test admin:

1. Sign up with:
   - Email: `admin@sssb.edu`
   - Password: `Admin@123456`
   - Full Name: `Admin User`

2. Then run this SQL (you'll need to get the user_id first from the profiles table):

```sql
-- Get the user_id for admin@sssb.edu from profiles table, then:
INSERT INTO public.user_roles (user_id, role)
VALUES ('paste-user-id-here', 'admin');
```

## Admin Features

Once logged in as admin, you can:
- ✅ Create, edit, and delete updates/news
- ✅ Add video links to updates (YouTube, Vimeo, etc.)
- ✅ Control publish status (draft/published)
- ✅ Manage update categories and dates
- ✅ View all admission submissions
- ✅ Manage staff information
- ✅ Control admission rate limits

## Security Notes

- Never share your admin credentials
- Use strong passwords
- The admin role is required to access `/admin` route
- Non-admin users will be redirected if they try to access admin pages
- All sensitive database operations require admin role verification
