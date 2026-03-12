@echo off
setlocal enabledelayedexpansion

set i=1

for %%f in (*.png) do (
    ren "%%f" "temp_!i!.png"
    set /a i+=1
)

set i=1

for %%f in (temp_*.png) do (
    ren "%%f" "!i!.png"
    set /a i+=1
)

echo Done renaming images.
pause