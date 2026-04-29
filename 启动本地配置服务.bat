@echo off
chcp 65001 >nul
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo 未找到 Node.js，无法启动本地配置服务。
  echo 请确认当前环境可以执行 node 命令后再重试。
  pause
  exit /b 1
)

echo 正在启动本地配置服务...
echo 页面地址：http://127.0.0.1:8787/responsibility-area-settings.html
echo 保存目标：%~dp0项目结构数据\责任区域配置.xlsx
echo.
echo 提示：保存前请关闭已打开的 Excel/WPS 文件。
echo 按 Ctrl+C 可停止服务。
echo.

start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Milliseconds 800; Start-Process 'http://127.0.0.1:8787/responsibility-area-settings.html'"
node "%~dp0local_config_server.mjs"
pause
