import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
api_key = os.environ.get("GEMINI_API_KEY")
print("API KEY:", api_key)

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash', system_instruction="You are an assistant.")

messages = [{"role": "user", "parts": ["Hello"]}]

try:
    response = model.generate_content(messages)
    print("Success:", response.text)
except Exception as e:
    import traceback
    traceback.print_exc()
