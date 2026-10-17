import type { Page } from '@playwright/test';
import { expect } from 'vitest';

interface Box {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

interface CardLayout {
  card: Box;
  header: Box;
  title: Box | null;
  titleLines: Box[];
  price: Box;
  priceText: Box;
  headerGap: number;
  details: Box | null;
  cta: Box;
  button: Box | null;
}

const tolerance = 1;

/** Measure rendered text/rows rather than inferring browser layout from class names. */
export async function measureCards(page: Page): Promise<CardLayout[]> {
  return page.getByTestId('package-card').evaluateAll((cards) =>
    cards.map((card) => {
      /** Copy an element's bounds or an existing rectangle into serializable coordinates. */
      const box = (element: Element | DOMRect) => {
        const rect =
          element instanceof Element
            ? element.getBoundingClientRect()
            : element;
        return {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
        };
      };
      /** Return the smallest rectangle enclosing a nonempty set of text rectangles. */
      const union = (rects: Box[]): Box => {
        const left = Math.min(...rects.map((rect) => rect.left));
        const right = Math.max(...rects.map((rect) => rect.right));
        const top = Math.min(...rects.map((rect) => rect.top));
        const bottom = Math.max(...rects.map((rect) => rect.bottom));
        return {
          left,
          right,
          top,
          bottom,
          width: right - left,
          height: bottom - top,
        };
      };
      const header = card.querySelector('header')!;
      const title = header.querySelector('h3');
      const price = header.querySelector('div')!;
      const details = card.querySelector('ul');
      const button = card.querySelector('button');
      const titleLines: Box[] = [];
      if (title) {
        const range = document.createRange();
        range.selectNodeContents(title);
        for (const rect of Array.from(range.getClientRects()).filter(
          (rect) => rect.width > 0
        )) {
          const line = titleLines.find(
            (line) => Math.abs(line.top - rect.top) < 1
          );
          if (line) Object.assign(line, union([line, box(rect)]));
          else titleLines.push(box(rect));
        }
      }
      const priceText = Array.from(price.querySelectorAll('p'))
        .filter((element) => element.textContent?.trim())
        .map((element) => box(element));
      return {
        card: box(card),
        header: box(header),
        title: title ? box(title) : null,
        titleLines,
        price: box(price),
        priceText: union(priceText),
        headerGap: Number.parseFloat(getComputedStyle(header).rowGap),
        details: details ? box(details) : null,
        cta: box(card.lastElementChild!),
        button: button ? box(button) : null,
      };
    })
  );
}

/** Check the text itself; full-width heading/price wrappers cannot prove centering. */
export function assertCentered(cards: CardLayout[]) {
  for (const [index, item] of cards.entries()) {
    const center = (item.card.left + item.card.right) / 2;
    for (const line of item.titleLines) {
      expect(
        Math.abs((line.left + line.right) / 2 - center),
        'title text is centered in card ' + index
      ).toBeLessThanOrEqual(tolerance);
    }
    expect(
      Math.abs((item.priceText.left + item.priceText.right) / 2 - center),
      'price/currency text is centered in card ' + index
    ).toBeLessThanOrEqual(tolerance);
  }
}

/** Align only cards sharing one desktop row, not cards from subsequent grid rows. */
export function assertDesktopRows(cards: CardLayout[]) {
  /** Assert that multiple coordinates differ by at most the rounding tolerance. */
  const aligned = (values: number[], name: string) => {
    if (values.length > 1) {
      expect(
        Math.max(...values) - Math.min(...values),
        name
      ).toBeLessThanOrEqual(tolerance);
    }
  };
  aligned(
    cards.map((item) => item.card.top),
    'card row tops align'
  );
  aligned(
    cards.map((item) => item.card.bottom),
    'card row bottoms align'
  );
  aligned(
    cards.map((item) => item.header.top),
    'header row tops align'
  );
  aligned(
    cards.flatMap((item) => (item.details ? [item.details.top] : [])),
    'detail row tops align'
  );
  aligned(
    cards.map((item) => item.cta.top),
    'CTA row tops align'
  );
  aligned(
    cards.flatMap((item) => (item.button ? [item.button.bottom] : [])),
    'CTA button bottoms align'
  );
}

/** A price follows its own title instead of stretching to another card's price baseline. */
export function assertNaturalPriceSpacing(cards: CardLayout[]) {
  for (const item of cards) {
    if (item.title) {
      expect(
        Math.abs(item.price.top - item.title.bottom - item.headerGap),
        'price follows its title with the header gap'
      ).toBeLessThanOrEqual(tolerance);
    }
  }
}

/** Assert that cards stack without overlap and the first two retain different heights. */
export function assertMobileStack(cards: CardLayout[]) {
  for (let index = 1; index < cards.length; index++) {
    expect(
      cards[index].card.top,
      'mobile cards do not overlap'
    ).toBeGreaterThan(cards[index - 1].card.bottom);
  }
  expect(
    cards[0].card.height,
    'mobile cards keep natural content heights'
  ).not.toBe(cards[1].card.height);
}
