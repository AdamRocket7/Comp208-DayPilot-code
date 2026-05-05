import React, { useState } from "react";

export default function PreferencesPanel({ preferences, onChange }) {
  const [themesInput, setThemesInput] = useState(
    preferences.meal_themes.join(", ")
  );

  function handleSave(e) {
    e.preventDefault();
    const themes = themesInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onChange({
      ...preferences,
      meal_themes: themes,
    });
  }

  return (
    <form className="card" onSubmit={handleSave}>
      <h2>Preferences</h2>
      <label>
        Meal themes (comma-separated)
        <input
          value={themesInput}
          onChange={(e) => setThemesInput(e.target.value)}
          placeholder="Italian, Korean, Cafe"
        />
      </label>
      <label>
        Max walk minutes
        <input
          type="number"
          value={preferences.max_walk_minutes}
          onChange={(e) =>
            onChange({
              ...preferences,
              max_walk_minutes: Number(e.target.value),
            })
          }
        />
      </label>
      <label>
        Sponsor weight
        <input
          type="number"
          step="0.1"
          value={preferences.sponsored_weight}
          onChange={(e) =>
            onChange({
              ...preferences,
              sponsored_weight: Number(e.target.value),
            })
          }
        />
      </label>
      <button type="submit">Save</button>
    </form>
  );
}
