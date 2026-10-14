
import { useEffect, useState } from "react";
import "./App.css";
import ReportCard from "./components/ReportCard";
import ReportFilters from "./components/ReportFilters";
import Pagination from "./components/Pagination";
import { getReports } from "./services/reportService";


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
}, [page, sort, search, area, type]);


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
