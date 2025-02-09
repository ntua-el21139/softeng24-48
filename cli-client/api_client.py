import requests
from config import API_BASE_URL, ENDPOINTS

class APIClient:
    def __init__(self):
        self.base_url = API_BASE_URL
        self.session = requests.Session()
        
    def healthcheck(self):
        """Call the healthcheck endpoint"""
        try:
            # Call the actual API endpoint
            response = requests.get(f"{self.base_url}{ENDPOINTS['healthcheck']}")
            response.raise_for_status()
            
            # Return the actual response from the API
            return response.json()
            
        except requests.exceptions.ConnectionError:
            raise Exception("Could not connect to the API. Is the server running?")
        except requests.exceptions.Timeout:
            raise Exception("API request timed out")
        except requests.exceptions.RequestException as e:
            raise Exception(f"API Error: {str(e)}")
            
    def resetpasses(self):
        """Call the resetpasses endpoint"""
        try:
            response = requests.post(f"{self.base_url}{ENDPOINTS['resetpasses']}")
            response.raise_for_status()
            return response.json()
        except requests.exceptions.ConnectionError:
            raise Exception("Could not connect to the API. Is the server running?")
        except requests.exceptions.Timeout:
            raise Exception("API request timed out")
        except requests.exceptions.RequestException as e:
            raise Exception(f"API Error: {str(e)}") 