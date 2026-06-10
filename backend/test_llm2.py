import os
from dotenv import load_dotenv
load_dotenv(".env")
from langchain_google_genai import ChatGoogleGenerativeAI

def test_model(model_name):
    print(f"Testing {model_name}...")
    try:
        llm = ChatGoogleGenerativeAI(
            google_api_key=os.getenv("GEMINI_API_KEY"),
            model=model_name,
            max_retries=0
        )
        res = llm.invoke("hello")
        print(f"Success! {model_name}")
    except Exception as e:
        print(f"Failed: {str(e)}")

test_model("gemini-flash-latest")
test_model("models/gemini-flash-latest")
test_model("gemini-2.0-flash")
