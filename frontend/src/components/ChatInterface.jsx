import { useState, useRef, useEffect } from 'react';
import { Send, FileText, Menu, Paperclip, Loader } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

export default function ChatInterface({ onToggleSidebar }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI Knowledge Assistant. Upload some documents on the left, and ask me anything about them.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isUploading]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = async (e) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    const validFiles = Array.from(selectedFiles).filter(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      return ['pdf', 'docx', 'txt'].includes(ext);
    });

    if (validFiles.length === 0) {
      alert('Only PDF, DOCX, and TXT files are supported.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    validFiles.forEach(file => formData.append('files', file));

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      await axios.post(`${apiUrl}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Tell sidebar to refresh
      window.dispatchEvent(new Event('document-uploaded'));
      
      // Add a system message notifying success
      setMessages(prev => [...prev, {
        role: 'system',
        content: `✅ Successfully uploaded ${validFiles.length} document(s). You can now ask questions about them.`
      }]);
    } catch (error) {
      console.error("Upload error:", error);
      alert(error.response?.data?.detail || 'Failed to upload documents.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { role: 'user', content: inputValue.trim() };
    const currentHistory = [...messages, userMessage];
    
    setMessages(currentHistory);
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    setIsLoading(true);

    try {
      const historyToSend = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await axios.post(`${apiUrl}/chat`, {
        query: userMessage.content,
        history: historyToSend
      });

      setMessages([
        ...currentHistory,
        { 
          role: 'assistant', 
          content: response.data.answer,
          sources: response.data.sources 
        }
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages([
        ...currentHistory,
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error communicating with the backend. Please ensure the server is running.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container glass-panel">
      <div className="chat-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="menu-button mobile-only" onClick={onToggleSidebar} aria-label="Toggle Sidebar">
          <Menu size={24} />
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Chat Context</h2>
          <p style={{ margin: 0, fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Ask questions and receive context-aware answers.
          </p>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message-row ${msg.role}`}>
            {msg.role === 'system' ? (
              <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--success)', margin: '1rem 0' }}>
                {msg.content}
              </div>
            ) : (
              <div className="message-bubble">
                {msg.role === 'user' ? (
                  <p style={{ margin: 0 }}>{msg.content}</p>
                ) : (
                  <div className="markdown-body">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
                
                {msg.sources && msg.sources.length > 0 && (
                  <div className="sources-container">
                    <div className="sources-title">
                      <FileText size={14} /> Sources
                    </div>
                    <div className="source-badges">
                      {msg.sources.map((source, sIdx) => (
                        <span key={sIdx} className="source-badge">
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {(isLoading || isUploading) && (
          <div className="message-row assistant">
            <div className="message-bubble" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isUploading && <Loader size={16} className="spin" />}
                {isUploading ? <span style={{ fontSize: '0.875rem' }}>Uploading document...</span> : (
                  <div className="typing-indicator">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <input 
            type="file" 
            multiple 
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileSelect}
            accept=".pdf,.docx,.txt"
          />
          <button 
            className="attach-button" 
            onClick={() => fileInputRef.current?.click()}
            title="Upload Document"
            disabled={isUploading}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-md)',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <Paperclip size={20} />
          </button>

          <textarea
            ref={textareaRef}
            className="chat-input"
            placeholder="Ask a question about your documents..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading || isUploading}
            style={{ flex: 1 }}
          />
          <button 
            className="send-button" 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading || isUploading}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
