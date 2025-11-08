# Script untuk simulate payment success di Midtrans Sandbox
# Usage: .\simulate-payment.ps1 -OrderId "ORD-20251109-001"

param(
    [Parameter(Mandatory=$true)]
    [string]$OrderId
)

# Load environment variables from .env.local
$envFile = Join-Path $PSScriptRoot "..\\.env.local"

if (-not (Test-Path $envFile)) {
    Write-Host "❌ Error: .env.local not found!" -ForegroundColor Red
    Write-Host "Expected location: $envFile" -ForegroundColor Yellow
    exit 1
}

Write-Host "📂 Reading .env.local..." -ForegroundColor Cyan

# Parse .env.local
$envVars = @{}
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]*?)\s*=\s*(.+?)\s*$') {
        $key = $matches[1]
        $value = $matches[2]
        $envVars[$key] = $value
    }
}

$serverKey = $envVars['MIDTRANS_SERVER_KEY']

if (-not $serverKey) {
    Write-Host "❌ Error: MIDTRANS_SERVER_KEY not found in .env.local" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Midtrans Payment Simulator (Sandbox)" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📦 Order ID    : $OrderId" -ForegroundColor White
Write-Host "🔑 Server Key  : $($serverKey.Substring(0, 15))..." -ForegroundColor White
Write-Host ""

# Encode server key for Basic Auth
$base64Auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${serverKey}:"))

# Prepare request
$url = "https://api.sandbox.midtrans.com/v2/$OrderId/status/b2b"
$headers = @{
    "Content-Type" = "application/json"
    "Accept" = "application/json"
    "Authorization" = "Basic $base64Auth"
}

$body = @{
    transaction_status = "settlement"
    status_code = "200"
    fraud_status = "accept"
} | ConvertTo-Json

Write-Host "🔄 Sending request to Midtrans API..." -ForegroundColor Cyan
Write-Host "📡 URL: $url" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body -ContentType "application/json"
    
    Write-Host "✅ SUCCESS! Payment simulated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📄 Response:" -ForegroundColor Cyan
    Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor White
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Refresh order detail page in browser" -ForegroundColor White
    Write-Host "2. Payment status should change to 'Paid'" -ForegroundColor White
    Write-Host "3. If webhook configured, order updates automatically" -ForegroundColor White
    Write-Host ""
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = $_.ErrorDetails.Message
    
    Write-Host "❌ FAILED! Error occurred:" -ForegroundColor Red
    Write-Host ""
    Write-Host "Status Code: $statusCode" -ForegroundColor Yellow
    
    if ($errorBody) {
        Write-Host "Error Details:" -ForegroundColor Yellow
        Write-Host $errorBody -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "Possible Issues:" -ForegroundColor Yellow
    
    if ($statusCode -eq 404) {
        Write-Host "- Order ID not found in Midtrans" -ForegroundColor White
        Write-Host "- Transaction not created yet" -ForegroundColor White
        Write-Host "- Check: https://dashboard.sandbox.midtrans.com/transactions" -ForegroundColor Cyan
    } elseif ($statusCode -eq 401) {
        Write-Host "- Invalid Server Key" -ForegroundColor White
        Write-Host "- Check MIDTRANS_SERVER_KEY in .env.local" -ForegroundColor White
    } else {
        Write-Host "- Unknown error, check Midtrans dashboard" -ForegroundColor White
    }
    
    Write-Host ""
    exit 1
}

Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
