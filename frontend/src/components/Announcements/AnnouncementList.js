import React, { useState, useEffect } from 'react';
import { announcementApi } from '../../services/api';
import './Announcements.css';

const AnnouncementList = ({ userRole }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await announcementApi.getAnnouncements();
      setAnnouncements(response.data.announcements);
    } catch (error) {
      setError('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading announcements...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="announcements-container">
      <h3>📢 Announcements</h3>
      {announcements.length === 0 ? (
        <p className="no-announcements">No announcements yet.</p>
      ) : (
        <div className="announcements-list">
          {announcements.map(announcement => (
            <div key={announcement._id} className={`announcement-card priority-${announcement.priority}`}>
              <div className="announcement-header">
                <h4>{announcement.title}</h4>
                <span className="priority-badge">{announcement.priority}</span>
              </div>
              <p className="announcement-message">{announcement.message}</p>
              <div className="announcement-footer">
                <span className="teacher-name">By: {announcement.teacher?.name}</span>
                <span className="announcement-date">
                  {new Date(announcement.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementList;