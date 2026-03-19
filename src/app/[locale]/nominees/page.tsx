import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import NomineesClient from '@/components/nominees/NomineesClient';
import { getActiveEvent, getCategories, getNominees } from '@/lib/firestore';
import type { Category, Nominee } from '@/lib/types';

// ─── Placeholder 27 catégories ───────────────────────────────────────────────
const PLACEHOLDER_CATEGORIES: Category[] = [
  { id: 'p-drama',       eventId: 'demo', title: 'Meilleur Drama',                  titleFr: 'Meilleur Drama',                  titleEn: 'Best Drama',                    description: '', descriptionFr: 'Le drama le plus marquant',                      descriptionEn: 'The most impactful drama',                    order: 1,  active: true },
  { id: 'p-romance',     eventId: 'demo', title: 'Meilleure Romance',               titleFr: 'Meilleure Romance',               titleEn: 'Best Romance',                  description: '', descriptionFr: 'La plus belle histoire d\'amour',               descriptionEn: 'The most beautiful love story',               order: 2,  active: true },
  { id: 'p-decors',      eventId: 'demo', title: 'Meilleurs Décors',                titleFr: 'Meilleurs Décors',                titleEn: 'Best Settings',                 description: '', descriptionFr: 'Les plus beaux univers visuels',               descriptionEn: 'The most stunning visual worlds',             order: 3,  active: true },
  { id: 'p-seinen',      eventId: 'demo', title: 'Meilleur Seinen',                 titleFr: 'Meilleur Seinen',                 titleEn: 'Best Seinen',                   description: '', descriptionFr: 'Le meilleur seinen de l\'année',               descriptionEn: 'The best seinen of the year',                 order: 4,  active: true },
  { id: 'p-action',      eventId: 'demo', title: 'Meilleur Animé d\'Action',        titleFr: 'Meilleur Animé d\'Action',        titleEn: 'Best Action Anime',             description: '', descriptionFr: 'L\'action la plus explosive',                  descriptionEn: 'The most explosive action',                   order: 5,  active: true },
  { id: 'p-animation',   eventId: 'demo', title: 'Meilleure Animation',             titleFr: 'Meilleure Animation',             titleEn: 'Best Animation',                description: '', descriptionFr: 'La qualité visuelle la plus époustouflante',   descriptionEn: 'The most breathtaking visual quality',        order: 6,  active: true },
  { id: 'p-masculin',    eventId: 'demo', title: 'Meilleur Personnage Masculin',    titleFr: 'Meilleur Personnage Masculin',    titleEn: 'Best Male Character',           description: '', descriptionFr: 'Le personnage masculin le plus marquant',      descriptionEn: 'The most iconic male character',              order: 7,  active: true },
  { id: 'p-feminin',     eventId: 'demo', title: 'Meilleur Personnage Féminin',     titleFr: 'Meilleur Personnage Féminin',     titleEn: 'Best Female Character',         description: '', descriptionFr: 'Le personnage féminin le plus marquant',       descriptionEn: 'The most iconic female character',            order: 8,  active: true },
  { id: 'p-deception',   eventId: 'demo', title: 'Déception de l\'Année',           titleFr: 'Déception de l\'Année',           titleEn: 'Disappointment of the Year',    description: '', descriptionFr: 'L\'animé qui a le plus déçu',                  descriptionEn: 'The most disappointing anime',                order: 9,  active: true },
  { id: 'p-combat',      eventId: 'demo', title: 'Meilleur Combat',                 titleFr: 'Meilleur Combat',                 titleEn: 'Best Fight',                    description: '', descriptionFr: 'Le combat le plus épique de l\'année',         descriptionEn: 'The most epic fight of the year',             order: 10, active: true },
  { id: 'p-comedie',     eventId: 'demo', title: 'Meilleure Comédie',               titleFr: 'Meilleure Comédie',               titleEn: 'Best Comedy',                   description: '', descriptionFr: 'L\'animé qui a le plus fait rire',             descriptionEn: 'The anime that made us laugh the most',       order: 11, active: true },
  { id: 'p-nouveaute',   eventId: 'demo', title: 'Meilleure Nouveauté',             titleFr: 'Meilleure Nouveauté',             titleEn: 'Best New Series',               description: '', descriptionFr: 'La nouvelle série la plus prometteuse',        descriptionEn: 'The most promising new series',               order: 12, active: true },
  { id: 'p-sensei',      eventId: 'demo', title: 'Meilleur Sensei',                 titleFr: 'Meilleur Sensei',                 titleEn: 'Best Sensei',                   description: '', descriptionFr: 'Le maître ou professeur le plus inspirant',    descriptionEn: 'The most inspiring teacher',                  order: 13, active: true },
  { id: 'p-isekai',      eventId: 'demo', title: 'Meilleur Isekai',                 titleFr: 'Meilleur Isekai',                 titleEn: 'Best Isekai',                   description: '', descriptionFr: 'Le meilleur voyage vers un autre monde',       descriptionEn: 'The best journey to another world',           order: 14, active: true },
  { id: 'p-chara',       eventId: 'demo', title: 'Meilleur Chara-Design',           titleFr: 'Meilleur Chara-Design',           titleEn: 'Best Character Design',         description: '', descriptionFr: 'Le design de personnage le plus réussi',       descriptionEn: 'The most successful character design',        order: 15, active: true },
  { id: 'p-attachant',   eventId: 'demo', title: 'Personnage le Plus Attachant',    titleFr: 'Personnage le Plus Attachant',    titleEn: 'Most Lovable Character',        description: '', descriptionFr: 'Le personnage qu\'on a le plus adoré',         descriptionEn: 'The character we loved the most',             order: 16, active: true },
  { id: 'p-film',        eventId: 'demo', title: 'Meilleur Film d\'Animation',      titleFr: 'Meilleur Film d\'Animation',      titleEn: 'Best Animated Film',            description: '', descriptionFr: 'Le meilleur film anime de l\'année',           descriptionEn: 'The best animated film of the year',          order: 17, active: true },
  { id: 'p-opening',     eventId: 'demo', title: 'Meilleur Opening',                titleFr: 'Meilleur Opening',                titleEn: 'Best Opening',                  description: '', descriptionFr: 'L\'opening le plus mémorable',                 descriptionEn: 'The most memorable opening',                  order: 18, active: true },
  { id: 'p-ending',      eventId: 'demo', title: 'Meilleur Ending',                 titleFr: 'Meilleur Ending',                 titleEn: 'Best Ending',                   description: '', descriptionFr: 'L\'ending le plus marquant',                   descriptionEn: 'The most impactful ending',                   order: 19, active: true },
  { id: 'p-chanson',     eventId: 'demo', title: 'Meilleure Chanson d\'Animé',      titleFr: 'Meilleure Chanson d\'Animé',      titleEn: 'Best Anime Song',               description: '', descriptionFr: 'La chanson qu\'on a le plus écoutée',          descriptionEn: 'The song we listened to the most',            order: 20, active: true },
  { id: 'p-protagoniste',eventId: 'demo', title: 'Meilleur Protagoniste',           titleFr: 'Meilleur Protagoniste',           titleEn: 'Best Protagonist',              description: '', descriptionFr: 'Le héros le plus marquant',                    descriptionEn: 'The most memorable hero',                     order: 22, active: true },
  { id: 'p-secondaire',  eventId: 'demo', title: 'Meilleur Personnage Secondaire',  titleFr: 'Meilleur Personnage Secondaire',  titleEn: 'Best Supporting Character',     description: '', descriptionFr: 'Le perso secondaire le plus mémorable',        descriptionEn: 'The most memorable supporting character',     order: 23, active: true },
  { id: 'p-suite',       eventId: 'demo', title: 'Meilleure Suite',                 titleFr: 'Meilleure Suite',                 titleEn: 'Best Sequel',                   description: '', descriptionFr: 'La suite qui a le mieux honoré l\'original',   descriptionEn: 'The sequel that best honored the original',   order: 24, active: true },
  { id: 'p-sol',         eventId: 'demo', title: 'Meilleur Slice of Life',          titleFr: 'Meilleur Slice of Life',          titleEn: 'Best Slice of Life',            description: '', descriptionFr: 'Le quotidien le plus touchant',                descriptionEn: 'The most touching everyday life',             order: 25, active: true },
  { id: 'p-annee',       eventId: 'demo', title: 'Animé de l\'Année',              titleFr: 'Animé de l\'Année',              titleEn: 'Anime of the Year',             description: '', descriptionFr: 'Le grand prix — meilleur animé 2025',          descriptionEn: 'The grand prize — best anime 2025',           order: 26, active: true },
  { id: 'p-antagoniste', eventId: 'demo', title: 'Meilleur Antagoniste',            titleFr: 'Meilleur Antagoniste',            titleEn: 'Best Antagonist',               description: '', descriptionFr: 'Le méchant qu\'on a adoré détester',           descriptionEn: 'The villain we loved to hate',                order: 27, active: true },
];

