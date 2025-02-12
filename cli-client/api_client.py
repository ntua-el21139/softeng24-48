import requests
import os
from dotenv import load_dotenv
from config import ENDPOINTS, API_BASE_URL
import urllib3

load_dotenv()

class APIClient:
    def __init__(self):
        self.base_url = os.getenv('API_URL', API_BASE_URL)
        self.session = requests.Session()
        # Optionally verify SSL certificates - for development, you may need to disable verification
        self.session.verify = False  # Only use in development
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)  # Suppress warnings
        self.token = None
        
    def healthcheck(self, format_type='csv'):
        """Call the healthcheck endpoint"""
        try:
            url = f"{self.base_url}{ENDPOINTS['healthcheck']}?format={format_type}"
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
            
        except requests.exceptions.SSLError:
            raise Exception("SSL Certificate verification failed. If this is a development environment, you may need to use a valid certificate or disable verification.")
        except requests.exceptions.ConnectionError:
            raise Exception("Could not connect to the API. Is the server running and HTTPS properly configured?")
        except requests.exceptions.Timeout:
            raise Exception("API request timed out")
        except requests.exceptions.RequestException as e:
            raise Exception(f"API Error: {str(e)}")
        except KeyError as e:
            raise Exception(f"Unexpected response format: missing field {str(e)}")
        except Exception as e:
            raise Exception(f"Error during healthcheck: {str(e)}")
            
    def resetpasses(self, format_type='csv'):
        """Call the resetpasses endpoint"""
        try:
            url = f"{self.base_url}{ENDPOINTS['resetpasses']}?format={format_type}"
            response = self.session.post(url)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.SSLError:
            raise Exception("SSL Certificate verification failed. If this is a development environment, you may need to use a valid certificate or disable verification.")
        except requests.exceptions.ConnectionError:
            raise Exception("Could not connect to the API. Is the server running and HTTPS properly configured?")
        except requests.exceptions.Timeout:
            raise Exception("API request timed out")
        except requests.exceptions.RequestException as e:
            raise Exception(f"API Error: {str(e)}")
    
    def reset_stations(self, format_type='csv'):
        """Call the resetstations endpoint"""
        try:
            url = f"{self.base_url}{ENDPOINTS['resetstations']}?format={format_type}"
            response = self.session.post(url)
            response.raise_for_status()
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"Error: {response.status_code} - {response.json().get('message', 'Unknown error occurred')}")
        except requests.exceptions.SSLError:
            raise Exception("SSL Certificate verification failed. If this is a development environment, you may need to use a valid certificate or disable verification.")
        except requests.exceptions.ConnectionError:
            raise Exception("Could not connect to the API. Is the server running and HTTPS properly configured?")
        except requests.exceptions.Timeout:
            raise Exception("API request timed out")
        except requests.exceptions.RequestException as e:
            raise Exception(f"API Error: {str(e)}")

    def addpasses(self, file_path, format_type='csv'):
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
                
                # Use the correct endpoint path from config with format parameter
                url = f"{self.base_url}{ENDPOINTS['admin']['addpasses']}?format={format_type}"
                
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