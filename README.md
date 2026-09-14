# MECHA-TECH Platform v4.2.8

## Updates in this version
- Interview slot manager now supports multiple days in one action.
- Each selected day can have its own number of slots and capacity per slot.
- Admin can select one or many active interview slots and remove them together.
- Available interview slots automatically close when 4 hours or less remain. Booked interviews are preserved.
- Added Google Drive upload for task attachments (admin).
- Added member task submission page with file upload and/or link.
- Admin activity tracking links directly to submitted files/links and keeps exact submission time.
- Member Home and Member Portal show clearer “time left” information or a clear message when nothing is close.
- Super Admin can create several MEMBER accounts in one click.
- Minor workflow and responsive UI improvements.

## Deploy order
1. Replace Apps Script `Code.gs` with `backend/Code.gs`.
2. Run `setupPlatform()` once from the Apps Script editor after saving. This ensures headers/settings and installs the 15-minute interview-slot cleanup trigger.
3. Deploy a **new version of the existing Web App deployment** (do not create a new deployment unless you want a new URL).
4. Upload the contents of `frontend/` to the root of the GitHub Pages repository.
5. Keep `config.js` pointing to the existing Apps Script `/exec` URL.
6. Test interview slots, task upload/submission, and bulk member creation.

## Drive folders
They are created automatically under the Apps Script owner's Drive when first used:
- `MECHA-TECH Task Files`
- `MECHA-TECH Task Submissions`

Task/submission file limit: 8 MB per file.
