import React from "react";
import MapPreview from "./MapPreview";

export default function GapRecommendations({ gap, recommendations, mapUrl }) {
  const apiKey = import.meta.env.VITE_GEOAPIFY_KEY;

  if (!gap) {
    return (
      <div className="card">
        <h2>Recommendations</h2>
        <p>Select a gap to see suggestions.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Recommendations for gap ({gap.duration_minutes} min)</h2>

      {/* STATIC MAP PREVIEW */}
      <MapPreview mapUrl={mapUrl} />

      {(!recommendations || recommendations.length === 0) && (
        <p>No feasible options found.</p>
      )}

      <ul className="rec-list">
        {recommendations.map((rec, idx) => {
          const lat = rec.lat;
          const lng = rec.lng;

          return (
            <li key={idx} className="rec-item">

              {/* RESTAURANT */}
              {(!rec.type || rec.type === "restaurant") && (
                <>
                  <div className="rec-header">
                    <strong>{rec.name}</strong>

                    {rec.sponsor_boost > 0 && (
                      <span className="badge">Sponsored</span>
                    )}
                  </div>

                  <div className="rec-distance">
                    {rec.distance_minutes !== null
                      ? `${rec.distance_minutes} min walk`
                      : "Distance unknown"}
                  </div>

                  <div className="rec-address">{rec.address}</div>

                  <div>Rating: {rec.rating?.toFixed(1)}/5</div>


                  <button
                    onClick={() =>
                      window.open(
                        `https://map.geoapify.com/v1/map?marker=lonlat:${lng},${lat}&apiKey=${apiKey}`,
                        "_blank"
                      )
                    }
                  >
                    View on Map
                  </button>
                </>
              )}
              {rec.type === "route" && (
                <>
                  <strong>Walking Route</strong>
                  <div>Duration: {rec.duration_minutes} minutes</div>

                  <button
                    onClick={() =>
                      window.open(
                        `https://map.geoapify.com/v1/routing?waypoints=${rec.from}|${rec.to}&mode=walk&apiKey=${apiKey}`,
                        "_blank"
                      )
                    }
                  >
                    Open Route
                  </button>
                </>
              )}

            </li>
          );
        })}
      </ul>
    </div>
  );
}
