import sqlite3
import json

try:
    conn = sqlite3.connect('chroma_db/chroma.sqlite3')
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    with open('db_output.txt', 'w') as f:
        f.write(f"Tables: {tables}\n")
        
        # Let's see what tables exist and print details
        for table in tables:
            tname = table[0]
            f.write(f"\nTable: {tname}\n")
            cursor.execute(f"PRAGMA table_info({tname});")
            cols = cursor.fetchall()
            f.write(f"Columns: {cols}\n")
            
            cursor.execute(f"SELECT * FROM {tname} LIMIT 10;")
            rows = cursor.fetchall()
            f.write(f"Rows (limit 10): {rows}\n")
    conn.close()
    print("Success")
except Exception as e:
    with open('db_output.txt', 'w') as f:
        f.write(f"Error: {str(e)}")
    print("Error:", e)
