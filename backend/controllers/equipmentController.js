const db = require('../config/db');
const { parseISO, isWithinInterval } = require('date-fns');

exports.getLabs = (req, res) => {
  db.all(`SELECT id, name FROM labs`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch labs: ' + err.message });
    res.json(rows);
  });
};

exports.getInstruments = async (req, res) => {
  const { lab_id } = req.params;
  try {
    // Fetch instruments grouped by instrument_name, taking the minimum instrument_id
    const instruments = await new Promise((resolve, reject) => {
      db.all(
        `SELECT MIN(i.instrument_id) as instrument_id, i.lab_id, i.instrument_name, 
                MAX(i.is_working) as is_working, l.name AS lab_name,
                (SELECT COUNT(*) FROM instruments i2 WHERE i2.instrument_name = i.instrument_name AND i2.lab_id = i.lab_id AND i2.is_working = 1) as total_instruments
         FROM instruments i 
         JOIN labs l ON i.lab_id = l.id 
         WHERE i.lab_id = ?
         GROUP BY i.instrument_name, i.lab_id, l.name`,
        [lab_id],
        (err, rows) => (err ? reject(err) : resolve(rows))
      );
    });
    console.log('Instruments fetched for lab_id', lab_id, ':', instruments);
    if (!instruments.length) {
      console.log('No instruments found for lab_id:', lab_id);
      return res.json([]);
    }

    const slotRanges = [
      { startHour: 10, endHour: 12 },
      { startHour: 12, endHour: 14 },
      { startHour: 14, endHour: 16 },
      { startHour: 16, endHour: 18 },
    ];
    const availabilityDays = 5;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const instrumentsWithAvailability = await Promise.all(
      instruments.map(async (instrument, index) => {
        const availability = [];
        // Get all instrument_ids for this instrument_name
        const instrumentIds = await new Promise((resolve, reject) => {
          db.all(
            `SELECT instrument_id 
             FROM instruments 
             WHERE instrument_name = ? AND lab_id = ? AND is_working = 1`,
            [instrument.instrument_name, instrument.lab_id],
            (err, rows) => (err ? reject(err) : resolve(rows.map(row => row.instrument_id)))
          );
        });
        for (let i = 0; i < availabilityDays; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          const dateStr = date.toISOString().split('T')[0];
          const slots = await Promise.all(
            slotRanges.map(async (range, slotIndex) => {
              const slotStart = new Date(date);
              slotStart.setUTCHours(range.startHour, 0, 0, 0);
              const slotEnd = new Date(date);
              slotEnd.setUTCHours(range.endHour, 0, 0, 0);
              const slotStartISO = slotStart.toISOString().split('.')[0] + 'Z';
              const slotEndISO = slotEnd.toISOString().split('.')[0] + 'Z';
              const booked = await new Promise((resolve, reject) => {
                db.get(
                  `SELECT COUNT(*) as booked 
                   FROM slot_bookings sb
                   JOIN instruments i ON sb.instrument_id = i.instrument_id
                   WHERE i.instrument_name = ? 
                   AND i.lab_id = ?
                   AND sb.slot >= ? 
                   AND sb.slot < ? 
                   AND sb.status IN ('pending', 'approved')`,
                  [instrument.instrument_name, instrument.lab_id, slotStartISO, slotEndISO],
                  (err, row) => (err ? reject(err) : resolve(row.booked))
                );
              });
              const total = instrument.is_working ? instrument.total_instruments : 0; // One booking per instrument_id
              const available = total - booked;
              return {
                slotId: index * 100 + i * 10 + slotIndex + 1,
                time: `${range.startHour}:00-${range.endHour}:00`,
                available: available < 0 ? 0 : available,
                total,
              };
            })
          );
          console.log(`Slots for instrument_name ${instrument.instrument_name} on ${dateStr}:`, slots);
          availability.push({ date: dateStr, slots });
        }
        return {
          instrument_id: instrument.instrument_id,
          lab_id: instrument.lab_id,
          instrument_name: instrument.instrument_name,
          is_working: instrument.is_working,
          total: instrument.is_working ? instrument.total_instruments : 0,
          lab_name: instrument.lab_name,
          availability,
        };
      })
    );

    console.log('Instruments with availability:', instrumentsWithAvailability);
    res.json(instrumentsWithAvailability);
  } catch (err) {
    console.error('Error fetching instruments:', err.message);
    res.status(500).json({ error: 'Failed to fetch instruments: ' + err.message });
  }
};

