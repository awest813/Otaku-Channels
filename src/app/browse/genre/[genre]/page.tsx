import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { listAnime } from '@/lib/backend';
import { clampPage } from '@/lib/params';

import { allContent as mockAllContent } from '@/data/mockData';

import MediaCard from '@/components/media/MediaCard';
import MediaCardSkeleton from '@/components/media/MediaCardSkeleton';

import type { AnimeSeries, Movie } from '@/types';

const PAGE_SIZE = 24;
/** Maximum grid columns at the widest breakpoint (xl:grid-cols-6). */
const MAX_GRID_COLS = 6;

interface Props {
  params: Promise<{ genre: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { genre } = await params;
  const decoded = decodeURIComponent(genre);
  return {
    title: `${decoded} Anime — Browse by Genre`,
    description: `Browse all officially licensed free ${decoded} anime series and movies.`,
  };
}

async function fetchGenreItems(
  genre: string,
  page: number
): Promise<{ items: (AnimeSeries | Movie)[]; total: number }> {
  try {
    const [seriesResult, moviesResult] = await Promise.all([
      listAnime({ genre, page, limit: PAGE_SIZE }),
      listAnime({ genre, type: 'MOVIE', page, limit: PAGE_SIZE }),
    ]);
    const items = [...seriesResult.data, ...moviesResult.data];
    const total = (seriesResult.total ?? 0) + (moviesResult.total ?? 0);
    if (items.length > 0) return { items, total };
  } catch {
    // Backend unavailable — fall through to mock data
  }

  // Mock data fallback: filter in-memory and paginate
  const all = (mockAllContent as (AnimeSeries | Movie)[]).filter((item) =>
    item.genres.some((g) => g.toLowerCase() === genre.toLowerCase())
  );
  const start = (page - 1) * PAGE_SIZE;
  return { items: all.slice(start, start + PAGE_SIZE), total: all.length };
}

export default async function GenreBrowsePage({ params, searchParams }: Props) {
  const { genre } = await params;
  const { page: pageParam } = await searchParams;
  const decoded = decodeURIComponent(genre);
  const page = clampPage(pageParam ?? '1') ?? 1;

  const { items, total } = await fetchGenreItems(decoded, page);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className='mx-auto max-w-screen-xl px-4 py-8'>
      {/* Back link */}
      <Link
        href='/browse'
        className='mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
      >
        <ArrowLeft className='h-4 w-4' />
        All genres
      </Link>

      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-white md:text-3xl'>{decoded}</h1>
        <p className='mt-0.5 text-sm text-slate-500'>
          {total > 0
            ? `${total} title${total !== 1 ? 's' : ''} available free`
            : 'Browse free anime by genre'}
        </p>
      </div>

      {/* Results */}
      {items.length === 0 ? (
        <div className='flex flex-col items-center justify-center gap-4 py-16 text-center'>
          <p className='font-semibold text-slate-300'>
            No {decoded} anime found
          </p>
          <p className='text-sm text-slate-500'>
            Try another genre or browse the full catalogue.
          </p>
          <Link
            href='/browse'
            className='mt-1 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
          >
            Browse all
          </Link>
        </div>
      ) : (
        <>
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
            {items.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
            {/* Fill last row with skeleton placeholders to keep grid aligned */}
            {items.length % MAX_GRID_COLS !== 0 &&
              Array.from({
                length: MAX_GRID_COLS - (items.length % MAX_GRID_COLS),
              }).map((_, i) => (
                <MediaCardSkeleton key={`placeholder-${i}`} aria-hidden />
              ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='mt-8 flex items-center justify-center gap-3'>
              {hasPrev ? (
                <Link
                  href={`/browse/genre/${encodeURIComponent(decoded)}?page=${
                    page - 1
                  }`}
                  className='flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:border-slate-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
                  aria-label='Previous page'
                >
                  <ChevronLeft className='h-4 w-4' />
                  Prev
                </Link>
              ) : (
                <span className='flex items-center gap-1.5 rounded-lg border border-slate-800 px-4 py-2 text-sm font-medium text-slate-600 opacity-50'>
                  <ChevronLeft className='h-4 w-4' />
                  Prev
                </span>
              )}

              <span className='text-sm text-slate-400'>
                Page {page} of {totalPages}
              </span>

              {hasNext ? (
                <Link
                  href={`/browse/genre/${encodeURIComponent(decoded)}?page=${
                    page + 1
                  }`}
                  className='flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:border-slate-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
                  aria-label='Next page'
                >
                  Next
                  <ChevronRight className='h-4 w-4' />
                </Link>
              ) : (
                <span className='flex items-center gap-1.5 rounded-lg border border-slate-800 px-4 py-2 text-sm font-medium text-slate-600 opacity-50'>
                  Next
                  <ChevronRight className='h-4 w-4' />
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
