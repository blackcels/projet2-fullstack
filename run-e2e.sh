#!/bin/bash

# =====================================================
# Script d'exécution des tests E2E avec Cypress
# =====================================================

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Titres
echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🧪 Tests E2E - Cypress                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Vérifier les options
case "$1" in
  "open")
    echo -e "${YELLOW}📺 Ouverture Cypress UI...${NC}"
    npm run cypress:open
    ;;
  "run")
    echo -e "${YELLOW}🚀 Exécution des tests E2E en mode headless...${NC}"
    npm run cypress:run
    ;;
  "login")
    echo -e "${YELLOW}🔐 Tests de connexion uniquement...${NC}"
    npm run cypress:run -- --spec "cypress/e2e/login.cy.ts"
    ;;
  "register")
    echo -e "${YELLOW}📝 Tests d'inscription uniquement...${NC}"
    npm run cypress:run -- --spec "cypress/e2e/register.cy.ts"
    ;;
  "students")
    echo -e "${YELLOW}👥 Tests des étudiants uniquement...${NC}"
    npm run cypress:run -- --spec "cypress/e2e/student-*.cy.ts"
    ;;
  "navbar")
    echo -e "${YELLOW}🗂️  Tests de navigation uniquement...${NC}"
    npm run cypress:run -- --spec "cypress/e2e/navbar.cy.ts"
    ;;
  "all")
    echo -e "${YELLOW}📊 Exécution de tous les tests E2E...${NC}"
    npm run cypress:run
    ;;
  "debug")
    echo -e "${YELLOW}🐛 Mode debug - UI avec pause sur erreur...${NC}"
    npm run cypress:open -- --config defaultCommandTimeout=10000
    ;;
  *)
    echo -e "${YELLOW}Usage:${NC}"
    echo ""
    echo -e "  ${GREEN}npm run e2e -- open${NC}          Ouvrir Cypress UI"
    echo -e "  ${GREEN}npm run e2e -- run${NC}           Exécuter tous les tests"
    echo -e "  ${GREEN}npm run e2e -- login${NC}         Tests connexion"
    echo -e "  ${GREEN}npm run e2e -- register${NC}      Tests inscription"
    echo -e "  ${GREEN}npm run e2e -- students${NC}      Tests étudiants"
    echo -e "  ${GREEN}npm run e2e -- navbar${NC}        Tests navigation"
    echo -e "  ${GREEN}npm run e2e -- all${NC}           Tous les tests"
    echo -e "  ${GREEN}npm run e2e -- debug${NC}         Mode debug"
    echo ""
    echo -e "${YELLOW}Raccourcis npm:${NC}"
    echo -e "  ${GREEN}npm run cypress:open${NC}         Ouvrir Cypress"
    echo -e "  ${GREEN}npm run cypress:run${NC}          Exécuter tests"
    echo -e "  ${GREEN}npm run e2e:open${NC}             Ouvrir Cypress"
    echo -e "  ${GREEN}npm run e2e${NC}                  Exécuter tests"
    echo ""
    ;;
esac