const CATEGORY_FONDS: Record<string, string> = {
  'p-romance':     '/FOND_ROMANCE.png',
  'p-decors':      '/FOND_DECOR.png',
  'p-chara':       '/FOND_CHARADESIGN.png',
  'p-combat':      '/FOND_COMBAT.png',
  'p-antagoniste': '/FOND_ANTAGONISTE.png',
  'p-sol':         '/FOND_SLICE.png',
  'p-nouveaute':   '/FOND_NOUVEAUTE.png',
  'p-attachant':   '/FOND_ATTACHANT.png',
  'p-feminin':     '/FOND_FEMININ.png',
  'p-masculin':    '/FOND _MASCULIN.png',
  'p-film':        '/FOND FILM.png',
  'p-isekai':      '/FOND ISEKAI.jpg',
  'p-protagoniste':'/FOND PROTA.jpg',
  'p-sensei':      '/FOND SENSEI.jpg',
};

function n(id: string, catId: string, name: string, anime: string, descFr: string, color = '0f0d09', textColor = 'c9a227', imgUrl?: string, audioUrl?: string): Nominee {
  return {
    id, categoryId: catId, name, anime,
    imageUrl: imgUrl ?? `https://placehold.co/300x400/${color}/${textColor}?text=${encodeURIComponent(name)}`,
    audioUrl,
    description: descFr, descriptionFr: descFr, descriptionEn: descFr, active: true,
  };
}

