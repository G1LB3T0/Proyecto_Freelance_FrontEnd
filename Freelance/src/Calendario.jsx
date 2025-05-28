// Freelance/src/Calendario.jsx
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import '@fullcalendar/core/main.css';
import '@fullcalendar/daygrid/main.css';

export default function Calendario() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/projects-with-deadlines') // asegurate que esté disponible el backend
      .then(res => res.json())
      .then(data => {
        const mappedEvents = data.map(p => ({
          title: `${p.title} (${p.status})`,
          date: p.deadline
        }));
        setEvents(mappedEvents);
      })
      .catch(err => console.error('Error loading deadlines:', err));
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