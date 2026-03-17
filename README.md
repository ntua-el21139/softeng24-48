# InterToll - Toll Interoperability System

A comprehensive toll management system that enables interoperability between different toll operators in Greece.

## Project Structure

The project consists of three main components:

### 1. Back-end (`/back-end`)

A RESTful API service built with Node.js and Express that handles:
- User authentication and authorization 
- Toll pass data management
- Financial calculations and debt offsetting
- Data import/export functionality

### 2. Front-end (`/front-end`)

A modern web application that provides:
- User-friendly interface for toll operators
- Real-time debt monitoring and management
- Interactive data visualization
- Secure authentication system

### 3. CLI Client (`/cli-client`)

A command-line interface tool that enables:
- Data management and retrieval
- Automated testing and verification
- Batch operations for toll data
- System health monitoring

### 4. SSH Server (`/cli-client/ssh_server.py`)

A secure SSH server that provides remote access to the CLI tool:
- Remote command execution via SSH
- Multi-user support with connection management
- Secure key-based authentication
- Interactive shell interface

Key Features:
- Automatic host key generation
- Connection limit management
- Network interface detection
- Firewall configuration guidance

Connection Details:
- Default Port: 2222
- Authentication: None required (development mode)
- Max Connections: 5

Connection Methods:
```bash
# Secure Method
ssh-keygen -R "[localhost]:2222"
ssh -p 2222 localhost -o PreferredAuthentications=none

# Development Method
ssh -p 2222 localhost -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o PreferredAuthentications=none
```

## Installation Guide

### Prerequisites

- Python 3.x
- Node.js and npm
- MySQL Server
- Git

### Installation Steps

#### For Unix-based Systems (Linux/macOS)

1. Clone the repository:
   ```bash
   git clone https://github.com/ntua/softeng24-48.git
   cd softeng24-48
   ```

2. Run the setup script:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. Update MySQL credentials:
   - Open `back-end/.env`
   - Update the following fields with your MySQL credentials:
     ```
     DB_HOST=127.0.0.1
     DB_USER=your_username
     DB_PASSWORD=your_password
     DB_DATABASE=interToll
     ```

4. Source your shell configuration:
   ```bash
   source ~/.zshrc   # For Zsh users
   # OR
   source ~/.bashrc  # For Bash users
   ```

#### For Windows

1. Clone the repository:
   ```cmd
   git clone https://github.com/ntua/softeng24-48.git
   cd softeng24-48
   ```

2. Run the setup script:
   ```cmd
   setup.bat
   ```

3. Update MySQL credentials:
   - Open `back-end\.env`
   - Update the following fields with your MySQL credentials:
     ```
     DB_HOST=127.0.0.1
     DB_USER=your_username
     DB_PASSWORD=your_password
     DB_DATABASE=interToll
     ```

4. Close and reopen your command prompt for PATH changes to take effect.

### Post-Installation

1. Ensure MySQL service is running
2. Start the application:
   ```bash
   npm start
   ```

### SSH Server Usage

1. Start the SSH server:
   ```bash
   python3 cli-client/ssh_server.py
   ```

2. Connect to the server (choose one method):
   ```bash
   # Secure Method
   ssh -p 2222 localhost -o PreferredAuthentications=none

   # Development Method (ignores host key verification)
   ssh -p 2222 localhost -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o PreferredAuthentications=none
   ```

### Troubleshooting

- If you encounter SSL certificate issues with the CLI client, check the `.env` file in the `cli-client` directory
- For MySQL connection issues, verify your credentials in `back-end/.env` and ensure the MySQL service is running
- If the CLI tool is not accessible globally, ensure your PATH environment variable is properly set

### Environment Files

The setup script creates two main environment files:

1. `back-end/.env`: Contains database and server configurations
2. `cli-client/.env`: Contains API endpoint configurations

Make sure to review and update these files according to your environment.

