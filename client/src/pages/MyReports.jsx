
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getMyReports,
  updateReport,
  resolveReport,
  deleteReport,
} from "../services/reportService";

export default function MyReports() {
  const { isAuthenticated, token } = useAuth();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setLoading(false);
      return;
    }

    let active = true;

    async function loadReports() {
      try {
        const result = await getMyReports(token);
        if (active) setReports(result.data);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadReports();

    return () => {
      active = false;
    };
  }, [isAuthenticated, token]);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  function startEditing(report) {
    setEditingId(report._id);
    setForm({
      title: report.title || "",
      description: report.description || "",
      category: report.category || "other",
      area: report.location?.area || "",
      landmark: report.location?.landmark || "",
    });
    setError("");
    setNotice("");
  }

  async function handleSave(event, report) {
    event.preventDefault();
    setBusyId(report._id);
    setError("");

    try {
      const result = await updateReport(
        report._id,
        {
          title: form.title,
          description: form.description,
          category: form.category,
          location: {
            city: report.location?.city || "Addis Ababa",
            area: form.area,
            landmark: form.landmark,
          },
        },
        token
      );

      setReports((previous) =>
        previous.map((item) =>
          item._id === report._id ? result.data : item
        )
      );
      setEditingId(null);
      setNotice("Report updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleResolve(report) {
    setBusyId(report._id);
    setError("");

    try {
      const result = await resolveReport(report._id, token);
      setReports((previous) =>
        previous.map((item) =>
          item._id === report._id ? result.data : item
        )
      );
      setNotice("Report marked as resolved.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(report) {
    const confirmed = window.confirm(
      `Delete "${report.title}" permanently?`
    );

    if (!confirmed) return;

    setBusyId(report._id);
    setError("");

    try {
      await deleteReport(report._id, token);
      setReports((previous) =>
        previous.filter((item) => item._id !== report._id)
      );
      setNotice("Report deleted successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  const openCount = reports.filter(
    (report) => report.status === "open"
  ).length;

  const resolvedCount = reports.filter(
    (report) => report.status === "resolved"
  ).length;

  return (
    <main className="reports-page">
      <section className="reports-banner">
        <div className="page-container">
          <span className="eyebrow">YOUR COMMUNITY ACCOUNT</span>
          <h1>My Reports</h1>
          <p>Manage the lost and found reports you created.</p>
        </div>
      </section>

      <div className="page-container reports-content">
        <div className="reports-toolbar">
          <div>
            <h2>Your dashboard</h2>
            <p>Track, update, and manage your reports.</p>
          </div>
          <Link className="primary-link" to="/reports">
            + Report an Item
          </Link>
        </div>

        {!loading && (
          <div className="my-report-stats">
            <div className="my-stat">
              <strong>{reports.length}</strong>
              <span>Total Reports</span>
            </div>
            <div className="my-stat">
              <strong>{openCount}</strong>
              <span>Open</span>
            </div>
            <div className="my-stat">
              <strong>{resolvedCount}</strong>
              <span>Resolved</span>
            </div>
          </div>
        )}

        {notice && <p className="success-notice" role="status">{notice}</p>}
        {error && <p className="error" role="alert">{error}</p>}
        {loading && <p className="state-message">Loading your reports...</p>}

        {!loading && reports.length === 0 && !error && (
          <div className="empty-state">
            <h3>No reports yet</h3>
            <p>Your newly created reports will appear here.</p>
            <Link to="/reports">Create your first report →</Link>
          </div>
        )}

        <div className="my-reports-list">
          {reports.map((report) => (
            <article className="my-report-card" key={report._id}>
              <div className="my-report-top">
                <div>
                  <span className="eyebrow">{report.type}</span>
                  <h3>{report.title}</h3>
                  <p>
                    {report.location?.area || "Addis Ababa"}
                    {" · "}
                    {report.category}
                  </p>
                </div>
                <span className={`my-status ${report.status}`}>
                  {report.status}
                </span>
              </div>

              {editingId === report._id ? (
                <form
                  className="my-edit-form"
                  onSubmit={(event) => handleSave(event, report)}
                >
                  <label>
                    Title
                    <input
                      required
                      value={form.title}
                      onChange={(event) =>
                        setForm({ ...form, title: event.target.value })
                      }
                    />
                  </label>

                  <label>
                    Description
                    <textarea
                      required
                      value={form.description}
                      onChange={(event) =>
                        setForm({ ...form, description: event.target.value })
                      }
                    />
                  </label>

                  <label>
                    Category
                    <select
                      value={form.category}
                      onChange={(event) =>
                        setForm({ ...form, category: event.target.value })
                      }
                    >
                      <option value="bag">Bag</option>
                      <option value="electronics">Electronics</option>
                      <option value="documents">Documents</option>
                      <option value="other">Other</option>
                    </select>
                  </label>

                  <label>
                    Area
                    <input
                      value={form.area}
                      onChange={(event) =>
                        setForm({ ...form, area: event.target.value })
                      }
                    />
                  </label>

                  <label>
                    Landmark
                    <input
                      value={form.landmark}
                      onChange={(event) =>
                        setForm({ ...form, landmark: event.target.value })
                      }
                    />
                  </label>

                  <div className="my-report-actions">
                    <button disabled={busyId === report._id} type="submit">
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p>{report.description}</p>
                  <div className="my-report-actions">
                    <button
                      type="button"
                      disabled={busyId === report._id}
                      onClick={() => startEditing(report)}
                    >
                      Edit
                    </button>

                    {report.status !== "resolved" && (
                      <button
                        type="button"
                        disabled={busyId === report._id}
                        onClick={() => handleResolve(report)}
                      >
                        Mark Resolved
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={busyId === report._id}
                      onClick={() => handleDelete(report)}
                    >
                      Delete
                    </button>

                    <Link to={`/reports/${report._id}`}>
                      View Details →
                    </Link>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
