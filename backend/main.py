from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import PyPDF2
import docx
import io
import re
import json
from datetime import datetime
import uuid

app = FastAPI(title="HR Candidate Intake API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ParsedCandidateData(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    current_title: Optional[str] = None
    education: Optional[str] = None
    skills: Optional[List[str]] = None
    summary: Optional[str] = None
    location: Optional[str] = None
    auto_populated_fields: List[str] = []

class CandidateCreate(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None
    current_title: Optional[str] = None
    education: Optional[str] = None
    skills: List[str] = []
    summary: Optional[str] = None
    location: Optional[str] = None
    source: str = "manual"
    cv_filepath: Optional[str] = None

class Candidate(CandidateCreate):
    id: str
    created_at: datetime
    updated_at: datetime

# In-memory database (replace with PostgreSQL in production)
candidates_db = []

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file"""
    try:
        pdf_file = io.BytesIO(file_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return ""

def extract_text_from_docx(file_content: bytes) -> str:
    """Extract text from DOCX file"""
    try:
        doc_file = io.BytesIO(file_content)
        doc = docx.Document(doc_file)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    except Exception as e:
        print(f"Error extracting DOCX text: {e}")
        return ""

def parse_candidate_info(text: str) -> ParsedCandidateData:
    """Parse candidate information from extracted text"""
    parsed_data = ParsedCandidateData()
    auto_populated = []
    
    # Clean up text
    lines = text.split('\n')
    clean_text = text.replace('\n', ' ').replace('\r', ' ')
    clean_text = re.sub(r'\s+', ' ', clean_text).strip()
    
    # Extract email
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    email_match = re.search(email_pattern, clean_text, re.IGNORECASE)
    if email_match:
        parsed_data.email = email_match.group()
        auto_populated.append('email')
    
    # Extract phone number
    phone_patterns = [
        r'\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})',
        r'\+?([0-9]{1,3})[-.\s]?([0-9]{3,4})[-.\s]?([0-9]{3,4})[-.\s]?([0-9]{3,4})',
        r'\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})'
    ]
    
    for pattern in phone_patterns:
        phone_match = re.search(pattern, clean_text)
        if phone_match:
            # Clean up the phone number
            phone = re.sub(r'[^\d+()-.\s]', '', phone_match.group())
            parsed_data.phone = phone.strip()
            auto_populated.append('phone')
            break
    
    # Extract name (improved logic)
    first_lines = [line.strip() for line in lines[:10] if line.strip()]
    
    for line in first_lines:
        # Skip lines with common CV keywords
        if re.search(r'resume|curriculum|vitae|cv|phone|email|address|objective|summary|experience|education|skills', line.lower()):
            continue
            
        # Look for name patterns
        name_patterns = [
            r'^([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)$',  # Proper case names
            r'^([A-Z\s]{4,30})$',  # ALL CAPS names
            r'^([A-Z][a-z]+\s[A-Z]\.\s[A-Z][a-z]+)$',  # First M. Last
        ]
        
        for pattern in name_patterns:
            name_match = re.search(pattern, line)
            if name_match:
                name = name_match.group(1).strip()
                # Validate it looks like a real name
                if 3 <= len(name) <= 50 and ' ' in name:
                    parsed_data.full_name = ' '.join(word.capitalize() for word in name.split())
                    auto_populated.append('full_name')
                    break
        
        if parsed_data.full_name:
            break
    
    # Extract skills (common technical skills)
    skills_keywords = [
        'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'HTML', 'CSS',
        'Angular', 'Vue.js', 'TypeScript', 'PHP', 'C++', 'C#', '.NET', 'Ruby',
        'Go', 'Rust', 'Swift', 'Kotlin', 'Flutter', 'Django', 'Flask', 'Spring',
        'Express', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'Kubernetes',
        'AWS', 'Azure', 'GCP', 'Git', 'Jenkins', 'CI/CD', 'Agile', 'Scrum',
        'Machine Learning', 'AI', 'Data Science', 'Analytics', 'Tableau', 'PowerBI',
        'Photoshop', 'Illustrator', 'Figma', 'Sketch', 'UI/UX', 'Design',
        'Project Management', 'Leadership', 'Communication', 'Problem Solving'
    ]
    
    found_skills = []
    text_lower = clean_text.lower()
    for skill in skills_keywords:
        if skill.lower() in text_lower:
            found_skills.append(skill)
    
    if found_skills:
        parsed_data.skills = found_skills[:10]  # Limit to 10 skills
        auto_populated.append('skills')
    
    # Extract education (look for degree keywords)
    education_patterns = [
        r'(Bachelor[^.]*?(?:Computer Science|Engineering|Business|Arts|Science)[^.]*)',
        r'(Master[^.]*?(?:Computer Science|Engineering|Business|Arts|Science)[^.]*)',
        r'(PhD[^.]*?(?:Computer Science|Engineering|Business|Arts|Science)[^.]*)',
        r'(B\.?S\.?[^.]*?(?:Computer Science|Engineering|Business)[^.]*)',
        r'(M\.?S\.?[^.]*?(?:Computer Science|Engineering|Business)[^.]*)',
        r'(MBA[^.]*)',
    ]
    
    for pattern in education_patterns:
        edu_match = re.search(pattern, clean_text, re.IGNORECASE)
        if edu_match:
            parsed_data.education = edu_match.group(1).strip()
            auto_populated.append('education')
            break
    
    # Extract job titles (look for common title patterns)
    title_keywords = [
        'Software Engineer', 'Developer', 'Programmer', 'Architect', 'Manager',
        'Director', 'Lead', 'Senior', 'Junior', 'Principal', 'Staff',
        'Data Scientist', 'Analyst', 'Designer', 'Product Manager', 'Project Manager',
        'DevOps', 'QA', 'Tester', 'Consultant', 'Specialist', 'Coordinator'
    ]
    
    for keyword in title_keywords:
        if keyword.lower() in clean_text.lower():
            # Try to extract the full title around this keyword
            pattern = rf'([A-Za-z\s]*{re.escape(keyword)}[A-Za-z\s]*)'
            title_match = re.search(pattern, clean_text, re.IGNORECASE)
            if title_match:
                title = title_match.group(1).strip()
                if len(title) < 50:  # Reasonable title length
                    parsed_data.current_title = title
                    auto_populated.append('current_title')
                    break
    
    # Extract location (look for city, state patterns)
    location_patterns = [
        r'([A-Z][a-z]+,\s*[A-Z]{2})',  # City, ST
        r'([A-Z][a-z]+,\s*[A-Z][a-z]+)',  # City, State
    ]
    
    for pattern in location_patterns:
        loc_match = re.search(pattern, clean_text)
        if loc_match:
            parsed_data.location = loc_match.group(1)
            auto_populated.append('location')
            break
    
    # Generate summary if we have enough information
    if len(auto_populated) >= 3:
        summary_parts = []
        if parsed_data.current_title:
            summary_parts.append(f"Experienced {parsed_data.current_title.lower()}")
        if parsed_data.skills and len(parsed_data.skills) > 0:
            summary_parts.append(f"with expertise in {', '.join(parsed_data.skills[:3])}")
        if parsed_data.education:
            summary_parts.append(f"holding {parsed_data.education}")
        
        if summary_parts:
            parsed_data.summary = ' '.join(summary_parts) + "."
            auto_populated.append('summary')
    
    parsed_data.auto_populated_fields = auto_populated
    return parsed_data

@app.post("/upload-cv", response_model=ParsedCandidateData)
async def upload_cv(file: UploadFile = File(...)):
    """Upload and parse CV file"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Check file type
    allowed_types = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")
    
    try:
        # Read file content
        file_content = await file.read()
        
        # Extract text based on file type
        if file.content_type == 'application/pdf':
            text = extract_text_from_pdf(file_content)
        else:  # DOCX
            text = extract_text_from_docx(file_content)
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from file")
        
        # Parse candidate information
        parsed_data = parse_candidate_info(text)
        
        return parsed_data
        
    except Exception as e:
        print(f"Error processing file: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.post("/candidates", response_model=Candidate)
async def create_candidate(candidate: CandidateCreate):
    """Create a new candidate"""
    new_candidate = Candidate(
        **candidate.dict(),
        id=str(uuid.uuid4()),
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    candidates_db.append(new_candidate)
    return new_candidate

@app.get("/candidates", response_model=List[Candidate])
async def get_candidates():
    """Get all candidates"""
    return candidates_db

@app.get("/candidates/{candidate_id}", response_model=Candidate)
async def get_candidate(candidate_id: str):
    """Get a specific candidate"""
    for candidate in candidates_db:
        if candidate.id == candidate_id:
            return candidate
    raise HTTPException(status_code=404, detail="Candidate not found")

@app.put("/candidates/{candidate_id}", response_model=Candidate)
async def update_candidate(candidate_id: str, updates: CandidateCreate):
    """Update a candidate"""
    for i, candidate in enumerate(candidates_db):
        if candidate.id == candidate_id:
            updated_candidate = Candidate(
                **updates.dict(),
                id=candidate_id,
                created_at=candidate.created_at,
                updated_at=datetime.now()
            )
            candidates_db[i] = updated_candidate
            return updated_candidate
    raise HTTPException(status_code=404, detail="Candidate not found")

@app.delete("/candidates/{candidate_id}")
async def delete_candidate(candidate_id: str):
    """Delete a candidate"""
    for i, candidate in enumerate(candidates_db):
        if candidate.id == candidate_id:
            del candidates_db[i]
            return {"message": "Candidate deleted successfully"}
    raise HTTPException(status_code=404, detail="Candidate not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)