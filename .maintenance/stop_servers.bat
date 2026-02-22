@echo off
echo Stopping Solar Admin App...
taskkill /f /im python.exe
taskkill /f /im node.exe
echo Done.
pause
