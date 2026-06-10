import requests

url = "http://127.0.0.1:8000/upload"
with open("test.txt", "w") as f:
    f.write("Hello world")

with open("test.txt", "rb") as f:
    files = {"files": ("test.txt", f, "text/plain")}
    response = requests.post(url, files=files)

print("Status:", response.status_code)
print("Response:", response.text)
