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
import requests

class InterTollSSHServer(paramiko.ServerInterface):
    def __init__(self):
        self.event = threading.Event()

    def check_auth_password(self, username, password):
        # Accept any username/password combination
        return paramiko.AUTH_SUCCESSFUL

    def get_allowed_auths(self, username):
        # Allow connection without authentication
        return 'none'

    def check_auth_none(self, username):
        # Allow connection without authentication
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
    old_stdout = sys.stdout
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
        api_client = cli.api_client
        
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
                
                # Read initial command
                initial_cmd = read_command(channel)
                
                if not initial_cmd:
                    continue
                
                try:
                    initial_cmd = initial_cmd.strip()
                    if initial_cmd.lower() in ['3', 'exit', 'quit']:
                        channel.send('Goodbye!\r\n')
                        break
                    
                    if initial_cmd == '1':
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
                        
                        while True:
                            channel.send('Enter your command: ')
                            actual_cmd = read_command(channel)
                            if actual_cmd:
                                actual_cmd = actual_cmd.strip()
                                
                                if actual_cmd.lower() == 'back':
                                    print("\n" + cli.intro)
                                    break
                                
                                if actual_cmd:  # Make sure command isn't empty after stripping
                                    args = actual_cmd.split()
                                    if args and args[0].lower() == 'se2448':
                                        try:
                                            cli.handle_command(args[1:])
                                        except Exception as e:
                                            print(f"Error executing command: {str(e)}")
                                        finally:
                                            output_catcher.flush()
                                    else:
                                        print("Commands must start with 'se2448'")
                                        output_catcher.flush()
                    
                    elif initial_cmd == '2':
                        cli.do_2('')  # Show help
                        output_catcher.flush()
                    else:
                        print("Please select a valid option (1, 2, or 3)")
                        output_catcher.flush()
                    
                except Exception as e:
                    print(f'Error: {str(e)}')
                    output_catcher.flush()
                    
            except Exception as e:
                print(f'Error processing command: {str(e)}')
                output_catcher.flush()

    except Exception as e:
        sys.stdout = old_stdout
        sys.stdout.write(f'*** Caught exception: {str(e)}\n')
        sys.stdout.flush()
    finally:
        sys.stdout = old_stdout
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
    
    return line

def start_server(port=2222, key_file='ssh_host_key', host='0.0.0.0', max_connections=5):
    """Start the SSH server"""
    global host_key
    active_connections = []  # Track active connections
    
    # Ensure the key file has the correct path
    key_file = os.path.abspath(key_file) if key_file else 'ssh_host_key'
    
    try:
        # Try to load existing key with proper error handling
        if os.path.exists(key_file):
            try:
                host_key = paramiko.RSAKey(filename=key_file)
                print(f"Loaded existing host key from {key_file}")
            except Exception as e:
                print(f"Error loading existing host key: {e}")
                print("Generating new key...")
                host_key = paramiko.RSAKey.generate(2048)
                host_key.write_private_key_file(key_file)
                print(f"Generated new host key and saved to {key_file}")
        else:
            # Generate new key if none exists
            print(f"No existing host key found at {key_file}")
            host_key = paramiko.RSAKey.generate(2048)
            host_key.write_private_key_file(key_file)
            print(f"Generated new host key and saved to {key_file}")
            
        # Set proper permissions on the key file (Unix-like systems only)
        if os.name != 'nt':  # not Windows
            os.chmod(key_file, 0o600)
            
    except Exception as e:
        print(f"Critical error with host key: {e}")
        sys.exit(1)

    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        sock.bind((host, port))
        sock.listen(100)
        
        print('\nSSH Server started!')
        print(f'Listening on port {port}...')
        
        # Get network interfaces
        try:
            import netifaces
            interfaces = netifaces.interfaces()
            
            print('\nAvailable on:')
            for iface in interfaces:
                addrs = netifaces.ifaddresses(iface)
                if netifaces.AF_INET in addrs:
                    for addr in addrs[netifaces.AF_INET]:
                        print(f'- {iface}: {addr["addr"]}')
        except ImportError:
            print("Install 'netifaces' package for detailed network interface information")
        
        print('\nConnection instructions:')
        print('Option 1 (Secure):')
        print(f'1. First remove old host key:')
        print(f'   ssh-keygen -R "[localhost]:2222"')
        print(f'2. Then connect:')
        print(f'   ssh -p {port} localhost -o PreferredAuthentications=none')
        print('\nOption 2 (Development only):')
        print(f'   ssh -p {port} localhost -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o PreferredAuthentications=none')
        print('\nNote: No username or password required')
        print('\nTroubleshooting:')
        print('1. Make sure your firewall allows incoming connections on port 2222')
        print('2. Try these commands to allow Python through the firewall:')
        print('   macOS: sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add $(which python3)')
        print('   Linux: sudo ufw allow 2222/tcp')
        print('3. Or temporarily disable firewall for testing')
        
        while True:
            try:
                client, addr = sock.accept()
                
                # Check if we've reached max connections
                active_connections = [t for t in active_connections if t.is_alive()]
                if len(active_connections) >= max_connections:
                    print(f"Maximum connections ({max_connections}) reached. Rejecting connection from {addr[0]}:{addr[1]}")
                    client.close()
                    continue
                
                print(f"\nNew connection attempt from {addr[0]}:{addr[1]}")
                print(f"Active connections: {len(active_connections)}/{max_connections}")
                
                thread = threading.Thread(target=handle_client, args=(client, addr))
                thread.daemon = True
                thread.start()
                active_connections.append(thread)
                
            except Exception as e:
                print(f"Error accepting connection: {e}")
            
    except KeyboardInterrupt:
        print('\nServer shutting down...')
        # Clean up connections
        for thread in active_connections:
            if thread.is_alive():
                thread.join(timeout=1.0)
    except Exception as e:
        print(f'*** Listen/accept failed: {str(e)}')
    finally:
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