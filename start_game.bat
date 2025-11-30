@echo off
echo ===================================
echo    贪吃蛇游戏启动器
echo ===================================
echo.
echo 文件结构已重新组织：
echo ├── src/
echo │   ├── js/game.js
echo │   ├── css/style.css
echo │   └── html/index.html
echo ├── docs/README.md
echo └── assets/
echo.
echo 正在启动游戏服务器...
echo 游戏将在浏览器中自动打开
echo.
echo 如果没有自动打开，请手动访问：
echo http://localhost:8080/src/html/index.html
echo.
echo 或使用独立版本：
echo http://localhost:8080/src/html/snake_game_standalone.html
echo.
echo 按 Ctrl+C 停止服务器
echo.

python -m http.server 8080

pause
