import React from "react";

export default function EventList({ events, onDelete, onEdit, conflicts }) {
  const conflictIds = new Set(
    conflicts.flatMap((c) => [c.a.id, c.b.id])
  );

  return (
    <div className="card">
      <h2>Events</h2>
      {events.length === 0 && <p>No events yet.</p>}

      <ul className="event-list">
        {events.map((e) => (
          <li key={e.id} className={conflictIds.has(e.id) ? "conflict" : ""}>
            <div>
              <strong>{e.title}</strong> @ {e.location}
            </div>

            <div>
              {new Date(e.start_time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              ({e.duration_minutes} min)
              {e.is_meal && ` • Meal (${e.meal_theme || "Any"})`}
            </div>

            <button onClick={() => onEdit(e)}>Edit</button>
            <button onClick={() => onDelete(e.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
