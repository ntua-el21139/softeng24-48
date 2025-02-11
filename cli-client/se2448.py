#!/usr/bin/env python3
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
from getpass import getpass  # Add this import for hidden password input

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

    def cmdloop(self, intro=None):
        """Override cmdloop to start directly"""
        super().cmdloop(intro)

    def do_1(self, arg):
        """Run CLI commands"""
        # Show instructions once when entering command mode
        print("\nEnter your command after the prompt below.")
        print("Example formats:")
        print("  se2448 healthcheck")
        print("  se2448 tollstationpasses --station AO01 --from 20220101 --to 20220131")
        print("  se2448 passanalysis --stationop OP01 --tagop TAG01 --from 20220101 --to 20220131")
        print("  se2448 passescost --stationop OP01 --tagop TAG01 --from 20220101 --to 20220131")
        print("  se2448 chargesby --opid OP01 --from 20220101 --to 20220131")
        print("  se2448 admin --addpasses --source /path/to/passes.json")
        print("  Type 'back' to return to main menu\n")
        
        while True:  # Main command loop
            command = input("Enter your command: ")
            command = command.strip()
            
            if not command:
                continue
            
            if command.lower() == 'back':
                print("\n" + self.intro)
                break
            
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
            format_type = parse_format_option(args)  # Get format from args

            if scope == 'healthcheck':
                result = self.api_client.healthcheck()
                print_health_status(result, format_type)  # Pass format type
            elif scope == 'resetpasses':
                result = self.api_client.resetpasses()
                output_result(result, format_type)  # Pass format type
            elif scope == 'resetstations':
                result = self.api_client.reset_stations()
                output_result(result, format_type)  # Pass format type
            elif scope == 'login':
                username, password = parse_login_options(args[1:])
                result = login(username, password)
                output_result(result, format_type)  # Pass format type
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
        except ValueError as e:
            print(f"\n❌ Error: {str(e)}")
        except Exception as e:
            print(f"\n❌ Error: {str(e)}")

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

def parse_format_option(options):
    """Parse format option from command arguments"""
    i = 0
    while i < len(options):
        # Check for the format flag and potential typos
        if options[i].startswith('--') and 'format' in options[i].lower():
            if options[i] != '--format':
                # Suggest the correct flag if there's a typo
                raise ValueError(f"Unknown parameter '{options[i]}'. Did you mean '--format'?")
            
            if i + 1 >= len(options):
                raise ValueError("--format requires a value (json or csv)")
                
            format_type = options[i + 1].lower()
            if format_type not in ['json', 'csv']:
                raise ValueError(f"Invalid format '{format_type}'. Format must be either 'json' or 'csv'")
            return format_type
        i += 1
    return 'csv'  # default format when no --format argument is provided

def output_result(data, format_type='csv'):
    """Output the result in the specified format"""
    if not data:
        return
        
    print("\n" + "=" * 60)
    print(f"⚠️  OUTPUT FORMAT: {format_type.upper()}")
    print("=" * 60)
    
    if format_type == 'json':
        # Ensure the output is valid JSON
        try:
            # Pretty print JSON with indentation
            print(json.dumps(data, indent=2))
            print("\n✅ Successfully output in JSON format")
        except Exception as e:
            print(f"❌ Error formatting JSON: {str(e)}")
    else:  # csv format
        try:
            if isinstance(data, dict):
                # For healthcheck and simple responses
                if 'status' in data:
                    status_symbol = '✅' if data['status'] == 'OK' else '❌'
                    print(f"{status_symbol} Status: {data['status']}")
                    # Print other fields if they exist
                    for key, value in data.items():
                        if key != 'status':
                            print(f"{key}: {value}")
                else:
                    # Output as CSV
                    writer = csv.DictWriter(sys.stdout, fieldnames=data.keys())
                    writer.writeheader()
                    writer.writerow(data)
            elif isinstance(data, list):
                if data:
                    writer = csv.DictWriter(sys.stdout, fieldnames=data[0].keys())
                    writer.writeheader()
                    writer.writerows(data)
            print("\n✅ Successfully output in CSV format")
        except Exception as e:
            print(f"❌ Error formatting CSV: {str(e)}")
    
    print("=" * 60)

def cli_healthcheck():
    """Direct command line healthcheck without interactive mode"""
    try:
        api_client = APIClient()
        result = api_client.healthcheck()
        if result:
            output_result(result)  # Use the standard output formatter instead of custom printing
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        sys.exit(1)

