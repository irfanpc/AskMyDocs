import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.environ['GEMINI_API_KEY'])

models = [
    'models/gemini-flash-latest', 
    'models/gemini-1.5-flash-latest',
    'models/gemini-pro-latest', 
    'models/gemini-2.5-flash',
    'models/gemini-2.0-flash',
    'models/gemma-4-26b-a4b-it'
]

working_models = []
for model_name in models:
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("hello")
        print(f"✅ {model_name} WORKED")
        working_models.append(model_name)
    except Exception as e:
        print(f"❌ {model_name} FAILED: {e}")

print("Working models:", working_models)
