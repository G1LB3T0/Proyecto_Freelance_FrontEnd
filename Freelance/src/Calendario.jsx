import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import '@fullcalendar/daygrid/main.css';

export default function Calendario() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Usar eventos simulados directamente sin conexión al backend
    const mockEvents = [
      { title: 'App Móvil Fitness ⚠️', date: '2025-06-02' },
      { title: 'Dashboard Analytics 📅', date: '2025-06-11' },
      { title: 'Blog Personal ✅', date: '2025-06-28' }
    ];
    setEvents(mockEvents);
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="auto"
      />
    </div>
  );
}
