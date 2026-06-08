// PUSH Closer Map — Zones / Quartiers de Casablanca
// Centroids GPS pour positionner les leads sur la carte

export const ZONES = {
  "Maarif": {
    lat: 33.5731,
    lng: -7.6322,
    radius: 0.008,
    description: "Centre commercial, restaurants, cafes"
  },
  "Gauthier": {
    lat: 33.5878,
    lng: -7.6234,
    radius: 0.006,
    description: "Quartier affaires, bureaux, restaurants haut de gamme"
  },
  "Bourgogne": {
    lat: 33.5802,
    lng: -7.6189,
    radius: 0.006,
    description: "Residentiel, commerces de proximite"
  },
  "Racine": {
    lat: 33.5893,
    lng: -7.6310,
    radius: 0.006,
    description: "Cliniques, restaurants, salons"
  },
  "Anfa": {
    lat: 33.5750,
    lng: -7.6580,
    radius: 0.010,
    description: "Quartier chic, restaurants gastronomiques, spas"
  },
  "Ain Diab": {
    lat: 33.5930,
    lng: -7.6700,
    radius: 0.010,
    description: "Corniche, restos, bars, plage, loisirs"
  },
  "Corniche": {
    lat: 33.5980,
    lng: -7.6620,
    radius: 0.008,
    description: "Front de mer, restaurants, fast-food, glaciers"
  },
  "Centre-ville": {
    lat: 33.5950,
    lng: -7.6119,
    radius: 0.008,
    description: "Medina, commerces traditionnels, snacks"
  },
  "Hay Hassani": {
    lat: 33.5600,
    lng: -7.6700,
    radius: 0.012,
    description: "Populaire, coiffeurs, snacks, boulangeries"
  },
  "Sidi Maarouf": {
    lat: 33.5420,
    lng: -7.6530,
    radius: 0.012,
    description: "Zone d'activite, bureaux, fast-food, fitness"
  },
  "Oulfa": {
    lat: 33.5550,
    lng: -7.5900,
    radius: 0.010,
    description: "Residentiel populaire, commerces locaux"
  },
  "Derb Sultan": {
    lat: 33.5870,
    lng: -7.6050,
    radius: 0.008,
    description: "Populaire, barbershops, snacks, boulangeries"
  },
  "Mers Sultan": {
    lat: 33.5900,
    lng: -7.6100,
    radius: 0.006,
    description: "Centre, commerces mixtes"
  },
  "Belvédère": {
    lat: 33.5780,
    lng: -7.6100,
    radius: 0.006,
    description: "Parc, residentiel, cafes"
  },
  "CIL": {
    lat: 33.5650,
    lng: -7.6200,
    radius: 0.008,
    description: "Residentiel, salons, commerces"
  },
  "2 Mars": {
    lat: 33.5820,
    lng: -7.6280,
    radius: 0.006,
    description: "Commercial, restaurants, fast-food"
  },
  "Palmier": {
    lat: 33.5680,
    lng: -7.6350,
    radius: 0.006,
    description: "Residentiel, cafes, boulangeries"
  },
  "Oasis": {
    lat: 33.5620,
    lng: -7.6450,
    radius: 0.008,
    description: "Residentiel chic, restaurants, salons"
  },
  "California": {
    lat: 33.5700,
    lng: -7.6700,
    radius: 0.008,
    description: "Moderne, fitness, healthy, brunch"
  },
  "Riviera": {
    lat: 33.5760,
    lng: -7.6600,
    radius: 0.006,
    description: "Residentiel, cafes, patisseries"
  }
};

export const ZONE_NAMES = Object.keys(ZONES);

// Casablanca center for initial map view
export const CASA_CENTER = { lat: 33.5731, lng: -7.6298 };
export const CASA_ZOOM = 13;
