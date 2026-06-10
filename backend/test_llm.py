import os
from dotenv import load_dotenv
load_dotenv(".env")
from langchain_google_genai import ChatGoogleGenerativeAI

try:
    llm = ChatGoogleGenerativeAI(
        google_api_key=os.getenv("GEMINI_API_KEY"),
        model="gemini-flash-latest"
    )
    res = llm.invoke("hello")
    print("Response:", res)
except Exception as e:
    print("Error:", e)
