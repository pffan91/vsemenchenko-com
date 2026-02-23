import getReadingTime from 'reading-time';
import { toString } from 'mdast-util-to-string';
import type { Root } from 'mdast';

export function remarkReadingTime() {
  return function (tree: Root, file: { data: { astro: { frontmatter: Record<string, unknown> } } }) {
    const textOnPage = toString(tree);
    const readingTime = getReadingTime(textOnPage);
    file.data.astro.frontmatter.minutesRead = readingTime.text;
  };
}
