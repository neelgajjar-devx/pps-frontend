import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/** Strip hyperlinks, link text, Source lines, and Resources section from article content. */
function sanitizeArticleContent(content) {
  if (!content || typeof content !== 'string') return content
  let text = content

  // Remove Resources section: from a line that is "Resources" / "**Resources:**" / "## Resources" to end
  const lines = text.split('\n')
  let cutIndex = lines.length
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    if (/^(#{1,6}\s*)?(\*\*)?Resources(\*\*)?:?\s*$/.test(trimmed)) {
      cutIndex = i
      break
    }
  }
  text = lines.slice(0, cutIndex).join('\n')

  // Remove markdown links [text](url) – remove entire link and its text
  text = text.replace(/\[[^\]]*\]\([^)]*\)/g, '')

  // Remove bare URLs (http/https)
  text = text.replace(/https?:\/\/[^\s)\]'"]+/g, '')

  // Remove whole lines that are "Source:" or "Source: ..." (with optional leading spaces/list markers)
  text = text.replace(/^\s*([*\-]\s*)?Source:\s*.*$/gm, '')

  // Remove inline "(Source: ...)" or "(Source: url)"
  text = text.replace(/\(\s*Source:\s*[^)]*\)/g, '')

  // Clean up extra blank lines
  text = text.replace(/\n{3,}/g, '\n\n').trim()
  return text
}

