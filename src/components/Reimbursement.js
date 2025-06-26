// src/components/Reimbursement.js
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import api from '../api';

const Reimbursement = () => {
  const [courseId, setCourseId] = useState('');
  const [detail, setDetail] = useState('');
  const [currentDesk, setCurrentDesk] = useState('');
  const [reimbursements, setReimbursements] = useState([]);
  const history = useHistory();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) history.push('/login');
    if (userId) api.getReimbursements(userId).then((res) => setReimbursements(res.data));
  }, [history]);

  const handleRequest = (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('User not logged in');
      return;
    }
    api.requestReimbursement({ course_id: courseId, detail, current_desk: currentDesk, requested_by: userId })
      .then(() => {
        alert('Reimbursement requested');
        api.getReimbursements(userId).then((res) => setReimbursements(res.data));
        setCourseId('');
        setDetail('');
        setCurrentDesk('');
      })
      .catch((error) => alert('Request failed: ' + error.response?.data?.error || error.message));
  };

  return (
    <div>
      <h2>Request Reimbursement</h2>
      <form onSubmit={handleRequest}>
        <input type="text" value={courseId} onChange={(e) => setCourseId(e.target.value)} placeholder="Course ID" required />
        <input type="text" value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Detail" required />
        <input type="text" value={currentDesk} onChange={(e) => setCurrentDesk(e.target.value)} placeholder="Current Desk" required />
        <button type="submit">Submit Request</button>
      </form>
      <h3>Your Reimbursements</h3>
      <ul>
        {reimbursements.map((reimb) => (
          <li key={reimb.id}>
            {reimb.course_id} - {reimb.detail} (Status: {reimb.is_resolved ? 'Resolved' : 'Pending'})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Reimbursement;