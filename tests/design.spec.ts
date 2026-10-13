import { expect, test, type Page } from "@playwright/test";

const siteName = "Notifications Page";
const siteUrl = "https://notifications-page-fm.royeradames.com/";

async function smallText(page: Page) {
  return page.evaluate(() => {
    const out: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const parent = node.parentElement;
      if (!parent || !node.textContent?.trim() || parent.closest("script,style,noscript,.sr-only")) continue;
      if (parent.getClientRects().length === 0) continue;
      if (parseFloat(getComputedStyle(parent).fontSize) < 16) out.push(node.textContent.trim());
    }
    return out;
  });
}

async function box(page: Page, selector: string) {
  const bounds = await page.locator(selector).first().boundingBox();
  if (!bounds) throw new Error(`Missing visible element: ${selector}`);
  return bounds;
}

async function textContrast(page: Page) {
  return page.evaluate(() => {
    const parse = (colour: string) => {
      const values = colour.match(/\d+(\.\d+)?/g);
      if (!values) throw new Error(`Unrecognised colour: ${colour}`);
      return values.slice(0, 3).map(Number);
    };
    const lum = (rgb: number[]) => {
      const [r, g, b] = rgb.map((value) => {
        const s = value / 255;
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const bg = (element: Element | null): string => {
      while (element) {
        const colour = getComputedStyle(element).backgroundColor;
        if (colour !== "rgba(0, 0, 0, 0)" && colour !== "transparent") return colour;
        element = element.parentElement;
      }
      return "rgb(255, 255, 255)";
    };
    const pairs: { text: string; ratio: number }[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const parent = node.parentElement;
      if (!parent || !node.textContent?.trim() || parent.closest("script,style,noscript,.sr-only") || !parent.getClientRects().length) continue;
      const [a, b] = [lum(parse(getComputedStyle(parent).color)), lum(parse(bg(parent)))].sort((x, y) => y - x);
      pairs.push({ text: node.textContent.trim(), ratio: (a + 0.05) / (b + 0.05) });
    }
    return pairs;
  });
}

test("declares one site name in og:site_name and WebSite JSON-LD, with canonical, sharing image and icons", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Notifications | Notifications Page");
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", siteName);
  const jsonLd: unknown = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}");
  expect(jsonLd).toEqual({ "@context": "https://schema.org", "@type": "WebSite", name: siteName, url: siteUrl });
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https:\/\/notifications-page-fm\.royeradames\.com\/?$/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /opengraph-image/);
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute("content", /Notifications Page/);
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
  await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute("href", "/icon.svg");
  await expect(page.locator('link[rel="icon"][sizes="96x96"]')).toHaveAttribute("href", "/icon-96.png");
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute("href", "/apple-touch-icon.png");
  // The caller renders both PNG icons before running the suite.
  for (const path of ["/icon.svg", "/icon-96.png", "/apple-touch-icon.png", "/opengraph-image"]) {
    expect((await page.request.get(path)).status(), path).toBe(200);
  }
  await expect(page.locator(".site-footer p").nth(0)).toHaveText("Practice demo. Read status stays on this page and resets when you reload.");
  await expect(page.locator(".site-footer p").nth(1)).toHaveText("Challenge by Frontend Mentor. Built by Royer Adames.");
  await expect(page.locator(".site-footer").getByRole("link", { name: "Frontend Mentor" })).toHaveAttribute("href", "https://www.frontendmentor.io/challenges/notifications-page-DqK5QAmKbC");
});

test("desktop frame matches the 1440 design", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 991 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const card = await box(page, ".notifications-card");
  expect(card.width).toBe(730);
  expect(card.x).toBe(355);
  expect(card.y).toBe(63);
  expect(card.x + card.width / 2).toBe(720);
  await expect(page.locator(".notifications-card")).toHaveCSS("padding", "32px");
  await expect(page.locator(".notifications-card")).toHaveCSS("border-radius", "15px");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(247, 250, 253)");
  await expect(page.locator("h1")).toHaveCSS("font-size", "24px");
  await expect(page.locator("h1")).toHaveCSS("font-weight", "800");
  const avatar = await box(page, ".notification-avatar");
  expect(avatar.width).toBe(45);
  expect(avatar.height).toBe(45);
  const text = await box(page, '[data-notification="rizky-hasanuddin"] .notification-text');
  const message = await box(page, ".private-message");
  expect(message.x).toBe(text.x);
  const picture = await box(page, ".picture-link img");
  expect(picture.width).toBe(45);
  expect(picture.height).toBe(45);
});