function ArticleDetail() {
  const { id } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchArticle() {
      try {
        const res = await fetch(`/api/posts/${id}`)
        if (!res.ok) throw new Error('Failed to load article')
        const data = await res.json()
        setArticle(data.data ?? data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [id])

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-8'>
      <div className='mx-auto flex max-w-5xl flex-col gap-6'>
        <header className='flex flex-wrap items-start justify-between gap-4'>
          <div className='space-y-2'>
            <Link
              to='/articles'
              className='inline-flex items-center gap-1 rounded-full border border-slate-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-500 shadow-sm transition hover:bg-red-100'
            >
              ← Back to Articles
            </Link>
            {article && (
              <>
                {article.url && (
                  <a
                    href={article.url}
                    target='_blank'
                    rel='noreferrer'
                    className='text-2xl font-semibold text-slate-900 '
                  >
                    <h1 className='hover:text-blue-700 hover:underline'>
                      {article.title}
                    </h1>
                  </a>  
                )}
                <div className='flex flex-wrap items-center gap-2 text-[12px] text-slate-600 font-medium pt-2'>
                  {article?.author && (
                    <span className='inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-amber-800 shadow-sm ring-1 ring-amber-100'>
                      <span className='h-1.5 w-1.5 rounded-full bg-amber-500' />
                      Author : {article?.author}
                    </span>
                  )}
                  {article.metadata?.category && (
                    <span className='inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-blue-800 shadow-sm ring-1 ring-blue-100 capitalize'>
                      <span className='h-1.5 w-1.5 rounded-full bg-blue-400' />
                      Category : {article.metadata.category}
                    </span>
                  )}
                  {article.published_at && (
                    <span className='inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 text-slate-800 shadow-sm ring-1 ring-slate-200'>
                      <span className='h-1.5 w-1.5 rounded-full bg-slate-400' />
                      Published Date : 
                      {new Date(article.published_at).toLocaleString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                  {article.source && (
                    <span className='inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-indigo-800 shadow-sm ring-1 ring-indigo-100'>
                      <span className='h-1.5 w-1.5 rounded-full bg-indigo-500' />
                      Source : {article.source}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
          {/* <Link
            to='/articles'
            className='inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50'
          >
            ← Back to Articles
          </Link> */}
        </header>

        {loading && (
          <div className='rounded-2xl border border-slate-200 bg-white/80 p-6 text-sm text-slate-500 shadow-sm'>
            Loading article...
          </div>
        )}

        {error && (
          <div className='rounded-2xl border border-red-100 bg-red-50/70 p-4 text-sm text-red-700 shadow-sm'>
            Error: {error}
          </div>
        )}

        {article && !loading && !error && (
          <div className='space-y-6'>
            {/* Main content */}
            <section className={`rounded-2xl border ${article.is_interesting ? 'border-indigo-500' : 'border-slate-200'} bg-white/90 p-4 shadow-sm`}>
              <div className='flex flex-wrap items-start justify-between gap-4' />

              {/* Article Content */}
              {article.content ? (
                (() => {
                  const cutoff = new Date('2026-01-29')
                  const publishedDate = article.published_at
                    ? new Date(article.published_at)
                    : null
                  const useLegacyList =
                    !publishedDate || publishedDate < cutoff

                  const contentToRender = sanitizeArticleContent(article.content)

                  if (useLegacyList) {
                    return (
                      <ul className='list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-800'>
                        {contentToRender
                          .split('\n')
                          .map((line) => line.trim())
                          .filter((line) => line.length > 0)
                          .map((line, idx) => (
                            <li key={idx}>{line}</li>
                          ))}
                      </ul>
                    )
                  }

                  return (
                    <div className={`rounded-2xl border ${article.is_interesting ? 'border-amber-300' : 'border-slate-200'} bg-slate-50/60 p-4 text-sm space-y-3 leading-relaxed text-slate-800`}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h2: ({ node, ...props }) => (
                            <h2
                              className='mt-1 text-lg font-semibold text-slate-900'
                              {...props}
                            />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3
                              className='mt-2 text-base font-semibold text-slate-900'
                              {...props}
                            />
                          ),
                          p: ({ node, ...props }) => (
                            <p className='mt-1 text-sm text-slate-800' {...props} />
                          ),
                          ul: ({ node, ordered, ...props }) => (
                            <ul
                              className='ml-5 list-disc space-y-1 text-sm text-slate-800'
                              {...props}
                            />
                          ),
                          ol: ({ node, ordered, ...props }) => (
                            <ol
                              className='ml-5 list-decimal space-y-1 text-sm text-slate-800'
                              {...props}
                            />
                          ),
                          li: ({ node, ...props }) => (
                            <li className='marker:text-slate-400' {...props} />
                          ),
                          table: ({ node, ...props }) => (
                            <div className='my-2 overflow-hidden rounded-xl border border-slate-200'>
                              <table
                                className='min-w-full border-collapse text-xs text-slate-800'
                                {...props}
                              />
                            </div>
                          ),
                          thead: (props) => (
                            <thead className='bg-slate-100' {...props} />
                          ),
                          th: ({ node, ...props }) => (
                            <th
                              className='border-b border-slate-200 px-3 py-2 text-left font-semibold'
                              {...props}
                            />
                          ),
                          td: ({ node, ...props }) => (
                            <td
                              className='border-t border-slate-100 px-3 py-2'
                              {...props}
                            />
                          ),
                          a: ({ node, ...props }) => (
                            <a
                              className='text-blue-600 hover:text-blue-700 hover:underline'
                              target='_blank'
                              rel='noreferrer'
                              {...props}
                            />
                          ),
                          hr: () => (
                            <hr className='my-4 border-slate-200' />
                          ),
                        }}
                      >
                        {contentToRender}
                      </ReactMarkdown>
                    </div>
                  )
                })()
              ) : (
                <p className='text-sm text-slate-500'>No content available.</p>
              )}
            </section>

            {/* Policy & Reasoning (only when article is interesting) */}
            {article.is_interesting && (
              <section className='grid grid-cols-12 gap-4'>
                <div className='col-span-12 rounded-2xl border border-indigo-500 bg-white/90 p-4 text-sm shadow-sm'>
                  <h2 className='mb-4 text-sm font-semibold text-slate-900'>
                    Policy & Reasoning
                  </h2>
                  <dl className='grid grid-cols-12 gap-4 text-slate-700'>
                    <div className='col-span-12 grid grid-cols-12 gap-3 border-b border-amber-300 pb-3'>
                      <dt className='col-span-3 text-xs font-medium text-slate-500'>
                        Policy anchor
                      </dt>
                      <dd className='col-span-9 text-sm text-slate-800'>
                        {article.metadata?.policy_anchor ?? '—'}
                      </dd>
                    </div>
                    <div className='col-span-12 grid grid-cols-12 gap-3 border-b border-amber-300 pb-3'>
                      <dt className='col-span-3 text-xs font-medium text-slate-500'>
                        Content pillar
                      </dt>
                      <dd className='col-span-9 text-sm text-slate-800'>
                        {article.metadata?.content_pillar ?? '—'}
                      </dd>
                    </div>
                    <div className='col-span-12 grid grid-cols-12 gap-3'>
                      <dt className='col-span-3 text-xs font-medium text-slate-500'>
                        Why this is Interesting ?
                      </dt>
                      <dd className='col-span-9 text-sm leading-relaxed text-slate-800'>
                        {article.metadata?.reasoning ?? '—'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ArticleDetail
