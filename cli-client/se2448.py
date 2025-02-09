import click
import json
import csv
import sys
from typing import Optional
from datetime import datetime
import cmd
from api_client import APIClient
import requests
import config
import os

class InterTollCLI(cmd.Cmd):
    intro = """
    ╔════════════════════════════════════════╗
    ║          Welcome to InterToll          ║
    ║----------------------------------------║
    ║  1. Run commands (se2448 scope ...)    ║
    ║  2. Show help page                     ║
    ║  3. Exit                               ║
    ╚════════════════════════════════════════╝
    """
    prompt = 'InterToll> '

    def __init__(self):
        super().__init__()
        self.api_client = APIClient()

    def do_1(self, arg):
        """Run CLI commands"""
        print("\nEnter your command after the prompt below.")
        print("Example formats:")
        print("  se2448 healthcheck")
        print("  se2448 tollstationpasses --station AO01 --from 20220101 --to 20220131\n")
        
        command = input("Enter your command: ")
        if command.strip():
            args = command.split()
            if args[0] == 'se2448':
                self.handle_command(args[1:])
            else:
                print("Commands must start with 'se2448'")

    def do_2(self, arg):
        """Show help page"""
        print_help()

    def do_3(self, arg):
        """Exit the program"""
        print("\nGoodbye!")
        return True

    def do_exit(self, arg):
        """Exit the program"""
        return self.do_3(arg)

    def do_quit(self, arg):
        """Exit the program"""
        return self.do_3(arg)

    def handle_command(self, args):
        if not args:
            print_help()
            return

        scope = args[0]

        try:
            if scope == 'healthcheck':
                result = self.api_client.healthcheck()
                print_health_status(result)
            elif scope == 'resetpasses':
                result = self.api_client.resetpasses()
                print(result)
            elif scope == 'resetstations':
                self.api_client.reset_stations()
            elif scope == 'login':
                username, password = parse_login_options(args[1:])
                login(username, password)
            elif scope == 'tollstationpasses':
                handle_tollstation_passes(config.API_BASE_URL, config.ENDPOINTS, args[1:])
            elif scope == 'passanalysis':
                handle_passanalysis(config.API_BASE_URL, config.ENDPOINTS, args[1:])
            elif scope == 'passescost':
                handle_passescost(config.API_BASE_URL, config.ENDPOINTS, args[1:])
            elif scope == 'chargesby':
                handle_chargesby(config.API_BASE_URL, config.ENDPOINTS, args[1:])
            elif scope == 'admin':
                handle_admin(config.API_BASE_URL, config.ENDPOINTS, args[1:])
            else:
                print(f"Unknown scope: {scope}")
                print_help()
        except Exception as e:
            print(f"Error: {str(e)}")

def print_help():
    help_text = """
    Usage: se2448 scope [--param1 value1 [--param2 value2 ...]]
    
    Available scopes:
    - healthcheck: Check system health
    - resetpasses: Reset all passes (WARNING: Deletes all passes)
    - resetstations: Reset all stations
    - login: User login (--username, --passw required)
    - logout: User logout
    - tollstationpasses: Get toll station passes (--station, --from, --to required)
    - passanalysis: Analyze passes (--stationop, --tagop, --from, --to required)
    - passescost: Calculate passes cost (--stationop, --tagop, --from, --to required)
    - chargesby: Get charges (--opid, --from, --to required)
    - admin: Administrative operations
    """
    print(help_text)

def parse_login_options(options):
    """Parse login command options"""
    username = None
    password = None

    i = 0
    while i < len(options):
        if options[i] == '--username' and i + 1 < len(options):
            username = options[i + 1]
            i += 2
        elif options[i] == '--passw' and i + 1 < len(options):
            password = options[i + 1]
            i += 2
        else:
            i += 1

    if not username or not password:
        raise ValueError("Username and password are required")

    return username, password

def healthcheck():
    """Implement healthcheck command by calling the API"""
    try:
        api_client = APIClient()
        result = api_client.healthcheck()
        return result
    except Exception as e:
        print(f"❌ Error during healthcheck: {str(e)}")
        return None

