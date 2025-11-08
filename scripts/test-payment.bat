@echo off
REM Simple launcher for payment simulation scripts
REM This .bat file delegates to better scripts (PowerShell or Node.js)
REM
REM Usage: test-payment.bat <ORDER_ID>
REM Example: test-payment.bat ORD-20251109-001

if "%1"=="" (
    echo ========================================
    echo   Payment Simulation Script Launcher
    echo ========================================
    echo.
    echo Error: Order ID required!
    echo.
    echo Usage: test-payment.bat ORDER_ID
    echo Example: test-payment.bat ORD-20251109-001
    echo.
    exit /b 1
)

set ORDER_ID=%1

echo ========================================
echo   Payment Simulation Script Launcher
echo ========================================
echo.
echo Order ID: %ORDER_ID%
echo.
echo Choose your preferred method:
echo   [1] PowerShell (Recommended - Full automation)
echo   [2] Node.js (Cross-platform)
echo   [3] Cancel
echo.
choice /C 123 /M "Select option"

if errorlevel 3 goto :end
if errorlevel 2 goto :nodejs
if errorlevel 1 goto :powershell

:powershell
echo.
echo Running PowerShell script...
echo ========================================
powershell -ExecutionPolicy Bypass -File ".\scripts\simulate-payment.ps1" -OrderId "%ORDER_ID%"
goto :end

:nodejs
echo.
echo Running Node.js script...
echo ========================================
node scripts\simulate-payment-success.mjs %ORDER_ID%
goto :end

:end
echo.
pause