def print_health_status(response, format_type='csv'):
    """Print the health status from the API response"""
    try:
        # Handle both response objects and dictionaries
        data = response.json() if hasattr(response, 'json') else response
        
        if format_type == 'json':
            output_result(data, format_type)
        else:  # csv format
            print("\n🔍 System Health Status")
            print("=" * 60)
            print(f"⚠️  OUTPUT FORMAT: CSV")
            print("=" * 60)
            
            # Convert health data to CSV format
            writer = csv.DictWriter(sys.stdout, fieldnames=data.keys())
            writer.writeheader()
            writer.writerow(data)
            
            print("\n✅ Successfully output in CSV format")
            print("=" * 60)
            
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

    # Check for missing parameters and provide specific error messages
    missing = []
    if not station:
        missing.append("--station")
    if not date_from:
        missing.append("--from")
    if not date_to:
        missing.append("--to")
    
    if missing:
        raise ValueError(f"Missing required parameters: {', '.join(missing)}\n" +
                        "Correct format: se2448 tollstationpasses --station <value> " +
                        "--from YYYYMMDD --to YYYYMMDD")

    # Validate date format is YYYYMMDD
    try:
        if not (len(date_from) == 8 and len(date_to) == 8):
            raise ValueError("Dates must be in YYYYMMDD format")
        return station, date_from, date_to
    except IndexError:
        raise ValueError("Dates must be in YYYYMMDD format")

def handle_tollstation_passes(base_url, endpoints, options):
    """Handle the tollstationpasses command"""
    try:
        station, date_from, date_to = parse_tollstation_options(options)
        format_type = parse_format_option(options)
        
        # Format the URL with direct path parameters
        url = f"{base_url}/api/tollStationPasses/{station}/{date_from}/{date_to}"
        
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            if data:
                print("\n📊 Toll Station Passes Report")
                print("----------------------------")
                output_result(data, format_type)
                print("----------------------------\n")
            else:
                print("No passes found for the specified criteria")
        elif response.status_code == 204:
            print(f"Error: Server returned status code {response.status_code}")
            print("No data is available for this time period.")
        elif response.status_code == 400:
            print(f"Error: Server returned status code {response.status_code}")
            error_data = response.json()
            if 'message' in error_data:
                print(f"Message from API: {error_data['message']}")
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

    # Validate date format is YYYYMMDD
    try:
        if not (len(date_from) == 8 and len(date_to) == 8):
            raise ValueError("Dates must be in YYYYMMDD format")
        # Keep dates in YYYYMMDD format without adding hyphens
        return stationop, tagop, date_from, date_to
    except IndexError:
        raise ValueError("Dates must be in YYYYMMDD format")

def handle_passanalysis(base_url, endpoints, options):
    """Handle the passanalysis command"""
    try:
        stationop, tagop, date_from, date_to = parse_passanalysis_options(options)
        format_type = parse_format_option(options)
        
        url = f"{base_url}/api/passAnalysis/{stationop}/{tagop}/{date_from}/{date_to}"
        
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            if data:
                print("\n📊 Pass Analysis Report")
                print("----------------------")
                output_result(data, format_type)
                print("----------------------\n")
            else:
                print("No analysis data found for the specified criteria")
        elif response.status_code == 204:
            print(f"Error: Server returned status code {response.status_code}")
            print("No data is available for this time period.")
        elif response.status_code == 400:
            print(f"Error: Server returned status code {response.status_code}")
            error_data = response.json()
            if 'message' in error_data:
                print(f"Message from API: {error_data['message']}")
        else:
            print(f"Error: Server returned status code {response.status_code}")
            
    except ValueError as e:
        print(f"Error: {str(e)}")
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to server: {e}")

def parse_passescost_options(options):
    """Parse passescost command options"""
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

    missing = []
    if not stationop:
        missing.append("--stationop")
    if not tagop:
        missing.append("--tagop")
    if not date_from:
        missing.append("--from")
    if not date_to:
        missing.append("--to")
    
    if missing:
        raise ValueError(f"Missing required parameters: {', '.join(missing)}\n" +
                        "Correct format: se2448 passescost --stationop <value> --tagop <value> " +
                        "--from YYYYMMDD --to YYYYMMDD")

    # Validate date format is YYYYMMDD
    try:
        if not (len(date_from) == 8 and len(date_to) == 8):
            raise ValueError("Dates must be in YYYYMMDD format")
        return stationop, tagop, date_from, date_to
    except IndexError:
        raise ValueError("Dates must be in YYYYMMDD format")