def resetpasses():
    """Implement resetpasses command by calling the API"""
    try:
        api_client = APIClient()
        result = api_client.resetpasses()
        if result:
            output_result(result)
            if result.get('status') == 'OK':
                print("\n✅ All passes have been successfully reset.")
        else:
            print("Error: No response from API")
    except Exception as e:
        print(f"Error during resetpasses: {str(e)}")

def login(username, password):
    """Implement login command"""
    result = {"status": "OK", "token": "sample_token"}
    output_result(result)

def output_result(data):
    """Output the result in a formatted way"""
    if not data:
        return
        
    if isinstance(data, dict):
        # For healthcheck and simple responses
        if 'status' in data:
            status_symbol = '✅' if data['status'] == 'OK' else '❌'
            print(f"\n{status_symbol} Status: {data['status']}")
            # Print other fields if they exist
            for key, value in data.items():
                if key != 'status':
                    print(f"{key}: {value}")
        else:
            # Fallback to CSV format for other types of responses
            writer = csv.DictWriter(sys.stdout, fieldnames=data.keys())
            writer.writeheader()
            writer.writerow(data)
    elif isinstance(data, list):
        if data:
            writer = csv.DictWriter(sys.stdout, fieldnames=data[0].keys())
            writer.writeheader()
            writer.writerows(data)

def cli_healthcheck():
    """Direct command line healthcheck without interactive mode"""
    try:
        api_client = APIClient()
        result = api_client.healthcheck()
        if result:
            print("\n🔍 System Health Status:")
            print("------------------------")
            print(f"Status: {'✅ OK' if result['status'] == 'OK' else '❌ Failed'}")
            print(f"Database: {result['dbconnection']}")
            print(f"Total Stations: {result['stations']}")
            print(f"Total Tags: {result['tags']}")
            print(f"Total Passes: {result['passes']}")
            print("------------------------\n")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        sys.exit(1)

def print_health_status(response):
    """Print the health status from the API response"""
    try:
        # Handle both response objects and dictionaries
        data = response.json() if hasattr(response, 'json') else response
        
        print("\n🔍 System Health Status:")
        print("------------------------")
        print(f"Status: {'✅ OK' if data.get('status') == 'OK' else '❌ Failed'}")
        if 'dbconnection' in data:
            print(f"Database: {data['dbconnection']}")
        if 'stations' in data:
            print(f"Total Stations: {data['stations']}")
        if 'tags' in data:
            print(f"Total Tags: {data['tags']}")
        if 'passes' in data:
            print(f"Total Passes: {data['passes']}")
        if 'message' in data:
            print(f"Message: {data['message']}")
        print("------------------------\n")
    except Exception as e:
        print(f"Error: Could not parse health check response - {str(e)}")

def handle_healthcheck(base_url, endpoints):
    """Handle the healthcheck command"""
    url = base_url + endpoints['healthcheck']
    try:
        response = requests.get(url)
        if response.status_code == 200:
            print_health_status(response)
        else:
            print(f"Error: Server returned status code {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to server: {e}")

def parse_tollstation_options(options):
    """Parse tollstationpasses command options"""
    station = None
    date_from = None
    date_to = None

    i = 0
    while i < len(options):
        if options[i] == '--station' and i + 1 < len(options):
            station = options[i + 1]
            i += 2
        elif options[i] == '--from' and i + 1 < len(options):
            date_from = options[i + 1]
            i += 2
        elif options[i] == '--to' and i + 1 < len(options):
            date_to = options[i + 1]
            i += 2
        else:
            i += 1

    if not all([station, date_from, date_to]):
        raise ValueError("Station, from date, and to date are all required")

    # Convert date format from YYYYMMDD to YYYY-MM-DD
    try:
        date_from = f"{date_from[:4]}-{date_from[4:6]}-{date_from[6:]}"
        date_to = f"{date_to[:4]}-{date_to[4:6]}-{date_to[6:]}"
    except IndexError:
        raise ValueError("Dates must be in YYYYMMDD format")

    return station, date_from, date_to

