import os
from dotenv import load_dotenv
load_dotenv(".env")
from langchain_google_genai import GoogleGenerativeAIEmbeddings

def test_embed():
    emb = GoogleGenerativeAIEmbeddings(
        google_api_key=os.getenv("GEMINI_API_KEY"),
        model="models/text-embedding-004"
    )
    vec = emb.embed_query("hello")
    print("text-embedding-004 dimensions:", len(vec))
    
    emb2 = GoogleGenerativeAIEmbeddings(
        google_api_key=os.getenv("GEMINI_API_KEY"),
        model="models/embedding-001"
    )
    vec2 = emb2.embed_query("hello")
    print("embedding-001 dimensions:", len(vec2))

test_embed()
