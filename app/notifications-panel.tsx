"use client";
/* eslint-disable @next/next/no-img-element -- next/image added client JavaScript here without optimizing anything (SVGs, data URLs or unoptimized files). */

import { useRef, useState } from "react";

type Notification = {
  id: string;
  name: string;
  action: string;
  time: string;
  target: { kind: "none" } | { kind: "post" | "group"; text: string };
  detail: { kind: "none" } | { kind: "message"; text: string } | { kind: "picture"; alt: string };
};

const notifications: Notification[] = [
  {
    id: "mark-webber", name: "Mark Webber", action: "reacted to your recent post", time: "1m ago",
    target: { kind: "post", text: "My first tournament today!" }, detail: { kind: "none" },
  },
  {
    id: "angela-gray", name: "Angela Gray", action: "followed you", time: "5m ago",
    target: { kind: "none" }, detail: { kind: "none" },
  },
  {
    id: "jacob-thompson", name: "Jacob Thompson", action: "has joined your group", time: "1 day ago",
    target: { kind: "group", text: "Chess Club" }, detail: { kind: "none" },
  },
  {
    id: "rizky-hasanuddin", name: "Rizky Hasanuddin", action: "sent you a private message", time: "5 days ago",
    target: { kind: "none" },
    detail: { kind: "message", text: "Hello, thanks for setting up the Chess Club. I've been a member for a few weeks now and I'm already having lots of fun and improving my game." },
  },
  {
    id: "kimberly-smith", name: "Kimberly Smith", action: "commented on your picture", time: "1 week ago",
    target: { kind: "none" }, detail: { kind: "picture", alt: "A woman seated at a chessboard" },
  },
  {
    id: "nathan-peterson", name: "Nathan Peterson", action: "reacted to your recent post", time: "2 weeks ago",
    target: { kind: "post", text: "5 end-game strategies to increase your win rate" }, detail: { kind: "none" },
  },
  {
    id: "anna-kim", name: "Anna Kim", action: "left the group", time: "2 weeks ago",
    target: { kind: "group", text: "Chess Club" }, detail: { kind: "none" },
  },
];

export function NotificationsPage() {
  const [unreadIds, setUnreadIds] = useState(["mark-webber", "angela-gray", "jacob-thompson"]);
  const [alreadyReadPresses, setAlreadyReadPresses] = useState(0);
  const markAllButton = useRef<HTMLButtonElement>(null);
  const unreadCount = unreadIds.length;
  const countText = unreadCount === 0 ? "No unread notifications" : `${unreadCount} unread ${unreadCount === 1 ? "notification" : "notifications"}`;

  function markAllAsRead() {
    if (unreadCount === 0) {
      setAlreadyReadPresses((presses) => presses + 1);
      return;
    }
    setUnreadIds([]);
  }

  function markAsRead(id: string) {
    setUnreadIds((ids) => ids.filter((unreadId) => unreadId !== id));
    // The row button disappears after reading; keep keyboard focus on a remaining control.
    markAllButton.current?.focus({ preventScroll: true });
  }

  return (
    <main className="notifications-card" aria-labelledby="notifications-title">
      <header className="notifications-header">
        <div className="heading-group">
          <h1 id="notifications-title">Notifications</h1>
          {unreadCount > 0 && <span className="unread-count" aria-hidden="true">{unreadCount}</span>}
          <span className="sr-only">{countText}</span>
        </div>
        <button ref={markAllButton} className="mark-all" type="button" onClick={markAllAsRead}>Mark all as read</button>
      </header>

      <p className="sr-only unread-announcement" role="status" aria-live="polite" aria-atomic="true">{countText}.</p>
      <p className="read-note" role="status" aria-live="polite" aria-atomic="true">
        {alreadyReadPresses > 0 && (
          <span key={alreadyReadPresses}>
            Everything is already read.
            {alreadyReadPresses > 1 && <span className="sr-only"> Check {alreadyReadPresses}.</span>}
          </span>
        )}
      </p>

      <ul className="notifications-list" aria-label="Notifications">
        {notifications.map((notification) => {
          const unread = unreadIds.includes(notification.id);
          return (
            <li key={notification.id} className={`notification${unread ? " is-unread" : ""}`} data-notification={notification.id}>
              {unread && (
                <button className="mark-read" type="button" onClick={() => markAsRead(notification.id)}>
                  <span className="sr-only">Mark as read: {notification.name}</span>
                </button>
              )}
              <img className="notification-avatar" src={`/images/avatar-${notification.id}.webp`} alt="" width={45} height={45} loading="lazy" decoding="async" />
              <div className="notification-content">
                <p className="notification-text">
                  <a className="person-link" href="#">{notification.name}</a>{" "}
                  {notification.action}
                  {notification.target.kind !== "none" && (
                    <>{" "}<a className={`${notification.target.kind}-link`} href="#">{notification.target.text}</a></>
                  )}
                  {unread && <>{" "}<span className="unread-dot" aria-hidden="true" /></>}
                </p>
                <p className="notification-time">{notification.time}</p>
                {notification.detail.kind === "message" && <a href="#" className="private-message">{notification.detail.text}</a>}
              </div>
              {notification.detail.kind === "picture" && (
                <a href="#" className="picture-link">
                  <img src="/images/image-chess.webp" alt={notification.detail.alt} width={45} height={45} loading="lazy" decoding="async" />
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
