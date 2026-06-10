import os
from dotenv import load_dotenv
load_dotenv(".env")
from langchain_google_genai import GoogleGenerativeAIEmbeddings

def test_model(model_name):
    print(f"Testing {model_name}...")
    try:
        emb = GoogleGenerativeAIEmbeddings(
            google_api_key=os.getenv("GEMINI_API_KEY"),
            model=model_name
        )
        vec = emb.embed_query("hello")
        print(f"Success! {model_name} dimensions: {len(vec)}")
    except Exception as e:
        print(f"Failed: {str(e)}")

test_model("text-embedding-004")
test_model("gemini-embedding-001")
test_model("models/text-embedding-004")
