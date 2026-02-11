# =====================================================
# Script d'exécution des tests E2E avec Cypress (Windows)
# =====================================================

param(
    [Parameter(Position = 0)]
    [ValidateSet("open", "run", "login", "register", "students", "navbar", "all", "debug", "help")]
    [string]$Command = "help"
)

# Couleurs
$Colors = @{
    Green  = "`e[32m"
    Yellow = "`e[33m"
    Blue   = "`e[34m"
    Red    = "`e[31m"
    Reset  = "`e[0m"
}

# Titres
Write-Host "$($Colors.Blue)╔════════════════════════════════════════════════════╗$($Colors.Reset)"
Write-Host "$($Colors.Blue)║   🧪 Tests E2E - Cypress                          ║$($Colors.Reset)"
Write-Host "$($Colors.Blue)╚════════════════════════════════════════════════════╝$($Colors.Reset)"
Write-Host ""

switch ($Command) {
    "open" {
        Write-Host "$($Colors.Yellow)📺 Ouverture Cypress UI...$($Colors.Reset)"
        npm run cypress:open
    }
    "run" {
        Write-Host "$($Colors.Yellow)🚀 Exécution des tests E2E en mode headless...$($Colors.Reset)"
        npm run cypress:run
    }
    "login" {
        Write-Host "$($Colors.Yellow)🔐 Tests de connexion uniquement...$($Colors.Reset)"
        npm run cypress:run -- --spec "cypress/e2e/login.cy.ts"
    }
    "register" {
        Write-Host "$($Colors.Yellow)📝 Tests d'inscription uniquement...$($Colors.Reset)"
        npm run cypress:run -- --spec "cypress/e2e/register.cy.ts"
    }
    "students" {
        Write-Host "$($Colors.Yellow)👥 Tests des étudiants uniquement...$($Colors.Reset)"
        npm run cypress:run -- --spec "cypress/e2e/student-*.cy.ts"
    }
    "navbar" {
        Write-Host "$($Colors.Yellow)🗂️  Tests de navigation uniquement...$($Colors.Reset)"
        npm run cypress:run -- --spec "cypress/e2e/navbar.cy.ts"
    }
    "all" {
        Write-Host "$($Colors.Yellow)📊 Exécution de tous les tests E2E...$($Colors.Reset)"
        npm run cypress:run
    }
    "debug" {
        Write-Host "$($Colors.Yellow)🐛 Mode debug - UI avec pause sur erreur...$($Colors.Reset)"
        npm run cypress:open -- --config defaultCommandTimeout=10000
    }
    default {
        Write-Host "$($Colors.Yellow)Usage:$($Colors.Reset)"
        Write-Host ""
        Write-Host "$($Colors.Green).\\run-e2e.ps1 open$($Colors.Reset)          Ouvrir Cypress UI"
        Write-Host "$($Colors.Green).\\run-e2e.ps1 run$($Colors.Reset)           Exécuter tous les tests"
        Write-Host "$($Colors.Green).\\run-e2e.ps1 login$($Colors.Reset)         Tests connexion"
        Write-Host "$($Colors.Green).\\run-e2e.ps1 register$($Colors.Reset)      Tests inscription"
        Write-Host "$($Colors.Green).\\run-e2e.ps1 students$($Colors.Reset)      Tests étudiants"
        Write-Host "$($Colors.Green).\\run-e2e.ps1 navbar$($Colors.Reset)        Tests navigation"
        Write-Host "$($Colors.Green).\\run-e2e.ps1 all$($Colors.Reset)           Tous les tests"
        Write-Host "$($Colors.Green).\\run-e2e.ps1 debug$($Colors.Reset)         Mode debug"
        Write-Host ""
        Write-Host "$($Colors.Yellow)Raccourcis npm:$($Colors.Reset)"
        Write-Host "$($Colors.Green)npm run cypress:open$($Colors.Reset)         Ouvrir Cypress"
        Write-Host "$($Colors.Green)npm run cypress:run$($Colors.Reset)          Exécuter tests"
        Write-Host "$($Colors.Green)npm run e2e:open$($Colors.Reset)             Ouvrir Cypress"
        Write-Host "$($Colors.Green)npm run e2e$($Colors.Reset)                  Exécuter tests"
        Write-Host ""
    }
}
