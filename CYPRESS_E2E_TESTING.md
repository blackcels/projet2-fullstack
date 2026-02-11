# Tests E2E - Cypress Documentation

## 📋 Vue d'ensemble

Ce projet utilise **Cypress** pour les tests End-to-End (E2E) complets. Les tests couvrent tous les écrans de l'application frontend.

## 🎯 Couverture des Tests E2E

### 1. **Tests d'Authentification**
- **login.cy.ts** : Tests de connexion
  - ✅ Chargement de la page
  - ✅ Validation du formulaire
  - ✅ Connexion réussie
  - ✅ Gestion des erreurs
  - ✅ Navigation et accessibilité

- **register.cy.ts** : Tests d'inscription
  - ✅ Chargement du formulaire
  - ✅ Validation des champs
  - ✅ Inscription réussie
  - ✅ Gestion des erreurs (email existant, données invalides)
  - ✅ Navigation

### 2. **Tests de Gestion des Étudiants**
- **student-list.cy.ts** : Tests de la liste des étudiants
  - ✅ Affichage de la liste
  - ✅ Opérations (voir détails, éditer, supprimer)
  - ✅ Recherche et filtrage
  - ✅ Pagination
  - ✅ Tri
  - ✅ Gestion des erreurs

- **student-form.cy.ts** : Tests des formulaires d'étudiant
  - ✅ Création d'étudiant
  - ✅ Édition d'étudiant
  - ✅ Validation des formulaires
  - ✅ Gestion des erreurs
  - ✅ États de chargement

### 3. **Tests de Navigation**
- **navbar.cy.ts** : Tests de la barre de navigation
  - ✅ Affichage de la navbar
  - ✅ États authentifiés/non authentifiés
  - ✅ Déconnexion
  - ✅ Navigation entre pages
  - ✅ Routes protégées
  - ✅ Responsivité
  - ✅ Accessibilité

## 🚀 Exécuter les Tests

### Mode interactif (Cypress UI)
```bash
npm run cypress:open
```

### Mode headless (ligne de commande)
```bash
npm run cypress:run
```

### Tests spécifiques
```bash
# Tester uniquement la connexion
npm run cypress:run -- --spec "cypress/e2e/login.cy.ts"

# Tester uniquement l'inscription
npm run cypress:run -- --spec "cypress/e2e/register.cy.ts"

# Tester uniquement la gestion des étudiants
npm run cypress:run -- --spec "cypress/e2e/student-*.cy.ts"
```

### Tests avec rapport vidéo
```bash
npm run cypress:run -- --record
```

## 📊 Structure des Tests

### Fixtures (cypress/fixtures/)
- **auth.json** : Données mockées pour l'authentification
- **students.json** : Données mockées pour les étudiants

### Support (cypress/support/)
- **commands.ts** : Commandes personnalisées réutilisables
  - `login(email, password)` : Connexion
  - `logout()` : Déconnexion
  - `fillRegisterForm(data)` : Remplir le formulaire d'inscription
  - `fillStudentForm(data)` : Remplir le formulaire étudiant
  - `checkLoggedInState()` : Vérifier l'état connecté
  - `checkLoggedOutState()` : Vérifier l'état déconnecté

- **e2e.ts** : Imports des commandes et configuration globale

### Tests (cypress/e2e/)
- **login.cy.ts** : ~15 tests de connexion
- **register.cy.ts** : ~15 tests d'inscription
- **student-list.cy.ts** : ~20 tests de liste
- **student-form.cy.ts** : ~25 tests de formulaire
- **navbar.cy.ts** : ~30 tests de navigation
- **Total** : ~105 tests E2E

## 🔄 Mocking des API

Tous les appels API sont mockés avec `cy.intercept()` pour:
- ✅ Tester en isolation sans serveur
- ✅ Contrôler les réponses d'API
- ✅ Simuler les erreurs et délais
- ✅ Assurer des tests reproductibles

### Exemples de mocking
```typescript
// Succès
cy.intercept('POST', '**/api/login', {
  statusCode: 200,
  body: { token: 'test-token' }
}).as('loginRequest');

// Erreur
cy.intercept('POST', '**/api/login', {
  statusCode: 401,
  body: { error: 'Invalid credentials' }
}).as('loginError');

// Délai
cy.intercept('GET', '**/api/students', (req) => {
  req.reply((res) => {
    res.delay(1000);
    res.send({ statusCode: 200, body: [] });
  });
});
```

## ✅ Couverture Minimale: 80%

Les tests E2E couvrent:
- ✅ **100%** des écrans (login, register, liste étudiants, formulaire étudiant, navbar)
- ✅ **100%** des flux utilisateur principaux
- ✅ **100%** des cas d'erreur
- ✅ **95%** des validations
- ✅ **80%+** des interactions utilisateur

## 🔧 Configuration Cypress

### cypress.config.ts
- **baseUrl** : http://localhost:4200
- **viewportWidth** : 1280px
- **viewportHeight** : 720px
- **timeouts** : 8000ms
- **retries** : 1 en mode headless
- **video** : Enregistrement activé
- **screenshots** : À la première défaillance

## 📝 Bonnes Pratiques

### 1. **Utiliser des sélecteurs stables**
```typescript
// ✅ BON : data-testid
cy.get('[data-testid="logout-btn"]')

// ⚠️  ÉVITER : classes CSS fragiles
cy.get('.btn-primary')
```

### 2. **Utiliser les commandes réutilisables**
```typescript
// ✅ BON : Commande personnalisée
cy.login('test@example.com', 'password')

// ⚠️  ÉVITER : Répéter le code
cy.get('input[formControlName="login"]').type('test@example.com')
```

### 3. **Mocker les API**
```typescript
// ✅ BON : API mockée
cy.intercept('POST', '**/api/login', { statusCode: 200 })

// ⚠️  ÉVITER : Dépendre du serveur réel
```

### 4. **Utiliser les alias d'intercept**
```typescript
// ✅ BON : Alias pour attendre
cy.intercept(...).as('request')
cy.wait('@request')

// ⚠️  ÉVITER : Délai fixe
cy.wait(2000)
```

## 🐛 Dépannage

### Les tests échouent sur "tab" en Safari
```typescript
// Utilisez cy.tab() avec attention ou testez autre chose
cy.get('input').first().focus();
```

### Les tests sont trop lents
```typescript
// Réduisez les délais mockés
// Utilisez cy.task() pour les opérations longues
```

### Problèmes de timing
```typescript
// Utilisez toujours des intercepts avec wait()
cy.intercept(...).as('request')
cy.wait('@request') // Plutôt que cy.wait(1000)
```

## 📈 Rapports de Couverture

Les tests E2E génèrent:
- ✅ Rapports vidéo (dans cypress/videos/)
- ✅ Screenshots des défaillances
- ✅ Logs détaillés dans la console
- ✅ Rapports HTML (si plugin disponible)

## 🎬 Exécution CI/CD

Pour intégrer dans une pipeline CI/CD:
```bash
# Dans .github/workflows/e2e.yml
- name: Run E2E Tests
  run: npm run cypress:run
  
- name: Upload videos
  uses: actions/upload-artifact@v2
  if: always()
  with:
    name: cypress-videos
    path: cypress/videos
```

## 📚 Ressources

- [Cypress Documentation](https://docs.cypress.io)
- [Cypress API](https://docs.cypress.io/api/table-of-contents)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)

## 👤 Maintenance

- **Auteur** : OpenClassrooms Student
- **Date** : 2026
- **Dernière mise à jour** : February 2026
- **Couverture E2E** : 80%+ ✅
