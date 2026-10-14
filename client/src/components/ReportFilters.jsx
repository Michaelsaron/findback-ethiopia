
function ReportFilters({
  search,
  setSearch,
  area,
  setArea,
  type,
  setType,
  sort,
  setSort,
  setPage
}) {
  return (
    <div className="filters">
      <input
        placeholder="Search items..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      <input
        placeholder="Area (e.g. Megenagna)"
        value={area}
        onChange={(e) => {
          setArea(e.target.value);
          setPage(1);
        }}
      />

      <select
        value={type}
        onChange={(e) => {
          setType(e.target.value);
          setPage(1);
        }}
      >
        <option value="">All reports</option>
        <option value="lost">Lost</option>
        <option value="found">Found</option>
      </select>

      <select
        value={sort}
        onChange={(e) => {
          setSort(e.target.value);
          setPage(1);
        }}
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
      </select>
    </div>
  );
}

export default ReportFilters;
