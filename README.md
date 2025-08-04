# HR Candidate Intake Demo App

A comprehensive HR candidate intake system with real CV parsing capabilities using FastAPI backend and React frontend.

## Features

### 🚀 Real CV Parsing
- **PDF & DOCX Support**: Upload and parse actual CV files
- **AI-Powered Extraction**: Automatically extracts:
  - Full name, email, phone number
  - Current job title and location
  - Education background
  - Technical skills and competencies
  - Professional summary generation
- **Smart Fallback**: Falls back to demo mode if backend is unavailable

### 📋 Candidate Management
- **Dual Input Methods**: CV upload or manual entry
- **Auto-Population Indicators**: Shows which fields were extracted from CV
- **Editable Forms**: Review and correct parsed data before saving
- **Full CRUD Operations**: Create, read, update, delete candidates
- **Search & Filter**: Find candidates quickly

### 🎨 Professional UI
- Clean, modern interface optimized for HR workflows
- Responsive design for desktop and tablet use
- Real-time parsing feedback and error handling
- Professional color scheme and typography

## Quick Start

### Option 1: Full Stack (Recommended)
```bash
# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies
npm install

# Start both backend and frontend
npm run dev:full
```

### Option 2: Frontend Only (Demo Mode)
```bash
npm install
npm run dev
```

## API Endpoints

The FastAPI backend provides these endpoints:

- `POST /upload-cv` - Parse CV file and extract candidate data
- `POST /candidates` - Create new candidate
- `GET /candidates` - List all candidates
- `GET /candidates/{id}` - Get specific candidate
- `PUT /candidates/{id}` - Update candidate
- `DELETE /candidates/{id}` - Delete candidate

## Backend Setup

### Requirements
- Python 3.8+
- FastAPI
- PyPDF2 (PDF parsing)
- python-docx (DOCX parsing)

### Installation
```bash
cd backend
pip install -r requirements.txt
python start.py
```

The API will be available at `http://localhost:8000` with interactive docs at `http://localhost:8000/docs`.

## CV Parsing Technology

### PDF Parsing
- Uses PyPDF2 for text extraction
- Handles multi-page documents
- Supports various PDF formats

### DOCX Parsing
- Uses python-docx library
- Extracts text from Word documents
- Maintains formatting context

### Information Extraction
- **Email Detection**: Regex patterns for email validation
- **Phone Numbers**: Multiple international formats
- **Name Extraction**: Intelligent name detection from document headers
- **Skills Matching**: Database of 50+ technical and soft skills
- **Education Parsing**: Degree and institution recognition
- **Job Title Detection**: Common title patterns and keywords
- **Location Extraction**: City, state format recognition

## Architecture

```
Frontend (React + TypeScript)
├── Components
│   ├── CandidateForm (CV upload + parsing)
│   ├── CandidateList (Search + display)
│   └── CandidateDetail (View + edit)
├── Services
│   └── candidateService (API integration)
└── Types
    └── candidate (TypeScript interfaces)

Backend (FastAPI + Python)
├── CV Parsing Engine
│   ├── PDF text extraction
│   ├── DOCX text extraction
│   └── Information extraction
├── REST API
│   └── CRUD operations
└── Data Models
    └── Pydantic schemas
```

## Development

### Frontend Development
```bash
npm run dev
```

### Backend Development
```bash
cd backend
python start.py
```

### Full Stack Development
```bash
npm run dev:full
```

## Production Deployment

### Backend
- Deploy FastAPI with Gunicorn/Uvicorn
- Use PostgreSQL for production database
- Add file storage (AWS S3, etc.)
- Implement authentication & authorization

### Frontend
- Build with `npm run build`
- Deploy to CDN or static hosting
- Configure API endpoint URLs

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API calls
- **Vite** for development

### Backend
- **FastAPI** for REST API
- **PyPDF2** for PDF parsing
- **python-docx** for DOCX parsing
- **Pydantic** for data validation
- **Uvicorn** for ASGI server

## License

MIT License - feel free to use this for your projects!