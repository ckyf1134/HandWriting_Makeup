@echo off
chcp 65001 >nul 2>nul
title 涟帆祈雨手写生成器 · 本地服务 (端口 8080)
cd /d "%~dp0"

echo.
echo   ======================================================
echo     涟帆祈雨手写生成器  Lianfan Qiyu Writing Studio
echo     默认地址： http://127.0.0.1:8080/
echo     关闭这个黑窗口即可停止服务
echo   ======================================================
echo.

where py >nul 2>nul
if %errorlevel%==0 goto use_py
where python >nul 2>nul
if %errorlevel%==0 goto use_python
where node >nul 2>nul
if %errorlevel%==0 goto use_node
goto no_runtime

:use_py
echo   [启动] 使用 Python，正在起服务...
py serve.py
goto finished

:use_python
echo   [启动] 使用 Python，正在起服务...
python serve.py
goto finished

:use_node
echo   [启动] 使用 Node.js，正在起服务...
node server.js
goto finished

:no_runtime
echo   没有检测到 Python 或 Node.js。
echo   先直接打开 index.html（手写字体可能无法加载）。
start "" "index.html"
pause
exit /b

:finished
echo.
echo   服务已结束。如果是报错，请把上面的提示发给我。
pause
