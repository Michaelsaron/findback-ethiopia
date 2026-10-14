
import { useEffect, useState } from "react";
import "./App.css";
import ReportCard from "./components/ReportCard";

const API_URL = "http://localhost:5001/api/v1/reports";

function App() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [area, setArea] = useState("");
  const [type, setType] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchReports() {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(page),
        limit: "2",
        sort
      });

      if (search.trim()) params.set("search", search.trim());
      if (area.trim()) params.set("area", area.trim());
      if (type) params.set("type", type);

      try {
        const response = await fetch(
          `${API_URL}?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to load reports");
        }

        const result = await response.json();

        setReports(result.data);
        setTotalPages(result.totalPages);
        setTotal(result.total);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    // Small delay so we don't request on every keystroke
    const timer = setTimeout(fetchReports, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, area, type, sort, page]);

  return (
    <div className="app">
      <header className="header">
        <h1>FindBack Ethiopia</h1>
        <p>Helping Addis Ababa find what matters.</p>
      </header>

      <main className="container">
        <div className="section-heading">
          <h2>Lost & Found Reports</h2>
          <p>Search for lost items or browse found belongings.</p>
        </div>

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

        {!loading && !error && (
          <p className="result-count">{total} reports found</p>
        )}

        {loading && <p>Loading reports...</p>}

        {error && <p className="error">{error}</p>}

        {!loading && !error && reports.length === 0 && (
          <p>No matching reports found.</p>
        )}

        {!loading && !error && (
          <div className="reports-grid">
            {reports.map((report) => (
               <ReportCard
                    key={report._id}
                   report={report}
                       />
             ))}



          </div>
        )}

        {!loading && !error && totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
