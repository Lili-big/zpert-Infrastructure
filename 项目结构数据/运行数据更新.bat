@echo off
setlocal EnableExtensions

set "SCRIPT_DIR=%~dp0"
set "PY_SCRIPT=%SCRIPT_DIR%local_json_to_construction_db.py"
set "RESPONSIBILITY_SCRIPT=%SCRIPT_DIR%sync_responsibility_workbook.mjs"
set "OUTPUT_DIR=%SCRIPT_DIR%output"
set "INPUT_FILE="

for %%F in ("%SCRIPT_DIR%*.txt") do (
  set "INPUT_FILE=%%~fF"
  goto :found_input
)

:found_input
echo ====== Project structure data update ======
echo Script dir: %SCRIPT_DIR%
echo Python script: %PY_SCRIPT%
echo Responsibility script: %RESPONSIBILITY_SCRIPT%
echo Input file: %INPUT_FILE%
echo Output dir: %OUTPUT_DIR%
echo.

if not exist "%PY_SCRIPT%" (
  echo ERROR: Python script not found.
  echo %PY_SCRIPT%
  echo.
  pause
  exit /b 1
)

if "%INPUT_FILE%"=="" (
  echo ERROR: No txt input file found in script directory.
  echo %SCRIPT_DIR%
  echo.
  pause
  exit /b 1
)

if not exist "%INPUT_FILE%" (
  echo ERROR: Input file not found.
  echo %INPUT_FILE%
  echo.
  pause
  exit /b 1
)

python "%PY_SCRIPT%" --input "%INPUT_FILE%" --output "%OUTPUT_DIR%"
set "EXIT_CODE=%ERRORLEVEL%"
if not "%EXIT_CODE%"=="0" goto :finish

if exist "%RESPONSIBILITY_SCRIPT%" (
  node "%RESPONSIBILITY_SCRIPT%"
  set "EXIT_CODE=%ERRORLEVEL%"
) else (
  echo WARNING: Responsibility sync script not found.
  echo %RESPONSIBILITY_SCRIPT%
)

echo.
:finish
if "%EXIT_CODE%"=="0" (
  echo DONE: Data files have been updated.
  echo Responsibility workbook and page data have been synced.
  echo Refresh or reopen the HTML page to view the latest project structure.
) else (
  echo ERROR: Data update failed. Exit code: %EXIT_CODE%
)
echo.
pause
exit /b %EXIT_CODE%
