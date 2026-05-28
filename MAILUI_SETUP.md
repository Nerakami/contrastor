# MailUi Email Builder Setup Guide

This guide will help you set up the MailUi drag-and-drop email builder for your application.

## What is MailUi?

MailUi is a professional drag-and-drop email template builder that provides:
- Intuitive drag-and-drop interface
- Pre-designed email templates
- AI-powered content creation
- Mobile-responsive designs
- HTML export functionality
- Free plan with unlimited exports

## Setup Steps

### 1. Create a MailUi Account

1. Go to [app.mailui.co/register](https://app.mailui.co/register)
2. Sign up for a free account (no credit card required)
3. Verify your email address

### 2. Create a Project

1. Log in to your MailUi dashboard
2. Click "Create New Project" or open an existing project
3. Give your project a name

### 3. Get Your Credentials

1. In your MailUi dashboard, navigate to **Project → Settings → Configure**
2. Find and copy your:
   - **Project ID** (a number)
   - **Signature** (a string)

### 4. Configure Allowed Domains

1. In the same settings page, scroll to "Production Domains"
2. Add your domain(s):
   - For local development: `localhost`
   - For production: your actual domain (e.g., `yourdomain.com`)
   - **Important**: Enter only the root domain without `http://`, `https://`, or `www`

### 5. Add Environment Variables

Add these environment variables to your Vercel project:

\`\`\`bash
NEXT_PUBLIC_MAILUI_PROJECT_ID=Re9DNimOHJYx1887u57ftStHSSmkG32eDm4O3Vomh4zPQchE2835v5vjnb5bttxd
NEXT_PUBLIC_MAILUI_SIGNATURE=bc00b4782e7fad5489748af78390334500af4e054970db486c8468dce418113d
\`\`\`

**To add environment variables in Vercel:**
1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add both variables
4. Redeploy your application

### 6. Enable Sandbox Mode (Optional)

For testing, you can enable Sandbox Mode in your MailUi project settings:
- This provides a safe testing environment
- No changes affect live data
- Disable when ready for production

## Features

Once set up, your users can:
- Drag and drop email components (text, images, buttons, etc.)
- Create multi-column layouts
- Use pre-designed templates
- Generate content with AI
- Preview emails on different devices
- Export HTML for use in email campaigns
- Save designs to your Supabase database

## Pricing

- **Free Plan**: Unlimited exports, basic features
- **Paid Plans**: Additional users, advanced features, priority support

Check [mailui.co](https://mailui.co) for current pricing.

## Troubleshooting

### Editor not loading
- Verify your Project ID and Signature are correct
- Check that your domain is added to the allowed domains list
- Ensure environment variables are set correctly in Vercel

### "Invalid credentials" error
- Double-check your Project ID (should be a number)
- Verify your Signature is copied correctly
- Make sure you're using the credentials from the correct project

### Domain not allowed error
- Add your domain to the allowed domains list in MailUi settings
- For local development, add `localhost`
- Remember: use only the root domain without protocol or www

## Support

For MailUi-specific issues:
- Email: [[email protected]](mailto:[email protected])
- Working hours: 8:30 AM - midnight (UTC+3), Monday-Friday
- Documentation: [mailui.co/docs](https://mailui.co/docs)
