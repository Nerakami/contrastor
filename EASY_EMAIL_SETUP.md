# Easy Email Editor Setup Guide

This project now uses **Easy Email Editor**, a professional open-source drag-and-drop email builder based on MJML.

## Features

✅ **Professional drag-and-drop interface** - Intuitive email building experience
✅ **MJML-based** - Generates responsive, email-client compatible HTML
✅ **Rich content blocks** - Text, images, buttons, social icons, dividers, spacers, heroes, and more
✅ **Flexible layouts** - 2, 3, and 4 column layouts with customizable widths
✅ **Export to HTML** - Download production-ready email HTML
✅ **Auto-save** - Content automatically saved to Supabase
✅ **Image uploads** - Upload and manage images within emails

## Setup Instructions

### 1. Storage Bucket Setup

The editor requires a Supabase storage bucket for image uploads. Run the SQL script:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the script in `scripts/create-email-images-bucket.sql`

This creates:
- A public `email-images` storage bucket
- Policies for authenticated users to upload/manage images
- Public read access for email images

### 2. Image Upload Configuration

The image upload functionality is configured in `app/editor/[id]/drag-drop/page.tsx`:

\`\`\`typescript
const onUploadImage = useCallback(async (file: Blob): Promise<string> => {
  // Uses uploadEmailImage from lib/email-storage.ts
  return await uploadEmailImage(file, params.id)
}, [params.id])
\`\`\`

To enable image uploads, update the `onUploadImage` callback in the page component to use the `uploadEmailImage` helper.

### 3. Using the Editor

Navigate to any email and click "Drag & Drop Editor" to access the new editor:

- **Left Sidebar**: Drag content blocks and layout structures
- **Center Canvas**: Build your email by dropping and arranging blocks
- **Right Panel**: Customize selected block properties
- **Top Toolbar**: Save, export HTML, and access additional options

### 4. Content Structure

Emails are stored in the `emails` table with the following structure:

\`\`\`typescript
{
  content: {
    type: 'page',
    data: { ... },
    attributes: { ... },
    children: [ ... ]
  },
  subject: 'Email subject line'
}
\`\`\`

The content follows the Easy Email / MJML block structure.

## Customization

### Adding Custom Blocks

You can add custom content blocks by modifying the `defaultCategories` array in `app/editor/[id]/drag-drop/page.tsx`.

### Styling

The editor inherits your app's theme colors. Additional customization can be done in `app/globals.css` under the Easy Email Editor section.

### Export Options

Currently supports HTML export. You can extend this to support:
- MJML export
- JSON export
- PDF generation
- Direct email sending

## Troubleshooting

**Images not uploading?**
- Ensure the storage bucket is created (run the SQL script)
- Check Supabase storage policies
- Verify authentication is working

**Editor not loading?**
- Check browser console for errors
- Ensure all dependencies are installed: `npm install`
- Clear browser cache and reload

**Styles look broken?**
- Ensure `easy-email-editor/lib/style.css` and `easy-email-extensions/lib/style.css` are imported
- Check for CSS conflicts in globals.css

## Resources

- [Easy Email Editor GitHub](https://github.com/zalify/easy-email-editor)
- [MJML Documentation](https://mjml.io/documentation/)
- [Easy Email Demo](https://open-source.easyemail.pro)
