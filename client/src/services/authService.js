const AUTH_URL = "http://localhost:5001/api/v1/auth";

async function authRequest(endpoint, data) {
  const response = await fetch(`${AUTH_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Authentication failed");
  }

  return result;
}

export function registerUser(data) {
  return authRequest("register", data);
}

export function loginUser(data) {
  return authRequest("login", data);
} 