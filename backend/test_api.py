import requests

try:
    response = requests.post('http://127.0.0.1:8000/chat', json={'query': 'hello', 'history': []})
    print("STATUS:", response.status_code)
    print("BODY:", response.text)
except Exception as e:
    print("ERROR:", str(e))
