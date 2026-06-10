import requests

response = requests.post("http://127.0.0.1:8000/chat", json={
    "query": "what is python?",
    "history": []
})

print(response.status_code)
print(response.json())
