import { NotificationsPage } from "./notifications-page";
import { challengeUrl } from "./site";

export default function Home() {
  return (
    <div className="page-shell">
      <NotificationsPage />
      <footer className="site-footer">
        <p>Practice demo. Read status stays on this page and resets when you reload.</p>
        <p>
          Challenge by <a href={challengeUrl}>Frontend Mentor</a>. Built by <a href="https://royeradames.com">Royer Adames</a>.
        </p>
      </footer>
    </div>
  );
}
