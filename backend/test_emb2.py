from app.services.rag_service import get_embeddings
import sys

try:
    emb = get_embeddings()
    print("Embedding type:", type(emb))
    vec = emb.embed_query("hello")
    print("Dimensions:", len(vec))
except Exception as e:
    print("Error:", e)
    sys.exit(1)
