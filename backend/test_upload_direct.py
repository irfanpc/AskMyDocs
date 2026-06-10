import asyncio
import os
from app.services.document_processor import process_document
from app.services.rag_service import add_documents_to_vector_store

async def test():
    filename = "test.txt"
    content = b"This is a test document."
    try:
        text = process_document(filename, content)
        print("Text extracted:", text)
        add_documents_to_vector_store(text, filename)
        print("Successfully added to vector store!")
    except Exception as e:
        print(f"Direct error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