const PLACEHOLDER_NOMINEES: Record<string, Nominee[]> = {
  'p-drama': [
    n('dra1','p-drama','The Apothecary Diaries S2','','','0a0a14','c9a227','/image/DRAME/Carnet.png'),
    n('dra2','p-drama','Bloom','','','0a1414','80e0c0','/image/DRAME/Bloom.png'),
    n('dra3','p-drama','To Your Eternity S3','','','0a0a1a','a0c0ff','/image/DRAME/Eternity.png'),
    n('dra5','p-drama','Link Click S3','','','0a0a20','6080ff','/image/DRAME/Link.png'),
    n('dra6','p-drama','Takopi\'s Original Sin','','','0a0a0a','ff80b4','/image/DRAME/Takopi.png'),
    n('dra7','p-drama','Rascal does not dream of Santa Claus','','','0a0a1a','d0b0ff','/image/DRAME/Rascal.png'),
    n('dra8','p-drama','My Happy Marriage S2','','','1a0a14','ff80b4','/image/DRAME/Happy.png'),
  ],
  'p-romance': [
    n('rom1','p-romance','Blue Box','','','0a0a1a','a0c0ff','/image/ROMANCE/Box.png'),
    n('rom2','p-romance','My Dress-Up Darling S2','','','1a0a14','ff80b4','/image/ROMANCE/Dress.png'),
    n('rom3','p-romance','Bloom','','','0a1008','80e880','/image/ROMANCE/Bloom.png'),
    n('rom4','p-romance','Kowloon Generic Romance','','','0a0a20','8080ff','/image/ROMANCE/Kowloon.png'),
    n('rom7','p-romance','My Happy Marriage S2','','','0a0a14','ffd0e0','/image/ROMANCE/Happy.png'),
    n('rom9','p-romance','Insomniacs After School','','','0a0a20','6080ff','/image/ROMANCE/Insomniac.png'),
    n('rom11','p-romance','Mikadono Sanshimai wa Angai, Choroi','','','0a1010','80d0d0','/image/ROMANCE/Mikadono.png'),
  ],
  'p-decors': [
    n('dc1','p-decors','— À venir —','','','0d0d0d','555555'),
  ],
  'p-seinen': [
    n('s1','p-seinen','Ameku Takao no Suiri Karte','','','0a0a14','c9a227','/image/SEINEN/Ameku.png'),
    n('s2','p-seinen','Les Carnets de l\'Apothicaire S2','','','0a0a14','c9a227','/image/SEINEN/Carnet.png'),
    n('s5','p-seinen','The Summer Hikaru Died','','','0a0a1a','80c0ff','/image/SEINEN/Summer.png'),
    n('s6','p-seinen','Kowloon Generic Romance','','','0a0a20','8080ff','/image/SEINEN/Kowloon.png'),
    n('s7','p-seinen','Orb: On the Movements of the Earth','','','100a00','c9a227','/image/DRAME/Orb.png'),
  ],
  'p-action': [
    n('act1','p-action','Solo Leveling S2','','','1a0800','ffd250','/image/ACTION/SOLO.png'),
    n('act6','p-action','Fire Force S3','','','200800','ff6020','/image/ACTION/FIRE.png'),
    n('act7','p-action','To Be Hero X','','','0a0a20','60a0ff','/image/ACTION/Hero.png'),
    n('act8','p-action','My Hero Academia (Final Season)','','','1a0500','ff4020','/image/ACTION/MHA.png'),
    n('act10','p-action','One Piece (Egghead Arc)','','','1a0800','ff7030','/image/ACTION/PIECE.png'),
    n('act11','p-action','Devil May Cry','','','100010','c000ff','/image/ACTION/Devil.png'),
    n('act15','p-action','Gachiakuta','','','0f0a00','c9a227','/image/ACTION/Gachiakuta.png'),
    n('act16','p-action','Blue Exorcist: The Blue Night Saga','','','0a0a20','6060ff','/image/ACTION/BLUE.png'),
    n('act17','p-action','Yaiba','','','1a0800','ff6020','/image/ACTION/YAIBA.png'),
    n('act18','p-action','Wind Breaker S2','','','0a0a14','80c0ff','/image/ACTION/WIND.png'),
    n('act19','p-action','Kaiju No. 8 S2','','','0a1414','60d0d0','/image/ACTION/KAIJU.png'),
  ],
  'p-animation': [
    n('an1','p-animation','Demon Slayer: The Movie — Infinity Castle','','','1a0800','ff8060','/image/ANIMATION/Demon.png'),
    n('an3','p-animation','Dandadan S2','','','0a0a20','a060ff','/image/ANIMATION/DANDADAN.png'),
    n('an4','p-animation','Delicious in Dungeon','','','1a0800','ff8030','/image/ANIMATION/Dungeon.png'),
    n('an5','p-animation','Solo Leveling S2','','','1a0800','ffd250','/image/ANIMATION/SOLO.png'),
    n('an6','p-animation','To Be Hero X','','','0a0a20','60a0ff','/image/ANIMATION/Hero.png'),
    n('an7','p-animation','Gachiakuta','','','1a0800','ff8030','/image/ANIMATION/Gachiakuta.png'),
    n('an9','p-animation','Lord of the Mysteries','','','100814','8040c0','/image/ANIMATION/Lord.png'),
    n('an10','p-animation','My Hero Academia — Final Season','','','1a0500','ff4020','/image/ANIMATION/MHA.png'),
  ],
  'p-masculin': [
    n('mas1','p-masculin','Bakugo','My Hero Academia','','1a0500','ff4020','/image/MASCULIN/Bakugo.png'),
    n('mas2','p-masculin','X','To Be Hero X','','0a0a20','60a0ff','/image/MASCULIN/X.png'),
    n('mas3','p-masculin','Akaza','Demon Slayer','','200010','ff4060','/image/MASCULIN/Akaza.png'),
    n('mas4','p-masculin','Denji','Chainsaw Man','','100010','c000ff','/image/MASCULIN/Denji.png'),
    n('mas9','p-masculin','Senku','Dr. Stone','','0a1008','80e880','/image/MASCULIN/Senku.png'),
    n('mas11','p-masculin','Xeno','Dr. Stone','','0a1008','ffd250','/image/MASCULIN/Xeno.png'),
    n('mas12','p-masculin','Lin Ling','To Be Hero X','','0a0a1a','a0c0ff','/image/MASCULIN/Lin.png'),
    n('mas15','p-masculin','Shigaraki','My Hero Academia','','100010','a000ff','/image/MASCULIN/Shigaraki.png'),
    n('mas16','p-masculin','Sung Jinwoo','Solo Leveling','','1a0800','ffd250','/image/MASCULIN/Jinwoo.png'),
    n('mas17','p-masculin','Sakura','','','0a0a20','a060ff','/image/MASCULIN/Sakura.png'),
    n('mas18','p-masculin','Badeni','Gachiakuta','','1a0800','ff8030','/image/MASCULIN/Badeni.png'),
    n('mas19','p-masculin','Giyu','Demon Slayer: The Movie — Infinity Castle','','0a0a1a','6080ff','/image/MASCULIN/Giyu.png'),
    n('mas20','p-masculin','Tanjiro','Demon Slayer: The Movie — Infinity Castle','','0a0a14','40a0ff','/image/MASCULIN/Tanjiro.png'),
  ],
  'p-feminin': [
    n('fem2','p-feminin','Suika','Dr. Stone','','0a1008','80e880','/image/FEMININ/Suika.png'),
    n('fem3','p-feminin','Marin Kitagawa','My Dress-Up Darling','','1a0a14','ff80b4','/image/FEMININ/Marin.png'),
    n('fem4','p-feminin','Maomao','The Apothecary Diaries','','0a0a14','c9a227','/image/FEMININ/Maomao.png'),
    n('fem10','p-feminin','Riyo','Gachiakuta','','0a0a20','6080ff','/image/FEMININ/Riyo.png'),
    n('fem13','p-feminin','Reze','Chainsaw Man','','100010','c000ff','/image/FEMININ/Reze.png'),
    n('fem14','p-feminin','Toga Himiko','My Hero Academia','','1a0a14','ff80b4','/image/FEMININ/Toga.png'),
    n('fem16','p-feminin','Semiu','Gachiakuta','','0a0a20','6080ff','/image/FEMININ/Semiu.png'),
  ],
  'p-combat': [
    n('cb1','p-combat','Luffy vs Kizaru','One Piece','','1a0800','ff7030'),
    n('cb2','p-combat','Jinwoo vs Beru','Solo Leveling','','1a0800','ffd250'),
    n('cb3','p-combat','Bakugo vs All For One','My Hero Academia Final Season','','1a0500','ff4020'),
    n('cb4','p-combat','Wang vs Mushan','Super Cube','','0a0a20','60a0ff'),
    n('cb5','p-combat','Zenitsu vs Kaigaku','Demon Slayer: Infinity Castle','','1a0800','ff8060'),
    n('cb6','p-combat','Queen vs Bowa','To Be Hero X','','0a0a20','60a0ff'),
    n('cb7','p-combat','Reze vs Denji','Chainsaw Man','','100010','c000ff'),
    n('cb8','p-combat','Shi Huang Di vs Hades','Valkyrie Apocalypse','','100814','8040c0'),
  ],
  'p-deception': [
    n('dec1','p-deception','The Beginning After the End','','','0d0d0d','666666','/image/DECEPTION/TBATE.png'),
    n('dec2','p-deception','One-Punch Man S3','','','0d0d0d','888888','/image/DECEPTION/One.png'),
    n('dec3','p-deception','Sakamoto Days','','','0d0d0d','777777','/image/DECEPTION/Sakamoto.png'),
    n('dec4','p-deception','Fairy Tail: 100 Years Quest','','','0d0d0d','555555','/image/DECEPTION/Fairy.png'),
    n('dec5','p-deception','Blue Lock S2','','','0d0d0d','6080ff','/image/DECEPTION/Blue Lock S2.png'),
    n('dec6','p-deception','The Rising of the Shield Hero S4','','','0d0d0d','c9a227','/image/DECEPTION/Shield.png'),
  ],
  'p-comedie': [
    n('com1','p-comedie','The 100 Girlfriends Who Really Love You S2','','','1a0a14','ff80b4','/image/COMEDIE/100.png'),
    n('com3','p-comedie','Kamen Rider','','','0a0a14','60a0ff','/image/COMEDIE/Kamen.png'),
    n('com4','p-comedie','Spy × Family S3','','','0a1414','60d0c0','/image/COMEDIE/Spy.png'),
    n('com5','p-comedie','May I Ask for One Final Thing?','','','0a0a1a','d0b0ff','/image/COMEDIE/May.png'),
    n('com6','p-comedie','Kono Subarashii Sekai ni Shukufuku wo! 3: BONUS STAGE','','','0a0a20','ffd250','/image/COMEDIE/Bonus.png'),
    n('com7','p-comedie','New Panty & Stocking with GARTERBELT S2','','','1a0a14','ff80b4','/image/COMEDIE/Pant.png'),
    n('com8','p-comedie','From Bureaucrat to Villainess','','','0a0a14','c9a227','/image/COMEDIE/Bureau.png'),
    n('com9','p-comedie','Witch Watch','','','1a0a14','ff80b4'),
    n('com10','p-comedie','Ranma 1/2 Remake','','','1a0500','ff4060'),
  ],
  'p-nouveaute': [
    n('nv1','p-nouveaute','To Be Hero X','','','0a0a20','60a0ff','/image/NOUVEAUTE/Hero.png'),
    n('nv3','p-nouveaute','Takopi\'s Original Sin','','','0a0a0a','ff80b4','/image/NOUVEAUTE/Takopi.png'),
    n('nv6','p-nouveaute','My Gift LVL 9999: Unlimited Gacha','','','0a0a14','c9a227','/image/NOUVEAUTE/LVL.png'),
    n('nv8','p-nouveaute','SANDA','','','0a0a14','c9a227','/image/NOUVEAUTE/Sanda.png'),
    n('nv10','p-nouveaute','Orb: On the Movements of the Earth','','','100a00','c9a227','/image/NOUVEAUTE/Orb.png'),
    n('nv11','p-nouveaute','Gachiakuta','','','1a0800','ff8030','/image/NOUVEAUTE/Gachiakuta.png'),
    n('nv12','p-nouveaute','The Summer Hikaru Died','','','0a0a1a','80c0ff','/image/NOUVEAUTE/Summer.png'),
  ],
  'p-sensei': [
    n('se1','p-sensei','Enjin','Gachiakuta','','0a0a20','60a0ff','/image/SENSEI/Enjin.png'),
    n('se2','p-sensei','Zanka','Gachiakuta','','0a0a14','6080ff','/image/SENSEI/Zanka.png'),
    n('se3','p-sensei','Tsukasa Akeuraji','Medalist','','0a0a1a','a0c0ff','/image/SENSEI/Tsukasa.png'),
    n('se5','p-sensei','Seiko Ayase','Dandadan','','0a0a20','a060ff','/image/SENSEI/Seiko.png'),
    n('se6','p-sensei','Senku Ishigami','Dr. Stone','','0a1008','80e880','/image/SENSEI/Senku.png'),
    n('se9','p-sensei','Dr. Xeno','Dr. Stone','','0a1008','ffd250','/image/SENSEI/Xeno.png'),
  ],
  'p-isekai': [
    n('isk1','p-isekai','Zenshu','','','0a0a1a','a0c0ff','/image/ISEKAI/Zenshu.png'),
    n('isk2','p-isekai','Lord of the Mysteries','','','100814','8040c0','/image/ISEKAI/Lord.png'),
    n('isk3','p-isekai','The Water Magician','','','0a0a20','6080ff','/image/ISEKAI/Water.png'),
    n('isk4','p-isekai','Who Made Me a Princess','','','1a0a14','ff80b4','/image/ISEKAI/Princess.png'),
    n('isk5','p-isekai','Re:Zero S3','','','0a0814','8040c0','/image/ISEKAI/Rezero.png'),
    n('isk6','p-isekai','The Rising of the Shield Hero S4','','','100a00','c9a227','/image/ISEKAI/Shield.png'),
    n('isk7','p-isekai','I Was Reincarnated as the 7th Prince S2','','','0a0a20','a060ff','/image/ISEKAI/Prince.png'),
    n('isk8','p-isekai','Yasei no Last Boss ga Arawareta!','','','100814','c000ff','/image/ISEKAI/Yasei.png'),
  ],
  'p-chara': [
    n('cha1','p-chara','Gachiakuta','','','1a0800','ff8030','/image/CHARA-DESIGN/Gachiakuta.png'),
    n('cha2','p-chara','Takopi','','','0a0a0a','ff80b4','/image/CHARA-DESIGN/Takopi.png'),
    n('cha3','p-chara','To Be Hero X','','','0a0a20','60a0ff','/image/CHARA-DESIGN/Hero.png'),
    n('cha5','p-chara','Dr. Stone SCIENCE FUTURE','','','0a1008','80e880','/image/CHARA-DESIGN/Stone.png'),
    n('cha7','p-chara','One Piece Egghead Arc','','','1a0800','ff7030','/image/CHARA-DESIGN/PIECE.png'),
    n('cha11','p-chara','Who Made Me a Princess','','','1a0a14','ff80b4','/image/CHARA-DESIGN/Princess.png'),
    n('cha12','p-chara','Solo Leveling S2','','','1a0800','ffd250','/image/CHARA-DESIGN/SOLO.png'),
    n('cha13','p-chara','Dandadan S2','','','0a0a20','a060ff','/image/CHARA-DESIGN/DANDADAN.png'),
  ],
  'p-attachant': [
    n('at1','p-attachant','Anya Forger','Spy × Family','','0a0a14','ff80b4','/image/ATTACHANT/Anya.png'),
    n('at2','p-attachant','Bonney','One Piece','','1a0a14','ff80b4','/image/ATTACHANT/Bonney.png'),
    n('at3','p-attachant','Suika','Dr. Stone','','0a1008','80e880','/image/ATTACHANT/Suika.png'),
    n('at4','p-attachant','Kaoruko','Bloom','','0a1414','80e0c0','/image/ATTACHANT/Kaoruko.png'),
    n('at5','p-attachant','Amo','Gachiakuta','','1a0800','ff8030','/image/ATTACHANT/Amo.png'),
    n('at6','p-attachant','Inori Yuitsuka','Medalist','','0a0a1a','a0c0ff','/image/ATTACHANT/Inori.png'),
  ],
  'p-film': [
    n('fil1','p-film','Demon Slayer The Movie — Infinity Castle','','','1a0800','ff8060','/image/FILM/Demon.png'),
    n('fil2','p-film','Chainsaw Man The Movie — Reze Arc','','','100010','c000ff','/image/FILM/Reze.png'),
    n('fil3','p-film','Overlord — Holy Kingdom','','','100814','8030a0','/image/FILM/Overlord.png'),
    n('fil4','p-film','Ne Zha 2','','','1a0500','ff4020','/image/FILM/Zha.png'),
    n('fil5','p-film','K-Pop Demon Hunters','','','1a0a14','ff80b4','/image/FILM/Kpop.png'),
    n('fil6','p-film','The Rose of Versailles','','','1a0a14','ff80b4','/image/FILM/Versailles.png'),
    n('fil7','p-film','100 Meters','','','0a0a14','6080ff','/image/FILM/metteer.png'),
    n('fil8','p-film','Scarlet et l\'Éternité','','','1a0a0a','e8a87c'),
    n('fil9','p-film','Mononoke, le film : Chapitre II - Les cendres de la rage','','','1a0800','ff8030'),
  ],
  'p-opening': [
    n('op1','p-opening','"Hugs" — Gachiakuta OP1','Paledusk','','1a0800','ff8030','/image/OPENING/Hugs.png','/music/Opening/Hugs.MP3'),
    n('op2','p-opening','"Inertia" — To Be Hero X OP','Sawano Hiroyuki[nZk]: RE','','0a0a20','60a0ff','/image/OPENING/Hero.png','/music/Opening/Inertia.MP3'),
    n('op3','p-opening','"Kaiju" — Orb: On the Movement of the Earth OP','Sakanaction','','100a00','c9a227','/image/OPENING/Orb.png','/music/Opening/Kaiju.MP3'),
    n('op4','p-opening','"Watch Me" — Witch Watch OP1','YOASOBI','','1a0a14','ff80b4','/image/OPENING/Witch.png','/music/Opening/Witch.MP3'),
    n('op5','p-opening','"Kakumei Douchuu" — Dandadan OP2','Aina the End','','0a0a20','a060ff','/image/OPENING/Dandadan.png','/music/Opening/Aina.MP3'),
    n('op6','p-opening','"Kusushiki" — The Apothecary Diaries S2 OP2','Mrs. GREEN APPLE','','0a0a14','c9a227','/image/OPENING/Apotecary.png','/music/Opening/MsGreen.MP3'),
    n('op7','p-opening','"Mirage" — Call of the Night S2 OP','Creepy Nuts','','0a0a20','8060ff','/image/OPENING/Call.png','/music/Opening/Mirage.MP3'),
    n('op8','p-opening','"Without Any Words" — Bleach TYBW OP3','Six Lounge','','0a0a14','6080ff','/image/OPENING/Bleach.png','/music/Opening/Without.MP3'),
    n('op9','p-opening','"Carmine" — One Piece OP28','Ellegarden','','1a0800','ff7030','/image/OPENING/One.png','/music/Opening/Carmine.MP3'),
    n('op10','p-opening','"Tsuyobi" — Fire Force S3 OP1','QUEEN BEE','','200800','ff6020','/image/OPENING/Fire.png','/music/Opening/Tsuyobi.MP3'),
    n('op11','p-opening','"ReawakenR" — Solo Leveling S2 OP1','LiSA feat. Felix','','1a0800','ffd250','/image/OPENING/Solo.png','/music/Opening/Reweaker.MP3'),
    n('op12','p-opening','"Frontiers" — Shangri-La Frontier S2 OP2','AWICH','','100814','8040c0','/image/OPENING/Frontier.png','/music/Opening/Frontier.MP3'),
  ],
  'p-ending': [
    n('en1','p-ending','"The 1" — One Piece Ending 24','Muque','','1a0800','ff7030','/image/ENDING/Muque.png','/music/ending/Muque.MP3'),
    n('en2','p-ending','"Kawaii Kawaii" — My Dress-Up Darling S2 ED','Piki','','1a0a14','ff80b4','/image/ENDING/Kawai.png','/music/ending/Kawai.MP3'),
    n('en3','p-ending','"Hoko" — Kingdom S6 ED','Tomonari Sora','','100a00','c9a227','/image/ENDING/Houkou.png','/music/ending/Hoko.MP3'),
    n('en4','p-ending','"Dark Dream" — Lord of the Mysteries ED','Curley Gao','','100814','8040c0','/image/ENDING/Dark.png','/music/ending/Dark.MP3'),
    n('en5','p-ending','"Doukashiteru" — Dandadan ED2','Wurts','','0a0a20','a060ff','/image/ENDING/Doukashiteru.png','/music/ending/Wurts.MP3'),
    n('en6','p-ending','"I" — My Hero Academia Final Season ED','BUMP OF CHICKEN','','1a0500','ff4020','/image/ENDING/I.png','/music/ending/I.MP3'),
    n('en7','p-ending','"Urusairen" — Fire Force S3 ED','Umeda Cypher','','200800','ff6020','/image/ENDING/Urusairen.png','/music/ending/UruSiren.MP3'),
    n('en8','p-ending','"Nemure" — Call of the Night S2 ED','Creepy Nuts','','0a0a20','8060ff','/image/ENDING/Nemure.png','/music/ending/Nemure.MP3'),
    n('en9','p-ending','"UN-APEX" — Solo Leveling S2 ED','TK from Ling tosite sigure','','1a0800','ffd250','/image/ENDING/TK.png','/music/ending/TK.MP3'),
  ],
  'p-chanson': [
    n('cs1','p-chanson','"Flaming Thunder God (Zenitsu\'s Theme)" — Diego Mitre','Demon Slayer: Infinity Castle','','1a0800','ff8060','/image/CHANSON/Flaming.png','/music/Chanson/Zenitsu.MP3'),
    n('cs2','p-chanson','"New Type of Hero" — Chatterbox','To Be Hero X','','0a0a20','60a0ff','/image/CHANSON/New.png','/music/Chanson/X.MP3'),
    n('cs3','p-chanson','"Momentum In My Veins" — Taku Iwasaki feat. Lotus Juice','Gachiakuta','','1a0800','ff8030','/image/CHANSON/Momentum.png','/music/Chanson/Momentum.MP3'),
    n('cs4','p-chanson','"Outlaws Get No Entry"','Gachiakuta OST','','1a0800','ff8030','/image/CHANSON/Outlaw.png','/music/Chanson/Outlaw.MP3'),
    n('cs5','p-chanson','"A World Where the Sun Never Rises" — Aimer','Demon Slayer: Infinity Castle','','1a0800','ff8060','/image/CHANSON/World.png','/music/Chanson/Aimer.MP3'),
    n('cs6','p-chanson','"Hunting Soul" — HAYASii','Dandadan S2','','0a0a20','a060ff','/image/CHANSON/Hunting.png','/music/Chanson/Hunting.MP3'),
    n('cs7','p-chanson','"Everything I Lost" — Shinji OST','Bleach TYBW','','0a0a14','6080ff','/image/CHANSON/Shinji.png','/music/Chanson/Shinji.MP3'),
  ],
  'p-protagoniste': [
    n('pr1','p-protagoniste','Denji','Chainsaw Man','','100010','c000ff','/image/PROTA/Denji.png'),
    n('pr2','p-protagoniste','Gojo & Marin','My Dress-Up Darling S2','','0a0a20','6060ff'),
    n('pr4','p-protagoniste','Cheng Xiaoshi & Lu Guang','Link Click S3','','0a0a20','6080ff','/image/PROTA/Cheng.png'),
    n('pr8','p-protagoniste','Senku',' Dr.STONE SCIENCE FUTURE','','0a1008','ffd250','/image/PROTA/Senku.png'),
    n('pr9','p-protagoniste','Jinwoo','Solo Leveling S2','','1a0800','ffd250','/image/PROTA/Jinwoo.png'),
    n('pr10','p-protagoniste','X','To Be Hero X','','0a0a20','60a0ff','/image/PROTA/X.png'),
    n('pr11','p-protagoniste','Maomao','The Apothecary Diaries S2','','0a0a14','c9a227','/image/PROTA/Mao.png'),
    n('pr12','p-protagoniste','Dante','Devil May Cry','','100010','c000ff','/image/PROTA/Dante.png'),
    n('pr14','p-protagoniste','Subaru','Re:Zero S3','','0a0814','8040c0','/image/PROTA/Subaru.png'),
    n('pr16','p-protagoniste','Natsuko Zenju','Zenshu','','0a0a1a','a0c0ff','/image/PROTA/Zenju.png'),
  ],
  'p-secondaire': [
    n('sc1','p-secondaire','Reinhard','Re:Zero S3','','0a0814','8040c0','/image/SECONDAIRE/Reinhard.png'),
    n('sc2','p-secondaire','Shi Huang Di','Valkyrie Apocalypse','','100814','8040c0','/image/SECONDAIRE/ShiHuang.png'),
    n('sc3','p-secondaire','Bakugo','My Hero Academia Final Season','','1a0500','ff4020','/image/SECONDAIRE/Bakugo.png'),
    n('sc4','p-secondaire','Shoto Todoroki','My Hero Academia Final Season','','0a0a1a','a0c0ff','/image/SECONDAIRE/Shoto.png'),
    n('sc5','p-secondaire','Mémé Turbo','Dandadan S2','','0a0a20','a060ff','/image/SECONDAIRE/Meme.png'),
    n('sc6','p-secondaire','Jinshi','Les Carnets de l\'Apothicaire S2','','0a0a14','c9a227','/image/SECONDAIRE/Jinshi.png'),
    n('sc7','p-secondaire','Jiji','Dandadan','','0a0a20','a060ff','/image/SECONDAIRE/Jiji.png'),
    n('sc8','p-secondaire','Enjin','Gachiakuta','','1a0800','ff8030','/image/SECONDAIRE/Enjin.png'),
    n('sc9','p-secondaire','Zanka','Gachiakuta','','0a0a14','6080ff','/image/SECONDAIRE/Zanka.png'),
    n('sc10','p-secondaire','Riyo','Gachiakuta','','0a0a20','6080ff','/image/SECONDAIRE/Riyo.png'),
  ],
  'p-suite': [
    n('su1','p-suite','My Hero Academia — Saison Finale','','','1a0500','ff4020','/image/SUITE/MHA.png'),
    n('su2','p-suite','Solo Leveling S2','','','1a0800','ffd250','/image/SUITE/SOLO.png'),
    n('su3','p-suite','Les Carnets de l\'apothicaire S2','','','0a0a14','c9a227','/image/SUITE/Carnet.png'),
    n('su4','p-suite',' Dr.STONE SCIENCE FUTURE','','','0a1008','80e880','/image/SUITE/Stone.png'),
    n('su5','p-suite','Blue Exorcist: The Blue Night Saga','','','0a0a20','6060ff','/image/SUITE/BLUE.png'),
    n('su6','p-suite','Kaiju No. 8 S2','','','0a1414','60d0d0','/image/SUITE/KAIJU.png'),
    n('su7','p-suite','I Was Reincarnated as the 7th Prince S2','','','0a0814','8040c0','/image/SUITE/Prince.png'),
    n('su8','p-suite','Grand Blue Dreaming S2','','','0a0a20','6080ff','/image/SUITE/GRAND.png'),
  ],
  'p-sol': [
    n('sl1','p-sol','Summer Pockets','','','0a0a1a','80c0ff','/image/SLICE/Pockets.png'),
    n('sl2','p-sol','My Dress-Up Darling S2','','','1a0a14','ff80b4','/image/SLICE/Dress.png'),
    n('sl3','p-sol','Slime Taoshite 300-nen S2','','','0a1008','80e880','/image/SLICE/Slime.png'),
    n('sl4','p-sol','Anne Shirley','','','1a0a14','ff80b4','/image/SLICE/Anne.png'),
    n('sl5','p-sol','Spy × Family S3','','','0a1414','60d0c0','/image/SLICE/Spy.png'),
  ],
  'p-annee': [
    n('ann1','p-annee','Solo Leveling S2','','','1a0800','ffd250','/image/ANNEE/SOLO.png'),
    n('ann2','p-annee','Takopi\'s Original Sin','','','0a0a0a','ff80b4','/image/ANNEE/Takopi.png'),
    n('ann3','p-annee','Dandadan S2','','','0a0a20','a060ff','/image/ANNEE/DANDADAN.png'),
    n('ann4','p-annee','Kaiju No. 8 S2','','','0a1414','60d0d0','/image/ANNEE/KAIJU.png'),
    n('ann5','p-annee','The Apothecary Diaries S2','','','0a0a14','c9a227','/image/ANNEE/Carnet.png'),
    n('ann6','p-annee','My Hero Academia: Final Season','','','1a0500','ff4020','/image/ANNEE/MHA.png'),
    n('ann7','p-annee','One Piece Egghead Arc','','','1a0800','ff7030','/image/ANNEE/PIECE.png'),
    n('ann8','p-annee','Re:Zero S3','','','0a0814','8040c0','/image/ANNEE/Rezero.png'),
    n('ann9','p-annee','Gachiakuta','','','1a0800','ff8030','/image/ANNEE/Gachiakuta.png'),
    n('ann10','p-annee','To Be Hero X','','','0a0a20','60a0ff','/image/ANNEE/Hero.png'),
  ],
  'p-antagoniste': [
    n('ag1','p-antagoniste','Reze','Chainsaw Man: The Movie Reze Arc','','100010','c000ff','/image/ANTAGONISTE/Reze.png'),
    n('ag2','p-antagoniste','Dabi','My Hero Academia: Final Season','','1a0a00','6080ff','/image/ANTAGONISTE/Dabi.png'),
    n('ag3','p-antagoniste','Doma','Demon Slayer','','0a0a1a','a0c0ff','/image/ANTAGONISTE/Doma.png'),
    n('ag4','p-antagoniste','All For One','My Hero Academia: Final Season','','0d0d0d','888888','/image/ANTAGONISTE/All.png'),
    n('ag5','p-antagoniste','Shigaraki','My Hero Academia: Final Season','','100010','a000ff','/image/ANTAGONISTE/Shigaraki.png'),
    n('ag6','p-antagoniste','Akaza','Demon Slayer: The Movie Infinity Castle','','200010','ff4060','/image/ANTAGONISTE/Akaza.png'),
    n('ag7','p-antagoniste','Yhwach','Bleach TYBW','','0a0a14','6080ff','/image/ANTAGONISTE/Yhwach.png'),
    n('ag8','p-antagoniste','Xeno',' Dr.STONE SCIENCE FUTURE','','0a1008','80e880','/image/ANTAGONISTE/Xeno.png'),
    n('ag9','p-antagoniste','Stanley',' Dr.STONE SCIENCE FUTURE','','0a0a14','6080ff','/image/ANTAGONISTE/Stanley.png'),
    n('ag10','p-antagoniste','Jabber','Gachiakuta','','1a0800','ff8030','/image/ANTAGONISTE/Jabber.png'),
    n('ag11','p-antagoniste','Zodyl','Clevatess','','0a0a1a','80c0ff','/image/ANTAGONISTE/Zodyl.png'),
    n('ag12','p-antagoniste','White Rabbit','Devil May Cry','','0a0a20','a060ff','/image/ANTAGONISTE/White.png'),
    n('ag13','p-antagoniste','Sherlock Holmes','Moriarty the Patriot','','0a0a14','c9a227','/image/ANTAGONISTE/Sherlock.png'),
    n('ag14','p-antagoniste','Beru','Solo Leveling S2','','1a0800','ffd250','/image/ANTAGONISTE/Beru.png'),
  ],
};

