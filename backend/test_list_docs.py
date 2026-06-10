from app.services.rag_service import get_vector_store

vs = get_vector_store()
data = vs.get(include=["metadatas"])
sources = set()
for md in data.get("metadatas", []):
    if "source" in md:
        sources.add(md["source"])

print(list(sources))