test("mobile frame fills the 375 design with 16 px side padding", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 901 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const card = await box(page, ".notifications-card");
  expect(card.x).toBe(0);
  expect(card.y).toBe(0);
  expect(card.width).toBe(375);
  await expect(page.locator(".notifications-card")).toHaveCSS("padding-left", "16px");
  await expect(page.locator(".notifications-card")).toHaveCSS("padding-right", "16px");
  await expect(page.locator(".notifications-card")).toHaveCSS("border-radius", "0px");
  await expect(page.locator("h1")).toHaveCSS("font-size", "20px");
  const first = await box(page, ".notification");
  expect(first.x).toBe(16);
  expect(first.width).toBe(343);
  const avatar = await box(page, ".notification-avatar");
  expect(avatar.width).toBe(39);
  expect(avatar.height).toBe(39);
  const text = await box(page, '[data-notification="rizky-hasanuddin"] .notification-text');
  expect((await box(page, ".private-message")).x).toBe(text.x);
});

test("every width from 320 to 1920 px keeps text at 16 px or more, no sideways scroll and one-line buttons", async ({ page }) => {
  test.setTimeout(180_000);
  const widths = [...Array.from({ length: 161 }, (_, i) => 320 + i * 10)];
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  for (const allRead of [false, true]) {
    if (allRead) {
      await page.getByRole("button", { name: "Mark all as read", exact: true }).click();
      await expect(page.locator(".unread-count")).toHaveCount(0);
      await page.getByRole("button", { name: "Mark all as read", exact: true }).click();
      await expect(page.locator(".read-note")).toBeVisible();
    }
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      const state = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth - innerWidth,
        wrapped: [...document.querySelectorAll<HTMLButtonElement>("button")]
          .filter((element) => {
            if (!element.getClientRects().length) return false;
            const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) {
              const node = walker.currentNode;
              if (!node.textContent?.trim() || node.parentElement?.closest(".sr-only")) continue;
              const range = document.createRange();
              range.selectNodeContents(node);
              if (new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size > 1) return true;
            }
            return false;
          })
          .map((element) => element.textContent),
      }));
      expect(state.scroll, `sideways scroll at ${width}, all read: ${allRead}`).toBeLessThanOrEqual(0);
      expect(state.wrapped, `wrapped button at ${width}, all read: ${allRead}`).toEqual([]);
      expect(await smallText(page), `small text at ${width}, all read: ${allRead}`).toEqual([]);
    }
  }
});

test("visible text passes 4.5:1 at rest, on hover and after marking everything read", async ({ page }) => {
  await page.goto("/");
  for (const pair of await textContrast(page)) expect(pair.ratio, pair.text).toBeGreaterThanOrEqual(4.5);
  for (const selector of [".mark-all", ".person-link", ".post-link", ".group-link", ".private-message", ".site-footer a"]) {
    const element = page.locator(selector).first();
    await element.hover();
    if (selector === ".private-message") {
      await expect(element).toHaveCSS("background-color", "rgb(229, 239, 250)");
    } else {
      await expect(element).toHaveCSS("color", "rgb(10, 49, 123)");
    }
    for (const pair of await textContrast(page)) expect(pair.ratio, `${selector} hover: ${pair.text}`).toBeGreaterThanOrEqual(4.5);
  }
  await page.getByRole("button", { name: "Mark all as read", exact: true }).click();
  await page.getByRole("button", { name: "Mark all as read", exact: true }).click();
  await expect(page.locator(".read-note")).toBeVisible();
  for (const pair of await textContrast(page)) expect(pair.ratio, pair.text).toBeGreaterThanOrEqual(4.5);
});

test("unread rows and group links show a hover change", async ({ page }) => {
  await page.goto("/");
  const row = page.locator(".mark-read").first();
  const before = await row.evaluate((el) => getComputedStyle(el).backgroundColor);
  await row.hover({ position: { x: 600, y: 10 } });
  await expect.poll(() => row.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(before);
  for (const pair of await textContrast(page)) expect(pair.ratio, `row hover: ${pair.text}`).toBeGreaterThanOrEqual(4.5);
  const group = page.locator(".group-link").first();
  await group.hover();
  await expect(group).toHaveCSS("text-decoration-line", "underline");
});
