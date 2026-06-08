# PUSH Closer Map — Documentation Complete

## C'est quoi ?

App terrain PWA pour l'equipe de closers PUSH a Casablanca. Une carte interactive avec tous les commerces de la ville, organises par niche et quartier, avec un mini CRM integre pour tracker les visites et un guide de closing par niche.

**URL live** : https://push-closer-map.vercel.app
**GitHub** : https://github.com/c4bagence-create/push-closer-map
**Supabase** : https://supabase.com/dashboard/project/jdlyfilsgbtxfrdxccli

---

## A quoi ca sert ?

Le closer sort sur le terrain avec sa tablette/telephone. Il ouvre l'app (ajoutee en ecran d'accueil, mode plein ecran sans barre URL). Il voit tous les commerces de Casa sur la carte. Il filtre par niche (restaurants, coiffeurs, etc.), par quartier, par statut. Il clique sur un commerce et il a :

1. **La fiche complete du commerce** — note Google, avis, telephone (cliquable pour appeler direct), adresse, site web, score PUSH
2. **Les boutons navigation** — Google Maps et Waze pour y aller en voiture
3. **Les arguments de closing** — pourquoi PUSH est indispensable pour CE type de commerce, avec des arguments concrets
4. **Les notifications pre-ecrites** — 5 exemples de notifications push que le commerce pourrait envoyer a ses clients (a copier-coller pour la demo)
5. **Les tips demo** — comment presenter PUSH sur la tablette pour cette niche specifique
6. **Le CRM** — apres la visite, le closer note : demo faite ?, interesse ?, paye ?, frais d'install payes ?, notes

Tout est synchronise en temps reel entre tous les closers via Supabase. Si un closer visite un commerce et le marque "close", tous les autres le voient immediatement.

---

## Les chiffres

- **643 leads** commerces reels a Casablanca
- **37 niches** couvertes
- **20 quartiers** de Casa mappes
- **6 statuts CRM** : Pas visite / Contacte / Demo faite / RDV planifie / Close / Pas interesse

---

## Les 37 niches

### Tier 1 — Food quotidien (clients viennent tous les jours)
| Niche | Leads | Pourquoi PUSH |
|-------|-------|---------------|
| Restaurants | 48 | Fidelite naturelle, 0 commission vs Glovo |
| Cafes | 17 | Rituel quotidien, 10e cafe offert |
| Boulangeries | 20 | Quotidien, notif "croissants chauds" le matin |
| Patisseries | 17 | Habitudes, viennoiseries, fetes |
| Pizzerias | 15 | Notif plat du jour a midi, geoloc |
| Burgers | 17 | Notif promo, stamps fidelite |
| Fast-food | 22 | Volume, midi rush, stamps |
| Sushi | 14 | Livraison, nouveau menu, fidelite |
| Glaciers | 16 | Saisonnier, notif canicule |
| Salons de the | 17 | Reguliers, ambiance, fideles |
| Juice bars | 23 | Healthy trend, stamps |
| Coffee shops | 25 | Specialty, communaute |

### Tier 2 — Beaute & services (clients viennent 1-4x/mois)
| Niche | Leads | Pourquoi PUSH |
|-------|-------|---------------|
| Coiffeurs | 30 | 1-2x/mois, rappel RDV, 10e coupe offerte |
| Barbershops | 13 | Lifestyle, fideles, Instagram |
| Esthetique | 32 | Soins recurrents, promo jours creux |
| Ongleries | 12 | Nail art, renouvellement mensuel |
| Spas | 18 | Premium, detente, offres speciales |
| Fitness | 29 | 3-5x/semaine, check-in, challenges |
| Pharmacies | 19 | Quotidien, parapharmacie, rappel ordonnance |
| Pressing | 24 | Hebdomadaire, rappel "vetements prets" |
| Opticiens | 12 | Panier eleve, rappel controle annuel |

### Tier 3 — Trendy food
| Niche | Leads | Pourquoi PUSH |
|-------|-------|---------------|
| Matcha | 12 | Tendance, jeune, wallet natif |
| Bubble tea | 11 | Stamps, nouveaux parfums |
| Cookies | 12 | Impulse buy, notif gourmandise |
| Brunch | 9 | Weekend, reservations |
| Healthy | 32 | Poke bowls, meal prep, recurrent |
| Acai | 8 | Smoothie bowls, tendance |
| Creperies | 18 | Families, gouter |
| Snacks | 16 | Volume, midi, stamps |
| Chocolatiers | 16 | Fetes, cadeaux, impulse |
| Traiteurs | 12 | Events recurrents, entreprises |

