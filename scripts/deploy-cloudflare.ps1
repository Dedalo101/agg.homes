$ErrorActionPreference = "Stop"
$ProjectName = if ($env:CLOUDFLARE_PAGES_PROJECT) { $env:CLOUDFLARE_PAGES_PROJECT } else { "agg-homes" }

$whoami = npx wrangler whoami 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Error "Not logged in. Run: npx wrangler login"
}

npx wrangler pages deploy . --project-name=$ProjectName
Write-Host "Deployed to https://${ProjectName}.pages.dev"