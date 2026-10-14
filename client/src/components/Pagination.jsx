
function Pagination({ page, totalPages, setPage }) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => setPage((previous) => previous - 1)}
      >
        Previous
      </button>

      <span>
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => setPage((previous) => previous + 1)}
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;
