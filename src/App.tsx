import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Users, FileText, Plus } from 'lucide-react';
import { CandidateList } from './components/CandidateList';
import { CandidateForm } from './components/CandidateForm';
import { CandidateDetail } from './components/CandidateDetail';
import { candidateService } from './services/candidateService';

type View = 'list' | 'add' | 'detail';

function App() {
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  useEffect(() => {
    // Initialize sample data on first load
    candidateService.initializeSampleData();
  }, []);

  const handleAddCandidate = () => {
    setCurrentView('add');
  };

  const handleViewCandidate = (id: string) => {
    setSelectedCandidateId(id);
    setCurrentView('detail');
  };

  const handleCandidateAdded = () => {
    setCurrentView('list');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedCandidateId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">HR Candidate Intake</h1>
                <p className="text-sm text-gray-600">Manage candidate applications and profiles</p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex items-center space-x-1">
              <button
                onClick={handleBackToList}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'list'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Candidates
              </button>
              <button
                onClick={handleAddCandidate}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'add'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add Candidate
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-6">
        {currentView === 'list' && (
          <CandidateList
            onAddCandidate={handleAddCandidate}
            onViewCandidate={handleViewCandidate}
          />
        )}
        
        {currentView === 'add' && (
          <CandidateForm onSuccess={handleCandidateAdded} />
        )}
        
        {currentView === 'detail' && selectedCandidateId && (
          <CandidateDetail
            candidateId={selectedCandidateId}
            onBack={handleBackToList}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>HR Candidate Intake Demo</span>
              <span>•</span>
              <span>Powered by React & TypeScript</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Mock API Endpoints:</span>
              <code className="px-2 py-1 bg-gray-100 rounded text-xs">POST /upload-cv</code>
              <code className="px-2 py-1 bg-gray-100 rounded text-xs">GET /candidates</code>
              <code className="px-2 py-1 bg-gray-100 rounded text-xs">POST /candidates</code>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;