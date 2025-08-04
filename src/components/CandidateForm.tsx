import React, { useState, useEffect } from 'react';
import { Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { candidateService } from '../services/candidateService';
import { ParsedCandidateData } from '../types/candidate';

interface CandidateFormProps {
  onSuccess: () => void;
}

export function CandidateForm({ onSuccess }: CandidateFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedCandidateData | null>(null);
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
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
  const [isSaving, setIsSaving] = useState(false);

  // Check backend availability on component mount
  useEffect(() => {
    candidateService.checkBackendHealth().then(setBackendAvailable);
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF or DOCX file.');
      return;
    }

    setUploadedFile(file);
    setIsParsing(true);
    setParseError(null);

    try {
      const parsed = await candidateService.parseCV(file);
      console.log('Parsed data received:', parsed);
      setParsedData(parsed);
      
      // Pre-fill form with parsed data
      setFormData({
        full_name: parsed.full_name || '',
        alias_name: parsed.alias_name || '',
        email: parsed.email || '',
        phone: parsed.phone || '',
        current_title: parsed.current_title || '',
        manager: parsed.manager || '',
        employee_id: parsed.employee_id || '',
        education: parsed.education || '',
        skills: parsed.skills?.join(', ') || '',
        summary: parsed.summary || '',
        location: parsed.location || '',
      });
      
      setShowForm(true);
    } catch (error) {
      console.error('Error parsing CV:', error);
      setParseError(`Error parsing CV: ${error instanceof Error ? error.message : 'Unknown error'}. You can still fill the form manually.`);
      setShowForm(true);
      setParsedData({ auto_populated_fields: [] });
    } finally {
      setIsParsing(false);
    }
  };

  const handleManualEntry = () => {
    setShowForm(true);
    setParsedData({ auto_populated_fields: [] });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await candidateService.saveCandidate({
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        source: uploadedFile ? 'upload' : 'manual',
        cv_filepath: uploadedFile?.name,
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error saving candidate:', error);
      alert('Error saving candidate. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const isAutoPopulated = (field: string) => {
    return parsedData?.auto_populated_fields.includes(field) || false;
  };

  if (!showForm) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Add New Candidate</h2>
          <p className="text-gray-600">Upload a CV for automatic parsing or enter details manually</p>
        </div>

        <div className="space-y-6">
          {/* CV Upload Option */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            {parseError && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-amber-800">{parseError}</span>
                </div>
              </div>
            )}
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Upload CV</h3>
            <p className="text-gray-600 mb-4">
              Upload a PDF or DOCX file to automatically extract candidate information
              {backendAvailable === true ? (
                <span className="block text-sm text-green-600 mt-1">✓ Real CV parsing enabled</span>
              ) : backendAvailable === false ? (
                <span className="block text-sm text-amber-600 mt-1">⚠ Backend unavailable - using demo mode</span>
              ) : (
                <span className="block text-sm text-gray-500 mt-1">⏳ Checking backend status...</span>
              )}
            </p>
            
            {backendAvailable === false && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>To enable real CV parsing:</strong><br/>
                  1. Install Python dependencies: <code className="bg-blue-100 px-1 rounded">pip install -r requirements.txt</code><br/>
                  2. Start the backend: <code className="bg-blue-100 px-1 rounded">npm run dev:full</code>
                </p>
              </div>
            )}
            
            {parseError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-800">{parseError}</span>
                </div>
              </div>
            )}
            
            {isParsing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-blue-600">
                  {backendAvailable ? 'Parsing CV with real AI...' : 'Processing CV...'}
                </span>
              </div>
              ) : (
              <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors">
                <FileText className="w-4 h-4 mr-2" />
                Choose File
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Manual Entry Option */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="border-t border-gray-300 flex-1"></div>
              <span className="px-4 text-gray-500 text-sm">OR</span>
              <div className="border-t border-gray-300 flex-1"></div>
            </div>
            
            <button
              onClick={handleManualEntry}
              className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Enter Details Manually
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Candidate Information</h2>
        {uploadedFile && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FileText className="w-4 h-4" />
            <span>CV uploaded: {uploadedFile.name}</span>
          </div>
        )}
        {parsedData?.auto_populated_fields.length > 0 && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800">
                {parsedData.auto_populated_fields.length} fields auto-populated from CV
              </span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Personal Information</h3>
            
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-1">
                <span>Full Name *</span>
                {isAutoPopulated('full_name') && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
                    <Check className="w-3 h-3 mr-1" />
                    Auto-filled
                  </span>
                )}
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-1">
                <span>Alias/Preferred Name</span>
                {isAutoPopulated('alias_name') && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
                    <Check className="w-3 h-3 mr-1" />
                    Auto-filled
                  </span>
                )}
              </label>
              <input
                type="text"
                value={formData.alias_name}
                onChange={(e) => handleInputChange('alias_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nickname or preferred name"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-1">
                <span>Email *</span>
                {isAutoPopulated('email') && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
                    <Check className="w-3 h-3 mr-1" />
                    Auto-filled
                  </span>
                )}
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-1">
                <span>Phone</span>
                {isAutoPopulated('phone') && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
                    <Check className="w-3 h-3 mr-1" />
                    Auto-filled
                  </span>
                )}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-1">
                <span>Location</span>
                {isAutoPopulated('location') && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
                    <Check className="w-3 h-3 mr-1" />
                    Auto-filled
                  </span>
                )}
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-1">
                <span>Employee ID</span>
                {isAutoPopulated('employee_id') && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
                    <Check className="w-3 h-3 mr-1" />
                    Auto-filled
                  </span>
                )}
              </label>
              <input
                type="text"
                value={formData.employee_id}
                onChange={(e) => handleInputChange('employee_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Employee ID"
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Professional Information</h3>
            
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-1">
                <span>Current Title</span>
                {isAutoPopulated('current_title') && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
                    <Check className="w-3 h-3 mr-1" />
                    Auto-filled
                  </span>
                )}
              </label>
              <input
                type="text"
                value={formData.current_title}
                onChange={(e) => handleInputChange('current_title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-1">
                <span>Manager</span>
                {isAutoPopulated('manager') && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
                    <Check className="w-3 h-3 mr-1" />
                    Auto-filled
                  </span>
                )}
              </label>
              <input
                type="text"
                value={formData.manager}
                onChange={(e) => handleInputChange('manager', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Direct manager name"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-1">
                <span>Education</span>
                {isAutoPopulated('education') && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
                    <Check className="w-3 h-3 mr-1" />
                    Auto-filled
                  </span>
                )}
              </label>
              <textarea
                value={formData.education}
                onChange={(e) => handleInputChange('education', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-1">
                <span>Skills (comma-separated)</span>
                {isAutoPopulated('skills') && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
                    <Check className="w-3 h-3 mr-1" />
                    Auto-filled
                  </span>
                )}
              </label>
              <textarea
                value={formData.skills}
                onChange={(e) => handleInputChange('skills', e.target.value)}
                rows={3}
                placeholder="JavaScript, React, Node.js, Python, SQL"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-1">
            <span>Professional Summary</span>
            {isAutoPopulated('summary') && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
                <Check className="w-3 h-3 mr-1" />
                Auto-filled
              </span>
            )}
          </label>
          <textarea
            value={formData.summary}
            onChange={(e) => handleInputChange('summary', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief professional summary or objective..."
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
          >
            {isSaving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            <span>{isSaving ? 'Saving...' : 'Save Candidate'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}