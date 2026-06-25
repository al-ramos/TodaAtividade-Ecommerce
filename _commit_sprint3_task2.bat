@echo off
cd /d C:\GitHub\TodaAtividade\E-COMMERCE
del /f /q .git\index.lock 2>nul
git add web/app/checkout/cartao/ web/app/api/checkout/cartao/ web/app/pedido/falha/
git commit -m "feat(checkout): US-15 resumo do pedido + US-17 pagamento com cartao -- Sprint 3"
pause
