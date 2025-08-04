import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, FileText, Calendar, Edit, Save, X } from 'lucide-react';
import { candidateService } from '../services/candidateService';
import { Candidate } from '../types/candidate';

interface CandidateDetailProps {
  candidateId: string;
  onBack: () => void;
}

export function CandidateDetail({ candidateId, onBack }: CandidateDetailProps) {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    alias_name: '',
    email: '',
    phone: '',
    current_title: '',
    manager: '',
    employee_id: '',
    education: '',
    skills: '',
    summary: '',
    location: '',
  });

  useEffect(() => {
    loadCandidate();
  }, [candidateId]);

  const loadCandidate = () => {
    setLoading(true);
    const data = candidateService.getCandidateById(candidateId);
    setCandidate(data);
    
    if (data) {
      setEditForm({
        full_name: data.full_name,
        alias_name: data.alias_name || '',
        email: data.email,
        phone: data.phone,
        current_title: data.current_title,
        manager: data.manager || '',
        employee_id: data.employee_id || '',
        education: data.education,
        skills: data.skills.join(', '),
        summary: data.summary,
        location: data.location,
      });
    }
    
    setLoading(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (candidate) {
      setEditForm({
        full_name: candidate.full_name,
        alias_name: candidate.alias_name || '',
        email: candidate.email,
        phone: candidate.phone,
        current_title: candidate.current_title,
        manager: candidate.manager || '',
        employee_id: candidate.employee_id || '',
        education: candidate.education,
        skills: candidate.skills.join(', '),
        summary: candidate.summary,
        location: candidate.location,
      });
    }
  };

  const handleSave = async () => {
    if (!candidate) return;

    try {
      const updatedCandidate = await candidateService.updateCandidate(candidate.id, {
        ...editForm,
        skills: editForm.skills.split(',').map(s => s.trim()).filter(s => s),
      });

      if (updatedCandidate) {
        setCandidate(updatedCandidate);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating candidate:', error);
      alert('Error updating candidate. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDisplayName = (candidate: Candidate) => {
    if (candidate.alias_name) {
      return `${candidate.alias_name} (${candidate.full_name})`;
    }
    return candidate.full_name;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-1">Candidate not found</h3>
          <p className="text-gray-600 mb-4">The candidate you're looking for doesn't exist.</p>
          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Candidates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Candidates
        </button>
        
        <div className="flex items-center space-x-3">
          {candidate.cv_filepath && (
            <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
              <FileText className="w-3 h-3 mr-1" />
              CV Available
            </span>
          )}
          <span className={`inline-flex items-center px-3 py-1 text-sm rounded-full ${
            candidate.source === 'upload' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {candidate.source === 'upload' ? 'CV Upload' : 'Manual Entry'}
          </span>
          
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="inline-flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Candidate Profile */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                  className="text-2xl font-bold bg-transparent border-b-2 border-white/50 focus:border-white outline-none text-white placeholder-white/70"
                  placeholder="Full Name"
                />
              ) : (
                <h1 className="text-2xl font-bold mb-2">{candidate.full_name}</h1>
              )}
              
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.current_title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, current_title: e.target.value }))}
                  className="text-lg bg-transparent border-b border-white/50 focus:border-white outline-none text-white/90 placeholder-white/60"
                  placeholder="Current Title"
                />
              ) : (
                <p className="text-lg text-blue-100">{candidate.current_title || 'No title specified'}</p>
              )}
            </div>
            
            {candidate.cv_filepath && (
              <div className="text-right">
                <p className="text-sm text-blue-100 mb-1">CV File:</p>
                <p className="text-sm font-medium">{candidate.cv_filepath}</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="px-6 py-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              {isEditing ? (
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <span className="text-gray-700">{candidate.email}</span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-400" />
              {isEditing ? (
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Phone number"
                />
              ) : (
                <span className="text-gray-700">{candidate.phone || 'Not provided'}</span>
              )}
            </div>
            
            <div className="flex items-center space-x-3 md:col-span-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Location"
                />
              ) : (
                <span className="text-gray-700">{candidate.location || 'Not provided'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Professional Summary */}
        <div className="px-6 py-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Summary</h2>
          {isEditing ? (
            <textarea
              value={editForm.summary}
              onChange={(e) => setEditForm(prev => ({ ...prev, summary: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Professional summary..."
            />
          ) : (
            <p className="text-gray-700 leading-relaxed">
              {candidate.summary || 'No summary provided'}
            </p>
          )}
        </div>

        {/* Skills */}
        <div className="px-6 py-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills</h2>
          {isEditing ? (
            <textarea
              value={editForm.skills}
              onChange={(e) => setEditForm(prev => ({ ...prev, skills: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Skills (comma-separated)"
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {candidate.skills.length > 0 ? (
                candidate.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">No skills listed</span>
              )}
            </div>
          )}
        </div>

        {/* Education */}
        <div className="px-6 py-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Education</h2>
          {isEditing ? (
            <textarea
              value={editForm.education}
              onChange={(e) => setEditForm(prev => ({ ...prev, education: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Education details..."
            />
          ) : (
            <p className="text-gray-700 leading-relaxed">
              {candidate.education || 'No education information provided'}
            </p>
          )}
        </div>

        {/* Metadata */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Added: {formatDate(candidate.created_at)}</span>
              </div>
              {candidate.updated_at !== candidate.created_at && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Updated: {formatDate(candidate.updated_at)}</span>
                </div>
              )}
            </div>
            <span className="text-xs text-gray-500">ID: {candidate.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}