### Tier 3 — Retail & services
| Niche | Leads | Pourquoi PUSH |
|-------|-------|---------------|
| Boutiques mode | 25 | Nouvelle collection, ventes privees |
| Bijouteries | 17 | Panier tres eleve, occasions |
| Fleuristes | 6 | Fetes, anniversaires, rappels |
| Animaleries | 17 | Croquettes mensuelles, rappel vaccin |
| Lavage auto | 16 | Rituel, rappel apres 2 semaines |
| Yoga & Pilates | 10 | Communaute, remplissage cours |

---

## Score PUSH — Comment on priorise

Chaque lead a un score /100 qui dit au closer "celui-la c'est prioritaire". Le score est calcule comme ca :

| Critere | Points | Logique |
|---------|--------|---------|
| Tier 1 (food quotidien) | +50 | Les clients reviennent tous les jours |
| Tier 2 (beaute/services) | +40 | Clients recurrents mensuels |
| Tier 3 (trendy/retail) | +30 | Moins recurrent mais bon potentiel |
| 500+ avis Google | +30 | Gros trafic = gros potentiel PUSH |
| 200+ avis | +25 | Bon trafic |
| 100+ avis | +20 | Trafic correct |
| Note 4.5+ | +15 | Commerce qui tourne bien |
| Note 4.0+ | +12 | Bon commerce |
| Telephone dispo | +8 | On peut appeler direct |
| Adresse dispo | +5 | On sait ou aller |
| PAS de site web | +5 | Pas digital = a BESOIN de PUSH |
| A un site web | +3 | Deja digital mais PUSH complete |
| Bonus niche (boulangeries, coiffeurs, pharmacies) | +10 | Fidelite ultra naturelle |

**Score > 70** = priorite absolue, aller le voir en premier
**Score 50-70** = bon lead, a visiter
**Score 30-49** = correct, a garder pour plus tard

---

## Fonctionnalites de l'app

