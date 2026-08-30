param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("init", "start", "stop", "status")]
  [string]$Action,
  [ValidateRange(1024, 65535)]
  [int]$Port = 5432
)

$runtimeRoot = Join-Path $env:LOCALAPPDATA "DUTLink\PostgreSQL17"
$binRoot = Join-Path $runtimeRoot "pgsql\bin"
$pgControl = Join-Path $binRoot "pg_ctl.exe"
$pgReady = Join-Path $binRoot "pg_isready.exe"
$postgres = Join-Path $binRoot "postgres.exe"
$initDb = Join-Path $binRoot "initdb.exe"
$createDb = Join-Path $binRoot "createdb.exe"
$projectRoot = Split-Path $PSScriptRoot -Parent
$localState = Join-Path $projectRoot ".local"
$dataDirectory = Join-Path $localState "postgres-data"
$passwordFile = Join-Path $localState "postgres-password.txt"
$logFile = Join-Path $localState "postgresql.log"
$errorLog = Join-Path $localState "postgresql-error.log"
$envFile = Join-Path $projectRoot ".env"
$envExample = Join-Path $projectRoot ".env.example"
$script:wasInitialized = $false
$script:localPassword = $null

function Assert-Runtime {
  foreach ($binary in @($pgControl, $pgReady, $postgres, $initDb, $createDb)) {
    if (-not (Test-Path -LiteralPath $binary)) {
      Write-Error "DUT Link PostgreSQL runtime was not found at $runtimeRoot. See docs/DATABASE_SETUP.md."
      exit 1
    }
  }
}

function Test-ServerReady {
  & $pgReady -h 127.0.0.1 -p $Port *> $null
  return $LASTEXITCODE -eq 0
}

function Write-ProjectEnvironment([string]$password) {
  $content = if (Test-Path -LiteralPath $envFile) {
    Get-Content -LiteralPath $envFile -Raw
  } elseif (Test-Path -LiteralPath $envExample) {
    Get-Content -LiteralPath $envExample -Raw
  } else {
    ""
  }

  if ($content -match '(?m)^DATA_BACKEND=.*$') {
    $content = $content -replace '(?m)^DATA_BACKEND=.*$', 'DATA_BACKEND="postgresql"'
  } else {
    $content = "DATA_BACKEND=`"postgresql`"`r`n$content"
  }

  $connectionUrl = "DATABASE_URL=`"postgresql://postgres:$password@127.0.0.1:$Port/dut_link`""
  if ($content -match '(?m)^\s*#?\s*DATABASE_URL=.*$') {
    $content = $content -replace '(?m)^\s*#?\s*DATABASE_URL=.*$', $connectionUrl
  } else {
    $content = "$content`r`n$connectionUrl`r`n"
  }

  Set-Content -LiteralPath $envFile -Value $content.TrimEnd() -Encoding UTF8
}

function Initialize-LocalDatabase {
  if (Test-Path -LiteralPath $dataDirectory) {
    Write-Output "DUT Link PostgreSQL data directory already exists."
    return
  }
  if (Test-ServerReady) {
    Write-Error "Port $Port already has a PostgreSQL server, but this clone has no local data directory. Stop the other local server or choose another port."
    exit 1
  }

  New-Item -ItemType Directory -Path $localState -Force | Out-Null
  $script:localPassword = ([guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N"))
  Set-Content -LiteralPath $passwordFile -Value $script:localPassword -Encoding ASCII

  Write-Output "Initializing PostgreSQL for this clone..."
  & $initDb -D $dataDirectory -U postgres -E UTF8 --auth-local=trust --auth-host=scram-sha-256 "--pwfile=$passwordFile"
  if ($LASTEXITCODE -ne 0) {
    Write-Error "PostgreSQL initialization failed. See the output above."
    exit $LASTEXITCODE
  }

  Write-ProjectEnvironment $script:localPassword
  $script:wasInitialized = $true
  Write-Output "Local database files and .env were created."
}

function Start-LocalDatabase {
  if (Test-ServerReady) {
    Write-Output "DUT Link PostgreSQL is already running on port $Port."
    return
  }

  Start-Process -FilePath $postgres -ArgumentList @("-D", "`"$dataDirectory`"", "-p", $Port) -WorkingDirectory $runtimeRoot -WindowStyle Hidden -RedirectStandardOutput $logFile -RedirectStandardError $errorLog
  for ($attempt = 0; $attempt -lt 60; $attempt += 1) {
    Start-Sleep -Milliseconds 250
    if (Test-ServerReady) {
      if ($script:wasInitialized) {
        $previousPassword = $env:PGPASSWORD
        $env:PGPASSWORD = $script:localPassword
        & $createDb -h 127.0.0.1 -p $Port -U postgres dut_link
        $createExitCode = $LASTEXITCODE
        if ($null -eq $previousPassword) { Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue } else { $env:PGPASSWORD = $previousPassword }
        if ($createExitCode -ne 0) {
          Write-Error "PostgreSQL started, but the dut_link database could not be created."
          exit $createExitCode
        }
      }
      Write-Output "DUT Link PostgreSQL started on port $Port."
      return
    }
  }
  Write-Error "PostgreSQL did not become ready. See .local/postgresql-error.log."
  exit 1
}

Assert-Runtime

switch ($Action) {
  "init" {
    Initialize-LocalDatabase
    if (-not $script:wasInitialized) { exit 0 }
    Start-LocalDatabase
  }
  "start" {
    Initialize-LocalDatabase
    Start-LocalDatabase
  }
  "stop" {
    if (-not (Test-Path -LiteralPath $dataDirectory)) {
      Write-Output "DUT Link PostgreSQL is not initialized in this clone."
      exit 0
    }
    if (-not (Test-ServerReady)) {
      Write-Output "DUT Link PostgreSQL is not running."
      exit 0
    }
    & $pgControl stop -D $dataDirectory -m fast -w
    exit $LASTEXITCODE
  }
  "status" {
    if (-not (Test-Path -LiteralPath $dataDirectory)) {
      Write-Output "DUT Link PostgreSQL is not initialized in this clone."
      exit 1
    }
    & $pgReady -h 127.0.0.1 -p $Port
    exit $LASTEXITCODE
  }
}
