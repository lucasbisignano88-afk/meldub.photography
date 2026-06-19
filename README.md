# Mélanie Dubois — Photographe équestre

Site vitrine (portfolio + réservation) de Mélanie Dubois, photographe équestre.
Site statique : `index.html` + `styles.css` + le code de l'app dans `js/`, sans étape de build.

## Contenu du site
- **Accueil** — hero, prochains concours, à propos, galerie de réalisations, appel à l'action
- **Tarifs** — prestations sur concours et séances privées
- **Réservation** — formulaire de réservation à un concours
- **Confirmation & Suivi** — lien personnel de suivi des photos
- **Espace photographe** — back-office (concours, réservations, tarifs, galerie)

## Structure

```
index.html      Point d'entrée (à la racine pour un déploiement Vercel direct)
styles.css      Toute la mise en forme
js/
  store.jsx     État global, données, persistance (localStorage)
  ui.jsx        Composants partagés + icônes
  public.jsx    Pages publiques (accueil, tarifs, réservation, suivi)
  admin.jsx     Espace photographe
  app.jsx       Routeur + montage de l'app (chargé en dernier)
photos/         Images du site
_prototype/     Export d'origine (coquille de prototype) — non déployé, conservé pour référence
```

L'app est en React, transformée dans le navigateur par Babel (React / ReactDOM / Babel
chargés depuis unpkg). C'est volontairement sans build : on édite les `.jsx` directement.

## Prévisualiser en local

Un serveur local est nécessaire (le double-clic sur `index.html` ne marche pas : les
fichiers `.jsx` sont chargés via `fetch`, bloqué en `file://`). Depuis ce dossier :

```bash
# Python (déjà installé sur la plupart des machines)
python -m http.server 8000
```

ou

```bash
# Node
npx serve .
```

Puis ouvrir http://localhost:8000 (ou l'URL affichée).

## Déployer sur Vercel

`index.html` est à la racine : aucun réglage nécessaire.

- **CLI** : `npx vercel` (puis `npx vercel --prod`)
- **Git** : importer le dépôt sur vercel.com — Framework Preset = « Other », rien à configurer.

Le dossier `_prototype/` est exclu du déploiement via `.vercelignore`.
