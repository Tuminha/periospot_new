# Complete Guide: How to Download Your WordPress Site via FTP

## What You'll Need

1. **FTP Client Software** (Free options):
   - **FileZilla** (Recommended - easiest) - https://filezilla-project.org/download.php
   - WinSCP (Windows only)
   - Cyberduck (Mac/Windows)

2. **Your FTP Credentials** (You already have these):
   - **Hostname/Server**: periospot.com
   - **Username**: acceso
   - **Password**: Stluu8iN3
   - **Port**: 21 (standard FTP) or 22 (if using SFTP)

3. **Local Storage**: At least 3-5 GB of free space on your computer

---

## Step-by-Step Instructions Using FileZilla (EASIEST METHOD)

### Step 1: Download and Install FileZilla

1. Go to https://filezilla-project.org/download.php
2. Download **FileZilla Client** (not the Server version)
3. Install it on your computer
4. Open FileZilla after installation

### Step 2: Connect to Your FTP Server

In FileZilla, you'll see this layout:
```
┌─────────────────────────────────────────────────────┐
│ Host | Username | Password | Port | Quickconnect   │
├─────────────────────────────────────────────────────┤
│ [Local Files] ← Left Side  │  [Remote Files] → Right Side │
└─────────────────────────────────────────────────────┘
```

**Fill in the connection details:**

1. **Host field**: `periospot.com`
2. **Username field**: `acceso`
3. **Password field**: `Stluu8iN3`
4. **Port field**: `21`

**Example:**
```
Host:     periospot.com
Username: acceso
Password: Stluu8iN3
Port:     21
```

5. Click **"Quickconnect"** button (or press Enter)

### Step 3: Wait for Connection

You should see a message in the bottom panel:
```
Status: Connecting to periospot.com...
Status: Connected
```

If you see an error, try these troubleshooting steps:
- **Error: "Connection refused"** → Try Port 22 instead (SFTP mode)
- **Error: "Authentication failed"** → Check username/password spelling
- **Error: "Timeout"** → Your internet may be slow; wait a few seconds

### Step 4: Navigate to WordPress Files

Once connected, on the **RIGHT side** (Remote Files), you'll see the server files.

**Look for these folders:**
- `wp-content/` ← **IMPORTANT** (contains all uploads, plugins, themes)
- `wp-admin/` ← WordPress admin files
- `wp-includes/` ← WordPress core files
- `wp-config.php` ← Database configuration

You should also see:
- `index.php`
- `wp-settings.php`
- Other WordPress files

### Step 5: Create a Local Backup Folder

On the **LEFT side** (Local Files):

1. Navigate to where you want to save the backup (e.g., Desktop or Documents)
2. Create a new folder called `periospot_wordpress_backup`
3. Open this folder

### Step 6: Download WordPress Files

**Option A: Download Everything (Recommended for complete backup)**

On the **RIGHT side** (Remote Files):

1. Right-click on the **root directory** (the main folder showing `wp-content`, `wp-admin`, etc.)
2. Select **"Download"**
3. FileZilla will start downloading all files

**This will download:**
- ✅ All WordPress core files
- ✅ All plugins (in `wp-content/plugins/`)
- ✅ All themes (in `wp-content/themes/`)
- ✅ All uploads/media (in `wp-content/uploads/`)
- ✅ Configuration files

**Time estimate**: 30 minutes to 2 hours (depending on internet speed)

---

**Option B: Download Only Specific Folders (Faster)**

If you only want the most important files:

1. **First, download `/wp-content/` folder:**
   - Right-click `wp-content` on the right side
   - Select "Download"
   - This contains all your media, plugins, and themes

2. **Then, download the WordPress root files:**
   - Select these files: `wp-config.php`, `index.php`, `wp-settings.php`, etc.
   - Right-click and select "Download"

---

### Step 7: Monitor the Download Progress

At the bottom of FileZilla, you'll see:

```
Transferring: [████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░] 45%
```

**Do NOT close FileZilla** while downloading. It may take 30 minutes to several hours depending on your internet speed.

**Tip**: You can minimize FileZilla and continue using your computer. The download will continue in the background.

### Step 8: Verify the Download

Once the download completes, you should see on the **LEFT side**:

```
periospot_wordpress_backup/
├── wp-content/
│   ├── plugins/
│   ├── themes/
│   ├── uploads/
│   └── ...
├── wp-admin/
├── wp-includes/
├── wp-config.php
├── index.php
└── [other WordPress files]
```

**Check the file count**: You should have 500+ files and folders.

---

## Step 9: Export the WordPress Database

This is CRITICAL for content migration. You need the database export.

### Method 1: Using phpMyAdmin (Easiest)

