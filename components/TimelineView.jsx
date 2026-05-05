import React, { useMemo, useEffect, useState } from "react";
import "./timelineView.css";

// Compute non-overlapping columns PER TIME WINDOW
function computeColumns(events) {
  const sorted = [...events].sort(
    (a, b) => new Date(a.start_time || a.start) - new Date(b.start_time || b.start)
  );

  const columns = [];

  sorted.forEach((event) => {
    const start = new Date(event.start_time || event.start);
    const end = new Date(start.getTime() + event.duration_minutes * 60000);

    let placed = false;

    for (const col of columns) {
      const last = col[col.length - 1];
      const lastStart = new Date(last.start_time || last.start);
      const lastEnd = new Date(
        lastStart.getTime() + last.duration_minutes * 60000
      );

      // Only overlap WITHIN the same time window
      if (lastEnd <= start || end <= lastStart) {
        col.push(event);
        placed = true;
        break;
      }
    }

    if (!placed) {
      columns.push([event]);
    }
  });

  return columns;
}

export default function TimelineView({ events, gaps, onGapClick }) {
  const columns = useMemo(() => computeColumns(events), [events]);

  const [nowPos, setNowPos] = useState(null);

  useEffect(() => {
    function update() {
      const now = new Date();
      const minutes = now.getHours() * 60 + now.getMinutes();
      setNowPos(minutes);
    }
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="card timeline">
      <h2>Day Timeline</h2>

      <div className="timeline-grid">

        {/* GAP BLOCKS */}
        {gaps.map((g, idx) => {
          const start = new Date(g.start_time || g.start);
          const top = start.getHours() * 60 + start.getMinutes();

          return (
            <button
              key={idx}
              className="gap-block"
              style={{ top: `${top}px` }}
              onClick={() =>
                onGapClick({
                  ...g,
                  start_time: g.start_time || g.start,
                  end_time: g.end_time || g.end,
                })
              }
            >
              Gap: {g.duration_minutes} min
            </button>
          );
        })}

        {/* RED NOW LINE */}
        {nowPos !== null && (
          <div className="now-line" style={{ top: `${nowPos}px` }} />
        )}

        {/* EVENT COLUMNS */}
        {columns.map((col, colIndex) => (
          <div
            className="timeline-column"
            key={colIndex}
            style={{ width: `${100 / columns.length}%` }}
          >
            {col.map((e) => {
              const start = new Date(e.start || e.start_time);
              const top = start.getHours() * 60 + start.getMinutes();

              return (
                <div
                  key={e.id}
                  className={`timeline-block ${e.is_meal ? "meal" : ""}`}
                  style={{
                    top: `${top}px`,
                    height: `${e.duration_minutes}px`,
                  }}
                >
                  <span className="time">
                    {start.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="label">{e.title}</span>
                </div>
              );
            })}
          </div>
        ))}

      </div>
    </div>
  );
}


