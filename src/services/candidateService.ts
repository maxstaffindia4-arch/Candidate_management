import { Candidate, ParsedCandidateData } from '../types/candidate';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

class CandidateService {
  private storageKey = 'hr_candidates';
  private useBackend = true; // Set to false to use localStorage fallback

  // Real CV parsing using FastAPI backend
  async parseCV(file: File): Promise<ParsedCandidateData> {
    try {
      // Always try the backend first
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_BASE_URL}/upload-cv`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000, // 10 second timeout
      });

      console.log('Real CV parsing successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Backend CV parsing failed:', error);
      
      // Only fall back to mock if backend is completely unavailable
      if (axios.isAxiosError(error) && (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK')) {
        console.log('Backend unavailable, using mock parsing');
        this.useBackend = false;
        return this.mockParseCV(file);
      }
      
      // For other errors, throw them so user knows parsing failed
      throw new Error(`CV parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Check if backend is available
  async checkBackendHealth(): Promise<boolean> {
    try {
      await axios.get(`${API_BASE_URL}/`, { timeout: 3000 });
      this.useBackend = true;
      return true;
    } catch (error) {
      console.log('Backend health check failed:', error);
      this.useBackend = false;
      return false;
    }
  }

  // Improved mock parsing (only used when backend is unavailable)
  private async mockParseCV(file: File): Promise<ParsedCandidateData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Try to read file content for better mock parsing
    try {
      const text = await this.extractTextFromFile(file);
      if (text) {
        return this.parseTextContent(text);
      }
    } catch (error) {
      console.log('Could not read file for mock parsing:', error);
    }
    
    // Fallback to filename-based mock
    return this.filenameMockParsing(file);
  }