def handle_passescost(base_url, endpoints, options):
    """Handle the passescost command"""
    try:
        stationop, tagop, date_from, date_to = parse_passescost_options(options)
        format_type = parse_format_option(options)
        
        url = f"{base_url}/api/passesCost/{stationop}/{tagop}/{date_from}/{date_to}"
        
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            if data:
                print("\n💰 Passes Cost Report")
                print("-------------------")
                output_result(data, format_type)
                print("-------------------\n")
            else:
                print("No cost data found for the specified criteria")
        elif response.status_code == 204:
            print(f"Error: Server returned status code {response.status_code}")
            print("No data is available for this time period.")
        elif response.status_code == 400:
            print(f"Error: Server returned status code {response.status_code}")
            error_data = response.json()
            if 'message' in error_data:
                print(f"Message from API: {error_data['message']}")
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

    missing = []
    if not opid:
        missing.append("--opid")
    if not date_from:
        missing.append("--from")
    if not date_to:
        missing.append("--to")
    
    if missing:
        raise ValueError(f"Missing required parameters: {', '.join(missing)}\n" +
                        "Correct format: se2448 chargesby --opid <value> " +
                        "--from YYYYMMDD --to YYYYMMDD")

    # Validate date format is YYYYMMDD
    try:
        if not (len(date_from) == 8 and len(date_to) == 8):
            raise ValueError("Dates must be in YYYYMMDD format")
        return opid, date_from, date_to
    except IndexError:
        raise ValueError("Dates must be in YYYYMMDD format")

def handle_chargesby(base_url, endpoints, options):
    """Handle the chargesby command"""
    try:
        opid, date_from, date_to = parse_chargesby_options(options)
        format_type = parse_format_option(options)
        
        url = f"{base_url}/api/chargesBy/{opid}/{date_from}/{date_to}"
        
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            if data:
                print("\n💳 Charges By Operator Report")
                print("--------------------------")
                output_result(data, format_type)
                print("--------------------------\n")
            else:
                print("No charges found for the specified criteria")
        elif response.status_code == 204:
            print(f"Error: Server returned status code {response.status_code}")
            print("No data is available for this time period.")
        elif response.status_code == 400:
            print(f"Error: Server returned status code {response.status_code}")
            error_data = response.json()
            if 'message' in error_data:
                print(f"Message from API: {error_data['message']}")
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
            
            if isinstance(result, dict):
                if result.get('status') == 'OK':
                    print("\n✅ Success: Passes added successfully")
                    if 'info' in result:
                        print(f"Info: {result['info']}")
                else:
                    print("\n❌ Error:")
                    if 'message' in result:
                        print(f"Message: {result['message']}")
                    if 'error' in result:
                        print(f"Error: {result['error']}")
                    if 'info' in result:
                        print(f"Info: {result['info']}")
            else:
                print("\n❌ Error: Unexpected response format from API")
                print(f"Response: {result}")
            
    except FileNotFoundError:
        print(f"❌ Error: File not found: {source}")
    except json.JSONDecodeError:
        print("❌ Error: Invalid JSON response from server")
    except requests.exceptions.RequestException as e:
        print(f"❌ Error: API request failed - {str(e)}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def cli_resetpasses():
    """Direct command line resetpasses without interactive mode"""
    try:
        api_client = APIClient()
        result = api_client.resetpasses()
        if result:
            output_result(result)  # Use standard output formatter
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        sys.exit(1)

def cli_resetstations():
    """Direct command line resetstations without interactive mode"""
    try:
        api_client = APIClient()
        result = api_client.reset_stations()
        if result:
            output_result(result)  # Use standard output formatter
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        sys.exit(1)

def main():
    args = sys.argv[1:]
    
    if not args:
        try:
            InterTollCLI().cmdloop()
        except KeyboardInterrupt:
            print("\nGoodbye!")
    else:
        cli = InterTollCLI()
        scope = args[0]
        if scope == 'healthcheck':
            cli_healthcheck()
        elif scope == 'resetpasses':
            cli_resetpasses()
        elif scope == 'resetstations':
            cli_resetstations()  # Call cli_resetstations directly
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
            print_help()

if __name__ == '__main__':
    main() 