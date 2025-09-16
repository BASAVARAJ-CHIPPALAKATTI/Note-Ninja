import React, { useState } from 'react';
import { pdfApi } from '../../services/api';

const PdfUpload = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a PDF file');
      return;
    }

    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('pdf', file);
    if (title) {
      formData.append('title', title);
    }

    try {
      const response = await pdfApi.upload(formData);
      setMessage('PDF uploaded successfully!');
      setFile(null);
      setTitle('');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pdf-upload">
      <h2>Upload PDF</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>PDF Title (optional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title for the PDF"
          />
        </div>

        <div className="form-group">
          <label>PDF File</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </div>

        {message && <div className="message">{message}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload PDF'}
        </button>
      </form>
    </div>
  );
};

export default PdfUpload;