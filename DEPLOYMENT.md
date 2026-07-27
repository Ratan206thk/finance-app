# Deployment Guide — Finance App

## Overview

The Finance App is a **single HTML file** — no build process, no dependencies to install, no servers required.

Simply:
1. Open `index.html` in any modern browser
2. Start editing your data
3. Click "Save" to persist
4. Click "Export Backup" to backup

That's it.

## Local Use (Recommended for Privacy)

### Option 1: Direct File
```bash
# From command line
open index.html
# or drag index.html to your browser
```

### Option 2: Local Server (Optional)
```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server

# Go to http://localhost:8000/index.html
```

## Browser Deployment

### Netlify (Easiest)

1. Drag `index.html` to [Netlify.com](https://netlify.com)
2. Done! Your app is live at a public URL
3. Data stays local to your browser (no cloud sync)

### Vercel

```bash
# Create vercel.json
{
  "buildCommand": null,
  "outputDirectory": "."
}

vercel
```

### GitHub Pages

1. Create a repo `finance-app`
2. Upload `index.html` to `main` branch
3. Go to Settings → Pages → Enable GitHub Pages
4. Your app is live at `username.github.io/finance-app`

### AWS S3

```bash
aws s3 cp index.html s3://your-bucket/
# Set bucket to public + enable static website hosting
```

## Security Considerations

### Data Privacy
- **All data stays in your browser** — localStorage only
- No cloud sync, no data sent anywhere
- No tracking, no analytics
- Safe to use with sensitive financial data

### If You Deploy Publicly
- Anyone with the URL can access the app
- But they can't access **your data** (stored locally in their browser)
- They get a fresh copy with pre-populated demo data
- You can change the pre-loaded values by editing the HTML file

### Protecting the File
If you want only you to access it:
- Don't deploy to public URL
- Keep `index.html` on your local computer
- Use password-protected folder if sharing device

## Backup Strategy

### Daily Backups
1. Click "Export Backup (.json)" in the app
2. Save to Downloads folder
3. Rename with date: `finance-backup-2026-07-27.json`
4. Keep last 7-10 backups

### Restore from Backup
1. Click "Import Backup"
2. Select a previous `.json` file
3. Your data is restored
4. Click "Save" to confirm

### Cloud Backup (Optional)
```bash
# Store backups in iCloud, Google Drive, Dropbox, etc.
cp ~/Downloads/finance-backup-*.json ~/iCloud\ Drive/Backups/
```

## Performance Tips

1. **Export regularly** — Don't rely only on localStorage
2. **Clear browser cache cautiously** — It deletes your app data
3. **Use different browsers** — Each browser has separate localStorage
4. **Test imports** — Verify backups work before relying on them

## Troubleshooting

### "My data disappeared"
1. Check browser storage: DevTools → Application → localStorage → look for `ratnakar_finance_app_v1`
2. If gone, check for a recent JSON backup
3. Try importing that backup

### Charts not showing
1. Check browser console (F12) for errors
2. Verify Chart.js CDN is accessible (need internet)
3. Try a different browser

### Slow calculations
1. Likely a network issue (Chart.js CDN)
2. Close other tabs
3. Clear browser cache

## Updating the App

### To Change Defaults
Edit `index.html` and find the `window.rsuRows`, `window.sipRows`, etc. arrays:

```javascript
window.rsuRows = [
  {date:'Jun 2026 (vested)', shares:103, cash:0},
  // ... change these values
];
```

### To Add Features
Edit the HTML/CSS/JS in the `<style>` and `<script>` sections. All code is self-contained.

### To Customize Colors
Edit CSS variables at the top of `<style>`:

```css
:root{
  --ink:#0E1116;        /* background */
  --paper:#E8E4D8;      /* text */
  --gold:#C4972E;       /* primary action */
  --teal:#3FA796;       /* positive */
  --rose:#C1554A;       /* warning/debt */
  /* ... etc */
}
```

## File Checklist

- [x] `index.html` — The entire app (63 KB)
- [x] `README.md` — User guide
- [x] `TEST_RESULTS.md` — Feature checklist
- [x] `ARCHITECTURE.md` — Technical notes (legacy)
- [x] `PRODUCTION_CHECKLIST.md` — QA checklist (legacy)

## Deployment Verification

After deploying, verify:
1. [ ] App loads in <2 seconds
2. [ ] All 11 tabs visible and clickable
3. [ ] Can edit inputs (they update calculations instantly)
4. [ ] Charts render without errors
5. [ ] "Save" button works
6. [ ] "Export Backup" downloads a file
7. [ ] "Import Backup" restores data from file
8. [ ] Mobile view works (rotate device, check layout)

## Support

- Issues with deployment → check your host's documentation
- Issues with the app → open DevTools (F12), check console for errors
- Feature requests → edit the HTML file yourself

---

**Status**: Ready to Deploy
**Deployment Time**: 5 minutes (any host)
**Zero Configuration Required**: ✅
