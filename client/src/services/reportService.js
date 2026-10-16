const API_URL = "http://localhost:5001/api/v1/reports";

export async function getReports({
  page = 1,
  limit = 2,
  sort = "newest",
  search = "",
  area = "",
  type = "",
  signal,
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sort,
  });

  if (search.trim()) {
    params.set("search", search.trim());
  }

  if (area.trim()) {
    params.set("area", area.trim());
  }

  if (type) {
    params.set("type", type);
  }

  const response = await fetch(`${API_URL}?${params.toString()}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch reports");
  }

  return response.json();
}

export async function createReport(reportData, token) {
  const response = await fetch(
    "http://localhost:5001/api/v1/reports",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reportData),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to create report");
  }

  return result;
}

// GET /api/v1/reports/:id
// Fetch one report from the backend using its ID
export async function getReportById(id, signal) {
  const response = await fetch(
    `http://localhost:5001/api/v1/reports/${encodeURIComponent(id)}`,
    { signal }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch report");
  }

  return result.data;
}