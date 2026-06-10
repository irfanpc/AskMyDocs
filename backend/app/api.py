from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
from pydantic import BaseModel
from app.services.document_processor import process_document
from app.services.rag_service import add_documents_to_vector_store, answer_question, get_all_documents, delete_document

router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    history: List[dict] = []

class ChatResponse(BaseModel):
    answer: str
    sources: List[str]

@router.get("/documents")
async def list_documents():
    try:
        docs = get_all_documents()
        return {"documents": docs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/documents/{filename}")
async def remove_document(filename: str):
    try:
        delete_document(filename)
        return {"message": f"Successfully deleted {filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload")
async def upload_documents(files: List[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    processed_files = []
    
    for file in files:
        try:
            content = await file.read()
            text = process_document(file.filename, content)
            
            if text.strip():
                add_documents_to_vector_store(text, file.filename)
                processed_files.append(file.filename)
            else:
                print(f"Warning: No text extracted from {file.filename}")
                
        except Exception as e:
            print(f"Error processing {file.filename}: {str(e)}")
            continue
            
    if not processed_files:
        raise HTTPException(status_code=400, detail="Could not process any of the provided files.")
        
    return {"message": "Files successfully uploaded and processed.", "files": processed_files}

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        response = answer_question(request.query, request.history)
        return ChatResponse(answer=response["answer"], sources=response["sources"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
