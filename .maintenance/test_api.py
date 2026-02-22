import urllib.request
import json

def test_statement():
    client_id = 1
    url = f"http://localhost:8000/clients/{client_id}/statement"
    try:
        with urllib.request.urlopen(url) as response:
            if response.getcode() == 200:
                data = json.loads(response.read().decode())
                print(f"Statement for client {client_id}:")
                for entry in data[:3]:
                    print(f"Type: {entry.get('type')}, Date: {entry.get('date')}")
                    print(f"Has item? {'item' in entry}")
                    if 'item' in entry:
                        print(f"  item keys: {list(entry['item'].keys())}")
                        print(f"  item.consumption_kwh: {entry['item'].get('consumption_kwh')}")
                    else:
                        print(f"  FULL ENTRY: {entry}")
            else:
                print(f"Error {response.getcode()}")
    except Exception as e:
        print(f"Connection error: {e}")

if __name__ == "__main__":
    test_statement()
