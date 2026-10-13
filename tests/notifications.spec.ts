import { expect, test, type Page } from "@playwright/test";

async function waitForHydrated(page: Page) {
  await page.waitForFunction(() => {
    const button = document.querySelector(".mark-all");
    return !!button && Object.keys(button).some((key) => key.startsWith("__reactProps"));
  });
}

async function open(page: Page, width = 1440) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto("/");
  await waitForHydrated(page);
}

const markAll = (page: Page) => page.getByRole("button", { name: "Mark all as read", exact: true });

test("starts with three unread notifications, a count badge, tinted rows and red dots", async ({ page }) => {
  await open(page);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Notifications");
  await expect(page.getByRole("list", { name: "Notifications", exact: true }).getByRole("listitem")).toHaveCount(7);
  await expect(page.locator(".unread-count")).toHaveText("3");
  await expect(page.locator(".notification.is-unread")).toHaveCount(3);
  for (const id of ["mark-webber", "angela-gray", "jacob-thompson"]) {
    const item = page.locator(`[data-notification="${id}"]`);
    await expect(item).toHaveClass(/is-unread/);
    await expect(item).toHaveCSS("background-color", "rgb(247, 250, 253)");
    await expect(item.locator(".unread-dot")).toBeVisible();
    await expect(item.locator(".unread-dot")).toHaveCSS("background-color", "rgb(246, 83, 81)");
  }
  await expect(page.locator(".notification:not(.is-unread)")).toHaveCount(4);
  for (const item of await page.locator(".notification:not(.is-unread)").all()) {
    await expect(item).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await expect(item.locator(".unread-dot")).toHaveCount(0);
  }
});

test("marks everything read, announces zero and explains a repeat press", async ({ page }) => {
  await open(page);
  await markAll(page).click();
  await expect(page.locator(".unread-count")).toHaveCount(0);
  await expect(page.locator(".notification.is-unread, .unread-dot, .mark-read")).toHaveCount(0);
  await expect(page.locator(".unread-announcement")).toHaveText("No unread notifications.");
  await expect(page.locator(".heading-group .sr-only")).toHaveText("No unread notifications");
  for (const item of await page.locator(".notification").all()) {
    await expect(item).toHaveCSS("background-color", "rgb(255, 255, 255)");
  }
  await markAll(page).click();
  await expect(page.locator(".read-note")).toHaveText("Everything is already read.");
  await expect(page.locator(".read-note")).toBeVisible();
  await markAll(page).click();
  await expect(page.locator(".read-note")).toHaveText("Everything is already read. Check 2.");
  await expect(markAll(page)).toBeFocused();
});

test("clicking an unread notification reads only that notification", async ({ page }) => {
  await open(page);
  const mark = page.locator('[data-notification="mark-webber"]');
  // The blank part of the row belongs to its real button overlay.
  await mark.click({ position: { x: 8, y: 8 } });
  await expect(mark).not.toHaveClass(/is-unread/);
  await expect(mark.locator(".unread-dot")).toHaveCount(0);
  await expect(page.locator(".unread-count")).toHaveText("2");
  await expect(page.locator(".unread-announcement")).toHaveText("2 unread notifications.");
  await expect(page.locator(".notification.is-unread")).toHaveCount(2);
});

test("row buttons support Enter and Space, show focus and keep focus after reading", async ({ page }) => {
  await open(page, 375);
  await page.keyboard.press("Tab");
  await expect(markAll(page)).toBeFocused();
  await page.keyboard.press("Tab");
  const mark = page.getByRole("button", { name: "Mark as read: Mark Webber", exact: true });
  await expect(mark).toBeFocused();
  await expect(mark).toHaveCSS("outline-style", "solid");
  await expect(mark).toHaveCSS("outline-width", "3px");
  await page.keyboard.press("Enter");
  await expect(page.locator(".unread-count")).toHaveText("2");
  await expect(markAll(page)).toBeFocused();

  await page.getByRole("button", { name: "Mark as read: Angela Gray", exact: true }).focus();
  await page.keyboard.press("Space");
  await expect(page.locator(".unread-count")).toHaveText("1");
  await expect(page.locator(".unread-announcement")).toHaveText("1 unread notification.");
  await expect(markAll(page)).toBeFocused();
});

