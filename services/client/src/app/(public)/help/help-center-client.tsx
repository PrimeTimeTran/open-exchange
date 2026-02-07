'use client';

import React, { useState } from 'react';
import {
  Search,
  FileText,
  ArrowLeft,
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  BookCheckIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Category, Article } from './data';

const iconMap: Record<string, React.ElementType> = {
  'book-open': BookCheckIcon,
  'shield-check': ShieldCheck,
  'file-text': FileText,
  'help-circle': HelpCircle,
};

interface HelpCenterClientProps {
  categories: Category[];
}

export function HelpCenterClient({ categories }: HelpCenterClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Flatten all articles for search
  const allArticles = categories.flatMap((cat) => cat.articles);

  // Filter articles based on search
  const filteredArticles = searchQuery
    ? allArticles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.content.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setSearchQuery(''); // Clear search on selection
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryToggle = (categoryId: string) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
  };

  const handleBackToHome = () => {
    setSelectedArticle(null);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="bg-muted py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            How can we help you?
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Search our knowledge base or browse categories below.
          </p>
          <div className="mx-auto max-w-2xl relative">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for topics, e.g., 'reset password'"
                className="h-12 w-full pl-10 text-lg shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Search Results Dropdown */}
            {searchQuery && (
              <div className="absolute top-14 left-0 right-0 z-10 max-h-80 overflow-y-auto rounded-md border bg-popover p-2 shadow-md">
                {filteredArticles.length > 0 ? (
                  filteredArticles.map((article) => (
                    <button
                      key={article.id}
                      className="flex w-full flex-col items-start rounded-sm px-4 py-3 text-left hover:bg-muted"
                      onClick={() => handleArticleClick(article)}
                    >
                      <span className="font-medium">{article.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {article.category}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-12 lg:grid-cols-4">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <nav className="space-y-2 sticky top-24">
              <h3 className="mb-4 text-lg font-semibold uppercase tracking-wider text-muted-foreground">
                Categories
              </h3>
              {categories.map((category) => (
                <div key={category.id} className="rounded-lg border bg-card">
                  <button
                    onClick={() => handleCategoryToggle(category.id)}
                    className={cn(
                      'flex w-full items-center justify-between px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/50',
                      activeCategory === category.id && 'bg-muted/50',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {(() => {
                        const Icon = iconMap[category.icon] || HelpCircle;
                        return <Icon className="h-4 w-4 text-primary" />;
                      })()}
                      <span>{category.title}</span>
                    </div>
                    {activeCategory === category.id ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {activeCategory === category.id && (
                    <div className="border-t bg-muted/20 px-4 py-2">
                      <ul className="space-y-1">
                        {category.articles.map((article) => (
                          <li key={article.id}>
                            <button
                              onClick={() => handleArticleClick(article)}
                              className={cn(
                                'block w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted hover:text-foreground',
                                selectedArticle?.id === article.id
                                  ? 'bg-primary/10 text-primary font-medium'
                                  : 'text-muted-foreground',
                              )}
                            >
                              {article.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-3">
            {selectedArticle ? (
              // Article View
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Button
                  variant="ghost"
                  onClick={handleBackToHome}
                  className="mb-6 pl-0 hover:pl-0 hover:bg-transparent hover:text-primary"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Help Center
                </Button>

                <div className="rounded-xl border bg-card p-8 shadow-sm">
                  <div className="mb-6">
                    <span className="text-sm font-medium text-primary">
                      {selectedArticle.category}
                    </span>
                    <h1 className="mt-2 text-3xl font-bold">
                      {selectedArticle.title}
                    </h1>
                  </div>

                  <div
                    className="prose prose-gray max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{
                      __html: selectedArticle.content,
                    }}
                  />

                  <div className="mt-12 border-t pt-8">
                    <h4 className="mb-4 font-semibold">
                      Was this article helpful?
                    </h4>
                    <div className="flex gap-4">
                      <Button variant="outline" size="sm">
                        Yes, thanks!
                      </Button>
                      <Button variant="outline" size="sm">
                        Not really
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Home View (Card Grid)
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-2xl font-bold mb-6">Popular Articles</h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    {allArticles.slice(0, 4).map((article) => (
                      <div
                        key={article.id}
                        className="group cursor-pointer rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
                        onClick={() => handleArticleClick(article)}
                      >
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors ">
                          <FileText className="h-5 w-5" />
                        </div>
                        <h3 className="mb-2 font-semibold group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          Click to read more about {article.title.toLowerCase()}{' '}
                          and learn how to use this feature effectively on our
                          platform.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-6">Browse by Topic</h2>
                  <div className="grid gap-6 md:grid-cols-3">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="cursor-pointer rounded-xl border bg-card p-6 text-center hover:bg-muted/50 transition-colors"
                        onClick={() => handleCategoryToggle(category.id)}
                      >
                        {(() => {
                          const Icon = iconMap[category.icon] || HelpCircle;
                          return (
                            <Icon className="mx-auto mb-4 h-8 w-8 text-primary" />
                          );
                        })()}
                        <h3 className="font-semibold">{category.title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {category.articles.length} articles
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