1. Go to your hosting control panel (cPanel, Plesk, etc.)
2. Look for **"phpMyAdmin"** or **"Database"** section
3. Click on your database (usually named `periospot_*` or similar)
4. Click **"Export"** button at the top
5. Select **"Quick"** export method
6. Choose **"SQL"** format
7. Click **"Go"** button
8. A file named `database.sql` will download
9. **Save this file** in your `periospot_wordpress_backup/` folder

### Method 2: Using WordPress Plugin (Alternative)

If you can't access phpMyAdmin:

1. Log in to WordPress admin: `periospot.com/wp-admin`
2. Go to **Plugins** → **Add New**
3. Search for **"All-in-One WP Migration"**
4. Install and activate it
5. Go to **All-in-One WP Migration** → **Export**
6. Click **"Export to File"**
7. Download the `.wpress` file
8. Save it in your `periospot_wordpress_backup/` folder

---

## Step 10: Compress the Backup (Optional but Recommended)

To make it easier to share/upload:

**On Windows:**
1. Right-click the `periospot_wordpress_backup` folder
2. Select **"Send to"** → **"Compressed (zipped) folder"**
3. This creates `periospot_wordpress_backup.zip`

**On Mac:**
1. Right-click the `periospot_wordpress_backup` folder
2. Select **"Compress"**
3. This creates `periospot_wordpress_backup.zip`

**File size**: Should be 1-3 GB (or 500 MB-1 GB if compressed)

---

## Step 11: Upload to Cloud Storage (For Sharing with Me)

Once you have the backup, you can share it with me:

### Option A: Google Drive
1. Go to https://drive.google.com
2. Create a new folder called "Periospot Backup"
3. Drag and drop your `periospot_wordpress_backup.zip` into it
4. Right-click the file → **"Share"**
5. Change to **"Anyone with the link can view"**
6. Copy the link and send it to me

### Option B: Dropbox
1. Go to https://www.dropbox.com
2. Upload your `periospot_wordpress_backup.zip`
3. Right-click → **"Share"**
4. Copy the link and send it to me

### Option C: OneDrive
1. Go to https://onedrive.live.com
2. Upload your `periospot_wordpress_backup.zip`
3. Right-click → **"Share"**
4. Copy the link and send it to me

---

## Troubleshooting Common Issues

### Issue 1: "Connection Refused" or "Cannot Connect"

**Solution:**
- Try using **Port 22** instead of Port 21 (SFTP mode)
- In FileZilla, change the Protocol dropdown to **"SFTP - SSH File Transfer Protocol"**
- Then try connecting again

### Issue 2: "Authentication Failed"

**Solution:**
- Double-check your username and password
- Make sure there are no extra spaces
- Username: `acceso` (not `acceso `)
- Password: `Stluu8iN3` (check for typos)

### Issue 3: Download is Very Slow

**Solution:**
- This is normal for large backups (1-3 GB)
- Let it run overnight if needed
- Don't close FileZilla
- Check your internet connection speed

### Issue 4: Download Stops/Disconnects

**Solution:**
- FileZilla will resume where it left off
- Just click "Quickconnect" again
- It will continue downloading

### Issue 5: "Permission Denied" Error

**Solution:**
- Some files may have restricted permissions
- This is okay - you'll still get the important files
- Try downloading again or contact your hosting provider

---

## What You Should Have After Download

✅ **Complete WordPress Installation**
- All WordPress core files
- All plugins (including Yoast SEO, WooCommerce, etc.)
- All themes
- All uploads and media files

✅ **Database Export** (database.sql file)
- All blog posts and pages
- All products and product data
- All user accounts
- All settings and configurations

✅ **Total Size**: 1-3 GB (or 500 MB-1 GB compressed)

---

## Next Steps After Download

Once you have the backup:

1. **Compress it** (make it smaller)
2. **Upload to Google Drive/Dropbox**
3. **Share the link with me**
4. I will:
   - Extract and analyze all content
   - Create migration mapping
   - Prepare all assets for Next.js
   - Continue with Typeform analysis
   - Create design blocks
   - Build implementation roadmap

---

## Quick Reference Checklist

- [ ] Download FileZilla from https://filezilla-project.org/download.php
- [ ] Install FileZilla
- [ ] Open FileZilla
- [ ] Enter connection details:
  - Host: `periospot.com`
  - Username: `acceso`
  - Password: `Stluu8iN3`
  - Port: `21`
- [ ] Click "Quickconnect"
- [ ] Create local folder: `periospot_wordpress_backup`
- [ ] Download all files from server
- [ ] Export database (database.sql)
- [ ] Compress the backup folder
- [ ] Upload to Google Drive/Dropbox
- [ ] Share link with me

---

## Need Help?

If you get stuck:
1. Take a screenshot of the error message
2. Send it to me
3. I'll help you troubleshoot

Good luck! This backup is crucial for your migration. 🚀

