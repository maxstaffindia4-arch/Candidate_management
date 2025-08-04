import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Eye, User, Briefcase, Users, Hash } from 'lucide-react';
import { candidateService } from '../services/candidateService';
import { Candidate } from '../types/candidate';

interface CandidateListProps {
  onAddCandidate: () => void;
  onViewCandidate: (id: string) => void;
}

export function CandidateList({ onAddCandidate, onViewCandidate }: CandidateListProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = () => {
    setLoading(true);
    const data = candidateService.getCandidates();
    setCandidates(data);
    setLoading(false);
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.alias_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.current_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Directory</h1>
          <p className="text-gray-600 mt-1">{candidates.length} total employees</p>
        </div>
        <button
          onClick={onAddCandidate}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees by name, alias, title, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Employee List */}
      {filteredCandidates.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
            <Users className="w-full h-full" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No employees found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first employee'}
          </p>
          {!searchTerm && (
            <button
              onClick={onAddCandidate}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Employee
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
              <div className="col-span-4 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Employee Name
              </div>
              <div className="col-span-3 flex items-center">
                <Briefcase className="w-4 h-4 mr-2" />
                Designation
              </div>
              <div className="col-span-2 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Manager
              </div>
              <div className="col-span-2 flex items-center">
                <Hash className="w-4 h-4 mr-2" />
                Employee ID
              </div>
              <div className="col-span-1 text-center">Actions</div>
            </div>
          </div>

          {/* Employee Rows */}
          <div className="divide-y divide-gray-200">
            {filteredCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onViewCandidate(candidate.id)}
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Employee Name */}
                  <div className="col-span-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {(candidate.alias_name || candidate.full_name).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDisplayName(candidate)}
                        </p>
                        <p className="text-xs text-gray-500">{candidate.email}</p>
                      </div>
                      {candidate.cv_filepath && (
                        <div className="p-1 bg-green-100 rounded">
                          <FileText className="w-3 h-3 text-green-600" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Designation */}
                  <div className="col-span-3">
                    <p className="text-sm text-gray-900">
                      {candidate.current_title || 'No designation'}
                    </p>
                    <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      candidate.source === 'upload' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {candidate.source === 'upload' ? 'CV Upload' : 'Manual'}
                    </div>
                  </div>

                  {/* Manager */}
                  <div className="col-span-2">
                    <p className="text-sm text-gray-900">
                      {candidate.manager || 'Not assigned'}
                    </p>
                  </div>

                  {/* Employee ID */}
                  <div className="col-span-2">
                    <p className="text-sm font-mono text-gray-900">
                      {candidate.employee_id || 'Not assigned'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewCandidate(candidate.id);
                      }}
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}