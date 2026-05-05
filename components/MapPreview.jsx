import React from "react";


export default function MapPreview({ mapUrl }) {
  if (!mapUrl) {
    return <p>No map available</p>;
  }

  return (
    <div style={{ textAlign: "center", marginTop: "1rem" }}>
      <img
        src={mapUrl}
        alt="Nearby places map"
        style={{ width: "100%", maxWidth: "600px", borderRadius: "8px" }}
      />
    </div>
  );
}
