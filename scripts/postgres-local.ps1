param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("start", "stop", "status")]
  [string]$Action
)

$runtimeRoot = Join-Path $env:LOCALAPPDATA "DUTLink\PostgreSQL17"
$pgControl = Join-Path $runtimeRoot "pgsql\bin\pg_ctl.exe"
$pgReady = Join-Path $runtimeRoot "pgsql\bin\pg_isready.exe"
$postgres = Join-Path $runtimeRoot "pgsql\bin\postgres.exe"
$projectRoot = Split-Path $PSScriptRoot -Parent
$localState = Join-Path $projectRoot ".local"
$dataDirectory = Join-Path $localState "postgres-data"
$logFile = Join-Path $localState "postgresql.log"

if (-not (Test-Path -LiteralPath $pgControl) -or -not (Test-Path -LiteralPath $dataDirectory)) {
  Write-Error "DUT Link local PostgreSQL was not found. See docs/DATABASE_SETUP.md."
  exit 1
}

switch ($Action) {
  "start" {
    & $pgReady -h 127.0.0.1 -p 5432 *> $null
    if ($LASTEXITCODE -eq 0) {
      Write-Output "DUT Link PostgreSQL is already running."
      exit 0
    }
    $errorLog = Join-Path $localState "postgresql-error.log"
    Start-Process -FilePath $postgres -ArgumentList @("-D", "`"$dataDirectory`"") -WorkingDirectory $runtimeRoot -WindowStyle Hidden -RedirectStandardOutput $logFile -RedirectStandardError $errorLog
    for ($attempt = 0; $attempt -lt 40; $attempt += 1) {
      Start-Sleep -Milliseconds 250
      & $pgReady -h 127.0.0.1 -p 5432 *> $null
      if ($LASTEXITCODE -eq 0) {
        Write-Output "DUT Link PostgreSQL started."
        exit 0
      }
    }
    Write-Error "PostgreSQL did not become ready. See .local/postgresql-error.log."
    exit 1
  }
  "stop" {
    & $pgReady -h 127.0.0.1 -p 5432 *> $null
    if ($LASTEXITCODE -ne 0) {
      Write-Output "DUT Link PostgreSQL is not running."
      exit 0
    }
    & $pgControl stop -D $dataDirectory -m fast -w
    exit $LASTEXITCODE
  }
  "status" {
    & $pgReady -h 127.0.0.1 -p 5432
    exit $LASTEXITCODE
  }
}
