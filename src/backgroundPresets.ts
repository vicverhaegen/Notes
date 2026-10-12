export interface ColorPreset {
  id: string;
  name: string;
  value: string;
}

// 11 predefined base colors + 12th is the RGB/Color picker
export const BASE_COLOR_PRESETS: ColorPreset[] = [
  { id: 'c-slate', name: 'Zacht Grijs', value: 'linear-gradient(to bottom right, #dfe7ef, #e2e8f0, #cbd5e1)' },
  { id: 'c-blue', name: 'Oceaanblauw', value: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' },
  { id: 'c-navy', name: 'Marineblauw', value: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' },
  { id: 'c-emerald', name: 'Smaragdgroen', value: 'linear-gradient(135deg, #059669 0%, #047857 100%)' },
  { id: 'c-forest', name: 'Woudgroen', value: 'linear-gradient(135deg, #14532d 0%, #166534 100%)' },
  { id: 'c-orange', name: 'Warm Oranje', value: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)' },
  { id: 'c-amber', name: 'Goudgeel', value: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' },
  { id: 'c-purple', name: 'Dieppaars', value: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' },
  { id: 'c-rose', name: 'Zacht Roze', value: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)' },
  { id: 'c-wine', name: 'Bordeaux', value: 'linear-gradient(135deg, #881337 0%, #9f1239 100%)' },
  { id: 'c-dark', name: 'Middernacht', value: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' },
];

export interface PhotoPreset {
  id: string;
  name: string;
  value: string;
}

// Exactly 18 curated scenic nature photos (100% offline self-contained SVG vector landscapes)
export const DEFAULT_PHOTO_PRESETS: PhotoPreset[] = [
  {
    id: 'p-alpine',
    name: 'Bergen & Meer',
    value: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080' viewBox='0 0 1920 1080'><defs><linearGradient id='sky' x1='0' y1='0' x2='0' y2='1'><stop offset='0%25' stop-color='%231e3c72'/><stop offset='60%25' stop-color='%232a5298'/><stop offset='100%25' stop-color='%237aa1d2'/></linearGradient><linearGradient id='m1' x1='0' y1='0' x2='0' y2='1'><stop offset='0%25' stop-color='%232c3e50'/><stop offset='100%25' stop-color='%231a252f'/></linearGradient><linearGradient id='water' x1='0' y1='0' x2='0' y2='1'><stop offset='0%25' stop-color='%232980b9'/><stop offset='100%25' stop-color='%231f4761'/></linearGradient></defs><rect width='1920' height='1080' fill='url(%23sky)'/><polygon points='200,650 650,220 1100,650' fill='url(%23m1)' opacity='0.7'/><polygon points='800,650 1250,280 1700,650' fill='url(%23m1)' opacity='0.85'/><polygon points='-100,680 400,340 900,680' fill='%231b2631'/><rect y='650' width='1920' height='430' fill='url(%23water)'/></svg>") center/cover no-repeat`,
  },
  {
    id: 'p-sunset',
    name: 'Gouden Zonsondergang',
    value: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080' viewBox='0 0 1920 1080'><defs><linearGradient id='bg' x1='0' y1='0' x2='0' y2='1'><stop offset='0%25' stop-color='%234a154b'/><stop offset='45%25' stop-color='%23b83280'/><stop offset='75%25' stop-color='%23dd6b20'/><stop offset='100%25' stop-color='%23f6e05e'/></linearGradient></defs><rect width='1920' height='1080' fill='url(%23bg)'/><circle cx='960' cy='620' r='180' fill='%23fff' opacity='0.75'/><polygon points='0,1080 0,720 500,620 1100,740 1920,680 1920,1080' fill='%23230c33'/></svg>") center/cover no-repeat`,
  },
  {
    id: 'p-forest',
    name: 'Misty Pines',
    value: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080' viewBox='0 0 1920 1080'><defs><linearGradient id='bg' x1='0' y1='0' x2='0' y2='1'><stop offset='0%25' stop-color='%230f2027'/><stop offset='50%25' stop-color='%23203a43'/><stop offset='100%25' stop-color='%232c5364'/></linearGradient></defs><rect width='1920' height='1080' fill='url(%23bg)'/><path d='M0,850 Q480,750 960,820 T1920,780 L1920,1080 L0,1080 Z' fill='%230b191e'/><path d='M0,920 Q480,840 960,890 T1920,860 L1920,1080 L0,1080 Z' fill='%23050c0e'/></svg>") center/cover no-repeat`,
  },
  {
    id: 'p-aurora',
    name: 'Noorderlicht',
    value: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080' viewBox='0 0 1920 1080'><defs><linearGradient id='sky' x1='0' y1='0' x2='0' y2='1'><stop offset='0%25' stop-color='%23020b14'/><stop offset='100%25' stop-color='%230a1c2a'/></linearGradient><linearGradient id='aurora' x1='0' y1='0' x2='1' y2='0'><stop offset='10%25' stop-color='%2300f2fe' stop-opacity='0'/><stop offset='40%25' stop-color='%234facfe' stop-opacity='0.7'/><stop offset='60%25' stop-color='%2300f260' stop-opacity='0.8'/><stop offset='90%25' stop-color='%230575e6' stop-opacity='0'/></linearGradient></defs><rect width='1920' height='1080' fill='url(%23sky)'/><path d='M-100,400 Q400,200 960,350 T1980,250 L2000,600 Q1500,450 960,550 T-100,500 Z' fill='url(%23aurora)'/></svg>") center/cover no-repeat`,
  },
  {
    id: 'p-desert',
    name: 'Duinen & Woestijn',
    value: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080' viewBox='0 0 1920 1080'><defs><linearGradient id='sky' x1='0' y1='0' x2='0' y2='1'><stop offset='0%25' stop-color='%23fbc2eb'/><stop offset='100%25' stop-color='%23a6c1ee'/></linearGradient></defs><rect width='1920' height='1080' fill='url(%23sky)'/><path d='M0,750 Q500,600 1000,720 T1920,680 L1920,1080 L0,1080 Z' fill='%23e08b68'/><path d='M0,850 Q600,720 1200,840 T1920,800 L1920,1080 L0,1080 Z' fill='%23c76d46'/></svg>") center/cover no-repeat`,
  },
  {
    id: 'p-ocean',
    name: 'Diepe Oceaan',
    value: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080' viewBox='0 0 1920 1080'><defs><linearGradient id='bg' x1='0' y1='0' x2='0' y2='1'><stop offset='0%25' stop-color='%2309203f'/><stop offset='100%25' stop-color='%23537895'/></linearGradient></defs><rect width='1920' height='1080' fill='url(%23bg)'/><path d='M0,600 C300,550 600,650 960,600 C1320,550 1620,650 1920,600 L1920,1080 L0,1080 Z' fill='%23122c4d' opacity='0.5'/><path d='M0,720 C300,680 600,760 960,720 C1320,680 1620,760 1920,720 L1920,1080 L0,1080 Z' fill='%230b1b30'/></svg>") center/cover no-repeat`,
  },
  {
    id: 'p-nightsky',
    name: 'Sterrenhemel',
    value: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080' viewBox='0 0 1920 1080'><defs><radialGradient id='stars' cx='50%25' cy='30%25' r='70%25'><stop offset='0%25' stop-color='%23192231'/><stop offset='100%25' stop-color='%23070b12'/></radialGradient></defs><rect width='1920' height='1080' fill='url(%23stars)'/><circle cx='300' cy='200' r='2' fill='%23fff' opacity='0.8'/><circle cx='800' cy='150' r='2.5' fill='%23fff' opacity='0.9'/><circle cx='1400' cy='280' r='1.8' fill='%23fff' opacity='0.7'/><circle cx='1100' cy='390' r='2.2' fill='%23fff' opacity='0.8'/><circle cx='500' cy='420' r='1.5' fill='%23fff' opacity='0.6'/><polygon points='0,1080 300,850 700,980 1200,870 1600,990 1920,890 1920,1080' fill='%23020407'/></svg>") center/cover no-repeat`,
  },
  {
    id: 'p-lavender',
    name: 'Lavendelvelden',
    value: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080' viewBox='0 0 1920 1080'><defs><linearGradient id='sky' x1='0' y1='0' x2='0' y2='1'><stop offset='0%25' stop-color='%23e0c3fc'/><stop offset='100%25' stop-color='%238ec5fc'/></linearGradient></defs><rect width='1920' height='1080' fill='url(%23sky)'/><path d='M0,700 Q480,620 960,680 T1920,650 L1920,1080 L0,1080 Z' fill='%2370538f'/><path d='M0,820 Q480,750 960,800 T1920,770 L1920,1080 L0,1080 Z' fill='%23573c75'/></svg>") center/cover no-repeat`,
  },
  {
    id: 'p-canyon',
    name: 'Rode Canyon',
    value: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080' viewBox='0 0 1920 1080'><defs><linearGradient id='sky' x1='0' y1='0' x2='0' y2='1'><stop offset='0%25' stop-color='%23fbc531'/><stop offset='60%25' stop-color='%23e17055'/><stop offset='100%25' stop-color='%23d63031'/></linearGradient></defs><rect width='1920' height='1080' fill='url(%23sky)'/><polygon points='0,1080 0,600 450,720 900,550 1400,680 1920,530 1920,1080' fill='%2363171b'/></svg>") center/cover no-repeat`,
  },
  // 9 Additional Nature Presets (total 18)
  {
    id: 'p-waterfall',
    name: 'Waterval in het Bos',
    value: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080' viewBox='0 0 1920 1080'><defs><linearGradient id='wsky' x1='0' y1='0' x2='0' y2='1'><stop offset='0%25' stop-color='%23134e4a'/><stop offset='60%25' stop-color='%230f766e'/><stop offset='100%25' stop-color='%2314b8a6'/></linearGradient><linearGradient id='fall' x1='0' y1='0' x2='0' y2='1'><stop offset='0%25' stop-color='%23ccfbf1'/><stop offset='100%25' stop-color='%235eead4'/></linearGradient></defs><rect width='1920' height='1080' fill='url(%23wsky)'/><polygon points='0,1080 0,500 550,560 700,750 0,1080' fill='%23042f2e'/><polygon points='1920,1080 1920,480 1350,540 1200,760 1920,1080' fill='%23042f2e'/><polygon points='860,540 1060,540 1120,1080 800,1080' fill='url(%23fall)' opacity='0.9'/><ellipse cx='960' cy='1050' rx='380' ry='70' fill='%2399f6e4' opacity='0.7'/></svg>") center/cover no-repeat`,
  },
  {
    id: 'p-autumn',
    name: 'Herfstbos',
    value: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080' viewBox='0 0 1920 1080'><defs><linearGradient id='asky' x1='0' y1='0' x2='0' y2='1'><stop offset='0%25' stop-color='%2378350f'/><stop offset='50%25' stop-color='%23b45309'/><stop offset='100%25' stop-color='%23fef3c7'/></linearGradient></defs><rect width='1920' height='1080' fill='url(%23asky)'/><polygon points='100,780 480,450 860,780' fill='%239a3412' opacity='0.85'/><polygon points='600,820 980,420 1380,820' fill='%23c2410c' opacity='0.85'/><polygon points='1100,800 1520,460 1900,800' fill='%23ea580c' opacity='0.8'/><path d='M0,820 Q480,720 960,790 T1920,750 L1920,1080 L0,1080 Z' fill='%23451a03'/></svg>") center/cover no-repeat`,
  },
  {
    id: 'p-beach',
    name: 'Tropisch Strand',
    value: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080' viewBox='0 0 1920 1080'><defs><linearGradient id='bsky' x1='0' y1='0' x2='0' y2='1'><stop offset='0%25' stop-color='%230284c7'/><stop offset='65%25' stop-color='%2338bdf8'/><stop offset='100%25' stop-color='%23bae6fd'/></linearGradient><linearGradient id='sea' x1='0' y1='0' x2='0' y2='1'><stop offset='0%25' stop-color='%230284c7'/><stop offset='50%25' stop-color='%2306b6d4'/><stop offset='100%25' stop-color='%2322d3ee'/></linearGradient></defs><rect width='1920' height='1080' fill='url(%23bsky)'/><circle cx='1400' cy='320' r='100' fill='%23fff' opacity='0.8'/><rect y='600' width='1920' height='260' fill='url(%23sea)'/><path d='M0,840 Q600,760 1200,820 T1920,800 L1920,1080 L0,1080 Z' fill='%23fde68a'/><path d='M0,930 Q500,880 1100,920 T1920,900 L1920,1080 L0,1080 Z' fill='%23fcd34d'/></svg>") center/cover no-repeat`,
  },
  {
    id: 'p-snowpeak',
    name: 'Besneeuwde Bergtop',
    value: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080' viewBox='0 0 1920 1080'><defs><linearGradient id='ssky' x1='0' y1='0' x2='0' y2='1'><stop offset='0%25' stop-color='%230f172a'/><stop offset='60%25' stop-color='%231e3a8a'/><stop offset='100%25' stop-color='%2393c5fd'/></linearGradient></defs><rect width='1920' height='1080' fill='url(%23ssky)'/><polygon points='200,720 700,200 1200,720' fill='%231e293b'/><polygon points='700,200 580,340 700,310 820,340' fill='%23f8fafc'/><polygon points='800,750 1350,160 1880,750' fill='%230f172a'/><polygon points='1350,160 1230,300 1350,280 1480,310' fill='%23ffffff'/><rect y='720' width='1920' height='360' fill='%2338bdf8' opacity='0.4'/><rect y='760' width='1920' height='320' fill='%230284c7' opacity='0.6'/></svg>") center/cover no-repeat`,
  },
  {
    id: 'p-greenhills',
    name: 'Groene Heuvels',
    value: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080' viewBox='0 0 1920 1080'><defs><linearGradient id='gsky' x1='0' y1='0' x2='0' y2='1'><stop offset='0%25' stop-color='%2360a5fa'/><stop offset='60%25' stop-color='%2393c5fd'/><stop offset='100%25' stop-color='%23dbeafe'/></linearGradient></defs><rect width='1920' height='1080' fill='url(%23gsky)'/><circle cx='400' cy='350' r='80' fill='%23fef08a' opacity='0.9'/><path d='M-100,750 Q450,550 1050,700 T2100,620 L2100,1080 L-100,1080 Z' fill='%234ade80'/><path d='M-100,840 Q550,680 1200,810 T2100,740 L2100,1080 L-100,1080 Z' fill='%2322c55e'/><path d='M-100,920 Q480,820 1000,900 T2100,850 L2100,1080 L-100,1080 Z' fill='%2315803d'/></svg>") center/cover no-repeat`,
  },
  {
    id: 'p-bamboo',
    name: 'Bamboe Bos',
    value: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080' viewBox='0 0 1920 1080'><defs><linearGradient id='bsky2' x1='0' y1='0' x2='0' y2='1'><stop offset='0%25' stop-color='%23064e3b'/><stop offset='50%25' stop-color='%23047857'/><stop offset='100%25' stop-color='%23a7f3d0'/></linearGradient></defs><rect width='1920' height='1080' fill='url(%23bsky2)'/><rect x='150' width='30' height='1080' fill='%23065f46' opacity='0.6'/><rect x='320' width='45' height='1080' fill='%23047857' opacity='0.75'/><rect x='520' width='35' height='1080' fill='%23065f46' opacity='0.5'/><rect x='780' width='50' height='1080' fill='%23047857' opacity='0.8'/><rect x='1050' width='40' height='1080' fill='%23065f46' opacity='0.6'/><rect x='1300' width='55' height='1080' fill='%23047857' opacity='0.85'/><rect x='1580' width='35' height='1080' fill='%23065f46' opacity='0.55'/><rect x='1780' width='45' height='1080' fill='%23047857' opacity='0.7'/><rect y='940' width='1920' height='140' fill='%23022c22'/></svg>") center/cover no-repeat`,
  },
  {
    id: 'p-river',
    name: 'Rustige Rivier',
    value: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080' viewBox='0 0 1920 1080'><defs><linearGradient id='rsky' x1='0' y1='0' x2='0' y2='1'><stop offset='0%25' stop-color='%231e293b'/><stop offset='60%25' stop-color='%23475569'/><stop offset='100%25' stop-color='%23cbd5e1'/></linearGradient><linearGradient id='rwater' x1='0' y1='0' x2='0' y2='1'><stop offset='0%25' stop-color='%2364748b'/><stop offset='100%25' stop-color='%230f172a'/></linearGradient></defs><rect width='1920' height='1080' fill='url(%23rsky)'/><polygon points='0,1080 0,620 600,680 850,750 0,1080' fill='%231e293b'/><polygon points='1920,1080 1920,600 1350,680 1100,750 1920,1080' fill='%230f172a'/><polygon points='920,680 1040,680 1180,1080 780,1080' fill='url(%23rwater)'/></svg>") center/cover no-repeat`,
  },
  {
    id: 'p-cherryblossom',
    name: 'Kersenbloesem & Berg',
    value: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080' viewBox='0 0 1920 1080'><defs><linearGradient id='csky' x1='0' y1='0' x2='0' y2='1'><stop offset='0%25' stop-color='%23f472b6'/><stop offset='50%25' stop-color='%23fbcfe8'/><stop offset='100%25' stop-color='%23ede9fe'/></linearGradient></defs><rect width='1920' height='1080' fill='url(%23csky)'/><circle cx='960' cy='520' r='160' fill='%23f43f5e' opacity='0.6'/><polygon points='500,820 960,350 1420,820' fill='%23475569'/><polygon points='960,350 860,450 960,430 1060,450' fill='%23ffffff'/><circle cx='250' cy='780' r='120' fill='%23ec4899' opacity='0.7'/><circle cx='380' cy='740' r='100' fill='%23f472b6' opacity='0.8'/><circle cx='1650' cy='760' r='130' fill='%23ec4899' opacity='0.7'/><circle cx='1520' cy='730' r='90' fill='%23f472b6' opacity='0.8'/><rect y='820' width='1920' height='260' fill='%23831843'/></svg>") center/cover no-repeat`,
  },
  {
    id: 'p-seaofclouds',
    name: 'Wolkenzee & Zonsopgang',
    value: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080' viewBox='0 0 1920 1080'><defs><linearGradient id='cldsky' x1='0' y1='0' x2='0' y2='1'><stop offset='0%25' stop-color='%23312e81'/><stop offset='40%25' stop-color='%236366f1'/><stop offset='75%25' stop-color='%23fbbf24'/><stop offset='100%25' stop-color='%23fed7aa'/></linearGradient></defs><rect width='1920' height='1080' fill='url(%23cldsky)'/><circle cx='960' cy='620' r='140' fill='%23fff' opacity='0.85'/><ellipse cx='300' cy='820' rx='420' ry='120' fill='%23ffffff' opacity='0.85'/><ellipse cx='960' cy='850' rx='500' ry='140' fill='%23f8fafc' opacity='0.9'/><ellipse cx='1620' cy='820' rx='450' ry='130' fill='%23ffffff' opacity='0.85'/><polygon points='820,820 960,670 1100,820' fill='%231e1b4b'/></svg>") center/cover no-repeat`,
  },
];