def handle_tollstation_passes(base_url, endpoints, options):
    """Handle the tollstationpasses command"""
    try:
        station, date_from, date_to = parse_tollstation_options(options)
        
        # Format the URL with the parameters
        url = base_url + endpoints['tollstationpasses'].format(
            station=station,
            date_from=date_from,
            date_to=date_to
        )
        
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            if data:
                print("\n📊 Toll Station Passes Report")
                print("----------------------------")
                # Assuming the response is a list of passes
                if isinstance(data, list):
                    # Print as table using csv writer
                    writer = csv.DictWriter(sys.stdout, fieldnames=data[0].keys())
                    writer.writeheader()
                    writer.writerows(data)
                else:
                    print(json.dumps(data, indent=2))
                print("----------------------------\n")
            else:
                print("No passes found for the specified criteria")
        else:
            print(f"Error: Server returned status code {response.status_code}")
            
    except ValueError as e:
        print(f"Error: {str(e)}")
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to server: {e}")

def parse_passanalysis_options(options):
    """Parse passanalysis command options"""
    stationop = None
    tagop = None
    date_from = None
    date_to = None

    i = 0
    while i < len(options):
        if options[i] == '--stationop' and i + 1 < len(options):
            stationop = options[i + 1]
            i += 2
        elif options[i] == '--tagop' and i + 1 < len(options):
            tagop = options[i + 1]
            i += 2
        elif options[i] == '--from' and i + 1 < len(options):
            date_from = options[i + 1]
            i += 2
        elif options[i] == '--to' and i + 1 < len(options):
            date_to = options[i + 1]
            i += 2
        else:
            i += 1

    if not all([stationop, tagop, date_from, date_to]):
        raise ValueError("Station operator, tag operator, from date, and to date are all required")

    # Convert date format from YYYYMMDD to YYYY-MM-DD
    try:
        date_from = f"{date_from[:4]}-{date_from[4:6]}-{date_from[6:]}"
        date_to = f"{date_to[:4]}-{date_to[4:6]}-{date_to[6:]}"
    except IndexError:
        raise ValueError("Dates must be in YYYYMMDD format")

    return stationop, tagop, date_from, date_to

def handle_passanalysis(base_url, endpoints, options):
    """Handle the passanalysis command"""
    try:
        stationop, tagop, date_from, date_to = parse_passanalysis_options(options)
        
        # Format the URL with the parameters
        url = base_url + endpoints['passanalysis'].format(
            stationop=stationop,
            tagop=tagop,
            date_from=date_from,
            date_to=date_to
        )
        
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            if data:
                print("\n📊 Pass Analysis Report")
                print("----------------------")
                if isinstance(data, list):
                    # Print as table using csv writer
                    writer = csv.DictWriter(sys.stdout, fieldnames=data[0].keys())
                    writer.writeheader()
                    writer.writerows(data)
                else:
                    print(json.dumps(data, indent=2))
                print("----------------------\n")
            else:
                print("No analysis data found for the specified criteria")
        else:
            print(f"Error: Server returned status code {response.status_code}")
            
    except ValueError as e:
        print(f"Error: {str(e)}")
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to server: {e}")

def handle_passescost(base_url, endpoints, options):
    """Handle the passescost command"""
    try:
        # We can reuse parse_passanalysis_options since it has the same parameters
        stationop, tagop, date_from, date_to = parse_passanalysis_options(options)
        
        # Format the URL with the parameters
        url = base_url + endpoints['passescost'].format(
            stationop=stationop,
            tagop=tagop,
            date_from=date_from,
            date_to=date_to
        )
        
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            if data:
                print("\n💰 Passes Cost Report")
                print("-------------------")
                if isinstance(data, list):
                    # Print as table using csv writer
                    writer = csv.DictWriter(sys.stdout, fieldnames=data[0].keys())
                    writer.writeheader()
                    writer.writerows(data)
                else:
                    print(json.dumps(data, indent=2))
                print("-------------------\n")
            else:
                print("No cost data found for the specified criteria")
        else:
            print(f"Error: Server returned status code {response.status_code}")
            
    except ValueError as e:
        print(f"Error: {str(e)}")
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to server: {e}")