  // Extract text from file for mock parsing
  private async extractTextFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text || '');
      };
      reader.onerror = () => reject(new Error('Could not read file'));
      
      // Only try to read as text for simple cases
      if (file.type === 'text/plain') {
        reader.readAsText(file);
      } else {
        reject(new Error('Cannot read binary file as text'));
      }
    });
  }

  // Parse text content for mock parsing
  private parseTextContent(text: string): ParsedCandidateData {
    const mockData: ParsedCandidateData = {
      auto_populated_fields: []
    };

    // Extract email
    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) {
      mockData.email = emailMatch[0];
      mockData.auto_populated_fields.push('email');
    }

    // Extract phone
    const phoneMatch = text.match(/[\+]?[1-9]?[\-\.\s]?\(?[0-9]{3}\)?[\-\.\s]?[0-9]{3}[\-\.\s]?[0-9]{4}/);
    if (phoneMatch) {
      mockData.phone = phoneMatch[0];
      mockData.auto_populated_fields.push('phone');
    }

    // Try to extract name from first few lines
    const lines = text.split('\n').slice(0, 5);
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 3 && trimmed.length < 50 && /^[A-Za-z\s]+$/.test(trimmed)) {
        mockData.full_name = trimmed;
        mockData.auto_populated_fields.push('full_name');
        break;
      }
    }

    return mockData;
  }

  // Filename-based mock parsing (last resort)
  private filenameMockParsing(file: File): ParsedCandidateData {
    const fileName = file.name.toLowerCase();
    const mockData: ParsedCandidateData = {
      auto_populated_fields: []
    };

    if (fileName.includes('john') || fileName.includes('developer')) {
      mockData.full_name = 'John Smith';
      mockData.alias_name = 'Johnny';
      mockData.email = 'john.smith@email.com';
      mockData.phone = '+1 (555) 123-4567';
      mockData.current_title = 'Senior Software Developer';
      mockData.manager = 'Sarah Johnson';
      mockData.employee_id = 'EMP001';
      mockData.education = 'Bachelor of Computer Science, University of Technology (2018)';
      mockData.skills = ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'AWS'];
      mockData.summary = 'Experienced software developer with 5+ years of experience in full-stack development.';
      mockData.location = 'San Francisco, CA';
      mockData.auto_populated_fields = ['full_name', 'alias_name', 'email', 'phone', 'current_title', 'manager', 'employee_id', 'education', 'skills', 'summary', 'location'];
    } else {
      // Generic fallback
      mockData.full_name = 'Unknown Candidate';
      mockData.email = 'candidate@email.com';
      mockData.auto_populated_fields = ['full_name', 'email'];
    }

    return mockData;
  }

  // Remove the old mockParseCV method
  private async oldMockParseCV(file: File): Promise<ParsedCandidateData> {
    // This method is now replaced by the improved mock parsing above
      return this.mockParseCV(file);
  }

  // Fallback mock CV parsing
  private async mockParseCV(file: File): Promise<ParsedCandidateData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock parsing results based on filename
    const fileName = file.name.toLowerCase();
    const mockData: ParsedCandidateData = {
      auto_populated_fields: []
    };

    // Simulate different parsing results
    if (fileName.includes('john') || fileName.includes('developer')) {
      mockData.full_name = 'John Smith';
      mockData.alias_name = 'Johnny';
      mockData.email = 'john.smith@email.com';
      mockData.phone = '+1 (555) 123-4567';
      mockData.current_title = 'Senior Software Developer';
      mockData.manager = 'Sarah Johnson';
      mockData.employee_id = 'EMP001';
      mockData.education = 'Bachelor of Computer Science, University of Technology (2018)';
      mockData.skills = ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'AWS'];
      mockData.summary = 'Experienced software developer with 5+ years of experience in full-stack development. Passionate about creating scalable web applications and leading development teams.';
      mockData.location = 'San Francisco, CA';
      mockData.auto_populated_fields = ['full_name', 'alias_name', 'email', 'phone', 'current_title', 'manager', 'employee_id', 'education', 'skills', 'summary', 'location'];
    } else if (fileName.includes('sarah') || fileName.includes('manager')) {
      mockData.full_name = 'Sarah Johnson';
      mockData.alias_name = 'Sarah';
      mockData.email = 'sarah.johnson@email.com';
      mockData.phone = '+1 (555) 987-6543';
      mockData.current_title = 'Product Manager';
      mockData.manager = 'Michael Chen';
      mockData.employee_id = 'EMP002';
      mockData.education = 'MBA in Business Administration, Harvard Business School (2019)';
      mockData.skills = ['Product Strategy', 'Agile', 'Scrum', 'Analytics', 'Leadership'];
      mockData.summary = 'Strategic product manager with 7+ years of experience driving product vision and execution. Expert in cross-functional team leadership and data-driven decision making.';
      mockData.location = 'New York, NY';
      mockData.auto_populated_fields = ['full_name', 'alias_name', 'email', 'phone', 'current_title', 'manager', 'employee_id', 'education', 'skills', 'summary', 'location'];
    } else {
      // Partial parsing simulation
      mockData.full_name = 'Alex Wilson';
      mockData.alias_name = 'Alex';
      mockData.email = 'alex.wilson@email.com';
      mockData.current_title = 'Marketing Specialist';
      mockData.employee_id = 'EMP003';
      mockData.auto_populated_fields = ['full_name', 'alias_name', 'email', 'current_title', 'employee_id'];
    }

    return mockData;
  }

  // Save candidate (using backend or localStorage)
  async saveCandidate(candidateData: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>): Promise<Candidate> {
    if (this.useBackend) {
      try {
        const response = await axios.post(`${API_BASE_URL}/candidates`, candidateData);
        return response.data;
      } catch (error) {
        console.error('Backend save failed, falling back to localStorage:', error);
        // Fall back to localStorage if backend fails
      }
    }

    // localStorage fallback
    const candidates = this.getCandidates();
    const newCandidate: Candidate = {
      ...candidateData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    candidates.push(newCandidate);
    localStorage.setItem(this.storageKey, JSON.stringify(candidates));
    return newCandidate;
  }

  // Get all candidates (using backend or localStorage)
  getCandidates(): Candidate[] {
    if (this.useBackend) {
      // Note: This should be async in a real implementation
      // For now, we'll use localStorage as the primary storage
      // and sync with backend periodically
    }

    // localStorage implementation
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  // Get candidate by ID (simulating GET /candidates/{id})
  getCandidateById(id: string): Candidate | null {
    const candidates = this.getCandidates();
    return candidates.find(c => c.id === id) || null;
  }

  // Update candidate
  async updateCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate | null> {
    if (this.useBackend) {
      try {
        const response = await axios.put(`${API_BASE_URL}/candidates/${id}`, updates);
        return response.data;
      } catch (error) {
        console.error('Backend update failed, falling back to localStorage:', error);
      }
    }

    // localStorage fallback
    const candidates = this.getCandidates();
    const index = candidates.findIndex(c => c.id === id);
    
    if (index === -1) return null;

    candidates[index] = {
      ...candidates[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem(this.storageKey, JSON.stringify(candidates));
    return candidates[index];
  }

  // Toggle between backend and localStorage mode
  setBackendMode(useBackend: boolean) {
    this.useBackend = useBackend;
  }

  isUsingBackend(): boolean {
    return this.useBackend;
  }

  // Initialize with sample data
  initializeSampleData() {
    const existing = this.getCandidates();
    if (existing.length > 0) return;

    const sampleCandidates: Candidate[] = [
      {
        id: '1',
        full_name: 'Emily Rodriguez',
        alias_name: 'Em',
        email: 'emily.rodriguez@email.com',
        phone: '+1 (555) 234-5678',
        current_title: 'UX Designer',
        manager: 'David Kim',
        employee_id: 'EMP101',
        education: 'Bachelor of Fine Arts in Graphic Design, Art Institute (2020)',
        skills: ['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping', 'HTML/CSS'],
        summary: 'Creative UX designer with 3+ years of experience creating user-centered designs. Passionate about accessibility and inclusive design practices.',
        location: 'Austin, TX',
        source: 'upload',
        cv_filepath: 'emily_rodriguez_resume.pdf',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
      },
      {
        id: '2',
        full_name: 'Michael Chen',
        alias_name: 'Mike',
        email: 'michael.chen@email.com',
        phone: '+1 (555) 345-6789',
        current_title: 'Data Scientist',
        manager: 'Jennifer Liu',
        employee_id: 'EMP102',
        education: 'PhD in Statistics, Stanford University (2021)',
        skills: ['Python', 'R', 'Machine Learning', 'SQL', 'TensorFlow', 'Statistics'],
        summary: 'Data scientist with expertise in machine learning and statistical analysis. 4+ years of experience in predictive modeling and data visualization.',
        location: 'Seattle, WA',
        source: 'manual',
        created_at: '2024-01-16T14:20:00Z',
        updated_at: '2024-01-16T14:20:00Z',
      },
    ];

    localStorage.setItem(this.storageKey, JSON.stringify(sampleCandidates));
  }
}

export const candidateService = new CandidateService();