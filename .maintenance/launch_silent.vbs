Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")
ScriptPath = FSO.GetParentFolderName(WScript.ScriptFullName)

' Set working directory to the script's location
WshShell.CurrentDirectory = ScriptPath

' Start Backend (Standard Python approach without activation script dependency)
' We use the python executable in the venv to run uvicorn module directly
BackendCmd = "cmd /c venv\Scripts\python.exe -m uvicorn backend.main:app --reload"
WshShell.Run BackendCmd, 0, False

' Start Frontend (Standard npm approach)
FrontendCmd = "cmd /c set PATH=C:\Program Files\nodejs;%PATH% && cd frontend && npm run dev"
WshShell.Run FrontendCmd, 0, False

' Wait for servers to initialize
WScript.Sleep 5000

' Open Browser
WshShell.Run "http://localhost:5173"
