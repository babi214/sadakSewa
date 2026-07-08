import Button from './Button'

export default function Pagination({ page, pages, onPageChange, total }) {
  if (pages <= 1) return null

  const getPageNumbers = (isMobile) => {
    const delta = isMobile ? 1 : 2
    const range = []
    const rangeWithDots = []

    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(pages - 1, page + delta);
      i += 1
    ) {
      range.push(i)
    }

    if (page - delta > 2) rangeWithDots.push(1, '...')
    else rangeWithDots.push(1)

    rangeWithDots.push(...range)

    if (page + delta < pages - 1) rangeWithDots.push('...', pages)
    else if (pages > 1) rangeWithDots.push(pages)

    return rangeWithDots
  }

  return (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      {total !== undefined && (
        <p className="text-sm text-muted">
          Page {page} of {pages} &middot; {total} total
        </p>
      )}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">&larr;</span>
        </Button>
        <div className="hidden sm:flex sm:items-center sm:gap-1">
          {getPageNumbers(false).map((item, i) =>
            item === '...' ? (
              <span key={`dots-${i}`} className="px-2 text-muted">...</span>
            ) : (
              <Button
                key={item}
                variant={page === item ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onPageChange(item)}
                className="min-w-[36px]"
              >
                {item}
              </Button>
            )
          )}
        </div>
        <div className="flex sm:hidden">
          {getPageNumbers(true).map((item, i) =>
            item === '...' ? (
              <span key={`dots-${i}`} className="px-1 text-muted">...</span>
            ) : (
              <Button
                key={item}
                variant={page === item ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onPageChange(item)}
                className="min-w-[32px] !px-1"
              >
                {item}
              </Button>
            )
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">&rarr;</span>
        </Button>
      </div>
    </div>
  )
}
