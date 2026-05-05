import React, { useEffect, useState } from "react";
import {
  fetchEvents,
  createEvent,
  deleteEvent,
  fetchGaps,
  fetchRecommendations,
} from "./api/client";
import TimelineView from "./components/TimelineView";
import EventForm from "./components/EventForm";
import EventList from "./components/EventList";
import GapRecommendations from "./components/GapRecommendations";
import PreferencesPanel from "./components/PreferencePanel";

export default function App() {
  const [day, setDay] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [gaps, setGaps] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [preferences, setPreferences] = useState({
    meal_themes: [],
    max_walk_minutes: 20,
    sponsored_weight: 0.5,
  });

  const [selectedGap, setSelectedGap] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [mapUrl, setMapUrl] = useState(null);

  const [editingEvent, setEditingEvent] = useState(null);

  const [userLocation, setUserLocation] = useState(null);

  const dayIso = day.toISOString().slice(0, 10);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation(`${latitude},${longitude}`);
      },
      (err) => console.warn("Geolocation error:", err)
    );
  }, []);

  async function loadDay() {
    const ev = await fetchEvents(dayIso);
    setEvents(ev);

    const gapData = await fetchGaps(dayIso);
    setGaps(gapData.gaps || []);
    setConflicts(gapData.conflicts || []);
  }

  useEffect(() => {
    loadDay();
  }, [dayIso]);

  async function handleAddEvent(eventData) {
    await createEvent(eventData);
    await loadDay();
  }

  async function handleDeleteEvent(id) {
    await deleteEvent(id);
    await loadDay();
  }

  function handleEdit(event) {
    setEditingEvent(event);
  }

  async function handleUpdateEvent(eventData) {
    await fetch(`http://localhost:8000/events/${eventData.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    });

    setEditingEvent(null);
    await loadDay();
  }

  async function handleGapClick(gap) {
    setSelectedGap(gap);

    const payload = {
      gap_start: gap.start_time,
      gap_end: gap.end_time,
      user_location: userLocation,
      meal_themes: preferences.meal_themes,
      max_walk_minutes: preferences.max_walk_minutes,
      sponsored_weight: preferences.sponsored_weight,
    };

    try {
      const response = await fetchRecommendations(payload);

      const recs =
        (response && response.recommendations) ||
        (Array.isArray(response) ? response : []);

      setRecommendations(recs);
      setMapUrl(response.map_url || null);
    } catch (err) {
      console.error("Recommendation error:", err);
      setRecommendations([]);
      setMapUrl(null);
    }
  }

  return (
    <div className="app">
      <header>
        <h1>DayPilot</h1>
        <input
          type="date"
          value={day.toISOString().slice(0, 10)}
          onChange={(e) => setDay(new Date(e.target.value))}
        />
      </header>

      <div className="layout">
        <div className="left-panel">
          <EventForm
            onSubmit={editingEvent ? handleUpdateEvent : handleAddEvent}
            initial={editingEvent}
          />

          <PreferencesPanel
            preferences={preferences}
            onChange={setPreferences}
          />

          <EventList
            events={events}
            onDelete={handleDeleteEvent}
            onEdit={handleEdit}
            conflicts={conflicts}
          />
        </div>

        <div className="right-panel">
          <TimelineView
            events={events}
            gaps={gaps}
            onGapClick={handleGapClick}
          />

          <GapRecommendations
            gap={selectedGap}
            recommendations={recommendations}
            mapUrl={mapUrl}
          />
        </div>
      </div>
    </div>
  );
}
