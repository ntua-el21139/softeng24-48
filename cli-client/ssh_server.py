import paramiko
import socket
import threading
import sys
import os
from se2448 import (
    InterTollCLI, 
    handle_healthcheck, 
    handle_tollstation_passes,
    handle_passanalysis,
    handle_passescost,
    handle_chargesby,
    handle_admin
)
import config

class InterTollSSHServer(paramiko.ServerInterface):
    def __init__(self):
        self.event = threading.Event()

    def check_auth_password(self, username, password):
        # For demo purposes, accept any username/password
        # In production, implement proper authentication
        return paramiko.AUTH_SUCCESSFUL

    def check_channel_request(self, kind, chanid):
        if kind == "session":
            return paramiko.OPEN_SUCCEEDED
        return paramiko.OPEN_FAILED_ADMINISTRATIVELY_PROHIBITED

    def check_channel_shell_request(self, channel):
        self.event.set()
        return True

    def check_channel_pty_request(self, channel, term, width, height, pixelwidth, pixelheight, modes):
        return True

class SSHOutputCatcher:
    def __init__(self, channel):
        self.channel = channel
        self.buffer = ""

    def write(self, data):
        if data:
            # Convert all newlines to CRLF
            formatted_data = data.replace('\n', '\r\n')
            self.channel.send(formatted_data)

    def flush(self):
        pass

def handle_client(client, addr):
    sys.stdout.write(f'New connection from {addr[0]}:{addr[1]}\n')
    sys.stdout.flush()
    
    try:
        transport = paramiko.Transport(client)
        transport.add_server_key(host_key)
        
        server = InterTollSSHServer()
        transport.start_server(server=server)

        channel = transport.accept(20)
        if channel is None:
            sys.stdout.write('*** No channel.\n')
            sys.stdout.flush()
            return

        server.event.wait(10)
        if not server.event.is_set():
            sys.stdout.write('*** Client never asked for a shell.\n')
            sys.stdout.flush()
            return

        # Create output catcher and redirect stdout
        output_catcher = SSHOutputCatcher(channel)
        old_stdout = sys.stdout
        sys.stdout = output_catcher
        
        # Create CLI instance with API client
        cli = InterTollCLI()
        api_client = cli.api_client  # Use the same API client instance
        
        # Send welcome message
        channel.send('\r\n')
        channel.send('Welcome to InterToll SSH Server!\r\n\r\n')
        
        # Send CLI intro
        for line in cli.intro.split('\n'):
            channel.send(line + '\r\n')
        
        # Main interaction loop
        while True:
            try:
                # Show prompt
                channel.send(cli.prompt)
                
                # Read initial command (1, 2, or 3)
                initial_cmd = read_command(channel)
                
                if not initial_cmd:
                    continue
                
                try:
                    if initial_cmd.strip() in ['3', 'exit', 'quit']:
                        channel.send('Goodbye!\r\n')
                        break
                    
                    # Handle the initial command
                    if initial_cmd.strip() == '1':
                        while True:
                            # Show the command prompt
                            print("\nEnter your command after the prompt below.")
                            print("Example formats:")
                            print("  se2448 healthcheck")
                            print("  se2448 tollstationpasses --station AO01 --from 20220101 --to 20220131\n")
                            
                            # Get the actual command
                            channel.send('Enter your command: ')
                            actual_cmd = read_command(channel)
                            if actual_cmd:
                                # Parse command and use the CLI's handle_command method
                                args = actual_cmd.split()
                                if args[0] == 'se2448':
                                    cli.handle_command(args[1:])  # Pass everything after 'se2448'
                                else:
                                    print("Commands must start with 'se2448'")
                                output_catcher.flush()
                            
                            # After command execution, show menu and return to main prompt
                            print("\n")
                            for line in cli.intro.split('\n'):
                                print(line)
                            break  # Return to main menu
                    else:
                        cli.onecmd(initial_cmd)
                        output_catcher.flush()
                        
                except Exception as e:
                    print(f'Error: {str(e)}')
                    output_catcher.flush()
                        
            except Exception as e:
                print(f'Error processing command: {str(e)}')
                output_catcher.flush()

    except Exception as e:
        sys.stdout = old_stdout  # Restore original stdout
        sys.stdout.write(f'*** Caught exception: {str(e)}\n')
        sys.stdout.flush()
    finally:
        sys.stdout = old_stdout  # Restore original stdout
        try:
            transport.close()
        except:
            pass

def read_command(channel):
    """Read a command from the SSH channel"""
    line = ''
    while True:
        char = channel.recv(1)
        if not char:  # Connection closed
            return None
            
        char = char.decode('utf-8')
        
        if char == '\r' or char == '\n':  # Enter key
            channel.send('\r\n')
            break
        elif char == '\x03':  # Ctrl+C
            channel.send('^C\r\n')
            return None
        elif char == '\x7f' or char == '\x08':  # Backspace
            if line:
                line = line[:-1]
                channel.send('\b \b')
        else:
            line += char
            channel.send(char)
    
    return line.strip()

def start_server(port=2222, key_file=None, host='0.0.0.0'):
    """Start the SSH server"""
    global host_key
    if key_file and os.path.exists(key_file):
        host_key = paramiko.RSAKey(filename=key_file)
        print(f"Loaded existing host key from {key_file}")
    else:
        host_key = paramiko.RSAKey.generate(2048)
        if key_file:
            host_key.write_private_key_file(key_file)
            print(f"Generated new host key and saved to {key_file}")
    
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        sock.bind((host, port))
        print(f"Successfully bound to {host}:{port}")
    except Exception as e:
        print(f'*** Bind failed: {str(e)}')
        sys.exit(1)

    try:
        sock.listen(100)
        print(f'Listening for connections on {host}:{port}...')
        
        # Get all available IP addresses
        hostname = socket.gethostname()
        local_ip = socket.gethostbyname(hostname)
        print(f'Hostname: {hostname}')
        print(f'Local IP address: {local_ip}')
        
        # Try to get all network interfaces
        try:
            import netifaces
            print("\nAvailable network interfaces:")
            for interface in netifaces.interfaces():
                addrs = netifaces.ifaddresses(interface)
                if netifaces.AF_INET in addrs:
                    for addr in addrs[netifaces.AF_INET]:
                        print(f"Interface {interface}: {addr['addr']}")
        except ImportError:
            print("Install 'netifaces' package for detailed network interface information")
        
        print('\nConnection instructions:')
        print(f'1. From this machine: ssh -p {port} username@localhost')
        print(f'2. From local network: ssh -p {port} username@{local_ip}')
        print('Note: Any username/password combination will work for testing')
        
        while True:
            try:
                client, addr = sock.accept()
                print(f"\nNew connection attempt from {addr[0]}:{addr[1]}")
                thread = threading.Thread(target=handle_client, args=(client, addr))
                thread.daemon = True
                thread.start()
            except Exception as e:
                print(f"Error accepting connection: {e}")
            
    except KeyboardInterrupt:
        print('\nServer shutting down...')
    except Exception as e:
        print(f'*** Listen/accept failed: {str(e)}')
    
    try:
        sock.close()
    except:
        pass

if __name__ == '__main__':
    # Add netifaces to requirements.txt
    try:
        import netifaces
    except ImportError:
        print("Installing netifaces package...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "netifaces"])
        import netifaces
    
    start_server(port=2222, key_file='ssh_host_key', host='0.0.0.0') 