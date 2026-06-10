from app.services.rag_service import get_vector_store

vs = get_vector_store()
print("Before delete:", len(vs.get(include=["metadatas"])["ids"]))

# Delete
vs._collection.delete(where={"source": "Customer_Support_AI_Assistant_Spec.docx"})

print("After delete:", len(vs.get(include=["metadatas"])["ids"]))