export default async function NomineesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const { category: categoryId } = await searchParams;
  const t = await getTranslations('nominees');

  let categories: Category[] = [];
  let nomineesByCategory: Record<string, Nominee[]> = {};

  try {
    const event = await getActiveEvent();
    if (event) {
      categories = await getCategories(event.id);
      for (const cat of categories) {
        nomineesByCategory[cat.id] = await getNominees(cat.id);
      }
    }
  } catch {
    // Firebase not configured
  }

  if (categories.length === 0) {
    categories = PLACEHOLDER_CATEGORIES;
    nomineesByCategory = PLACEHOLDER_NOMINEES;
  }

  // Determine active category (from param or first)
  const activeCat = (categoryId ? categories.find((c) => c.id === categoryId) : null) ?? categories[0] ?? null;
  const activeIdx = activeCat ? categories.findIndex((c) => c.id === activeCat.id) : -1;
  const prevCat = activeIdx > 0 ? categories[activeIdx - 1] : null;
  const nextCat = activeIdx < categories.length - 1 ? categories[activeIdx + 1] : null;
  const nominees = activeCat ? (nomineesByCategory[activeCat.id] ?? []) : [];

  return (
    <>
      <Navbar />

      {/* Sub-navbar — fixed below main navbar */}
      <div
        className="fixed left-0 right-0 z-40"
        style={{
          top: '64px',
          background: 'linear-gradient(180deg, rgba(8,6,0,0.98) 0%, rgba(12,9,0,0.96) 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(201,162,39,0.2)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}
      >
        {/* Gold top accent line */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,162,39,0.5) 30%, rgba(201,162,39,0.5) 70%, transparent)' }} />

        <div className="container-mobile flex items-stretch" style={{ height: '56px' }}>
          {/* Prev */}
          {prevCat ? (
            <Link
              href={`/${locale}/nominees?category=${prevCat.id}`}
              className="flex items-center gap-2 flex-1 group"
              style={{ minWidth: 0 }}
            >
              <div
                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all group-hover:scale-110"
                style={{ background: 'rgba(201,162,39,0.12)', border: '1px solid rgba(201,162,39,0.25)' }}
              >
                <ChevronLeft className="w-4 h-4" style={{ color: '#c9a227' }} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(201,162,39,0.55)' }}>
                  {locale === 'fr' ? 'Précédent' : 'Previous'}
                </span>
                <span className="text-xs font-semibold truncate leading-tight" style={{ color: '#c4a882' }}>
                  {locale === 'fr' ? prevCat.titleFr : prevCat.titleEn}
                </span>
              </div>
            </Link>
          ) : <div className="flex-1" />}

          {/* Center — All categories */}
          <div className="flex items-center flex-shrink-0 px-3">
            <Link
              href={`/${locale}/categories`}
              className="flex flex-col items-center gap-0.5 group"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #c9a227, #9e7c1e)', boxShadow: '0 2px 12px rgba(201,162,39,0.3)' }}
              >
                <LayoutGrid className="w-4 h-4 text-black" />
              </div>
              <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: 'rgba(201,162,39,0.7)' }}>
                {locale === 'fr' ? 'Catégories' : 'Categories'}
              </span>
            </Link>
          </div>

          {/* Next */}
          {nextCat ? (
            <Link
              href={`/${locale}/nominees?category=${nextCat.id}`}
              className="flex items-center gap-2 flex-1 justify-end group"
              style={{ minWidth: 0 }}
            >
              <div className="flex flex-col items-end min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(201,162,39,0.55)' }}>
                  {locale === 'fr' ? 'Suivant' : 'Next'}
                </span>
                <span className="text-xs font-semibold truncate leading-tight" style={{ color: '#c4a882' }}>
                  {locale === 'fr' ? nextCat.titleFr : nextCat.titleEn}
                </span>
              </div>
              <div
                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all group-hover:scale-110"
                style={{ background: 'rgba(201,162,39,0.12)', border: '1px solid rgba(201,162,39,0.25)' }}
              >
                <ChevronRight className="w-4 h-4" style={{ color: '#c9a227' }} />
              </div>
            </Link>
          ) : <div className="flex-1" />}
        </div>
      </div>

      <main style={{ background: '#080600', minHeight: '100vh', paddingTop: '121px', paddingBottom: '5rem' }}>
        {/* Projecteur haut */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] pointer-events-none z-0"
          style={{ background: 'radial-gradient(ellipse at top, rgba(201,162,39,0.1) 0%, transparent 65%)' }} />

        <div className="container-mobile relative z-10 pt-8">
          <NomineesClient
            category={activeCat}
            nominees={nominees}
            locale={locale}
            voteHref={`/${locale}/vote`}
            voteNowLabel={t('voteNow')}
            noNomineesLabel={t('noNominees')}
            fondUrl={activeCat ? CATEGORY_FONDS[activeCat.id] : undefined}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
