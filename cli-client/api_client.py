import requests
import os
from dotenv import load_dotenv
from config import ENDPOINTS, API_BASE_URL

load_dotenv()

class APIClient:
    def __init__(self):
        self.base_url = os.getenv('API_URL', API_BASE_URL)
        self.session = requests.Session()
        self.token = None
        
    def healthcheck(self):
        """Call the healthcheck endpoint"""
        try:
            url = f"{self.base_url}{ENDPOINTS['healthcheck']}"
            response = self.session.get(url)
            response.raise_for_status()  # Raise an exception for bad status codes
            
            data = response.json()
            
            # Check if response contains expected fields
            if data.get('status') == "OK":
                return {
                    'status': data['status'],
                    'dbconnection': data['dbconnection'],
                    'stations': data['n_stations'],
                    'tags': data['n_tags'],
                    'passes': data['n_passes']
                }
            else:
                raise Exception(f"Healthcheck failed: {data.get('status', 'Unknown error')}")
            
        except requests.exceptions.ConnectionError:
            raise Exception("Could not connect to the API. Is the server running?")
        except requests.exceptions.Timeout:
            raise Exception("API request timed out")
        except requests.exceptions.RequestException as e:
            raise Exception(f"API Error: {str(e)}")
        except KeyError as e:
            raise Exception(f"Unexpected response format: missing field {str(e)}")
        except Exception as e:
            raise Exception(f"Error during healthcheck: {str(e)}")
            
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
    
    def reset_stations(self):
        """Call the resetstations endpoint"""
        try:
            response = requests.post(f"{self.base_url}{ENDPOINTS['resetstations']}")
            if response.status_code == 200:
                print("Stations reset successfully")
            else:
                print(f"Error: {response.status_code}")
                print(response.json().get('message', 'Unknown error occurred'))
        except requests.exceptions.RequestException as e:
            print(f"Error connecting to server: {e}")

    def addpasses(self, file_path):
        """Upload passes from CSV file"""
        try:
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"File not found: {file_path}")
            
            if not file_path.lower().endswith('.csv'):
                raise ValueError("File must be a CSV file")
            
            # Open the file in binary mode and create the files dict
            with open(file_path, 'rb') as file:
                files = {
                    'file': (os.path.basename(file_path), file, 'text/csv')
                }
                
                # Use the correct endpoint path from config
                url = f"{self.base_url}{ENDPOINTS['admin']['addpasses']}"
                
                response = self.session.post(url, files=files)
                return response.json()
        
        except FileNotFoundError as e:
            raise Exception(f"File error: {str(e)}")
        except ValueError as e:
            raise Exception(f"Invalid file: {str(e)}")
        except requests.exceptions.RequestException as e:
            raise Exception(f"API Error: {str(e)}")
        except Exception as e:
            raise Exception(f"Error uploading passes: {str(e)}")

# Remove the standalone command handling code 