test("keeps all seven notifications and the private message exactly as FM supplied them", async ({ page }) => {
  await open(page);
  const words = [
    "Mark Webber reacted to your recent post My first tournament today!",
    "Angela Gray followed you",
    "Jacob Thompson has joined your group Chess Club",
    "Rizky Hasanuddin sent you a private message",
    "Kimberly Smith commented on your picture",
    "Nathan Peterson reacted to your recent post 5 end-game strategies to increase your win rate",
    "Anna Kim left the group Chess Club",
  ];
  await expect(page.locator(".notification-text")).toHaveText(words);
  await expect(page.locator(".notification-time")).toHaveText(["1m ago", "5m ago", "1 day ago", "5 days ago", "1 week ago", "2 weeks ago", "2 weeks ago"]);
  await expect(page.locator(".private-message")).toHaveText("Hello, thanks for setting up the Chess Club. I've been a member for a few weeks now and I'm already having lots of fun and improving my game.");
  await expect(page.locator(".notification-avatar")).toHaveCount(7);
  for (const avatar of await page.locator(".notification-avatar").all()) {
    await expect(avatar).toHaveAttribute("src", /avatar-.*\.webp/);
    await expect(avatar).toHaveAttribute("width", "45");
    await expect(avatar).toHaveAttribute("height", "45");
  }
  const picture = page.getByRole("link", { name: "A woman seated at a chessboard", exact: true });
  await expect(picture).toHaveAttribute("href", "#");
  await expect(picture.locator("img")).toHaveAttribute("src", /image-chess\.webp/);
});

test("links remain independent of row buttons and use FM hover states", async ({ page }) => {
  await open(page);
  const name = page.getByRole("link", { name: "Angela Gray", exact: true });
  await name.hover();
  await expect(name).toHaveCSS("color", "rgb(10, 49, 123)");
  await name.click();
  await expect(page.locator(".unread-count")).toHaveText("3");
  const post = page.getByRole("link", { name: "My first tournament today!", exact: true });
  await post.hover();
  await expect(post).toHaveCSS("color", "rgb(10, 49, 123)");
  await post.click();
  await expect(page.locator(".unread-count")).toHaveText("3");
  for (const link of await page.locator(".notifications-list a").all()) await expect(link).toHaveAttribute("href", "#");
  await page.locator(".private-message").hover();
  await expect(page.locator(".private-message")).toHaveCSS("background-color", "rgb(229, 239, 250)");
});

test("read status resets on reload, writes no storage and sends no non-GET requests", async ({ page, context }) => {
  const writes: string[] = [];
  page.on("request", (request) => { if (request.method() !== "GET") writes.push(`${request.method()} ${request.url()}`); });
  await page.addInitScript(() => {
    const storageWrites: string[] = [];
    Reflect.set(window, "notificationStorageWrites", storageWrites);
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (this: Storage, key: string, value: string) {
      storageWrites.push(key);
      return setItem.call(this, key, value);
    };
    const indexedDbOpen = IDBFactory.prototype.open;
    IDBFactory.prototype.open = function (this: IDBFactory, name: string, version?: number) {
      storageWrites.push(`indexedDB:${name}`);
      return indexedDbOpen.call(this, name, version);
    };
  });
  await open(page);
  await page.getByRole("button", { name: "Mark as read: Jacob Thompson", exact: true }).click();
  await markAll(page).click();
  await markAll(page).click();
  await page.locator(".private-message").click();
  await page.locator(".picture-link").click();
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
  expect(await page.evaluate(() => Reflect.get(window, "notificationStorageWrites"))).toEqual([]);
  expect(await context.cookies()).toEqual([]);
  await page.reload();
  await waitForHydrated(page);
  await expect(page.locator(".unread-count")).toHaveText("3");
  await expect(page.locator(".notification.is-unread")).toHaveCount(3);
  expect(writes).toEqual([]);
});
