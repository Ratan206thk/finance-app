# The Ledger — Personal Finance Command Center

A lightweight, single-user personal finance tracking tool built with vanilla HTML/CSS/JavaScript. No server, no build step—just open the file in a browser and start planning.

## Features

- **Income & Tax**: Indian new tax regime calculator with live slab computation
- **RSU & ESPP Tracking**: Vesting schedule and net-of-tax pipeline
- **Cash Buckets**: Separate tracking for India (₹) and Nepal (₨) accounts
- **Portfolio (SIP)**: Monthly investment tracking by category
- **House Planning**: EMI eligibility and down-payment projection
- **Net Worth Projection**: 4-year forward estimate based on SIP/PF/NPS returns
- **Monthly Ledger**: Income, expenses, and savings trend
- **Lenden Ledger**: Who owes whom, settled or pending
- **Insurance Policies**: Active policy tracking and coverage assessment
- **Expression Evaluator**: Every numeric field accepts arithmetic (`20000+5000` or `68000/4`)
- **Real-time Cloud Sync**: Firestore integration for automatic backup across devices
- **Offline Fallback**: localStorage cache when offline

## How to Use

1. Open `Ratnakar_Finance_App.html` in any modern browser (Chrome, Firefox, Safari, Edge).
2. Edit fields directly — all calculations update live.
3. Click **Save** when ready to persist (or rely on auto-save every 45 seconds).
4. Use **Export Backup** to download your data as JSON, or **Import Backup** to restore.

## Tech Stack

- **HTML5/CSS3** + vanilla JavaScript (no frameworks)
- **Chart.js** (CDN) for visualizations
- **Google Fonts**: Fraunces, IBM Plex Mono, Inter
- **Firebase Firestore** (v12.16.0, modular SDK via CDN) for cloud sync
- No build step, no server—runs entirely in the browser

## Privacy & Security

This is a **private, single-user tool**. It is **not** designed for multi-user or public sharing. Access is gated by a Firestore security rule tied to a private document ID.

- The Firebase API key is visible in the source (this is expected and normal for client-side Firebase apps).
- All data is stored in your browser's localStorage as a fallback.
- Changes sync to Firestore in real-time when online.

## Browser Support

Requires modern JavaScript (ES6+, async/await, modules). Tested on:
- Chrome/Chromium
- Firefox
- Safari
- Edge

## License

Personal tool. Not for public distribution or commercial use.
