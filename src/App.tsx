import { useState } from 'react';
import CreateFestForm from './components/CreateFestForm';
import { FestFormData } from './types';
import './App.css';

function App() {
  const [showForm, setShowForm] = useState(true);
  const [editFestId, setEditFestId] = useState<string | undefined>();

  const handleFormSuccess = (fest: FestFormData) => {
    console.log('Fest saved successfully:', fest);
    // In a real app, you might navigate to a different page or refresh a list
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditFestId(undefined);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Socio - Campus Event Management</h1>
        <p className="app-subtitle">Create and manage your campus fest events</p>
      </header>

      <main className="app-main">
        {showForm ? (
          <CreateFestForm
            festId={editFestId}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        ) : (
          <div className="app-welcome">
            <div className="welcome-content">
              <h2>Welcome to Socio</h2>
              <p>Your campus event management system</p>
              <div className="welcome-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setEditFestId(undefined);
                    setShowForm(true);
                  }}
                >
                  Create New Fest
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    // Simulate editing an existing fest
                    setEditFestId('demo-fest-id');
                    setShowForm(true);
                  }}
                >
                  Edit Existing Fest (Demo)
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 Socio - Campus Event Management System</p>
      </footer>
    </div>
  );
}

export default App;