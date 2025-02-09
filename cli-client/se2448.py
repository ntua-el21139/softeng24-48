import click
import json
import csv
import sys
from typing import Optional
from datetime import datetime
import cmd
from api_client import APIClient

class InterTollCLI(cmd.Cmd):
    intro = """
    ╔════════════════════════════════════════╗
    ║          Welcome to InterToll          ║
    ║----------------------------------------║
    ║  1. Run commands (se2448 scope ...)    ║
    ║  2. Show help page                     ║
    ║  3. Exit                              ║
    ╚════════════════════════════════════════╝
    """
    prompt = 'InterToll> '

    def __init__(self):
        super().__init__()
        self.api_client = APIClient()

    def do_1(self, arg):
        """Run CLI commands"""
        command = input("Enter your command (e.g., 'se2448 healthcheck'): ")
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
                healthcheck()
            elif scope == 'resetpasses':
                confirm = input("\n⚠️  WARNING: This will delete all passes from the database. Are you sure? (y/N): ")
                if confirm.lower() == 'y':
                    resetpasses()
                else:
                    print("Operation cancelled.")
            elif scope == 'login':
                username, password = parse_login_options(args[1:])
                login(username, password)
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
        if result:
            output_result(result)
        else:
            print("Error: No response from API")
    except Exception as e:
        print(f"Error during healthcheck: {str(e)}")

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
    """Output the result in CSV format"""
    if isinstance(data, dict):
        writer = csv.DictWriter(sys.stdout, fieldnames=data.keys())
        writer.writeheader()
        writer.writerow(data)
    elif isinstance(data, list):
        if data:
            writer = csv.DictWriter(sys.stdout, fieldnames=data[0].keys())
            writer.writeheader()
            writer.writerows(data)

if __name__ == '__main__':
    try:
        InterTollCLI().cmdloop()
    except KeyboardInterrupt:
        print("\nGoodbye!") 