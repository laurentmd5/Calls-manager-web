# Rapport d'Analyse Détaillée du Codebase NetSysCall

## Table des matières
1. [Authentification & Gestion des rôles](#1-authentification--gestion-des-rôles)
2. [Composant Dashboard principal](#2-composant-dashboard-principal)
3. [Système de filtrage](#3-système-de-filtrage)
4. [Différenciation UI basée sur les rôles](#4-différenciation-ui-basée-sur-les-rôles)
5. [Panneau de gestion des utilisateurs](#5-panneau-de-gestion-des-utilisateurs)
6. [Cartes KPI / Résumé](#6-cartes-kpi--résumé)
7. [Ce qui manque ou doit être ajouté](#7-ce-qui-manque-ou-doit-être-ajouté)

---

## 1. Authentification & Gestion des rôles

### Stockage du rôle utilisateur

**Méthode de stockage**: React Context  
**Fichier**: `src/contexts/AuthContext.tsx`

- Les rôles utilisateur sont stockés dans l'état du **AuthContext**
- Les rôles proviennent des données du profil backend récupérées via l'endpoint `/api/v1/me`
- Token d'accès stocké dans `localStorage` avec le préfixe `Bearer`

### Rôles supportés

Trois rôles sont définis dans `src/types/user.ts`:

| Rôle | Accès |
|------|-------|
| **ADMIN** | Accès complet au système |
| **MANAGER** | Accès scoped à l'équipe |
| **COMMERCIAL** | Accès utilisateur/employé |

### Validation des rôles

**Fonction**: `hasRequiredRole()` dans `src/contexts/AuthContext.tsx` (lignes 69-72)
- Vérifie que l'utilisateur est `ADMIN` ou `MANAGER`
- Utilisée pour contrôler l'accès à l'application

### Système de protection des routes

⚠️ **IMPORTANT**: No explicit route guards at router level

**Implémentation actuelle**:
- La protection se fait au niveau du composant, pas au niveau du routeur
- `src/components/layout/DashboardLayout.tsx` (lignes 19-22) vérifie `isAuthenticated`
- Si non authentifié, redirige vers `/login`

**Problème de sécurité**: Les routes sont techniquement accessibles initialement avant que le composant ne vérifie l'authentification.

---

## 2. Composant Dashboard principal

### Structure du Dashboard

**Fichier**: `src/pages/Dashboard.tsx`

Le Dashboard contient trois sections principales:

| Composant | Fonction |
|-----------|----------|
| **6 Stat Cards** | Affiche les métriques clés du dashboard |
| **CallsChart** | Visualisation de la tendance des appels |
| **TopPerformers** | Grille des meilleurs commerciaux |
| **CallsTable** | Liste des 5 derniers appels |

### Tableau de la liste des appels

**Fichier**: `src/components/calls/CallsTable.tsx`

#### Colonnes affichées:
- 📞 Numéro de téléphone
- 📅 Date / Heure
- ⏱️ Durée
- ✓ Statut (Répondu/Manqué/Rejeté/Pas de réponse)
- 📋 Décision (Intéressé/Non intéressé/Rappeler)
- 🎵 Lecteur audio (pour l'enregistrement)
- ⬇️ Bouton de téléchargement

#### Remarques
- Colonne `notes` existe dans les données mock mais n'est pas affichée dans le tableau
- Les données proviennent de `src/data/mockData.ts`

### Composant Lecteur Audio

**État**: ✅ Entièrement intégré

**Fichier**: `src/components/audio/AudioPlayerModal.tsx`

#### Caractéristiques:
- Modal basée sur Dialog
- **Contrôles**: Play/Pause, avance/recul 10 secondes, curseur volume, mute
- **Affichage**: Numéro de téléphone, date d'appel, durée
- **Technologie**: HTML5 `<audio>` element (pas de librairie tiers)

#### Lecteur audio URL pattern:
```
http://127.0.0.1:8000/api/v1/recordings/by-call/{callId}/play?token={access_token}
```

**Composant complémentaire**: `src/components/audio/AudioDuration.tsx`
- Extrait et affiche la durée de l'audio
- Charge les métadonnées du fichier audio
- Dégradation gracieuse si le chargement échoue
- Ajoute automatiquement le token d'authentification à l'URL

---

## 3. Système de filtrage

### Filtres implémentés

**Fichier**: `src/components/calls/CallsTable.tsx` (lignes 106-130)

| Filtre | Implémentation | Localisation |
|--------|-----------------|-------------|
| **Numéro de téléphone** | Recherche textuelle client-side | Case-insensitive |
| **Statut** | Select dropdown (tout/répondu/manqué/rejeté/pas de réponse) | Client-side |
| **Type** | Variable filtre existe mais implémentation incomplète | Client-side |

### Flux de données

**Récupération des appels**:
- Endpoint: `/api/v1/calls`
- Paramètres: `skip` et `limit` pour la pagination
- Données retournées en JSON

**Localisation du filtrage**:
- `src/hooks/useCalls.ts` - filtrage côté client
- Aucun filtre n'est envoyé au backend sous forme de query params

### Source de données

**Fichier**: `src/data/mockData.ts`

Données mock disponibles:
- `mockCalls`: 10 appels d'exemple (téléphone, durée, statut, décision, notes)
- `mockDashboardStats`: Métriques agrégées statiques
- `weeklyCallsData`, `hourlyActivityData`, `monthlyTrendData`: Données pour les graphiques
- `callTypeDistribution`, `callStatusDistribution`: Données de distribution

---

## 4. Différenciation UI basée sur les rôles

### État actuel: ⚠️ LIMITÉ / NON COMPLÈTEMENT IMPLÉMENTÉ

### Ce qui existe:
- ✅ Le rôle est récupéré depuis `AuthContext` via `user.role`
- ✅ `src/components/layout/AppSidebar.tsx` affiche les informations utilisateur et logout
- ✅ Le Dashboard affiche les mêmes vues pour tous les utilisateurs authentifiés

### Ce qui manque:
- ❌ Aucun rendu conditionnel d'éléments UI basé sur rôle manager vs admin
- ❌ Aucun filtrage de scope (données d'équipe seulement vs données de l'entreprise)
- ❌ Aucune différenciation des boutons d'action (create/edit/delete rendu conditionnel)
- ❌ La page Performance affiche tous les commerciaux indépendamment du rôle

### Navigation (AppSidebar)

**Fichier**: `src/components/layout/AppSidebar.tsx` (lignes 11-16)

Éléments de menu affichés pour tous les rôles authentifiés:
- Dashboard
- Commerciaux (Utilisateurs)
- Appels
- Performances
- Statistiques
- Paramètres

**Aucun rendu conditionnel basé sur le rôle n'existe actuellement.**

---

## 5. Panneau de gestion des utilisateurs

### État de la gestion utilisateur actuelle

**Fichier**: `src/pages/Settings.tsx`

La page Settings existe mais elle est **principalement constituée de stubs UI**:

| Section | État |
|---------|------|
| **Profil** | Affichage/édition du nom et email (non câblé) |
| **Sécurité** | Formulaire changement de mot de passe (non câblé) |
| **Notifications** | Basculements pour email/notifications push (état local uniquement) |
| **Export de données** | Bouton placeholder |

### Ce qui manque:

- ❌ Aucune page dédiée de gestion des utilisateurs
- ❌ Aucune interface UI pour les opérations CRUD utilisateur
- ❌ Aucune interface pour l'attribution de rôles
- ❌ Aucune interface de création/attribution de commerciaux
- ❌ La page Settings ne se connecte pas au backend
- ❌ Aucune pagination ou recherche d'utilisateurs

### Commerciaux (Utilisateurs)

**Fichier**: `src/pages/Commercials.tsx`

- Page existe mais pas complètement examinée
- Probablement une vue de liste uniquement
- Aucune fonctionnalité CRUD observée

---

## 6. Cartes KPI / Résumé

### Cartes de résumé existantes

**État**: ✅ Oui, 6 cartes de métriques existent

**Fichier**: `src/pages/Dashboard.tsx`

Métriques affichées:
1. **Total des appels** - Nombre d'appels total
2. **Appels répondus** - Nombre d'appels répondus
3. **Appels manqués** - Nombre d'appels manqués
4. **Durée totale** - Formatée en heures/minutes
5. **Durée moyenne** - Formatée en minutes/secondes
6. **Taux de réponse** - Pourcentage

### Composant StatCard

**Fichier**: `src/components/dashboard/StatCard.tsx`

**Fonctionnalités**:
- Affiche icône, titre et valeur
- Variantes: default, primary, success, warning, destructive
- Affichage optionnel de tendance (indicateur de changement pourcentage)

### Scoping par rôle

❌ **NON IMPLÉMENTÉ**

- Tous les utilisateurs voient les mêmes métriques globales
- Aucune métrique spécifique à l'équipe pour les managers
- Toutes les métriques calculées à partir de données mock, pas du backend

**Source de données**: `src/data/mockData.ts` (lignes 51-60)
- `mockDashboardStats`: Valeurs agrégées statiques
- Données de tendance hebdomadaires, horaires et mensuelles pour les graphiques

---

## 7. Ce qui manque ou doit être ajouté

### Lacunes critiques

| Zone | Lacune | Impact |
|------|--------|--------|
| **Route Guards** | Aucune protection au niveau du routeur; vérification auth seulement au niveau du composant | Risque de sécurité; routes techniquement accessibles avant la vérification d'auth |
| **UI basée sur rôles** | Aucun rendu conditionnel basé sur ADMIN vs MANAGER | Même UI pour tous les rôles; aucun scoping d'équipe |
| **Admin User Mgmt** | Aucune UI pour créer/éditer/supprimer les utilisateurs ou attribuer des rôles | Impossible de gérer les comptes utilisateurs depuis l'UI |
| **Data Scoping** | Toutes les données sont globales; aucun filtrage par équipe/manager | Le manager voit tous les appels, pas seulement ceux de son équipe |
| **Settings Backend** | Interface UI Settings non connectée à l'API | Les modifications ne sont pas persistées |
| **Filtrage** | Les filtres se font côté client uniquement; n'est pas envoyé au backend | Mauvaise performance avec de grands datasets |
| **Commercial Mgmt** | Aucune UI pour créer/éditer/supprimer les commerciaux | Impossible de gérer le catalogue des commerciaux |
| **Commercial Assignment** | Aucune interface pour assigner les commerciaux aux managers | Impossible de gérer les attributions d'équipe |
| **Performance Filtering** | Les métriques de performance affichent tous les commerciaux pour tous les utilisateurs | Devrait être scoped par rôle |
| **Comments/Notes** | Colonne notes dans les données mais non affichée dans le tableau des appels | Interface manquante pour les notes de décision |
| **Call Search** | Seulement la recherche par numéro disponible | Devrait supporter plage de dates, durée, filtres de statut |
| **Recording Management** | Enregistrements vérifiés mais pas d'interface suppression/archivage | Impossible de supprimer les enregistrements |
| **Pagination** | L'API supporte la pagination mais l'UI ne montre pas les contrôles de pagination | Limité à la première page des résultats |

### Composants non encore implémentés

- [ ] Modales User CRUD (créer/éditer/supprimer utilisateur formulaires)
- [ ] Modales Commercial CRUD
- [ ] Interface attribution de rôles
- [ ] Interface gestion d'équipe
- [ ] Composant filtrage/recherche d'appels avancé
- [ ] Dashboards basés sur rôles (Dashboard Manager vs Dashboard Admin)
- [ ] Visionneuse de journal d'audit
- [ ] Import d'utilisateurs en masse

### Pages nécessitant des améliorations

**Fichier**: `src/pages/Settings.tsx`
- Intégration backend requise
- Validation des données avant envoi
- Messages de succès/erreur

**Fichier**: `src/pages/Commercials.tsx`
- Ajouter les opérations CRUD
- Ajouter la recherche/filtrage
- Intégrer avec le backend

**Fichier**: `src/pages/Performance.tsx`
- Ajouter le filtrage basé sur rôles
- Scoper les données par équipe pour les managers

---

## Références Rapides - Structure des Fichiers

| Fonction | Fichiers clés |
|----------|---------------|
| **Authentification** | `src/contexts/AuthContext.tsx`, `src/types/user.ts`, `src/config/api.ts` |
| **Dashboard** | `src/pages/Dashboard.tsx`, `src/components/dashboard/*` |
| **Gestion des appels** | `src/pages/Calls.tsx`, `src/components/calls/CallsTable.tsx`, `src/hooks/useCalls.ts` |
| **Lecteur audio** | `src/components/audio/AudioPlayerModal.tsx`, `src/components/audio/AudioDuration.tsx` |
| **Navigation** | `src/components/layout/AppSidebar.tsx`, `src/components/NavLink.tsx` |
| **Performance** | `src/pages/Performance.tsx`, `src/services/performanceService.ts` |
| **Configuration API** | `src/services/api.ts`, `src/config/api.ts` |
| **Données Mock** | `src/data/mockData.ts` |

---

## Résumé exécutif

### Points forts:
✅ Composants fondamentaux solides (authentification, dashboard, lecteur audio, filtrage basique)  
✅ Architecture de services API bien structurée  
✅ Gestion d'état avec React Context  
✅ Intégration de médias (lecteur audio HTML5)  

### Points faibles:
❌ Manque de différenciation UI basée sur les rôles  
❌ Pas de route guards appropriés au niveau du routeur  
❌ Aucune intégration backend pour la gestion des utilisateurs  
❌ Filtrage côté client uniquement  
❌ Scoping de données non implémenté  

### Prochaines étapes recommandées:
1. Implémenter des route guards au niveau du routeur
2. Ajouter le rendu conditionnel d'UI basé sur les rôles
3. Implémenter le scoping des données par rôle
4. Créer les interfaces de gestion des utilisateurs et commerciaux
5. Connecter le backend pour les formulaires Settings
6. Ajouter les contrôles de pagination
7. Améliorer le système de filtrage pour inclure plage de dates

---

**Date du rapport**: 24 mars 2026  
**Version du projet**: Current state analysis
