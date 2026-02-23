import { getCollection, type CollectionEntry } from 'astro:content';

export async function getPublishedProjects(): Promise<CollectionEntry<'projects'>[]> {
  const projects = await getCollection('projects', ({ data }) => !data.draft);
  return projects.sort((a, b) => a.data.order - b.data.order);
}
