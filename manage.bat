@echo off
setlocal enabledelayedexpansion

:: H5 Ordering System Service Management Script (Windows)
:: Usage: manage.bat [start|stop|restart|status|logs]

set "PROJECT_ROOT=%~dp0"
set "BACKEND_DIR=%PROJECT_ROOT%backend"
set "FRONTEND_DIR=%PROJECT_ROOT%frontend"
set "BACKEND_PORT=8080"
set "FRONTEND_PORT=3000"
set "JAVA_HOME=D:/Program Files/Java/jdk-21"
set "M2_HOME=D:/Program Files/Java/apache-maven-3.9.14"
set "MVN_CMD=%M2_HOME%/bin/mvn.cmd"

:: Check parameters
if "%1"=="" goto :help
if "%1"=="start" goto :start
if "%1"=="stop" goto :stop
if "%1"=="restart" goto :restart
if "%1"=="status" goto :status
if "%1"=="logs" goto :logs
if "%1"=="help" goto :help
echo Unknown command: %1
goto :help

:start
echo ========================================
echo Starting H5 Ordering System...
echo ========================================

:: Check backend port
echo [Check] Backend port %BACKEND_PORT%...
netstat -ano | findstr ":%BACKEND_PORT% " >nul
if not errorlevel 1 (
    echo [Warning] Port %BACKEND_PORT% is already in use
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%BACKEND_PORT% "') do (
        echo [Info] Process PID: %%a
    )
    choice /c YN /m "Continue anyway? (Y/N)"
    if errorlevel 2 goto :end
)

:: Check frontend port
echo [Check] Frontend port %FRONTEND_PORT%...
netstat -ano | findstr ":%FRONTEND_PORT% " >nul
if not errorlevel 1 (
    echo [Warning] Port %FRONTEND_PORT% is already in use
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%FRONTEND_PORT% "') do (
        echo [Info] Process PID: %%a
    )
    choice /c YN /m "Continue anyway? (Y/N)"
    if errorlevel 2 goto :end
)

:: Start backend
echo [Start] Backend service...
cd /d "%BACKEND_DIR%"
start "H5-Backend" cmd /k "title H5-Backend && "%MVN_CMD%" spring-boot:run"

:: Wait for backend
echo [Wait] Backend starting... (about 15 seconds)
timeout /t 15 /nobreak >nul

:: Verify backend
:wait_backend
set /a count+=1
if !count! gtr 30 (
    echo [Error] Backend startup timeout
    goto :end
)
curl -s http://localhost:%BACKEND_PORT%/api/categories >nul 2>&1
if errorlevel 1 (
    timeout /t 2 /nobreak >nul
    goto :wait_backend
)
echo [OK] Backend started: http://localhost:%BACKEND_PORT%

:: Start frontend
echo [Start] Frontend service...
cd /d "%FRONTEND_DIR%"
start "H5-Frontend" cmd /k "title H5-Frontend && npm run dev"

:: Wait for frontend
echo [Wait] Frontend starting... (about 10 seconds)
timeout /t 10 /nobreak >nul

echo ========================================
echo All services started!
echo ========================================
echo Backend:  http://localhost:%BACKEND_PORT%
echo Frontend: http://localhost:%FRONTEND_PORT%
echo Druid:    http://localhost:%BACKEND_PORT%/druid (admin/admin123)
echo ========================================
goto :end

:stop
echo ========================================
echo Stopping H5 Ordering System...
echo ========================================

:: Stop backend
echo [Stop] Backend service...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%BACKEND_PORT% "') do (
    echo [Kill] PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

:: Stop frontend
echo [Stop] Frontend service...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%FRONTEND_PORT% "') do (
    echo [Kill] PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

:: Close windows
taskkill /F /FI "WINDOWTITLE eq H5-Backend*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq H5-Frontend*" >nul 2>&1

echo [OK] Services stopped
goto :end

:restart
echo ========================================
echo Restarting H5 Ordering System...
echo ========================================
call :stop
timeout /t 3 /nobreak >nul
call :start
goto :end

:status
echo ========================================
echo H5 Ordering System Status
echo ========================================

:: Backend status
echo [Backend] Port %BACKEND_PORT%:
netstat -ano | findstr ":%BACKEND_PORT% " >nul
if errorlevel 1 (
    echo   Status: Not running
) else (
    echo   Status: Running
    curl -s http://localhost:%BACKEND_PORT%/api/categories >nul 2>&1
    if errorlevel 1 (
        echo   API: No response
    ) else (
        echo   API: OK
    )
)

:: Frontend status
echo [Frontend] Port %FRONTEND_PORT%:
netstat -ano | findstr ":%FRONTEND_PORT% " >nul
if errorlevel 1 (
    echo   Status: Not running
) else (
    echo   Status: Running
)

echo ========================================
goto :end

:logs
echo ========================================
echo View Service Logs
echo ========================================
echo Select log to view:
echo   1. Backend (H5-Backend window)
echo   2. Frontend (H5-Frontend window)
echo   3. Return
choice /c 123 /n /m "Select [1/2/3]: "
if errorlevel 3 goto :end
if errorlevel 2 (
    echo View logs in H5-Frontend window
    goto :end
)
if errorlevel 1 (
    echo View logs in H5-Backend window
    goto :end
)
goto :end

:help
echo ========================================
echo H5 Ordering System Service Management
echo ========================================
echo Usage: manage.bat [command]
echo.
echo Commands:
echo   start    - Start all services
echo   stop     - Stop all services
echo   restart  - Restart all services
echo   status   - View service status
echo   logs     - View service logs
echo   help     - Show help
echo ========================================
echo Examples:
echo   manage.bat start     # Start services
echo   manage.bat stop      # Stop services
echo   manage.bat status    # Check status
echo ========================================
goto :end

:end
cd /d "%PROJECT_ROOT%"
endlocal