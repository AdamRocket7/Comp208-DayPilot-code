const API_BASE = "http://localhost:8000";

export async function fetchEvents(dayIso) {
  const res = await fetch(`${API_BASE}/events/?day=${encodeURIComponent(dayIso)}`);
  return res.json();
}

export async function createEvent(event) {
  const res = await fetch(`${API_BASE}/events/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
  return res.json();
}

export async function deleteEvent(id) {
  const res = await fetch(`${API_BASE}/events/${id}`, { method: "DELETE" });
  return res.json();
}

export async function fetchGaps(dayIso) {
  const res = await fetch(`${API_BASE}/events/gaps?day=${encodeURIComponent(dayIso)}`);
  return res.json();
}

export async function fetchRecommendations(payload) {
  const res = await fetch("http://localhost:8000/recommendations/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch recommendations: ${res.status}`);
  }

  return res.json();
}


export async function fetchRoute(payload) {
  const res = await fetch(`${API_BASE}/navigation/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}
