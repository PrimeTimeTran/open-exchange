import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const articlesDirectory = path.join(process.cwd(), 'src/articles');

export interface ArticleMeta {
  title: string;
  description?: string;
  date?: string;
  author?: string;
  slug: string;
  category?: string;
  series?: string;
  part?: number;
  published?: boolean;
}

export interface Article {
  meta: ArticleMeta;
  content: string; // Raw MDX content
}

// Recursively get all article files
function getArticleFiles(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      results = results.concat(getArticleFiles(filePath));
    } else {
      if (file.endsWith('.md') || file.endsWith('.mdx')) {
        results.push(filePath);
      }
    }
  });

  return results;
}

export function getAllArticles(): ArticleMeta[] {
  if (!fs.existsSync(articlesDirectory)) {
    return [];
  }

  const files = getArticleFiles(articlesDirectory);

  const articles = files
    .map((filePath) => {
      // Calculate slug relative to articlesDirectory
      const relativePath = path.relative(articlesDirectory, filePath);
      const slug = relativePath.replace(/\.(mdx|md)$/, '');

      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);

      // Fallback title from content if not in frontmatter
      let title = data.title;
      if (!title) {
        const match = content.match(/^#\s+(.*)/m);
        if (match) {
          title = match[1];
        } else {
          title = path.basename(slug);
        }
      }

      const meta = {
        ...data,
        slug,
        title,
        description: data.description || '',
        date: data.date ? new Date(data.date).toISOString() : '',
        author: data.author || '',
        category:
          path.dirname(relativePath) !== '.'
            ? path.dirname(relativePath)
            : undefined,
      } as ArticleMeta;

      return meta;
    })
    .filter((article) => article.published !== false);

  return articles;
}

export function getArticleBySlug(slugPath: string[]): Article | null {
  const slug = slugPath.join('/');
  const realSlug = slug.replace(/\.mdx?$/, '');

  // Try .md and .mdx
  let fullPath = path.join(articlesDirectory, `${realSlug}.md`);
  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(articlesDirectory, `${realSlug}.mdx`);
  }

  if (!fs.existsSync(fullPath)) {
    // Try index file
    fullPath = path.join(articlesDirectory, realSlug, 'index.md');
    if (!fs.existsSync(fullPath)) {
      fullPath = path.join(articlesDirectory, realSlug, 'index.mdx');
    }
  }

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  let title = data.title;
  if (!title) {
    const match = content.match(/^#\s+(.*)/m);
    if (match) {
      title = match[1];
    } else {
      title = path.basename(realSlug);
    }
  }

  return {
    meta: {
      ...data,
      slug: realSlug,
      title: title || '',
      description: data.description || '',
      date: data.date ? new Date(data.date).toISOString() : '',
      author: data.author || '',
    },
    content,
  };
}
