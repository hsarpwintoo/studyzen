# StudyZen Landing Page

This folder contains a standalone static landing page for StudyZen.

## Set your app URL

In `script.js`, set `APP_URL` to the separate URL where your real StudyZen app is hosted.

## Run locally

From the project root:

```bash
npx serve landing-page
```

Then open the URL shown in your terminal.

## Deploy as a separate link (Firebase Hosting)

You can deploy this folder as a different hosting target or a different Firebase project so it has its own URL.

### Option A: Deploy to a separate Firebase project (simplest clean separation)

1. Create a new Firebase project for the landing page.
2. In terminal:

```bash
firebase use --add
```

3. Add a hosting config that points to `landing-page` for that project.
4. Deploy:

```bash
firebase deploy --only hosting
```

### Option B: Use Netlify or Vercel

- Set publish directory to `landing-page`
- Deploy and use the generated link

## Files

- `index.html`
- `styles.css`
- `script.js`
