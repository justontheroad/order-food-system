@echo off
setlocal enabledelayedexpansion

:: H5 Ordering System Service Management Script (Windows)
:: Usage: manage.bat [start|stop|restart|status]

set "PROJECT_ROOT=%~dp0"
set "BACKEND_DIR=%PROJECT_ROOT%backend"
set "FRONTEND_DIR=%PROJECT_ROOT%frontend"
set "FRONTEND_ADMIN_DIR=%PROJECT_ROOT%frontend-admin"
set "BACKEND_PORT=8080"
set "FRONTEND_PORT=3000"
set "FRONTEND_ADMIN_PORT=3001"
set "MVN_CMD=mvn"

if "%1"=="" goto :usage
if "%1"=="start" goto :start
if "%1"=="stop" goto :stop
if "%1"=="restart" goto :restart
if "%1"=="status" goto :status
goto :usage

:start
echo ========================================
echo Starting H5 Ordering System...
echo ========================================

call :kill_port %BACKEND_PORT%
call :kill_port %FRONTEND_PORT%
call :kill_port %FRONTEND_ADMIN_PORT%

echo [Start] Backend service...
cd /d "%BACKEND_DIR%"
start "H5-Backend" cmd /k "title H5-Backend && cd /d %BACKEND_DIR% && %MVN_CMD% spring-boot:run"

echo [Wait] Backend starting...
call :wait_port %BACKEND_PORT% 60
if errorlevel 1 (
    echo [Error] Backend failed to start
    goto :end
)
echo [OK] Backend started on port %BACKEND_PORT%

echo [Start] Frontend service...
cd /d "%FRONTEND_DIR%"
start "H5-Frontend" cmd /k "title H5-Frontend && cd /d %FRONTEND_DIR% && npm run dev"

echo [Wait] Frontend starting...
call :wait_port %FRONTEND_PORT% 30

echo [Start] Frontend-Admin service...
cd /d "%FRONTEND_ADMIN_DIR%"
start "H5-Admin" cmd /k "title H5-Admin && cd /d %FRONTEND_ADMIN_DIR% && npm run dev"

echo [Wait] Admin starting...
call :wait_port %FRONTEND_ADMIN_PORT% 30

echo ========================================
echo All services started!
echo ========================================
echo Backend:     http://localhost:%BACKEND_PORT%
echo Frontend:    http://localhost:%FRONTEND_PORT%
echo Admin:       http://localhost:%FRONTEND_ADMIN_PORT%
echo Druid:       http://localhost:%BACKEND_PORT%/druid (admin/admin123)
echo ========================================
goto :end

:stop
echo ========================================
echo Stopping H5 Ordering System...
echo ========================================
call :kill_port %BACKEND_PORT%
call :kill_port %FRONTEND_PORT%
call :kill_port %FRONTEND_ADMIN_PORT%

taskkill /F /FI "WINDOWTITLE eq H5-Backend*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq H5-Frontend*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq H5-Admin*" >nul 2>&1

echo [OK] All services stopped
goto :end

:restart
call :stop
timeout /t 2 /nobreak >nul
call :start
goto :end

:status
echo ========================================
echo H5 Ordering System Status
echo ========================================

call :check_port %BACKEND_PORT% "Backend"
call :check_port %FRONTEND_PORT% "Frontend"
call :check_port %FRONTEND_ADMIN_PORT% "Admin"

echo ========================================
goto :end

:kill_port
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%1 " ^| findstr LISTENING') do (
    echo [Kill] PID %%a on port %1
    taskkill /F /PID %%a >nul 2>&1
)
goto :eof

:wait_port
set /a attempts=%2 / 2
:wait_loop
set /a attempts-=1
if !attempts! leq 0 goto :eof
netstat -ano | findstr ":%1 " | findstr LISTENING >nul 2>&1
if errorlevel 1 (
    timeout /t 2 /nobreak >nul
    goto :wait_loop
)
goto :eof

:check_port
netstat -ano | findstr ":%1 " | findstr LISTENING >nul 2>&1
if errorlevel 1 (
    echo [%~2] Not running
) else (
    echo [%~2] Running on port %1
)
goto :eof

:usage
echo ========================================
echo H5 Ordering System Service Management
echo ========================================
echo Usage: manage.bat [command]
echo.
echo Commands:
echo   start    - Start all services
echo   stop     - Stop all services
echo   restart  - Restart all services
echo   status   - Check service status
echo.
echo Ports:
echo   Backend:        %BACKEND_PORT%
echo   Frontend:      %FRONTEND_PORT%
echo   Frontend-Admin: %FRONTEND_ADMIN_PORT%
echo ========================================
goto :eof

:end
cd /d "%PROJECT_ROOT%"
endlocal
