@echo off
setlocal enabledelayedexpansion

:: Colors for output
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "NC=[0m"

:: Function to print status messages
echo Installing Python dependencies...
python -m pip install -r requirements.txt
if %ERRORLEVEL% EQU 0 (
    echo %GREEN%[✓]%NC% Python dependencies installed successfully
) else (
    echo %RED%[✗]%NC% Failed to install Python dependencies
    exit /b 1
)

:: Install Node.js dependencies
echo.
echo Installing Node.js dependencies...

:: Root directory
if exist package.json (
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo %RED%[✗]%NC% Failed to install root Node.js dependencies
        exit /b 1
    )
    echo %GREEN%[✓]%NC% Root Node.js dependencies installed successfully
)

:: Frontend
if exist front-end\package.json (
    cd front-end
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo %RED%[✗]%NC% Failed to install frontend Node.js dependencies
        exit /b 1
    )
    
    :: Install additional frontend dependencies
    echo Installing additional frontend dependencies...
    call npm install react-helmet-async
    if %ERRORLEVEL% NEQ 0 (
        echo %RED%[✗]%NC% Failed to install additional frontend dependencies
        exit /b 1
    )

    :: Generate SSL certificates
    echo Generating SSL certificates...
    if not exist .cert mkdir .cert
    if exist generate-cert.sh (
        bash generate-cert.sh
        echo %GREEN%[✓]%NC% SSL certificates generated successfully
    ) else (
        echo %YELLOW%[!]%NC% generate-cert.sh not found - you'll need to generate SSL certificates manually
    )

    echo %GREEN%[✓]%NC% Frontend Node.js dependencies installed successfully
    cd ..
)

:: Backend
if exist back-end\package.json (
    cd back-end
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo %RED%[✗]%NC% Failed to install backend Node.js dependencies
        exit /b 1
    )
    echo %GREEN%[✓]%NC% Backend Node.js dependencies installed successfully
    cd ..
)

:: Setup environment files
echo.
echo Setting up environment files...

:: Backend environment
if not exist back-end\.env (
    if exist back-end\.env.example (
        copy back-end\.env.example back-end\.env
        echo %GREEN%[✓]%NC% Created back-end/.env from example
    ) else (
        echo # Database Configuration > back-end\.env
        echo DB_HOST=127.0.0.1 >> back-end\.env
        echo DB_USER=root >> back-end\.env
        echo DB_PASSWORD= >> back-end\.env
        echo DB_DATABASE=interToll >> back-end\.env
        echo. >> back-end\.env
        echo # Server Configuration >> back-end\.env
        echo PORT=9115 >> back-end\.env
        echo NODE_ENV=development >> back-end\.env
        echo. >> back-end\.env
        echo # JWT Configuration >> back-end\.env
        echo JWT_SECRET=your_jwt_secret_key >> back-end\.env
        echo %GREEN%[✓]%NC% Created default back-end/.env file
        echo %YELLOW%[!]%NC% Please update back-end/.env with your MySQL credentials
    )
)

:: CLI environment
if not exist cli-client\.env (
    if exist cli-client\.env.example (
        copy cli-client\.env.example cli-client\.env
        echo %GREEN%[✓]%NC% Created cli-client/.env from example
    ) else (
        echo # API Configuration > cli-client\.env
        echo BASE_URL=https://localhost:9115 >> cli-client\.env
        echo PYTHONWARNINGS=ignore:Unverified HTTPS request >> cli-client\.env
        echo REQUESTS_CA_BUNDLE= >> cli-client\.env
        echo CURL_CA_BUNDLE= >> cli-client\.env
        echo %GREEN%[✓]%NC% Created default cli-client/.env file
    )
)

:: Setup CLI tool
echo.
echo Setting up CLI tool...

:: Add CLI directory to PYTHONPATH
setx PYTHONPATH "%PYTHONPATH%;%CD%\cli-client"
echo %GREEN%[✓]%NC% Added CLI directory to PYTHONPATH

:: Create a wrapper batch file for the CLI tool
echo @echo off > "%USERPROFILE%\se2448.bat"
echo python "%CD%\cli-client\se2448.py" %%* >> "%USERPROFILE%\se2448.bat"
echo %GREEN%[✓]%NC% Created CLI wrapper script

:: Add user directory to PATH if not already there
echo %PATH% | find "%USERPROFILE%" > nul
if %ERRORLEVEL% NEQ 0 (
    setx PATH "%PATH%;%USERPROFILE%"
    echo %GREEN%[✓]%NC% Added user directory to PATH
) else (
    echo %GREEN%[✓]%NC% User directory already in PATH
)

echo.
echo %GREEN%Setup completed successfully!%NC%
echo %YELLOW%[!]%NC% Important: Before starting the application:
echo 1. Update MySQL credentials in back-end\.env
echo 2. Make sure MySQL service is running
echo 3. Close and reopen your command prompt for PATH changes to take effect
echo.
echo Then you can start the application with: npm start

endlocal 