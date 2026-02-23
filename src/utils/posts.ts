import { getCollection, type CollectionEntry } from 'astro:content';

export async function getPublishedPosts(): Promise<CollectionEntry<'posts'>[]> {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
}

export async function getFeaturedPosts(n: number): Promise<CollectionEntry<'posts'>[]> {
  const posts = await getPublishedPosts();
  return posts.filter((p) => p.data.isFeatured).slice(0, n);
}

export async function getRecentPosts(n: number): Promise<CollectionEntry<'posts'>[]> {
  const posts = await getPublishedPosts();
  return posts.slice(0, n);
}

export async function getAllTags(): Promise<Map<string, number>> {
  const posts = await getPublishedPosts();
  const tags = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      tags.set(tag, (tags.get(tag) ?? 0) + 1);
    }
  }
  return tags;
}

export async function getPostsByTag(tag: string): Promise<CollectionEntry<'posts'>[]> {
  const posts = await getPublishedPosts();
  return posts.filter((p) => p.data.tags.includes(tag));
}

export async function getRelatedPosts(
  slug: string,
  tags: string[],
  n: number = 3
): Promise<CollectionEntry<'posts'>[]> {
  const posts = await getPublishedPosts();
  const others = posts.filter((p) => p.id !== slug);

  const scored = others.map((post) => ({
    post,
    score: post.data.tags.filter((t) => tags.includes(t)).length,
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, n).map((s) => s.post);
}
