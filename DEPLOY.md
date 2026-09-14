# v4.2.8 deployment checklist

1. Apps Script: replace Code.gs.
2. Save.
3. Run `setupPlatform()` once and approve permissions if Google asks (Drive + trigger permissions may be requested).
4. Deploy > Manage deployments > Edit > Version > New version > Deploy.
5. GitHub: replace `app.js`, `index.html`, `style.css` and keep/upload existing `logo.jpg`, `config.js`, `assets/`.
6. Wait for GitHub Pages to rebuild and hard refresh the site.

The 4-hour slot rule hides/deactivates the *available slot* only. It does not delete an applicant's already-booked Interview row.
