// Palmarès des Zenkai Anime Awards 2026 (résultats révélés en direct).
// Ordre = ordre de passage pendant le live. Images : /public/image/<DOSSIER>/...
// Photos des présentateurs : /public/image/presentateurs/...

export interface PodiumEntry {
  name: string;
  /** anime, artiste ou studio affiché sous le nom */
  sub?: string;
  img: string;
}

export interface Winner extends PodiumEntry {
  /** studio, auteur, doubleur ou artiste (crédits officiels du live) */
  credit?: string;
}

export interface Presenter {
  name: string;
  handle?: string;
  photo?: string;
}

export interface PalmaresCategory {
  id: string;
  titleFr: string;
  titleEn: string;
  presenter: Presenter;
  bg: string;
  winner: Winner;
  second?: PodiumEntry;
  third?: PodiumEntry;
}

const P = (file: string) => `/image/presentateurs/${file}`;

export const PALMARES_2026: PalmaresCategory[] = [
  {
    id: 'p-deception', titleFr: 'Déception de l’année', titleEn: 'Disappointment of the Year', bg: '/FOND_DECEPTION.png',
    presenter: { name: 'Tempest', handle: '@guy.di.tempest', photo: P('tempest.webp') },
    winner: { name: 'One-Punch Man', sub: 'Saison 3', credit: 'J.C.Staff · ONE', img: '/image/DECEPTION/One.png' },
    second: { name: 'The Beginning After the End', sub: 'Saison 2', img: '/image/DECEPTION/TBATE.png' },
    third: { name: 'Blue Lock', sub: 'Saison 2', img: '/image/DECEPTION/Blue Lock S2.png' },
  },
  {
    id: 'p-romance', titleFr: 'Meilleure romance', titleEn: 'Best Romance', bg: '/FOND_ROMANCE.png',
    presenter: { name: 'Y-Gaëtan', handle: '@yvesgaetan', photo: P('gaetan.webp') },
    winner: { name: 'Bloom', credit: 'CloverWorks · Saka Mikami', img: '/image/ROMANCE/Bloom.png' },
    second: { name: 'My Dress-Up Darling', sub: 'Saison 2', img: '/image/ROMANCE/Dress.png' },
    third: { name: 'Blue Box', img: '/image/ROMANCE/Box.png' },
  },
  {
    id: 'p-sol', titleFr: 'Meilleur slice of life', titleEn: 'Best Slice of Life', bg: '/FOND_SLICE.png',
    presenter: { name: 'Hermione', handle: '@hermione.rbl_', photo: P('hermione.webp') },
    winner: { name: 'Spy × Family', sub: 'Saison 3', credit: 'Wit Studio & CloverWorks · Tatsuya Endo', img: '/image/SLICE/Spy.png' },
    second: { name: 'My Dress-Up Darling', sub: 'Saison 2', img: '/image/SLICE/Dress.png' },
    third: { name: 'Anne Shirley', img: '/image/SLICE/Anne.png' },
  },
  {
    id: 'p-comedie', titleFr: 'Meilleure comédie', titleEn: 'Best Comedy', bg: '/FOND_COMEDIE.png',
    presenter: { name: 'Daan', handle: '@king_w_dan', photo: P('daan.webp') },
    winner: { name: 'Spy × Family', sub: 'Saison 3', credit: 'Wit Studio & CloverWorks · Tatsuya Endo', img: '/image/COMEDIE/Spy.png' },
    second: { name: 'Konosuba', sub: 'Saison 3 · Bonus Stage', img: '/image/COMEDIE/Bonus.png' },
    third: { name: 'Ranma ½', img: '/image/COMEDIE/Ranma.png' },
  },
  {
    id: 'p-isekai', titleFr: 'Meilleur isekai', titleEn: 'Best Isekai', bg: '/FOND ISEKAI.jpg',
    presenter: { name: 'Shadow', handle: '@accelerator_07', photo: P('shadow.webp') },
    winner: { name: 'Re:Zero', sub: 'Saison 3', credit: 'White Fox · Tappei Nagatsuki', img: '/image/ISEKAI/Rezero.png' },
    second: { name: 'Lord of the Mysteries', img: '/image/ISEKAI/Lord.png' },
    third: { name: 'The Rising of the Shield Hero', sub: 'Saison 4', img: '/image/ISEKAI/Shield.png' },
  },
  {
    id: 'p-seinen', titleFr: 'Meilleur seinen', titleEn: 'Best Seinen', bg: '/FOND_SEINEN.png',
    presenter: { name: 'Afro Joestar', handle: '@afrothecreator', photo: P('afro.webp') },
    winner: { name: 'Les Carnets de l’apothicaire', sub: 'Saison 2', credit: 'Toho Animation Studio & OLM · Natsu Hyūga', img: '/image/SEINEN/Carnet.png' },
    second: { name: 'Orb', sub: 'Du mouvement de la Terre', img: '/image/NOUVEAUTE/Orb.png' },
    third: { name: 'The Summer Hikaru Died', img: '/image/SEINEN/Summer.png' },
  },
  {
    id: 'p-antagoniste', titleFr: 'Meilleur antagoniste', titleEn: 'Best Antagonist', bg: '/FOND_ANTAGONISTE.png',
    presenter: { name: 'Stylouish', handle: '@stylouish', photo: P('stylouish.webp') },
    winner: { name: 'All For One', sub: 'My Hero Academia', credit: 'Voix japonaise : Akio Ōtsuka', img: '/image/ANTAGONISTE/All.png' },
    second: { name: 'Akaza', sub: 'Demon Slayer', img: '/image/ANTAGONISTE/Akaza.png' },
    third: { name: 'Yhwach', sub: 'Bleach TYBW', img: '/image/ANTAGONISTE/Yhwach.png' },
  },
  {
    id: 'p-combat', titleFr: 'Meilleur combat', titleEn: 'Best Fight', bg: '/FOND_COMBAT.png',
    presenter: { name: 'Alex Kagami', handle: '@alexkagami.manga', photo: P('kagami.webp') },
    winner: { name: 'Akaza vs Giyu & Tanjiro', sub: 'Demon Slayer : La Forteresse Infinie', credit: 'Ufotable', img: '/image/COMBAT/AkavsTan.png' },
    second: { name: 'Bakugo vs All For One', sub: 'My Hero Academia', img: '/image/COMBAT/BakvsAFO.png' },
    third: { name: 'Jinwoo vs Beru', sub: 'Solo Leveling', img: '/image/COMBAT/JinvsBer.png' },
  },
  {
    id: 'p-protagoniste', titleFr: 'Meilleur protagoniste', titleEn: 'Best Protagonist', bg: '/FOND PROTA.jpg',
    presenter: { name: 'Jason', handle: '@_aljason_', photo: P('jason.webp') },
    winner: { name: 'Izuku Midoriya', sub: 'My Hero Academia', credit: 'Voix japonaise : Daiki Yamashita', img: '/image/PROTA/Midoriya.png' },
    second: { name: 'Sung Jinwoo', sub: 'Solo Leveling', img: '/image/PROTA/Jinwoo.png' },
    third: { name: 'Maomao', sub: 'Les Carnets de l’apothicaire', img: '/image/PROTA/Mao.png' },
  },
  {
    id: 'p-action', titleFr: 'Meilleur animé d’action', titleEn: 'Best Action Anime', bg: '/FOND_ACTION.png',
    presenter: { name: 'Senior Sendo', handle: '@senior.sendo', photo: P('sendo.webp') },
    winner: { name: 'My Hero Academia', sub: 'Saison finale', credit: 'Studio Bones · Kōhei Horikoshi', img: '/image/ACTION/MHA.png' },
    second: { name: 'Fire Force', sub: 'Saison 3', img: '/image/ACTION/FIRE.png' },
    third: { name: 'Solo Leveling', sub: 'Saison 2', img: '/image/ACTION/SOLO.png' },
  },
  {
    id: 'p-drama', titleFr: 'Meilleur drama', titleEn: 'Best Drama', bg: '/FOND_DRAME.png',
    presenter: { name: 'Afro Otaku', handle: '@audeanselm', photo: P('aude.webp') },
    winner: { name: 'Le Péché originel de Takopi', credit: 'Enishiya · Taizan 5', img: '/image/DRAME/Takopi.png' },
    second: { name: 'Les Carnets de l’apothicaire', sub: 'Saison 2', img: '/image/DRAME/Carnet.png' },
    third: { name: 'To Your Eternity', sub: 'Saison 3', img: '/image/DRAME/Eternity.png' },
  },
  {
    id: 'p-chara', titleFr: 'Meilleur chara-design', titleEn: 'Best Character Design', bg: '/FOND_CHARADESIGN.png',
    presenter: { name: 'Spyro', handle: '@spyrosuke', photo: P('spyro.webp') },
    winner: { name: 'Gachiakuta', credit: 'Studio Bones · Kei Urana', img: '/image/CHARA-DESIGN/Gachiakuta.png' },
    second: { name: 'To Be Hero X', img: '/image/CHARA-DESIGN/Hero.png' },
    third: { name: 'Solo Leveling', sub: 'Saison 2', img: '/image/CHARA-DESIGN/SOLO.png' },
  },
  {
    id: 'p-animation', titleFr: 'Meilleure animation', titleEn: 'Best Animation', bg: '/FOND_ANIMATION.png',
    presenter: { name: 'Tsunade Desty', handle: '@tsunadedesty', photo: P('tsunade.webp') },
    winner: { name: 'My Hero Academia', sub: 'Saison finale', credit: 'Studio Bones · Kōhei Horikoshi', img: '/image/ANIMATION/MHA.png' },
    second: { name: 'Solo Leveling', sub: 'Saison 2', img: '/image/ANIMATION/SOLO.png' },
    third: { name: 'Lord of the Mysteries', img: '/image/ANIMATION/Lord.png' },
  },
  {
    id: 'p-nouveaute', titleFr: 'Meilleure nouveauté', titleEn: 'Best New Series', bg: '/FOND_NOUVEAUTE.png',
    presenter: { name: 'Le Zumaki', handle: '@espezumaki1x', photo: P('zumaki.webp') },
    winner: { name: 'Gachiakuta', credit: 'Studio Bones · Kei Urana', img: '/image/NOUVEAUTE/Gachiakuta.png' },
    second: { name: 'To Be Hero X', img: '/image/NOUVEAUTE/Hero.png' },
    third: { name: 'Le Péché originel de Takopi', img: '/image/NOUVEAUTE/Takopi.png' },
  },
  {
    id: 'p-suite', titleFr: 'Meilleure suite', titleEn: 'Best Sequel', bg: '/FOND_SUITE.png',
    presenter: { name: 'Jeremiah', handle: '@jeremiah_san_', photo: P('jeremiah.webp') },
    winner: { name: 'My Hero Academia', sub: 'Saison finale', credit: 'Studio Bones · Kōhei Horikoshi', img: '/image/SUITE/MHA.png' },
    second: { name: 'Dr. Stone', sub: 'Science Future', img: '/image/SUITE/Stone.png' },
    third: { name: 'Solo Leveling', sub: 'Saison 2', img: '/image/SUITE/SOLO.png' },
  },
  {
    id: 'p-attachant', titleFr: 'Personnage le plus attachant', titleEn: 'Most Lovable Character', bg: '/FOND_ATTACHANT.png',
    presenter: { name: 'Elyza', handle: '@cmoielyza', photo: P('elyza.webp') },
    winner: { name: 'Anya Forger', sub: 'Spy × Family', credit: 'Voix japonaise : Atsumi Tanezaki', img: '/image/ATTACHANT/Anya.png' },
    second: { name: 'Suika', sub: 'Dr. Stone', img: '/image/ATTACHANT/Suika.png' },
    third: { name: 'Kaoruko', sub: 'Bloom', img: '/image/ATTACHANT/Kaoruko.png' },
  },
  {
    id: 'p-feminin', titleFr: 'Meilleur personnage féminin', titleEn: 'Best Female Character', bg: '/FOND_FEMININ.png',
    presenter: { name: 'Yvendis', handle: '@yvendis', photo: P('yvendis.webp') },
    winner: { name: 'Maomao', sub: 'Les Carnets de l’apothicaire', credit: 'Voix japonaise : Aoi Yūki', img: '/image/FEMININ/Maomao.png' },
    second: { name: 'Semiu', sub: 'Gachiakuta', img: '/image/FEMININ/Semiu.png' },
    third: { name: 'Reze', sub: 'Chainsaw Man', img: '/image/FEMININ/Reze.png' },
  },
  {
    id: 'p-secondaire', titleFr: 'Meilleur personnage secondaire', titleEn: 'Best Supporting Character', bg: '/FOND_SECONDAIRE.png',
    presenter: { name: 'Mikassa237', handle: '@mikassa237', photo: P('mikassa.webp') },
    winner: { name: 'Katsuki Bakugo', sub: 'My Hero Academia', credit: 'Voix japonaise : Nobuhiko Okamoto', img: '/image/SECONDAIRE/Bak.png' },
    second: { name: 'Arthur Boyle', sub: 'Fire Force', img: '/image/SECONDAIRE/Arthur.png' },
    third: { name: 'Shi Huang Di', sub: 'Valkyrie Apocalypse', img: '/image/SECONDAIRE/Shi.png' },
  },
  {
    id: 'p-sensei', titleFr: 'Meilleur sensei', titleEn: 'Best Sensei', bg: '/FOND SENSEI.jpg',
    presenter: { name: 'Sensei TV', handle: '@sensei.tv0', photo: P('sensei.webp') },
    winner: { name: 'Senku Ishigami', sub: 'Dr. Stone', credit: 'Voix japonaise : Yūsuke Kobayashi', img: '/image/SENSEI/Senku.png' },
    second: { name: 'Enjin', sub: 'Gachiakuta', img: '/image/SENSEI/Enjin.png' },
    third: { name: 'Seiko Ayase', sub: 'Dandadan', img: '/image/SENSEI/Seiko.png' },
  },
  {
    id: 'p-masculin', titleFr: 'Meilleur personnage masculin', titleEn: 'Best Male Character', bg: '/FOND _MASCULIN.png',
    presenter: { name: 'Mr. Hunter', handle: '@mr.hunter2g', photo: P('hunter.webp') },
    winner: { name: 'Akaza', sub: 'Demon Slayer', credit: 'Voix japonaise : Akira Ishida', img: '/image/MASCULIN/Akaza.png' },
    second: { name: 'Sung Jinwoo', sub: 'Solo Leveling', img: '/image/MASCULIN/Jinwoo.png' },
    third: { name: 'X', sub: 'To Be Hero X', img: '/image/MASCULIN/X.png' },
  },
  {
    id: 'p-film', titleFr: 'Meilleur film d’animation', titleEn: 'Best Animated Film', bg: '/FOND FILM.png',
    presenter: { name: 'Braizanime', handle: '@braizanime', photo: P('braiz.webp') },
    winner: { name: 'Demon Slayer', sub: 'La Forteresse Infinie', credit: 'Ufotable · Koyoharu Gotouge', img: '/image/FILM/Demon.png' },
    second: { name: 'Chainsaw Man', sub: 'Le film : l’arc de Reze', img: '/image/FILM/Reze.png' },
    third: { name: 'K-Pop Demon Hunters', img: '/image/FILM/Kpop.png' },
  },
  {
    id: 'p-chanson', titleFr: 'Meilleure chanson d’animé', titleEn: 'Best Anime Song', bg: '/FOND_CHANSON.png',
    presenter: { name: 'Tomi-tan', handle: '@une_protagoniste', photo: P('tomitan.webp') },
    winner: { name: 'IRIS OUT', sub: 'Chainsaw Man : l’arc de Reze', credit: 'Kenshi Yonezu', img: '/image/CHANSON/IRIS.png' },
    second: { name: 'New Type of Hero', sub: 'Griff Clawson · To Be Hero X', img: '/image/CHANSON/New.png' },
    third: { name: 'Hunting Soul', sub: 'HAYASii · Dandadan S2', img: '/image/CHANSON/Hunting.png' },
  },
  {
    id: 'p-ending', titleFr: 'Meilleur ending', titleEn: 'Best Ending', bg: '/FOND_ENDING.png',
    presenter: { name: 'Rico', handle: '@ricokouame' },
    winner: { name: 'I', sub: 'My Hero Academia · Saison finale', credit: 'BUMP OF CHICKEN', img: '/image/ENDING/I.png' },
    second: { name: 'The 1', sub: 'Muque · One Piece', img: '/image/ENDING/Muque.png' },
    third: { name: 'Urusairen', sub: 'Umeda Cypher · Fire Force S3', img: '/image/ENDING/Urusairen.png' },
  },
  {
    id: 'p-opening', titleFr: 'Meilleur opening', titleEn: 'Best Opening', bg: '/FOND_OPENING.png',
    presenter: { name: 'Le Grand G', handle: '@gmp_legrandg', photo: P('grandg.webp') },
    winner: { name: 'Mirage', sub: 'Call of the Night · Saison 2', credit: 'Creepy Nuts', img: '/image/OPENING/Call.png' },
    second: { name: 'Kakumei Douchuu', sub: 'Aina The End · Dandadan S2', img: '/image/OPENING/Dandadan.png' },
    third: { name: 'Inertia', sub: 'Hiroyuki Sawano : Rei · To Be Hero X', img: '/image/OPENING/Hero.png' },
  },
];

/** Le grand prix, présenté à part (pic de la page). */
export const ANIME_DE_L_ANNEE: PalmaresCategory = {
  id: 'p-annee', titleFr: 'Animé de l’année', titleEn: 'Anime of the Year', bg: '/FOND_ANIME.png',
  presenter: { name: 'Rico', handle: '@ricokouame' },
  winner: { name: 'My Hero Academia', sub: 'Saison finale', credit: 'Studio Bones · Kōhei Horikoshi', img: '/image/ANNEE/MHA.png' },
};
