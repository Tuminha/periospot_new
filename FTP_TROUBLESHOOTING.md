# FTP Connection Troubleshooting Guide

## Current Issue

- ✅ Connection establishes (connects to 216.198.79.1:21)
- ❌ Times out waiting for welcome message
- ❌ Cannot complete handshake

## Possible Causes

1. **FTP Service Disabled**: Hosting provider may have disabled FTP after DNS/hosting changes
2. **Firewall Blocking**: Server firewall may be blocking FTP port 21
3. **DNS/Hosting Migration**: FTP access might need to be re-enabled after migration
4. **Port Changed**: FTP might be on a different port (SFTP port 22, or passive mode)
5. **Hosting Provider Policy**: Some providers disable FTP for security

## Troubleshooting Steps

### Step 1: Try SFTP (Port 22)

Many hosting providers prefer SFTP over FTP for security:

**FileZilla Settings:**
1. File → Site Manager → New Site
2. Protocol: **SFTP - SSH File Transfer Protocol**
3. Host: `periospot.com`
4. Port: **22** (instead of 21)
5. Logon Type: **Normal**
6. User: `acceso`
7. Password: `Stluu8iN3`

### Step 2: Try Passive Mode

If using FTP (port 21), enable Passive Mode:

**FileZilla Settings:**
1. Edit → Settings → Connection → FTP
2. Check **"Use passive mode"**
3. Try connecting again

### Step 3: Check Hosting Control Panel

1. Log into your hosting control panel (cPanel, Plesk, etc.)
2. Look for:
   - **FTP Accounts** section
   - **File Manager** (alternative to FTP)
   - **FTP Settings** or **FTP Configuration**
3. Check if FTP is enabled
4. Verify FTP credentials are still valid
5. Look for any warnings about FTP being disabled

### Step 4: Contact Hosting Provider

If FTP/SFTP doesn't work, contact your hosting provider:

**What to ask:**
- "Has FTP been disabled after DNS/hosting changes?"
- "Can you re-enable FTP access?"
- "What is the correct FTP/SFTP configuration?"
- "Is there an alternative way to access files (SSH, File Manager)?"

### Step 5: Try WordPress File Manager Plugin

If you can access WordPress admin:

1. Install "File Manager" plugin in WordPress
2. Navigate to `/wp-content/uploads/`
3. Download files through browser (slower but works)

### Step 6: Use cPanel File Manager

If you have cPanel access:

1. Log into cPanel
2. Go to **File Manager**
3. Navigate to `public_html/wp-content/uploads/`
4. Select all files/folders
5. Click **Compress** (zip)
6. Download the zip file
7. Extract locally

## Alternative: Download Media from WordPress Site Directly

Since the website is live, you could:

1. **Extract image URLs** from your JSON files (already done)
2. **Download images directly** via browser/script (if not blocked by hotlinking)
3. **Use WordPress Media Library API** (if available)

## Next Steps

1. **Try SFTP first** (port 22) - this is the most likely solution
2. **Check hosting control panel** - FTP might need to be re-enabled
3. **Contact hosting provider** - They can confirm FTP status
4. **Use alternative methods** - File Manager, WordPress plugins, etc.

## If FTP Remains Unavailable

We can:
- Work on other migration tasks while you resolve FTP
- Create a script to download images directly from WordPress URLs (if accessible)
- Wait for FTP access to be restored
- Use alternative download methods
