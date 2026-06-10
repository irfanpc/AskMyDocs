import { useState } from 'react';
import DocumentUploader from './components/DocumentUploader';
import ChatInterface from './components/ChatInterface';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app-container">
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}
      
      <div className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
        <DocumentUploader />
      </div>
      
      <ChatInterface onToggleSidebar={toggleSidebar} />
    </div>
  );
}

export default App;
