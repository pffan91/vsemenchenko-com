import { useEffect, useRef, useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';

interface SearchResult {
  url: string;
  meta: { title: string };
  excerpt: string;
}

// Pagefind generates safe HTML excerpts with <mark> tags only.
// This sanitizer strips everything except <mark> as an extra safeguard.
function sanitizeExcerpt(html: string): string {
  return html.replace(/<(?!\/?mark\b)[^>]+>/gi, '');
}

export default function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pagefindRef = useRef<any>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const openModal = useCallback(() => {
    setOpen(true);
    dialogRef.current?.showModal();
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    dialogRef.current?.close();
    setQuery('');
    setResults([]);
    setSelectedIndex(0);
  }, []);

  // Global Cmd+K listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (open) closeModal();
        else openModal();
      }
      if (e.key === 'Escape' && open) {
        closeModal();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, openModal, closeModal]);

  // Connect search trigger button
  useEffect(() => {
    const btn = document.getElementById('search-trigger');
    if (btn) {
      btn.addEventListener('click', openModal);
      return () => btn.removeEventListener('click', openModal);
    }
  }, [openModal]);

  // Load Pagefind lazily
  async function loadPagefind() {
    if (pagefindRef.current) return pagefindRef.current;
    try {
      const pf = await import(/* @vite-ignore */ '/pagefind/pagefind.js');
      await pf.init();
      pagefindRef.current = pf;
      return pf;
    } catch {
      return null;
    }
  }

  async function search(term: string) {
    if (!term.trim()) {
      setResults([]);
      return;
    }
    const pf = await loadPagefind();
    if (!pf) return;
    const searchResults = await pf.search(term);
    const data = await Promise.all(
      searchResults.results.slice(0, 8).map((r: any) => r.data())
    );
    setResults(data);
    setSelectedIndex(0);
  }

  function handleInput(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 200);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      window.location.href = results[selectedIndex].url;
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 m-0 h-full w-full max-w-full max-h-full bg-transparent p-0 backdrop:bg-zinc-900/50"
      onClick={(e) => { if (e.target === dialogRef.current) closeModal(); }}
    >
      <div className="mx-auto mt-[10vh] w-full max-w-lg rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-center gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
          <Search size={18} className="shrink-0 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search posts..."
            className="flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
            aria-label="Search"
          />
          <kbd className="hidden rounded border border-zinc-300 px-1.5 py-0.5 text-[10px] text-zinc-400 dark:border-zinc-600 sm:inline">
            ESC
          </kbd>
          <button onClick={closeModal} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 sm:hidden" aria-label="Close search">
            <X size={18} />
          </button>
        </div>

        {results.length > 0 && (
          <ul className="max-h-[60vh] overflow-y-auto p-2" role="listbox">
            {results.map((result, i) => (
              <li key={result.url} role="option" aria-selected={i === selectedIndex}>
                <a
                  href={result.url}
                  className={`block rounded-lg px-3 py-2 transition-colors ${
                    i === selectedIndex
                      ? 'bg-accent-50 text-accent-900 dark:bg-accent-950 dark:text-accent-100'
                      : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  <p className="text-sm font-medium">{result.meta.title}</p>
                  <p
                    className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400 [&_mark]:bg-accent-200 [&_mark]:dark:bg-accent-800"
                    dangerouslySetInnerHTML={{ __html: sanitizeExcerpt(result.excerpt) }}
                  />
                </a>
              </li>
            ))}
          </ul>
        )}

        {query && results.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No results found.
          </p>
        )}
      </div>
    </dialog>
  );
}
