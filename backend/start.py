#!/usr/bin/env python3
"""
Start script for the FastAPI backend server
"""
import uvicorn
import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("🚀 Starting HR Candidate Intake API Server...")
    print("📋 API Documentation will be available at: http://localhost:8000/docs")
    print("🔄 CORS enabled for frontend at: http://localhost:5173")
    print("=" * 60)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )