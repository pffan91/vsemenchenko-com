import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      publishDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      coverImage: image().optional(),
      tags: z.array(z.string()),
      isFeatured: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

const projectLinkType = z.enum([
  'appstore',
  'playstore',
  'github',
  'website',
  'demo',
  'video',
  'other',
]);

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      coverImage: image(),
      gallery: z.array(image()).default([]),
      tags: z.array(z.string()),
      links: z
        .array(z.object({ label: z.string(), url: z.string(), type: projectLinkType }))
        .default([]),
      role: z.string().optional(),
      dateRange: z.string().optional(),
      order: z.number().default(0),
      draft: z.boolean().default(false),
      metrics: z
        .array(z.object({ label: z.string(), value: z.string() }))
        .optional(),
    }),
});

export const collections = { posts, projects };
