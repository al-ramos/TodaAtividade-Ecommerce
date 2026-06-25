@echo off
cd /d C:\GitHub\TodaAtividade\E-COMMERCE
del /f /q .git\index.lock 2>nul
git add web/app/carrinho/page.tsx web/app/checkout/ web/app/api/checkout/ web/app/pedido/ web/components/checkout/
git commit -m "feat(checkout): US-14 carrinho, US-16 Pix Mercado Pago, US-18 parcelamento -- Sprint 3"
pause
