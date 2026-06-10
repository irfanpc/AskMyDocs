import os
from dotenv import load_dotenv
load_dotenv(".env")
from langchain_google_genai import GoogleGenerativeAIEmbeddings

def test_embed():
    emb = GoogleGenerativeAIEmbeddings(
        google_api_key=os.getenv("GEMINI_API_KEY"),
        model="models/gemini-embedding-001"
    )
    vec = emb.embed_query("hello")
    print("models/gemini-embedding-001 dimensions:", len(vec))

test_embed()
