import requests
from typing import Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv('API_URL', 'http://localhost:9103/interoperability/api')

class APIClient:
    def __init__(self):
        self.token = None
        
    def healthcheck(self) -> Dict[str, Any]:
        response = requests.get(f"{BASE_URL}/admin/healthcheck")
        return response.json()
        
    def login(self, username: str, password: str) -> Dict[str, Any]:
        response = requests.post(f"{BASE_URL}/login", 
                               json={"username": username, "password": password})
        if response.ok:
            self.token = response.json().get('token')
        return response.json()
        
    def get_toll_passes(self, station: str, from_date: str, to_date: str) -> Dict[str, Any]:
        params = {
            "station": station,
            "from": from_date,
            "to": to_date
        }
        headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}
        response = requests.get(f"{BASE_URL}/tollStationPasses", 
                              params=params, 
                              headers=headers)
        return response.json() 