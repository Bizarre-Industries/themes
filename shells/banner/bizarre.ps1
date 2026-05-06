# ─────────────────────────────────────────────────────────────
#  BIZARRE INDUSTRIES — shell banner (PowerShell)
#  CATCH THE STARS.
#
#  Usage in $PROFILE:
#    . "$HOME\dotfiles\bizarre\shells\banner\bizarre.ps1"
#
#  Toggle: $env:BIZARRE_BANNER = '1' force | '0' off | unset daily
# ─────────────────────────────────────────────────────────────

if (-not [Environment]::UserInteractive -and -not $Host.Name.Contains("ConsoleHost")) { return }

$_BzrDir       = Split-Path -Parent $PSCommandPath
$_BzrRoot      = Resolve-Path (Join-Path $_BzrDir "..\..")
$_BzrManifesto = Join-Path $_BzrRoot "shells\manifesto.txt"
$_BzrCache     = if ($env:XDG_CACHE_HOME) { $env:XDG_CACHE_HOME } else { Join-Path $HOME ".cache" }
$_BzrStamp     = Join-Path $_BzrCache "bizarre-banner.stamp"

function _Bzr-ShouldShow {
  if ($env:BIZARRE_BANNER -eq '0') { return $false }
  if ($env:BIZARRE_BANNER -eq '1') { return $true }
  $today = (Get-Date).ToString('yyyy-MM-dd')
  if ((Test-Path $_BzrStamp) -and ((Get-Content $_BzrStamp -Raw).Trim() -eq $today)) {
    return $false
  }
  if (-not (Test-Path $_BzrCache)) { New-Item -ItemType Directory -Path $_BzrCache -Force | Out-Null }
  Set-Content -Path $_BzrStamp -Value $today -NoNewline
  return $true
}

function Bizarre-Banner {
  $e   = [char]27
  $lime = "$e[38;2;198;255;36m"
  $glow = "$e[38;2;232;255;138m"
  $gray = "$e[38;2;120;120;120m"
  $fg   = "$e[38;2;228;228;228m"
  $dim  = "$e[2m"
  $b    = "$e[1m"
  $r    = "$e[0m"

  Write-Host ""
  Write-Host "$lime$b ██████╗ ██╗███████╗ █████╗ ██████╗ ██████╗ ███████╗$r"
  Write-Host "$lime$b ██╔══██╗██║╚══███╔╝██╔══██╗██╔══██╗██╔══██╗██╔════╝$r"
  Write-Host "$lime$b ██████╔╝██║  ███╔╝ ███████║██████╔╝██████╔╝█████╗  $r"
  Write-Host "$lime$b ██╔══██╗██║ ███╔╝  ██╔══██║██╔══██╗██╔══██╗██╔══╝  $r"
  Write-Host "$lime$b ██████╔╝██║███████╗██║  ██║██║  ██║██║  ██║███████╗$r"
  Write-Host "$lime$b ╚═════╝ ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝$r"
  Write-Host ""
  Write-Host "$gray ██╗███╗   ██╗██████╗ ██╗   ██╗███████╗████████╗██████╗ ██╗███████╗███████╗$r"
  Write-Host "$gray ██║████╗  ██║██╔══██╗██║   ██║██╔════╝╚══██╔══╝██╔══██╗██║██╔════╝██╔════╝$r"
  Write-Host "$gray ██║██╔██╗ ██║██║  ██║██║   ██║███████╗   ██║   ██████╔╝██║█████╗  ███████╗$r"
  Write-Host "$gray ██║██║╚██╗██║██║  ██║██║   ██║╚════██║   ██║   ██╔══██╗██║██╔══╝  ╚════██║$r"
  Write-Host "$gray ██║██║ ╚████║██████╔╝╚██████╔╝███████║   ██║   ██║  ██║██║███████╗███████║$r"
  Write-Host "$gray ╚═╝╚═╝  ╚═══╝╚═════╝  ╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚══════╝╚══════╝$r"
  Write-Host ""

  $monthYear = (Get-Date).ToString('MMM yyyy').ToUpper()
  $host_short = $env:COMPUTERNAME
  Write-Host "  $dim${gray}BZR / SHELL / V0.1 / $monthYear$r   $glow$b✦$r   ${gray}host: $host_short$r"

  if (Test-Path $_BzrManifesto) {
    $lines = Get-Content $_BzrManifesto | Where-Object { $_ -ne '' }
    if ($lines.Count -gt 0) {
      $line = $lines | Get-Random
      Write-Host ""
      Write-Host "  $fg$b$line$r"
    }
  }

  Write-Host ""
  Write-Host "  $lime${b}CATCH THE STARS.$r"
  Write-Host ""
}

if (_Bzr-ShouldShow) {
  Bizarre-Banner
}
