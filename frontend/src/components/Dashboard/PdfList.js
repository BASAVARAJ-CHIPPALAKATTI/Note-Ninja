import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { pdfApi } from '../../services/api';

const PdfList = ({ onSelectPdf }) => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchPdfs();
  }, []);

  const fetchPdfs = async () => {
    try {
      const apiCall = user.role === 'teacher' 
        ? pdfApi.getTeacherPdfs 
        : pdfApi.getStudentPdfs;
      
      const response = await apiCall();
      setPdfs(response.data);
    } catch (error) {
      console.error('Failed to fetch PDFs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading PDFs...</div>;
  }

  return (
    <div className="pdf-list">
      {pdfs.length === 0 ? (
        <p>No PDFs available</p>
      ) : (
        pdfs.map(pdf => (
          <div key={pdf.id} className="pdf-item" onClick={() => onSelectPdf && onSelectPdf(pdf)}>
            <h3>{pdf.title}</h3>
            <p>Uploaded: {new Date(pdf.uploaded_at).toLocaleDateString()}</p>
            {onSelectPdf && <button>Ask Questions</button>}
          </div>
        ))
      )}
    </div>
  );
};

export default PdfList;