import { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import axios from 'axios';

export default function DocumentUploader({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(null);
  const fileInputRef = useRef(null);

  const fetchDocuments = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await axios.get(`${apiUrl}/documents`);
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    }
  };

  useEffect(() => {
    fetchDocuments();
    
    // Listen for uploads from the chat interface
    const handleDocumentUploaded = () => {
      fetchDocuments();
    };
    
    window.addEventListener('document-uploaded', handleDocumentUploaded);
    
    return () => {
      window.removeEventListener('document-uploaded', handleDocumentUploaded);
    };
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const deleteDocument = async (filename) => {
    if (!window.confirm(`Are you sure you want to delete ${filename}?`)) return;
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      await axios.delete(`${apiUrl}/documents/${encodeURIComponent(filename)}`);
      setDocuments(prev => prev.filter(doc => doc !== filename));
    } catch (error) {
      console.error("Failed to delete document:", error);
      alert("Failed to delete document");
    }
  };

  const processFiles = async (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    const validFiles = Array.from(selectedFiles).filter(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      return ['pdf', 'docx', 'txt'].includes(ext);
    });

    if (validFiles.length === 0) {
      setUploadStatus({ type: 'error', message: 'Only PDF, DOCX, and TXT files are supported.' });
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    validFiles.forEach(file => formData.append('files', file));

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await axios.post(`${apiUrl}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setUploadStatus({ type: 'success', message: `Successfully processed ${validFiles.length} file(s).` });
      fetchDocuments(); // Refresh list after upload
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus({ 
        type: 'error', 
        message: error.response?.data?.detail || 'Failed to upload documents. Is the backend running?' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e) => {
    processFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="sidebar glass-panel">
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <UploadCloud size={24} className="file-icon" /> Knowledge Base
      </h2>
      
      <div 
        className={`upload-zone ${isDragging ? 'active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud className="upload-icon" />
        <div>
          <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-primary)' }}>
            Click or drag files to upload
          </p>
          <p style={{ margin: 0, fontSize: '0.8rem', marginTop: '0.25rem' }}>
            PDF, DOCX, TXT
          </p>
        </div>
        <input 
          type="file" 
          multiple 
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileSelect}
          accept=".pdf,.docx,.txt"
        />
      </div>

      {isUploading && (
        <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <div className="typing-indicator" style={{ justifyContent: 'center' }}>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
          <p>Processing documents...</p>
        </div>
      )}

      {uploadStatus && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem', 
          borderRadius: 'var(--radius-md)',
          backgroundColor: uploadStatus.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: uploadStatus.type === 'success' ? 'var(--success)' : 'var(--danger)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.5rem',
          fontSize: '0.875rem'
        }}>
          {uploadStatus.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{uploadStatus.message}</span>
        </div>
      )}

      <div className="file-list">
        {documents.length > 0 ? (
          <div>
            <h4 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Uploaded Files ({documents.length})
            </h4>
            {documents.map((docName, i) => (
              <div key={i} className="file-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                  <FileText size={18} className="file-icon" style={{ flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={docName}>
                    {docName}
                  </span>
                </div>
                <button 
                  onClick={() => deleteDocument(docName)}
                  style={{ 
                    background: 'none', border: 'none', cursor: 'pointer', 
                    color: 'var(--danger)', padding: '0.25rem', opacity: 0.7 
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
                  title="Delete Document"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem', fontSize: '0.875rem' }}>
            No documents uploaded yet.<br/>Upload some to start chatting!
          </div>
        )}
      </div>
    </div>
  );
}
