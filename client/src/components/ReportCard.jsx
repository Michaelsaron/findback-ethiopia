
function ReportCard({ report }) {
  return (
    <article className="report-card">
      <div className="card-top">
        <span className={`type ${report.type}`}>
          {report.type}
        </span>

        <span className="status">
          {report.status}
        </span>
      </div>

      <h3>{report.title}</h3>

      <p className="description">
        {report.description || "No description provided."}
      </p>

      <div className="card-details">
        <p>Category: {report.category}</p>

        <p>
          Area: {report.location?.area || "Unknown"}
        </p>

        <p>
          Reported:{" "}
          {new Date(report.createdAt).toLocaleDateString()}
        </p>
      </div>
    </article>
  );
}

export default ReportCard;
