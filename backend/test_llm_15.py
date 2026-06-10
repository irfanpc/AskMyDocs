import os
from dotenv import load_dotenv
load_dotenv(".env")
from langchain_google_genai import ChatGoogleGenerativeAI

llm = ChatGoogleGenerativeAI(
    google_api_key=os.getenv("GEMINI_API_KEY"),
    model="gemini-1.5-flash",
    max_retries=1
)
try:
    print(llm.invoke("Say hi"))
except Exception as e:
    print("Error:", e)
