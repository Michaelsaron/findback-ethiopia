import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getReportById } from "../services/reportService";

function ReportDetails() {
  const { id } = useParams();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchReport() {
      setLoading(true);
      setError("");

      try {
        const data = await getReportById(id, controller.signal);

        if (!controller.signal.aborted) {
          setReport(data);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchReport();

    return () => controller.abort();
  }, [id]);

  return (
    <main className="details-page">
      <Link to="/" className="back-link">
        ← Back to reports
      </Link>

      {loading && <p>Loading report...</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && !error && report && (
        <article className="details-card">
          <span className={`report-badge ${report.type}`}>
            {report.type === "lost" ? "Lost" : "Found"}
          </span>

          <h1>{report.title}</h1>

          <p className="details-description">
            {report.description || "No description provided."}
          </p>

          <div className="details-info">
            <p><strong>Category:</strong> {report.category}</p>
            <p><strong>Area:</strong> {report.location?.area}</p>
            <p>
              <strong>Landmark:</strong>{" "}
              {report.location?.landmark || "Not specified"}
            </p>
            <p><strong>City:</strong> {report.location?.city}</p>
            <p>
              <strong>Date lost/found:</strong>{" "}
              {new Date(report.eventDate).toLocaleDateString()}
            </p>
            <p><strong>Status:</strong> {report.status}</p>
          </div>
        </article>
      )}
    </main>
  );
}

export default ReportDetails;