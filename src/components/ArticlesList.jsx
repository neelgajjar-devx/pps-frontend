import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function ArticlesList() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [onlyInteresting, setOnlyInteresting] = useState(false)
  const articlesPerPage = 10

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch('/api/posts')
        if (!res.ok) throw new Error('Failed to load articles')
        const data = await res.json()
        setArticles(data.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  // Apply filter
  const filteredArticles = onlyInteresting
    ? articles.filter((a) => a.is_interesting)
    : articles

  // Pagination calculations
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage) || 1
  const startIndex = (currentPage - 1) * articlesPerPage
  const endIndex = startIndex + articlesPerPage
  const currentArticles = filteredArticles.slice(startIndex, endIndex)

  // Reset to page 1 when articles change
  useEffect(() => {
    setCurrentPage(1)
  }, [articles.length, onlyInteresting])

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const hasData = !loading && !error && filteredArticles.length > 0

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-8'>
      <div className='mx-auto flex max-w-6xl flex-col gap-5'>
        <header className='space-y-3'>
          <div className='flex flex-wrap items-baseline justify-between gap-3'>
            <div>
              <h1 className='text-2xl font-semibold text-slate-900'>
                Articles
              </h1>
              <p className='mt-1 text-sm text-slate-500'>
                Manage and curate your daily policy news feed.
              </p>
            </div>
          </div>

          {hasData && (
            <div className='inline-flex rounded-full bg-slate-100 p-1 text-xs font-medium text-slate-600'>
              <button
                type='button'
                onClick={() => {
                  setOnlyInteresting(false)
                  setCurrentPage(1)
                }}
                className={`inline-flex items-center gap-1 rounded-full px-4 py-1.5 transition ${
                  !onlyInteresting
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600'
                }`}
              >
                All Articles
              </button>
              <button
                type='button'
                onClick={() => {
                  setOnlyInteresting(true)
                  setCurrentPage(1)
                }}
                className={`inline-flex items-center gap-1 rounded-full px-4 py-1.5 transition ${
                  onlyInteresting
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600'
                }`}
              >
                <span className='text-[11px]'>★</span>
                Interesting Only
              </button>
            </div>
          )}
        </header>

        <div className='rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur-sm'>
          {loading && (
            <div className='space-y-2 px-6 py-4'>
              {[...Array(4)].map((_, idx) => (
                <div
                  key={idx}
                  className='h-8 animate-pulse rounded-md bg-slate-100'
                />
              ))}
            </div>
          )}

          {error && (
            <div className='flex items-center justify-between gap-4 px-6 py-4 text-sm'>
              <p className='text-red-600'>Error: {error}</p>
              <button
                type='button'
                onClick={() => window.location.reload()}
                className='rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50'
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {filteredArticles.length > 0 ? (
                <>
                  <ul className='space-y-3 px-4 py-4'>
                    {currentArticles.map((article, index) => {
                      const globalIndex = startIndex + index
                      return (
                        <li
                          key={article.id}
                          className='text-sm'
                        >
                          <div
                            className={`flex items-stretch gap-3 rounded-2xl border px-4 py-3 transition ${
                              article.is_interesting
                                ? 'border-amber-300 bg-indigo-50/60'
                                : 'border-slate-200 bg-slate-50/60'
                            } hover:border-indigo-400 hover:bg-indigo-50`}
                          >
                            {/* Left icon column */}
                            <div className='flex items-start pt-1'>
                              {article.is_interesting ? (
                                <span className='text-lg text-amber-500'>★</span>
                              ) : (
                                <span className='text-lg text-slate-300'>★</span>
                              )}
                            </div>

                            {/* Main content */}
                            <div className='flex min-w-0 flex-1 flex-col gap-1'>
                              <Link
                                to={`/articles/${article.id}`}
                                className='line-clamp-2 text-left text-sm font-semibold text-slate-900 hover:text-indigo-700'
                              >
                                {article.title}
                              </Link>
                              <div className='flex flex-wrap items-center gap-2 text-[11px] text-slate-500'>
                                {article.published_at && (
                                  <span>
                                    {new Date(
                                      article.published_at,
                                    ).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </span>
                                )}
                                {article.is_interesting && (
                                  <span className='inline-flex items-center rounded-full bg-indigo-600 px-2 py-0.5 text-[11px] font-medium text-white'>
                                    INTERESTING
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Right side chips / menu */}
                            <div className='flex flex-col items-end justify-between gap-2'>
                              <div className='flex flex-wrap items-center gap-2'>
                                {article.metadata?.category && (
                                  <span className='rounded-full bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-800 capitalize'>
                                    {article.metadata.category}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                      </li>
                      )
                    })}
                  </ul>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className='border-t border-slate-200 bg-slate-50/50 px-6 py-4'>
                      <div className='flex flex-wrap items-center justify-between gap-4'>
                        <div className='text-xs text-slate-600'>
                          Showing {startIndex + 1} to{' '}
                          {Math.min(endIndex, filteredArticles.length)} of{' '}
                          {filteredArticles.length}{' '}
                          {onlyInteresting ? 'interesting articles' : 'articles'}
                        </div>
                        <div className='flex items-center gap-2'>
                          <button
                            type='button'
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className='rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white'
                          >
                            Previous
                          </button>

                          <div className='flex items-center gap-1'>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                              .filter((page) => {
                                // Show first page, last page, current page, and pages around current
                                if (
                                  page === 1 ||
                                  page === totalPages ||
                                  (page >= currentPage - 1 &&
                                    page <= currentPage + 1)
                                ) {
                                  return true
                                }
                                // Show ellipsis markers
                                if (
                                  page === currentPage - 2 ||
                                  page === currentPage + 2
                                ) {
                                  return false
                                }
                                return false
                              })
                              .map((page, idx, arr) => {
                                const prevPage = arr[idx - 1]
                                const showEllipsis =
                                  prevPage && page - prevPage > 1

                                return (
                                  <div key={page} className='flex items-center'>
                                    {showEllipsis && (
                                      <span className='px-1 text-xs text-slate-400'>
                                        ...
                                      </span>
                                    )}
                                    <button
                                      type='button'
                                      onClick={() => handlePageChange(page)}
                                      className={`min-w-[2rem] rounded-md px-2 py-1.5 text-xs font-medium transition ${
                                        currentPage === page
                                          ? 'bg-blue-600 text-white'
                                          : 'bg-white text-slate-700 hover:bg-slate-100'
                                      }`}
                                    >
                                      {page}
                                    </button>
                                  </div>
                                )
                              })}
                          </div>

                          <button
                            type='button'
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className='rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white'
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className='px-6 py-10 text-center text-sm text-slate-500'>
                  <p className='font-medium text-slate-700'>
                    No articles found
                  </p>
                  <p className='mt-1 text-xs text-slate-500'>
                    Once the scraper runs, new articles will appear here.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ArticlesList
