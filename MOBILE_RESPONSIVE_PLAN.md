# Plan d'adaptation mobile (iPhone 12 et équivalents)

Ce plan couvre la stratégie pour rendre l'application pleinement utilisable sur iPhone 12 (390×844, DPR 3) et, plus largement, sur mobiles modernes. Il est organisé en phases actionnables et checklists.

## 1) Principes généraux
- **Mobile-first** : définir les styles de base pour ≤400px, puis étendre avec des breakpoints `sm` (640) / `md` (768) pour tablettes.
- **Grille fluide** : utiliser `flex`/`grid` avec `gap` et largeur `minmax(0,1fr)` pour éviter les débordements.
- **Unités adaptatives** : préférer `clamp()` pour tailles de texte/espacements (ex. `text-[clamp(14px,3vw,16px)]`).
- **Hauteurs sûres** : intégrer les variables CSS `env(safe-area-inset-*)` pour les marges haut/bas.
- **Gestuelle native** : zones tactiles ≥48px, pas de gestes cachés non signalés.

## 2) Navigation & structure
- **Barre d’action basse** : déplacer les actions principales en bas (thumb reach) avec 4–5 icônes max.
- **Header compact** : hauteur ≤64px, bouton retour clair, titre tronqué avec `text-ellipsis`.
- **Transitions** : utiliser `framer-motion` pour transitions de pages et modales (durée 180–240ms, easing `easeOut`).
- **Modales plein écran** : pour formulaires longs et listes filtrables.

## 3) Typographie & lisibilité
- **Échelle** : base 16px, `clamp` pour titres (ex. `h1: clamp(24px,5vw,28px)`).
- **Contraste** : vérifier WCAG AA (≥4.5:1) pour textes et icônes.
- **Interlignage** : `leading-5/6` sur textes courants pour éviter les collisions.

## 4) Composants clés (React + Tailwind)
- **Cards/sections** : padding `p-4 sm:p-6`, coins `rounded-2xl`, ombres légères pour séparation.
- **Listes** : activer le scroll inertiel (`overflow-y-auto`), séparateurs `divide-y`, support du swipe pour actions secondaires uniquement si doublé d’icônes visibles.
- **Formulaires** : labels visibles, aides contextuelles sous les champs, boutons primaires en bas avec `position: sticky`/`fixed` + marge `env(safe-area-inset-bottom)`.
- **Graphiques (recharts)** : hauteur fixe `min-h-[260px]`, `ResponsiveContainer`, simplifier le nombre de ticks (<5) et afficher des tooltips accessibles.
- **Images/icônes** : `max-w-full h-auto`, éviter les SVG non redimensionnables, utiliser `lucide-react` taille 22–28px.

## 5) Performance mobile
- **Bundle** : activer le code-splitting par page (`React.lazy`/`Suspense`), vérifier `vite build --analyze`.
- **Images** : formats `webp/avif`, lazy loading, tailwind `object-contain` pour éviter les crops.
- **Animations** : limiter à transform/opacity, réduire parallaxes, désactiver animations lourdes sur `prefers-reduced-motion`.

## 6) Gestuelle & interactions
- **Touch feedback** : états actifs (`active:`) et haptique légère si l’API est disponible (capacitor/bridge éventuel).
- **Prévention du zoom involontaire** : tailles de police minimales et `input` adaptés (`type=tel`, `inputmode` correct).
- **Barre de statut** : choisir un thème clair/sombre cohérent; appliquer `meta name="theme-color"` dynamique via React Helmet ou équivalent.

## 7) Accessibilité mobile
- **Focus visible** même au toucher (ring Tailwind), ordre logique des éléments.
- **Lecture d’écran** : aria-label sur icônes seules, rôle explicite sur boutons flottants.
- **Taille des zones clicables** : padding horizontal/vertical suffisant, éviter les liens très rapprochés.

## 8) Tests & validation
- **Devices cibles** : iPhone 12 (390×844), iPhone SE (375×667), Pixel 7 (412×915), tablette 768px.
- **Procédure** :
  - `npm run dev` + emulation Chrome « iPhone 12 ».
  - Vérifier débordements horizontaux (`overflow-x-hidden` sur le body/layout principal).
  - Contrôler la lisibilité en extérieur (mode fort contraste) et en sombre (si thème disponible).
- **Check-list de livraison** :
  - [ ] Aucun scroll horizontal sur toutes les pages.
  - [ ] Navigation principale utilisable à une main (thumb zone).
  - [ ] Taux de tap errors <2% lors de tests internes (boutons ≥48px).
  - [ ] Animations fluides à 60fps sur appareil physique.
  - [ ] Charts lisibles et interactifs sans zoom.

## 9) Roadmap d’implémentation
1. **Audit des écrans** : capturer les pages actuelles en mode iPhone 12, lister les éléments qui débordent ou se chevauchent.
2. **Refonte du layout** :
   - Créer un composant `MobileLayout` (header compact + barre d’action basse + slot contenu).
   - Appliquer `overflow-x-hidden`, `min-h-screen` et gestion des safe areas.
3. **Composants réutilisables** : boutons principaux (variant plein), cartes, listes, barres d’action; factoriser dans `src/components/ui/`.
4. **Adaptation des pages** : migrer chaque page vers `MobileLayout`, ajuster typographies et espacements.
5. **Optimisation performance** : mettre en place `React.lazy` par route et audit `vite build`.
6. **Tests sur devices** : émulateur + test réel iPhone 12; corriger jusqu’à valider la check-list.

## 10) Livrables attendus
- Composant `MobileLayout` + barre d’action basse.
- Kit UI mobile (boutons, cartes, listes, modales, toasts) en Tailwind.
- Documentation d’utilisation des breakpoints et des tokens (tailles, couleurs, ombres) pour la cohérence visuelle.
- Rapport de tests avec captures d’écran iPhone 12.
