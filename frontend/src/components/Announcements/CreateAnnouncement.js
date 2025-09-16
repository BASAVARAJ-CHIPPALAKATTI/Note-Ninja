import React, { useState } from 'react';
import { announcementApi } from '../../services/api';
import './Announcements.css';

const CreateAnnouncement = ({ onAnnouncementCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'medium',
    expiresIn: '7'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await announcementApi.createAnnouncement(formData);
      setFormData({ title: '', message: '', priority: 'medium', expiresIn: '7' });
      onAnnouncementCreated?.();
      alert('Announcement created successfully!');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-announcement">
      <h3>📝 Create New Announcement</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="Enter announcement title"
          />
        </div>

        <div className="form-group">
          <label>Message *</label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
            placeholder="Enter your announcement message"
            rows="4"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="form-group">
            <label>Expires in (days)</label>
            <select
              value={formData.expiresIn}
              onChange={(e) => setFormData({ ...formData, expiresIn: e.target.value })}
            >
              <option value="1">1 day</option>
              <option value="3">3 days</option>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
            </select>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Announcement'}
        </button>
      </form>
    </div>
  );
};

export default CreateAnnouncement;