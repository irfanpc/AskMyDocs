import os
from app.services.rag_service import get_embeddings, get_llm
from app.config import settings

print("LLM PROVIDER:", settings.llm_provider)
print("EMBEDDINGS TYPE:", type(get_embeddings()))
print("LLM TYPE:", type(get_llm()))
