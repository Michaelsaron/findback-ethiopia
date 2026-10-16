
import { useEffect, useState } from "react";
import { Link, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import "./design.css";

import ReportCard from "./components/ReportCard";
import ReportFilters from "./components/ReportFilters";
import Pagination from "./components/Pagination";
import ReportForm from "./components/ReportForm";
import ReportDetails from "./pages/ReportDetails";
import AuthPage from "./pages/AuthPage";
import { getReports } from "./services/reportService";
import { useAuth } from "./context/AuthContext";
import MyReports from "./pages/MyReports";

function SiteHeader() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand" to="/">
          <span className="brand-symbol">F</span>
          <span>FindBack <strong>Ethiopia</strong></span>
        </Link>

        <nav className="site-nav" aria-label="Main navigation">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/reports">Browse Reports</NavLink>
          {isAuthenticated && (
  <NavLink to="/my-reports">My Reports</NavLink>
)}
          {isAuthenticated ? (
            <>
              <span className="nav-user">Hi, {user?.name}</span>
              <button className="nav-logout" onClick={logout} type="button">
                Log Out
              </button>
            </>
          ) : (
            <Link className="nav-login" to="/auth">Log In / Sign Up</Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  function searchReports(event) {
    event.preventDefault();
    navigate(`/reports?search=${encodeURIComponent(query.trim())}`);
  }

  return (
    <>
      <section className="home-hero">
        <div className="hero-content">
          <span className="eyebrow">MADE FOR OUR COMMUNITY IN ETHIOPIA</span>
          <h1>Lost something?<br /><em>Let's find it together.</em></h1>
          <p>
            A community-powered way to reconnect people in Addis Ababa
            with the belongings that matter to them.
          </p>

          <form className="hero-search" onSubmit={searchReports}>
            <input
              aria-label="Search for lost or found items"
              placeholder="Search for a phone, wallet, bag..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button type="submit">Search Items →</button>
          </form>

          <div className="hero-actions">
            <Link className="primary-link" to="/reports">
              Explore Reports
            </Link>
            <Link className="secondary-link" to="/reports">
              Report an Item
            </Link>
          </div>
        </div>

        <div className="hero-art" aria-label="Illustration of a lost item being found">
          <div className="hero-art-orbit">
            <div className="hero-art-card">
              <span className="art-icon">⌕</span>
              <strong>Every item has a story.</strong>
              <span>Let's help it find its way home.</span>
              <div className="art-location">⌖ Addis Ababa, Ethiopia</div>
            </div>
          </div>
          <span className="art-tag art-tag-one">LOST → FOUND</span>
          <span className="art-tag art-tag-two">COMMUNITY FIRST</span>
        </div>
      </section>

      <section className="how-section">
        <div className="section-heading">
          <span className="eyebrow">SIMPLE & COMMUNITY-POWERED</span>
          <h2>How FindBack works</h2>
          <p>Three simple steps to help bring lost belongings home.</p>
        </div>

        <div className="steps-grid">
          <article className="step-card">
            <span className="step-number">01</span>
            <h3>Report an item</h3>
            <p>Share what you lost or found, including the area and date.</p>
          </article>
          <article className="step-card">
            <span className="step-number">02</span>
            <h3>Browse reports</h3>
            <p>Search community listings and narrow results by location.</p>
          </article>
          <article className="step-card">
            <span className="step-number">03</span>
            <h3>Help reconnect</h3>
            <p>Use the available report information to identify a possible match.</p>
          </article>
        </div>
      </section>

      <section className="home-cta">
        <div>
          <span className="eyebrow">SMALL ACTIONS, BIG IMPACT</span>
          <h2>Found something that isn't yours?</h2>
          <p>Your report could make someone's day.</p>
        </div>
        <Link className="primary-link" to="/reports">Get Started →</Link>
      </section>
    </>
  );
}

function ReportsPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState(
    () => new URLSearchParams(window.location.search).get("search") || ""
  );
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
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchReports() {
      setLoading(true);
      setError("");

      try {
        const result = await getReports({
          page,
          limit: 6,
          sort,
          search,
          area,
          type,
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        setReports(result.data);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      } catch (err) {
        if (!controller.signal.aborted) setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchReports();
    return () => controller.abort();
  }, [page, sort, search, area, type, refreshKey]);

  function toggleReportForm() {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    setNotice("");
    setShowForm((previous) => !previous);
  }

  return (
    <main className="reports-page">
      <div className="reports-banner">
        <div className="page-container">
          <span className="eyebrow">THE COMMUNITY NOTICEBOARD</span>
          <h1>Lost & Found Reports</h1>
          <p>Explore reports from around Addis Ababa and help items find their owners.</p>
        </div>
      </div>

      <div className="page-container reports-content">
        <div className="reports-toolbar">
          <div>
            <h2>Browse community listings</h2>
            <p>Search by item, location, or report type.</p>
          </div>
          <button className="action-button" onClick={toggleReportForm}>
            {showForm ? "Cancel Report" : "+ Report an Item"}
          </button>
        </div>

        {notice && <p className="success-notice" role="status">{notice}</p>}

        {showForm && isAuthenticated && (
          <div className="report-form-panel">
            <ReportForm
              onSuccess={() => {
                setShowForm(false);
                setNotice("Your report was submitted successfully!");
                setSearch("");
                setArea("");
                setType("");
                setSort("newest");
                setPage(1);
                setRefreshKey((previous) => previous + 1);
              }}
            />
          </div>
        )}

        <div className="filters-panel">
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
        </div>

        {!loading && !error && (
          <div className="listing-heading">
            <h3>Recent listings</h3>
            <span>{total} {total === 1 ? "report" : "reports"} found</span>
          </div>
        )}

        {loading && <p className="state-message">Loading reports...</p>}
        {error && <p className="error" role="alert">{error}</p>}

        {!loading && !error && reports.length === 0 && (
          <div className="empty-state">
            <h3>No matching reports</h3>
            <p>Try a different search or location.</p>
          </div>
        )}

        {!loading && !error && (
          <div className="reports-grid">
            {reports.map((report) => (
              <ReportCard key={report._id} report={report} />
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
      </div>
    </main>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-container footer-inner">
        <strong>FindBack Ethiopia</strong>
        <span>Made for our community in Addis Ababa.</span>
        <span>© {new Date().getFullYear()} FindBack Ethiopia</span>
      </div>
    </footer>
  );
}

export default function AppRoutes() {
  return (
    <div className="site-shell">
      <SiteHeader />
      <Routes>
        <Route path="/my-reports" element={<MyReports />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/reports/:id" element={<ReportDetails />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
      <SiteFooter />
    </div>
  );
}
