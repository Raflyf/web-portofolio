@echo off
title Portfolio Rafly Firmansyah - Local Server
echo ===================================================
echo Menjalankan Server Lokal Portofolio Rafly Firmansyah
echo ===================================================
echo Membuka browser di http://localhost:3000 ...
start http://localhost:3000
python -m http.server 3000
pause
