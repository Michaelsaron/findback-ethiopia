import { useState } from "react";
import { createReport } from "../services/reportService";
import { useAuth } from "../context/AuthContext";

function ReportForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    type: "lost",
    title: "",
    category: "",
    description: "",
    area: "",
    landmark: "",
    eventDate: "",
  });
  const { token } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
  event.preventDefault();

  setSubmitting(true);
  setError("");
  setSuccess("");

  try {
    const payload = {
      type: formData.type,
      title: formData.title.trim(),
      category: formData.category,
      description: formData.description.trim(),
      location: {
        city: "Addis Ababa",
        area: formData.area.trim(),
        landmark: formData.landmark.trim(),
      },
      eventDate: formData.eventDate,
    };

    if (!token) {
  throw new Error("Please log in before submitting a report.");
}

await createReport(payload, token);

    setSuccess("Your report was submitted successfully!");

    setFormData({
      type: "lost",
      title: "",
      category: "",
      description: "",
      area: "",
      landmark: "",
      eventDate: "",
    });

    onSuccess?.();
  } catch (err) {
    setError(err.message);
  } finally {
    setSubmitting(false);
  }
}

  return (
    <form onSubmit={handleSubmit} className="report-form">
      <h2>Submit a Report</h2>

      <label htmlFor="type">Report Type</label>
      <select
        id="type"
        name="type"
        value={formData.type}
        onChange={handleChange}
      >
        <option value="lost">Lost Item</option>
        <option value="found">Found Item</option>
      </select>

      <label htmlFor="title">Item Title</label>
      <input
        id="title"
        type="text"
        name="title"
        placeholder="e.g. Black backpack"
        value={formData.title}
        onChange={handleChange}
        required
      />

      <label htmlFor="category">Category</label>
      <select
        id="category"
        name="category"
        value={formData.category}
        onChange={handleChange}
        required
      >
        <option value="">Select a category</option>
        <option value="bag">Bag</option>
        <option value="electronics">Electronics</option>
        <option value="documents">Documents</option>
        <option value="other">Other</option>
      </select>

      <label htmlFor="description">Description</label>
      <textarea
        id="description"
        name="description"
        placeholder="Describe your item..."
        value={formData.description}
        onChange={handleChange}
      />

      <label htmlFor="area">Area</label>
      <input
        id="area"
        type="text"
        name="area"
        placeholder="e.g. Megenagna"
        value={formData.area}
        onChange={handleChange}
        required
      />

      <label htmlFor="landmark">Nearby Landmark</label>
      <input
        id="landmark"
        type="text"
        name="landmark"
        placeholder="e.g. Near the bus station"
        value={formData.landmark}
        onChange={handleChange}
      />

      <label htmlFor="eventDate">Date Lost or Found</label>
      <input
        id="eventDate"
        type="date"
        name="eventDate"
        value={formData.eventDate}
        onChange={handleChange}
        required
      />

      {error && <p className="error">{error}</p>}

      {success && <p role="status">{success}</p>}

      <button type="submit" disabled={submitting}>
         {submitting ? "Submitting..." : "Submit Report"}
      </button>
    </form>
  );
}

export default ReportForm;

  