def parse_chargesby_options(options):
    """Parse chargesby command options"""
    opid = None
    date_from = None
    date_to = None

    i = 0
    while i < len(options):
        if options[i] == '--opid' and i + 1 < len(options):
            opid = options[i + 1]
            i += 2
        elif options[i] == '--from' and i + 1 < len(options):
            date_from = options[i + 1]
            i += 2
        elif options[i] == '--to' and i + 1 < len(options):
            date_to = options[i + 1]
            i += 2
        else:
            i += 1

    if not all([opid, date_from, date_to]):
        raise ValueError("Operator ID, from date, and to date are all required")

    # Convert date format from YYYYMMDD to YYYY-MM-DD
    try:
        date_from = f"{date_from[:4]}-{date_from[4:6]}-{date_from[6:]}"
        date_to = f"{date_to[:4]}-{date_to[4:6]}-{date_to[6:]}"
    except IndexError:
        raise ValueError("Dates must be in YYYYMMDD format")

    return opid, date_from, date_to

def handle_chargesby(base_url, endpoints, options):
    """Handle the chargesby command"""
    try:
        opid, date_from, date_to = parse_chargesby_options(options)
        
        # Format the URL with the parameters
        url = base_url + endpoints['chargesby'].format(
            opid=opid,
            date_from=date_from,
            date_to=date_to
        )
        
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            if data:
                print("\n💳 Charges By Operator Report")
                print("--------------------------")
                if isinstance(data, list):
                    # Print as table using csv writer
                    writer = csv.DictWriter(sys.stdout, fieldnames=data[0].keys())
                    writer.writeheader()
                    writer.writerows(data)
                else:
                    print(json.dumps(data, indent=2))
                print("--------------------------\n")
            else:
                print("No charges found for the specified criteria")
        else:
            print(f"Error: Server returned status code {response.status_code}")
            
    except ValueError as e:
        print(f"Error: {str(e)}")
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to server: {e}")

def parse_admin_options(options):
    """Parse admin command options"""
    command = None
    source = None

    i = 0
    while i < len(options):
        if options[i] == '--addpasses':
            command = 'addpasses'
            i += 1
        elif options[i] == '--source' and i + 1 < len(options):
            source = options[i + 1]
            i += 2
        else:
            i += 1

    if command == 'addpasses' and not source:
        raise ValueError("Source file path is required (--source)")

    return command, source

def handle_admin(base_url, endpoints, options):
    """Handle the admin command"""
    try:
        command, source = parse_admin_options(options)
        
        if command == 'addpasses':
            print(f"\n📤 Uploading passes from {source}")
            print("------------------------")
            
            api_client = APIClient()
            result = api_client.addpasses(source)
            
            if result.get('status') == 'OK':
                print("\n✅ Success: Passes added successfully")
            else:
                print("\n❌ Error:")
                if 'message' in result:
                    print(f"Message: {result['message']}")
                if 'info' in result:
                    print(f"Info: {result['info']}")
        else:
            print("Unknown admin command. Available commands: --addpasses")
            
    except FileNotFoundError:
        print(f"❌ Error: File not found: {source}")
    except json.JSONDecodeError:
        print("❌ Error: Invalid response from server")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def main():
    args = sys.argv[1:]
    
    if not args:
        try:
            InterTollCLI().cmdloop()
        except KeyboardInterrupt:
            print("\nGoodbye!")
    else:
        command = args[0]
        if command == 'healthcheck':
            handle_healthcheck(config.API_BASE_URL, config.ENDPOINTS)
        elif command == 'tollstationpasses':
            handle_tollstation_passes(config.API_BASE_URL, config.ENDPOINTS, args[1:])
        elif command == 'passanalysis':
            handle_passanalysis(config.API_BASE_URL, config.ENDPOINTS, args[1:])
        elif command == 'passescost':
            handle_passescost(config.API_BASE_URL, config.ENDPOINTS, args[1:])
        elif command == 'chargesby':
            handle_chargesby(config.API_BASE_URL, config.ENDPOINTS, args[1:])
        elif command == 'admin':
            handle_admin(config.API_BASE_URL, config.ENDPOINTS, args[1:])
        else:
            print_help()

if __name__ == '__main__':
    main() 