# GitHub-Backup für Wänu: holt alle Repos und legt pro Repo eine Sicherungsdatei (.bundle) in OneDrive ab.
# Ablage:  D:\KI CLAUDE\Backup\git-mirror   (Arbeitskopien, nicht in OneDrive)
#          <OneDrive>\Backup\GitHub          (Sicherungsdateien, die letzten 30 pro Repo)
# Wiederherstellen: git clone "<Datei>.bundle" "<Zielordner>"

$Repos = @(
  "Waenu/TSCHENT-O-MAT-180264",
  "Waenu/Tschentomat",
  "Waenu/Tschentomat-privat",
  "Waenu/Mietvertrag-Chalet-Tschenten"
)
$Mirror  = "D:\KI CLAUDE\Backup\git-mirror"
$OneDrv  = if ($env:OneDrive) { $env:OneDrive } else { Join-Path $env:USERPROFILE "OneDrive" }
$Ziel    = Join-Path $OneDrv "Backup\GitHub"
$Behalten = 30
$Log     = Join-Path $Ziel "backup-log.txt"

New-Item -ItemType Directory -Force -Path $Mirror, $Ziel | Out-Null
$stempel = Get-Date -Format "yyyy-MM-dd_HHmm"
function Schreib($t) { $z = (Get-Date -Format "yyyy-MM-dd HH:mm") + "  " + $t; Write-Host $z; Add-Content -Path $Log -Value $z -Encoding UTF8 }

Schreib "Start"
foreach ($r in $Repos) {
  $name = $r.Split("/")[1]
  $dir  = Join-Path $Mirror ($name + ".git")
  try {
    if (Test-Path $dir) {
      git -C "$dir" remote update --prune 2>&1 | Out-Null
    } else {
      git clone --mirror "https://github.com/$r.git" "$dir" 2>&1 | Out-Null
    }
    if ($LASTEXITCODE -ne 0) { throw "git meldet Fehler $LASTEXITCODE" }
    $datei = Join-Path $Ziel ($name + "_" + $stempel + ".bundle")
    git -C "$dir" bundle create "$datei" --all 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Bundle fehlgeschlagen" }
    Schreib ("OK     " + $r + "  ->  " + (Split-Path $datei -Leaf))
    Get-ChildItem -Path $Ziel -Filter ($name + "_*.bundle") | Sort-Object Name -Descending | Select-Object -Skip $Behalten | Remove-Item -Force
  } catch {
    Schreib ("FEHLER " + $r + "  " + $_)
  }
}
Schreib "Fertig"