### Carte interactive
- Leaflet.js + OpenStreetMap (gratuit, pas d'API key)
- MarkerCluster pour les zones denses
- Couleur du marker = niche (chaque niche a sa couleur)
- Marker gris = close ou pas interesse
- Marker or = RDV planifie

### Filtres
- **Par niche** : 37 pills scrollables en haut
- **Par quartier** : dropdown avec 20 quartiers de Casa
- **Par statut** : dropdown (pas visite, contacte, demo faite, RDV, close, pas interesse)
- Le compteur de leads se met a jour en temps reel

### Recherche
- Barre de recherche dans le header
- Recherche par nom de commerce, niche ou quartier
- Dropdown avec les resultats en live
- Clic sur un resultat = zoom sur le marker + ouvre la fiche

### Fiche commerce (clic sur un marker)
- Nom + niche + quartier
- Note Google (/5) ou "Pas de note"
- Avis Google (nombre) ou "Aucun avis"
- Telephone cliquable (appel direct)
- Adresse
- Site web cliquable (domaine affiche)
- Score PUSH /100 + Tier
- Statut CRM actuel

### Boutons action
- **Appeler** : tel: direct (si telephone dispo)
- **Google Maps** : itineraire en voiture
- **Waze** : navigation GPS
- **Site** : ouvre le site web du commerce

### Guide de closing (visible directement)
- **Pourquoi PUSH** : 3-4 raisons specifiques a la niche
- **Arguments de closing** : 3-4 arguments concrets pour convaincre
- **Tips demo tablette** : comment presenter PUSH pour cette niche
- **Notifications pre-ecrites** : 5 messages push prets a copier-coller pour la demo

### CRM (bouton "Closing — Suivi de visite")
- Nom du closer (memorise en localStorage)
- Demo faite ? (Oui/Non)
- Interesse ? (Non / A relancer / Oui)
- Statut (Pas visite / Contacte / Demo faite / RDV planifie / Close / Pas interesse)
- Date RDV (si RDV planifie)
- A paye ? (Oui/Non)
- Frais d'installation payes ? (Oui/Non)
- Notes terrain (textarea libre)
- Sauvegarde automatique

### Stats terrain
- Total leads
- Pourcentage de couverture (leads visites / total)
- Nombre de closes
- Nombre de RDV planifies
- Barres de progression par statut
- Barres de progression par niche

### PWA
- manifest.json avec display: standalone (pas de barre URL)
- Service worker pour le cache offline
- Icone PUSH sur l'ecran d'accueil
- Theme color #FF3B7F

### Sync temps reel
- Supabase PostgreSQL pour stocker les leads + statuts CRM
- Real-time : quand un closer met a jour un statut, tous les autres le voient
- localStorage en fallback (si pas de connexion)
- Merge intelligent : la donnee la plus recente gagne

---

## Stack technique

| Composant | Technologie | Cout |
|-----------|-------------|------|
| Frontend | HTML/CSS/JS pur (pas de framework, pas de build) | Gratuit |
| Carte | Leaflet.js 1.9.4 + MarkerCluster (CDN) | Gratuit |
| Tiles | CartoDB Light (OpenStreetMap) | Gratuit |
| Database | Supabase Free Tier (PostgreSQL) | Gratuit |
| Real-time | Supabase Realtime WebSocket | Gratuit |
| Deploy | Vercel (auto-deploy depuis GitHub) | Gratuit |
| Scraping | ScrapingBee Google Search API | Payant (credits) |
| Font | Inter (Google Fonts CDN) | Gratuit |

---

## Branding PUSH

- **Gradient** : `linear-gradient(135deg, #FF3B7F, #7C5CFF)`
- **Rose** : `#FF3B7F`
- **Orange** : `#FF6B2C`
- **Violet** : `#7C5CFF`
- **Fond** : blanc `#FFFFFF`
- **Cards** : border-radius 16px, shadow douce
- **Boutons** : pill (border-radius 9999px), gradient
- **Font** : Inter

---

## Structure des fichiers

```
push-closer-map/
├── index.html              # App shell unique (PWA)
├── manifest.json           # PWA manifest (standalone)
├── sw.js                   # Service worker (cache v3)
├── css/
│   └── styles.css          # Tout le CSS (mobile-first, PUSH branding)
├── js/
│   ├── app.js              # Init map, markers, clustering, recherche, stats
│   ├── data.js             # 643 leads avec coordonnees GPS
│   ├── niches.js           # 37 niches : couleurs, arguments, notifs, tips
│   ├── zones.js            # 20 quartiers Casa : coordonnees centroids
│   ├── sidebar.js          # Fiche commerce + guide closing + CRM
│   ├── filters.js          # Filtres niche + zone + statut
│   ├── store.js            # localStorage + Supabase sync
│   └── supabase.js         # Client Supabase REST + Realtime
├── assets/
│   └── push-icon.svg       # Icone PUSH (gradient P)
├── scripts/
│   └── seed-supabase.mjs   # Script one-time : push leads dans Supabase
└── vercel.json             # Config Vercel (si besoin)
```

---

## Base de donnees Supabase

### Table `leads` (643 rows)
| Colonne | Type | Description |
|---------|------|-------------|
| id | SERIAL PK | ID unique |
| name | TEXT | Nom du commerce |
| address | TEXT | Adresse (si dispo) |
| phone | TEXT | Telephone (si dispo) |
| rating | DECIMAL | Note Google /5 |
| reviews | INTEGER | Nombre d'avis Google |
| niche | TEXT | Niche (ex: Restaurants, Coiffeurs) |
| tier | INTEGER | Tier 1/2/3 |
| score | INTEGER | Score PUSH /100 |
| quartier | TEXT | Quartier de Casa |
| lat | DECIMAL | Latitude GPS |
| lng | DECIMAL | Longitude GPS |
| website | TEXT | URL du site web |

### Table `lead_status` (CRM)
| Colonne | Type | Description |
|---------|------|-------------|
| id | SERIAL PK | ID unique |
| lead_id | INTEGER FK | Reference vers leads.id |
| closer_name | TEXT | Prenom du closer |
| status | TEXT | not_visited / contacted / demo_done / rdv_planned / closed / not_interested |
| next_rdv | DATE | Date du prochain RDV |
| notes | TEXT | Notes terrain libres |
| updated_at | TIMESTAMPTZ | Derniere mise a jour |

RLS desactive (open access). Realtime active sur `lead_status`.

---

## Cles et acces

- **Supabase URL** : `https://jdlyfilsgbtxfrdxccli.supabase.co`
- **Supabase publishable key** : `sb_publishable_nZdKSA2zRIGb2lB_k5JGNQ_5PORgiwJ`
- **ScrapingBee API key** : `I0QTP73582RXQKK7CBZY11RZFZDM13XI389KTUZOTNDAYJKJXZ3SMN0N60IZUMJZ477NKH2FWVCRXH7I`
- **GitHub** : `c4bagence-create/push-closer-map`
- **Vercel** : `c4bagence-creates-projects/push-closer-map`

---

## Scraping — Comment les leads ont ete recuperes

### Outil
ScrapingBee Google Search API (`/api/v1/store/google`)

### Methode
191 requetes Google Search couvrant les 37 niches x plusieurs mots-cles et quartiers. Exemples :
- "restaurant casablanca maarif"
- "coiffeur femme casablanca"
- "pharmacie casablanca gauthier"
- "salle de sport ain diab"

### Sources de donnees par lead
- **Google Local Pack** : nom, adresse, telephone, rating, reviews, website (le plus riche)
- **Knowledge Graph** : infos business structurees
- **Instagram** : profils business locaux
- **Sites web** : pages business avec extraction tel/adresse

### Nettoyage
- Deduplication par nom normalise
- Suppression des articles/blogs ("Top 10", "Meilleur", "Livraison de")
- Suppression des sites aggregateurs (TripAdvisor, Yelp, RestaurantGuru)
- Merge des doublons (si meme commerce apparait avec tel dans une source et adresse dans une autre)

### Geocodage
Pas d'adresses GPS reelles — les leads sont positionnes autour des centroids de quartiers avec un jitter aleatoire (50-200m) pour un rendu realiste sur la carte. Chaque niche est assignee aux quartiers ou elle est typiquement presente (ex: sushi → Maarif, Anfa, Gauthier).

### Script
`/Users/c4b/Desktop/scrape-push-casa-v2.py` — script Python complet avec toutes les requetes, l'extraction, le scoring et le nettoyage.

---

## Contexte business

### PUSH c'est quoi
Carte de fidelite digitale dans Apple Wallet / Google Wallet. Le commerce installe une tablette a la caisse, le client scanne le QR code, la carte s'ajoute a son Wallet. Ensuite le commerce envoie des notifications push a TOUS ses clients en 1 clic.

### Chiffres cles PUSH
- **95% taux d'ouverture** des notifications push (vs 20% email, 5% SMS)
- **Geolocalisation** : notification automatique quand un client passe a 200m
- **Stamps** : programme de fidelite digital (10 tampons = 1 gratuit)
- **0 commission** (contrairement a Glovo, Jumia Food qui prennent 15-30%)

### Pricing PUSH
- **Starter** : 59EUR/mois (~600 DH)
- **Pro** : 159EUR/mois
- **Installation** : 70EUR HT (souvent offerte en promo)

### L'equipe terrain
Les closers se deplacent a Casablanca, quartier par quartier. Ils entrent dans les commerces, font une demo de PUSH sur la tablette, et closent sur place. L'app leur sert a :
1. Savoir ou aller (carte + navigation)
2. Savoir quoi dire (arguments par niche)
3. Avoir la demo prete (notifications pre-ecrites)
4. Tracker leur progression (CRM)
5. Ne pas visiter un commerce deja close par un autre closer (sync temps reel)

---

## Pour relancer le projet

1. `git clone https://github.com/c4bagence-create/push-closer-map.git`
2. `python3 -m http.server 8080` dans le dossier
3. Ouvrir `http://localhost:8080`
4. Pour modifier les leads : editer `js/data.js` puis `node scripts/seed-supabase.mjs`
5. Pour ajouter une niche : editer `js/niches.js` (ajouter dans NICHES + NICHE_ORDER)
6. Deploy : `git push origin main` (auto-deploy Vercel)
