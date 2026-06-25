@echo off
chcp 65001 > nul
echo ========================================
echo  TodaAtividade — Deploy Vercel
echo ========================================
echo.
echo Passo 1: Instalar Vercel CLI (se nao tiver)
echo   npm i -g vercel
echo.
echo Passo 2: Login na Vercel
echo   vercel login
echo.
echo Passo 3: Linkar o projeto (primeira vez)
echo   cd C:\GitHub\TodaAtividade\E-COMMERCE
echo   vercel link
echo   (quando perguntar root directory, deixe em branco — o vercel.json resolve)
echo.
echo Passo 4: Configurar variaveis de ambiente na Vercel
echo   Acesse: https://vercel.com/dashboard
echo   Projeto ^> Settings ^> Environment Variables
echo   Adicione todas as vars do arquivo web/.env.example
echo   (use os valores de producao, nao os de desenvolvimento)
echo.
echo Passo 5: Deploy de preview
echo   vercel
echo.
echo Passo 6: Deploy de producao
echo   vercel --prod
echo.
echo Passo 7: Configurar dominio personalizado
echo   https://vercel.com/dashboard ^> projeto ^> Settings ^> Domains
echo   Adicionar: www.todaatividade.com.br
echo   Adicionar: todaatividade.com.br (redirect para www)
echo.
echo   Registros DNS necessarios no seu registrador:
echo   CNAME  www   cname.vercel-dns.com
echo   A      @     76.76.21.21
echo.
echo ========================================
pause
