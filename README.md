# Notifications Page

The [Frontend Mentor notifications page](https://www.frontendmentor.io/challenges/notifications-page-DqK5QAmKbC), built with Next.js 16.3.6, React 19.2.8, TypeScript 5.9.3 and Tailwind 4.2.1 on Node 24.

Live: https://notifications-page-fm.royeradames.com/

- Three notifications start unread. Their tinted background, red dot and count badge distinguish them from the four read notifications.
- Press "Mark all as read" to clear the unread state. The badge hides at zero, and a live region announces "No unread notifications". Pressing again shows "Everything is already read."
- Click an unread row or focus its "Mark as read" button and press Enter or Space to read one notification. Focus moves to "Mark all as read" when the row button disappears. Names, posts, groups, the private message and chess picture remain separate links with demo `#` destinations.
- Read status lives in memory and resets on reload. Nothing is stored or sent.
- Layout, words and images follow Frontend Mentor's desktop 1440 px, mobile 375 px and active-state designs in `reference/design/`. The desktop card is 730 px wide with 32 px padding; on phones it fills the width with 16 px side padding. At 320 px the header can wrap its controls onto separate rows.
- Every visible text is at least 16 px, including timestamps and the footer. Gray 500 fails 4.5:1 on white, so secondary text uses a darker Gray 600, `hsl(219, 12%, 40%)`, which also passes on the private message's Blue 100 hover background. The larger timestamps and mobile body text can change line breaks and total height from the supplied image.
- `og:site_name` and WebSite JSON-LD name the site "Notifications Page"; a 1200 x 630 Open Graph image includes the bell icon and Mark Webber's notification. The SVG bell uses the challenge colours. The caller renders `public/icon-96.png` and `public/apple-touch-icon.png` from it before verification.

## Development

```bash
npm ci
npm run lint && npm run typecheck && npm run build
npm test   # Playwright: unread state, keyboard, exact words, identity, design frames, 320-1920 px sweep, contrast
```

The implementation includes these tests; installs, builds, servers and Playwright execution are left to the caller.
