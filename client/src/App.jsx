
import { useEffect, useState } from "react";
import "./App.css";
import ReportCard from "./components/ReportCard";
import ReportFilters from "./components/ReportFilters";
import Pagination from "./components/Pagination";
import { getReports } from "./services/reportService";
import ReportForm from "./components/ReportForm";


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
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  
useEffect(() => {
  const controller = new AbortController();

  async function fetchReports() {
    setLoading(true);
    setError("");

    try {
      const result = await getReports({
        page,
        limit: 2,
        sort,
        search,
        area,
        type,
        signal: controller.signal
      });

      if (controller.signal.aborted) return;

      setReports(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error) {
      if (controller.signal.aborted) return;

      setError(error.message);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }

  fetchReports();

  return () => controller.abort();
}, [page, sort, search, area, type, refreshKey]);


return (
  <div className="app">
    <header className="header">
  <div className="container">
    <h1>FindBack Ethiopia</h1>
    <p>Helping Addis Ababa find what matters.</p>
  </div>
</header>

    <main className="container">
      <h2>Lost & Found Reports</h2>
      <p>Search for lost items or browse found belongings.</p>

      {/* Button to open or close the report form */}
      <div className="report-actions">
        <button
          type="button"
          onClick={() => setShowForm((previous) => !previous)}
        >
          {showForm ? "Cancel" : "Report Lost or Found Item"}
        </button>
      </div>

      {/* Show form only when showForm is true */}
      {showForm && (
        <ReportForm
          onSuccess={() => {
            setShowForm(false);
            setSearch("");
            setArea("");
            setType("");
            setSort("newest");
            setPage(1);
            setRefreshKey((previous) => previous + 1);
          }}
        />
      )}

      {/* Search and filtering */}
      <ReportFilters
        search={search}
        setSearch={setSearch}
        area={area}
        setArea={setArea}
        type={type}
        setType={setType}
        sort={sort}
        setSort={setSort}
        setPage={setPage}
      />

      {/* Number of matching reports */}
      {!loading && !error && (
        <p className="result-count">{total} reports found</p>
      )}

      {/* Loading and error messages */}
      {loading && <p>Loading reports...</p>}

      {error && <p className="error">{error}</p>}

      {/* Empty results */}
      {!loading && !error && reports.length === 0 && (
        <p>No matching reports found.</p>
      )}

      {/* Report cards */}
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

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          setPage={setPage}
        />
      )}
    </main>
  </div>
);
}
export default App;