exports.bookSlot = async (req, res) => {
  const { lab_id, lab_name, instrument_name, slot, requested_by } = req.body;
  console.log('Received booking request:', req.body);
  try {
    // Validate required fields
    if (!lab_id || !lab_name || !instrument_name || !slot || !requested_by) {
      return res.status(400).json({ error: 'All fields (lab_id, lab_name, instrument_name, slot, requested_by) are required.' });
    }

    // Verify at least one instrument exists and is working
    const instrument = await new Promise((resolve, reject) => {
      db.get(
        `SELECT lab_id, is_working 
         FROM instruments 
         WHERE instrument_name = ? AND lab_id = ? AND is_working = 1
         ORDER BY instrument_id ASC
         LIMIT 1`,
        [instrument_name, lab_id],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });
    if (!instrument) {
      return res.status(400).json({ error: 'No working instrument found for the specified name and lab.' });
    }
    if (instrument.lab_id !== lab_id) {
      return res.status(400).json({ error: 'Instrument does not belong to the specified lab.' });
    }

    // Get supervisor from labs table
    const lab = await new Promise((resolve, reject) => {
      db.get(
        `SELECT supervisor FROM labs WHERE id = ?`,
        [lab_id],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });
    if (!lab || !lab.supervisor) {
      return res.status(400).json({ error: 'Lab not found or no supervisor assigned.' });
    }

    // Get supervisor's user ID from users table
    const supervisorUser = await new Promise((resolve, reject) => {
      db.get(
        `SELECT id FROM users WHERE username = ?`,
        [lab.supervisor],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });
    if (!supervisorUser) {
      return res.status(400).json({ error: `Supervisor ${lab.supervisor} not found in users.` });
    }

    // Parse slot as ISO 8601 string
    const slotDate = parseISO(slot);
    if (isNaN(slotDate.getTime())) {
      return res.status(400).json({ error: 'Invalid slot format. Must be ISO 8601 (e.g., 2025-06-25T10:00:00Z).' });
    }

    // Validate slot time within ranges
    const slotHour = slotDate.getUTCHours();
    const slotMinute = slotDate.getUTCMinutes();
    const slotSecond = slotDate.getUTCSeconds();
    console.log('Parsed slot:', slot, 'slotHour:', slotHour, 'slotMinute:', slotMinute, 'slotSecond:', slotSecond);

    const slotRanges = [
      { startHour: 10, endHour: 12 },
      { startHour: 12, endHour: 14 },
      { startHour: 14, endHour: 16 },
      { startHour: 16, endHour: 18 },
    ];
    const validSlot = slotRanges.some((range) => {
      const start = new Date(slotDate);
      start.setUTCHours(range.startHour, 0, 0, 0);
      const end = new Date(slotDate);
      end.setUTCHours(range.endHour, 0, 0, 0);
      return isWithinInterval(slotDate, { start, end });
    });

    if (!validSlot) {
      return res.status(400).json({ error: `Invalid slot time. Must be one of: ${slotRanges.map(r => `${r.startHour}:00-${r.endHour}:00`).join(', ')}.` });
    }

    // Adjust slot to start of the 2-hour window
    const slotStart = new Date(slotDate);
    slotStart.setUTCHours(slotHour, 0, 0, 0);
    const slotEnd = new Date(slotDate);
    slotEnd.setUTCHours(slotHour + 2, 0, 0, 0);
    const slotStartISO = slotStart.toISOString().split('.')[0] + 'Z';
    const slotEndISO = slotEnd.toISOString().split('.')[0] + 'Z';

    // Check availability across all instrument_ids for this instrument_name
    const total = await new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as total 
         FROM instruments 
         WHERE instrument_name = ? AND lab_id = ? AND is_working = 1`,
        [instrument_name, lab_id],
        (err, row) => (err ? reject(err) : resolve(row.total))
      );
    });
    const booked = await new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as booked 
         FROM slot_bookings sb
         JOIN instruments i ON sb.instrument_id = i.instrument_id
         WHERE i.instrument_name = ? 
         AND i.lab_id = ?
         AND sb.slot >= ? 
         AND sb.slot < ? 
         AND sb.status IN ('pending', 'approved')`,
        [instrument_name, lab_id, slotStartISO, slotEndISO],
        (err, row) => (err ? reject(err) : resolve(row.booked))
      );
    });
    const available = total - booked;
    if (available <= 0) {
      return res.status(400).json({ error: 'Slot not available' });
    }

    // Select the first available instrument_id (lowest ID) with no bookings in the slot
    const availableInstrumentId = await new Promise((resolve, reject) => {
      db.get(
        `SELECT i.instrument_id
         FROM instruments i
         WHERE i.instrument_name = ? AND i.lab_id = ? AND i.is_working = 1
         AND NOT EXISTS (
           SELECT 1 
           FROM slot_bookings sb 
           WHERE sb.instrument_id = i.instrument_id 
           AND sb.slot >= ? 
           AND sb.slot < ? 
           AND sb.status IN ('pending', 'approved')
         )
         ORDER BY i.instrument_id ASC
         LIMIT 1`,
        [instrument_name, lab_id, slotStartISO, slotEndISO],
        (err, row) => (err ? reject(err) : resolve(row ? row.instrument_id : null))
      );
    });

    if (!availableInstrumentId) {
      return res.status(400).json({ error: 'No available instrument for this slot.' });
    }

    const bookingId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO slot_bookings (lab_name, instrument_id, slot, status, requested_by, requested_to) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [lab_name, availableInstrumentId, slotStartISO, 'pending', requested_by, supervisorUser.id],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    res.status(201).json({ message: 'Slot booked as pending', bookingId });
  } catch (err) {
    console.error('Booking error:', err.message);
    res.status(500).json({ error: 'Booking failed: ' + err.message });
  }
};