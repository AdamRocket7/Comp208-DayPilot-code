import React, { useState, useEffect } from "react";

export default function EventForm({ onSubmit, initial }) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [start, setStart] = useState("");
  const [duration, setDuration] = useState(60);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState("WEEKLY");
  const [isMeal, setIsMeal] = useState(false);
  const [mealTheme, setMealTheme] = useState("");
  const [arriveEarly, setArriveEarly] = useState(5);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState(30);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title);
      setLocation(initial.location);
      setStart(initial.start_time.slice(0, 16));
      setDuration(initial.duration_minutes);
      setIsRecurring(initial.is_recurring);
      setRecurrenceRule(initial.recurrence_rule || "WEEKLY");
      setIsMeal(initial.is_meal);
      setMealTheme(initial.meal_theme || "");
      setArriveEarly(initial.arrive_early_minutes);
      setNotificationsEnabled(initial.notifications_enabled);
      setReminderMinutes(initial.reminder_minutes_before);
    }
  }, [initial]);

  function handleSubmit(e) {
    e.preventDefault();

    onSubmit({
      id: initial?.id,
      title,
      location,
      start_time: new Date(start).toISOString(),
      duration_minutes: Number(duration),
      is_recurring: isRecurring,
      recurrence_rule: isRecurring ? recurrenceRule : null,
      is_meal: isMeal,
      meal_theme: isMeal ? mealTheme : null,
      arrive_early_minutes: Number(arriveEarly),
      notifications_enabled: notificationsEnabled,
      reminder_minutes_before: Number(reminderMinutes),
    });

    if (!initial) {
      setTitle("");
      setLocation("");
      setStart("");
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>{initial ? "Edit Event" : "Add Event"}</h2>

      <label>
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>

      <label>
        Location
        <input value={location} onChange={(e) => setLocation(e.target.value)} required />
      </label>

      <label>
        Start time
        <input
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          required
        />
      </label>

      <label>
        Duration (minutes)
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          min="5"
        />
      </label>

      <label>
        Arrive early (minutes)
        <input
          type="number"
          value={arriveEarly}
          onChange={(e) => setArriveEarly(e.target.value)}
          min="0"
        />
      </label>

      <label>
        Recurring?
        <input
          type="checkbox"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
        />
      </label>

      {isRecurring && (
        <label>
          Recurrence rule
          <select
            value={recurrenceRule}
            onChange={(e) => setRecurrenceRule(e.target.value)}
          >
            <option value="WEEKLY">Weekly</option>
            <option value="DAILY">Daily</option>
          </select>
        </label>
      )}

      <label>
        Is meal?
        <input
          type="checkbox"
          checked={isMeal}
          onChange={(e) => setIsMeal(e.target.checked)}
        />
      </label>

      {isMeal && (
        <label>
          Meal theme
          <input
            value={mealTheme}
            onChange={(e) => setMealTheme(e.target.value)}
            placeholder="Italian, Korean..."
          />
        </label>
      )}

      <label>
        Enable notification
        <input
          type="checkbox"
          checked={notificationsEnabled}
          onChange={(e) => setNotificationsEnabled(e.target.checked)}
        />
      </label>

      {notificationsEnabled && (
        <label>
          Reminder (minutes before)
          <input
            type="number"
            value={reminderMinutes}
            onChange={(e) => setReminderMinutes(e.target.value)}
            min="1"
          />
        </label>
      )}

      <button type="submit">{initial ? "Save Changes" : "Add"}</button>
    </form>
  );
}
