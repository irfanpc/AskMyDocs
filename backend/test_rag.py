from app.services.rag_service import answer_question
try:
    print(answer_question("hello", []))
except Exception as e:
    import traceback
    traceback.print_exc()
