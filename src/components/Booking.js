// src/components/Booking.js
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import api from '../api';

const Booking = () => {
  const [labs, setLabs] = useState([]);
  const [selectedLab, setSelectedLab] = useState('');
  const [instruments, setInstruments] = useState([]);
  const history = useHistory();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) history.push('/login');
    api.getLabs().then((res) => setLabs(res.data));
  }, [history]);

  const handleLabChange = (e) => {
    const labId = e.target.value;
    setSelectedLab(labId);
    if (labId) {
      api.getInstruments(labId).then((res) => setInstruments(res.data));
    } else {
      setInstruments([]);
    }
  };

  const handleBook = (instrumentId, date) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('User not logged in');
      return;
    }
    const lab = labs.find((l) => l.id === parseInt(selectedLab));
    api.bookSlot({
      lab_name: lab.name,
      instrument_id: instrumentId,
      slot: `${date}T10:00:00`, // Example time slot
      requested_by: userId,
      requested_to: 1, // Replace with actual supervisor ID
    })
      .then(() => {
        alert('Slot booked as pending');
        handleLabChange({ target: { value: selectedLab } }); // Refresh
      })
      .catch((error) => alert('Booking failed: ' + error.response?.data?.error || error.message));
  };

  return (
    <div>
      <h2>Book Equipment</h2>
      <select onChange={handleLabChange} value={selectedLab}>
        <option value="">Select Lab</option>
        {labs.map((lab) => (
          <option key={lab.id} value={lab.id}>
            {lab.name}
          </option>
        ))}
      </select>
      {instruments.map((inst) => (
        <div key={inst.instrument_id}>
          <h3>{inst.instrument_name}</h3>
          {inst.availability.map((avail) => (
            <div key={avail.date}>
              <h4>{avail.date}</h4>
              <button onClick={() => handleBook(inst.instrument_id, avail.date)} disabled={avail.available === 0}>
                Book: {avail.available}/{avail.total} available
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Booking;