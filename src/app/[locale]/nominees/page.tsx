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
  { id: 'p-developpement',eventId:'demo', title: 'Meilleur Développement',          titleFr: 'Meilleur Développement',          titleEn: 'Best Character Development',    description: '', descriptionFr: 'La progression de personnage la plus réussie', descriptionEn: 'The best character growth',                   order: 10, active: true },
  { id: 'p-comedie',     eventId: 'demo', title: 'Meilleure Comédie',               titleFr: 'Meilleure Comédie',               titleEn: 'Best Comedy',                   description: '', descriptionFr: 'L\'animé qui a le plus fait rire',             descriptionEn: 'The anime that made us laugh the most',       order: 11, active: true },
  { id: 'p-nouveaute',   eventId: 'demo', title: 'Meilleure Nouveauté',             titleFr: 'Meilleure Nouveauté',             titleEn: 'Best New Series',               description: '', descriptionFr: 'La nouvelle série la plus prometteuse',        descriptionEn: 'The most promising new series',               order: 12, active: true },
  { id: 'p-sensei',      eventId: 'demo', title: 'Meilleur Sensei',                 titleFr: 'Meilleur Sensei',                 titleEn: 'Best Sensei',                   description: '', descriptionFr: 'Le maître ou professeur le plus inspirant',    descriptionEn: 'The most inspiring teacher',                  order: 13, active: true },
  { id: 'p-isekai',      eventId: 'demo', title: 'Meilleur Isekai',                 titleFr: 'Meilleur Isekai',                 titleEn: 'Best Isekai',                   description: '', descriptionFr: 'Le meilleur voyage vers un autre monde',       descriptionEn: 'The best journey to another world',           order: 14, active: true },
  { id: 'p-chara',       eventId: 'demo', title: 'Meilleur Chara-Design',           titleFr: 'Meilleur Chara-Design',           titleEn: 'Best Character Design',         description: '', descriptionFr: 'Le design de personnage le plus réussi',       descriptionEn: 'The most successful character design',        order: 15, active: true },
  { id: 'p-attachant',   eventId: 'demo', title: 'Personnage le Plus Attachant',    titleFr: 'Personnage le Plus Attachant',    titleEn: 'Most Lovable Character',        description: '', descriptionFr: 'Le personnage qu\'on a le plus adoré',         descriptionEn: 'The character we loved the most',             order: 16, active: true },
  { id: 'p-film',        eventId: 'demo', title: 'Meilleur Film d\'Animation',      titleFr: 'Meilleur Film d\'Animation',      titleEn: 'Best Animated Film',            description: '', descriptionFr: 'Le meilleur film anime de l\'année',           descriptionEn: 'The best animated film of the year',          order: 17, active: true },
  { id: 'p-opening',     eventId: 'demo', title: 'Meilleur Opening',                titleFr: 'Meilleur Opening',                titleEn: 'Best Opening',                  description: '', descriptionFr: 'L\'opening le plus mémorable',                 descriptionEn: 'The most memorable opening',                  order: 18, active: true },
  { id: 'p-ending',      eventId: 'demo', title: 'Meilleur Ending',                 titleFr: 'Meilleur Ending',                 titleEn: 'Best Ending',                   description: '', descriptionFr: 'L\'ending le plus marquant',                   descriptionEn: 'The most impactful ending',                   order: 19, active: true },
  { id: 'p-bo',          eventId: 'demo', title: 'Meilleure Bande Originale',       titleFr: 'Meilleure Bande Originale',       titleEn: 'Best Original Soundtrack',      description: '', descriptionFr: 'La musique la plus épique',                    descriptionEn: 'The most epic music',                         order: 20, active: true },
  { id: 'p-chanson',     eventId: 'demo', title: 'Meilleure Chanson d\'Animé',      titleFr: 'Meilleure Chanson d\'Animé',      titleEn: 'Best Anime Song',               description: '', descriptionFr: 'La chanson qu\'on a le plus écoutée',          descriptionEn: 'The song we listened to the most',            order: 21, active: true },
  { id: 'p-protagoniste',eventId: 'demo', title: 'Meilleur Protagoniste',           titleFr: 'Meilleur Protagoniste',           titleEn: 'Best Protagonist',              description: '', descriptionFr: 'Le héros le plus marquant',                    descriptionEn: 'The most memorable hero',                     order: 22, active: true },
  { id: 'p-secondaire',  eventId: 'demo', title: 'Meilleur Personnage Secondaire',  titleFr: 'Meilleur Personnage Secondaire',  titleEn: 'Best Supporting Character',     description: '', descriptionFr: 'Le perso secondaire le plus mémorable',        descriptionEn: 'The most memorable supporting character',     order: 23, active: true },
  { id: 'p-suite',       eventId: 'demo', title: 'Meilleure Suite',                 titleFr: 'Meilleure Suite',                 titleEn: 'Best Sequel',                   description: '', descriptionFr: 'La suite qui a le mieux honoré l\'original',   descriptionEn: 'The sequel that best honored the original',   order: 24, active: true },
  { id: 'p-sol',         eventId: 'demo', title: 'Meilleur Slice of Life',          titleFr: 'Meilleur Slice of Life',          titleEn: 'Best Slice of Life',            description: '', descriptionFr: 'Le quotidien le plus touchant',                descriptionEn: 'The most touching everyday life',             order: 25, active: true },
  { id: 'p-annee',       eventId: 'demo', title: 'Animé de l\'Année',              titleFr: 'Animé de l\'Année',              titleEn: 'Anime of the Year',             description: '', descriptionFr: 'Le grand prix — meilleur animé 2025',          descriptionEn: 'The grand prize — best anime 2025',           order: 26, active: true },
  { id: 'p-antagoniste', eventId: 'demo', title: 'Meilleur Antagoniste',            titleFr: 'Meilleur Antagoniste',            titleEn: 'Best Antagonist',               description: '', descriptionFr: 'Le méchant qu\'on a adoré détester',           descriptionEn: 'The villain we loved to hate',                order: 27, active: true },
];

function n(id: string, catId: string, name: string, anime: string, descFr: string, color = '0f0d09', textColor = 'c9a227'): Nominee {
  return {
    id, categoryId: catId, name, anime,
    imageUrl: `https://placehold.co/300x400/${color}/${textColor}?text=${encodeURIComponent(name)}`,
    description: descFr, descriptionFr: descFr, descriptionEn: descFr, active: true,
  };
}

const PLACEHOLDER_NOMINEES: Record<string, Nominee[]> = {
  'p-drama': [
    n('dra1','p-drama','The Apothecary Diaries S2','','','0a0a14','c9a227'),
    n('dra2','p-drama','Bloom','','','0a1414','80e0c0'),
    n('dra3','p-drama','To Your Eternity S3','','','0a0a1a','a0c0ff'),
    n('dra4','p-drama','Orb: On the Movements of the Earth','','','100a00','c9a227'),
    n('dra5','p-drama','Link Click S3','','','0a0a20','6080ff'),
    n('dra6','p-drama','Takopi\'s Original Sin','','','0a0a0a','ff80b4'),
    n('dra7','p-drama','Bunny Girl Senpai (Nouvelle saison)','','','0a0a1a','d0b0ff'),
    n('dra8','p-drama','My Happy Marriage S2','','','1a0a14','ff80b4'),
    n('dra9','p-drama','The Rising of the Shield Hero S4','','','100a00','c9a227'),
    n('dra10','p-drama','Scarlet','','','1a0a0a','e8a87c'),
  ],
  'p-romance': [
    n('rom1','p-romance','Blue Box','','','0a0a1a','a0c0ff'),
    n('rom2','p-romance','My Dress-Up Darling S2','','','1a0a14','ff80b4'),
    n('rom3','p-romance','The Fragrant Flower Blooms with Dignity','','','0a1008','80e880'),
    n('rom4','p-romance','Kowloon Generic Romance','','','0a0a20','8080ff'),
    n('rom5','p-romance','Bunny Girl Senpai (Nouvelle saison)','','','0a0a1a','d0b0ff'),
    n('rom6','p-romance','A Condition Called Love','','','1a0a14','ff80b4'),
    n('rom7','p-romance','My Happy Marriage S2','','','0a0a14','ffd0e0'),
    n('rom8','p-romance','The 100 Girlfriends Who Really Love You S2','','','1a0a14','ff80b4'),
    n('rom9','p-romance','Insomniacs After School','','','0a0a20','6080ff'),
    n('rom10','p-romance','Horimiya','','','140a14','ff80b4'),
    n('rom11','p-romance','Mikadono Sanshimai wa Angai, Choroi','','','0a1010','80d0d0'),
    n('rom12','p-romance','There\'s No Freaking Way I\'ll Be Your Lover! Unless…','','','1a0a14','ff80b4'),
  ],
  'p-decors': [
    n('dc1','p-decors','— À venir —','','','0d0d0d','555555'),
  ],
  'p-seinen': [
    n('s1','p-seinen','— À venir —','','','0d0d0d','555555'),
  ],
  'p-action': [
    n('act1','p-action','Solo Leveling S2','','','1a0800','ffd250'),
    n('act2','p-action','Kaiju No. 8 S2','','','0a1414','60d0d0'),
    n('act3','p-action','Dandadan S2','','','0a0a20','a060ff'),
    n('act4','p-action','Wind Breaker S2','','','0a0a14','6080ff'),
    n('act5','p-action','Gachiakuta','','','1a0800','ff8030'),
    n('act6','p-action','Fire Force S3','','','200800','ff6020'),
    n('act7','p-action','To Be Hero X','','','0a0a20','60a0ff'),
    n('act8','p-action','My Hero Academia (Final Season)','','','1a0500','ff4020'),
    n('act9','p-action','Blue Exorcist','','','0a0a20','6060ff'),
    n('act10','p-action','One Piece (Egghead Arc)','','','1a0800','ff7030'),
    n('act11','p-action','Devil May Cry','','','100010','c000ff'),
    n('act12','p-action','I Was Reincarnated as the 7th Prince S2','','','0a0814','8040c0'),
    n('act13','p-action','The Final Boss','','','0d0d0d','c9a227'),
    n('act14','p-action','Yaiba : Samurai Legend','','','0f0a00','c9a227'),
  ],
  'p-animation': [
    n('an1','p-animation','— À venir —','','','0d0d0d','555555'),
  ],
  'p-masculin': [
    n('mas1','p-masculin','Bakugo','My Hero Academia','','1a0500','ff4020'),
    n('mas2','p-masculin','X','To Be Hero X','','0a0a20','60a0ff'),
    n('mas3','p-masculin','Akaza','Demon Slayer','','200010','ff4060'),
    n('mas4','p-masculin','Denji','Chainsaw Man','','100010','c000ff'),
    n('mas5','p-masculin','Bandenlie','Gachiakuta','','1a0800','ff8030'),
    n('mas6','p-masculin','Jinwoo','Solo Leveling','','1a0800','ffd250'),
    n('mas7','p-masculin','Shinra','Fire Force','','200800','ff6020'),
    n('mas8','p-masculin','Sakura','Wind Breaker','','0a0a14','6080ff'),
    n('mas9','p-masculin','Senku','Dr. Stone','','0a1008','80e880'),
    n('mas10','p-masculin','Saitama','One-Punch Man','','0a0a14','ffd250'),
    n('mas11','p-masculin','Xeno','Dr. Stone','','0a1008','ffd250'),
    n('mas12','p-masculin','Ling Ling','Ling Ling','','0a0a1a','a0c0ff'),
    n('mas13','p-masculin','Him','The 100 Girlfriends','','0a0a20','a060ff'),
    n('mas14','p-masculin','Hikaru','The Summer Hikaru Died','','0a0a1a','80c0ff'),
    n('mas15','p-masculin','Shigaraki','My Hero Academia','','100010','a000ff'),
  ],
  'p-feminin': [
    n('fem1','p-feminin','Momo Ayase','Dandadan','','0a0a20','a060ff'),
    n('fem2','p-feminin','Suika','Dr. Stone','','0a1008','80e880'),
    n('fem3','p-feminin','Marin Kitagawa','My Dress-Up Darling','','1a0a14','ff80b4'),
    n('fem4','p-feminin','Maomao','The Apothecary Diaries','','0a0a14','c9a227'),
    n('fem5','p-feminin','Mai Sakurajima','Bunny Girl Senpai','','0a0a1a','d0b0ff'),
    n('fem6','p-feminin','Scarlet','Scarlet','','1a0a0a','e8a87c'),
    n('fem7','p-feminin','Anastasia','Who Made Me a Princess','','1a0a14','ff80b4'),
    n('fem8','p-feminin','Seiko Ayase','Dandadan','','0a0a20','a060ff'),
    n('fem9','p-feminin','Semui','Clevatess','','0a0a1a','80c0ff'),
    n('fem10','p-feminin','Riyo','The Water Magician','','0a0a20','6080ff'),
    n('fem11','p-feminin','Lucy','Lazarus','','0d0d0d','aaaaaa'),
    n('fem12','p-feminin','Emilia','Re:Zero','','0a0a1a','a0c0ff'),
    n('fem13','p-feminin','Reze','Chainsaw Man','','100010','c000ff'),
    n('fem14','p-feminin','Toga Himiko','My Hero Academia','','1a0a14','ff80b4'),
    n('fem15','p-feminin','Uraraka','My Hero Academia','','1a0a14','ff80b4'),
  ],
  'p-deception': [
    n('dec1','p-deception','TBATE (The Beginning After the End)','','','0d0d0d','666666'),
    n('dec2','p-deception','One-Punch Man S3','','','0d0d0d','888888'),
    n('dec3','p-deception','Sakamoto Days','','','0d0d0d','777777'),
    n('dec4','p-deception','Fairy Tail: 100 Years Quest','','','0d0d0d','555555'),
  ],
  'p-developpement': [
    n('dv1','p-developpement','— À venir —','','','0d0d0d','555555'),
  ],
  'p-comedie': [
    n('com1','p-comedie','The 100 Girlfriends Who Really Love You S2','','','1a0a14','ff80b4'),
    n('com2','p-comedie','Konosuba S3','','','0a0a20','a060ff'),
    n('com3','p-comedie','Kamen Rider','','','0a0a14','60a0ff'),
    n('com4','p-comedie','Spy × Family S3','','','0a1414','60d0c0'),
    n('com5','p-comedie','May I Ask for One Final Thing?','','','0a0a1a','d0b0ff'),
    n('com6','p-comedie','Kono Subarashii Sekai ni Shukufuku wo! 3: BONUS STAGE','','','0a0a20','ffd250'),
    n('com7','p-comedie','New Panty & Stocking with GARTERBELT S2','','','1a0a14','ff80b4'),
    n('com8','p-comedie','From Bureaucrat to Villainess','','','0a0a14','c9a227'),
  ],
  'p-nouveaute': [
    n('nv1','p-nouveaute','To Be Hero X','','','0a0a20','60a0ff'),
    n('nv2','p-nouveaute','Bloom','','','0a1414','80e0c0'),
    n('nv3','p-nouveaute','Takopi\'s Original Sin','','','0a0a0a','ff80b4'),
    n('nv4','p-nouveaute','Rock Is a Lady\'s Modesty','','','1a0a14','ff80b4'),
    n('nv5','p-nouveaute','Devil May Cry (Netflix)','','','100010','c000ff'),
    n('nv6','p-nouveaute','My Gift LVL 9999: Unlimited Gacha','','','0a0a14','c9a227'),
    n('nv7','p-nouveaute','Clevatess','','','0a0a1a','80c0ff'),
    n('nv8','p-nouveaute','SANDA','','','0a0a14','c9a227'),
    n('nv9','p-nouveaute','Lazarus','','','0d0d0d','aaaaaa'),
    n('nv10','p-nouveaute','Orb: On the Movements of the Earth','','','100a00','c9a227'),
    n('nv11','p-nouveaute','Gachiakuta','','','1a0800','ff8030'),
    n('nv12','p-nouveaute','The Summer Hikaru Died','','','0a0a1a','80c0ff'),
  ],
  'p-sensei': [
    n('se1','p-sensei','— À venir —','','','0d0d0d','555555'),
  ],
  'p-isekai': [
    n('isk1','p-isekai','Zenshu','','','0a0a1a','a0c0ff'),
    n('isk2','p-isekai','Lord of the Mysteries','','','100814','8040c0'),
    n('isk3','p-isekai','The Water Magician','','','0a0a20','6080ff'),
    n('isk4','p-isekai','Who Made Me a Princess','','','1a0a14','ff80b4'),
    n('isk5','p-isekai','Re:Zero S3','','','0a0814','8040c0'),
    n('isk6','p-isekai','The Rising of the Shield Hero S4','','','100a00','c9a227'),
    n('isk7','p-isekai','I Was Reincarnated as the 7th Prince S2','','','0a0a20','a060ff'),
    n('isk8','p-isekai','Yasei no Last Boss ga Arawareta!','','','100814','c000ff'),
  ],
  'p-chara': [
    n('cha1','p-chara','Gachiakuta','','','1a0800','ff8030'),
    n('cha2','p-chara','Takopi','','','0a0a0a','ff80b4'),
    n('cha3','p-chara','To Be Hero X','','','0a0a20','60a0ff'),
    n('cha4','p-chara','Clevatess','','','0a0a1a','80c0ff'),
    n('cha5','p-chara','Dr. Stone','','','0a1008','80e880'),
    n('cha6','p-chara','The Apothecary Diaries','','','0a0a14','c9a227'),
    n('cha7','p-chara','One Piece','','','1a0800','ff7030'),
    n('cha8','p-chara','SANDA','','','0a0a14','c9a227'),
    n('cha9','p-chara','The Summer Hikaru Died','','','0a0a1a','80c0ff'),
    n('cha10','p-chara','Mikadono Sanshimai','','','0a1010','80d0d0'),
    n('cha11','p-chara','Who Made Me a Princess','','','1a0a14','ff80b4'),
    n('cha12','p-chara','Solo Leveling','','','1a0800','ffd250'),
    n('cha13','p-chara','Dandadan','','','0a0a20','a060ff'),
  ],
  'p-attachant': [
    n('at1','p-attachant','— À venir —','','','0d0d0d','555555'),
  ],
  'p-film': [
    n('fil1','p-film','Demon Slayer — Infinity Castle','','','1a0800','ff8060'),
    n('fil2','p-film','Chainsaw Man — Reze Arc','','','100010','c000ff'),
    n('fil3','p-film','Overlord — Holy Kingdom','','','100814','8030a0'),
    n('fil4','p-film','Ne Zha 2','','','1a0500','ff4020'),
    n('fil5','p-film','K-Pop Demon Hunters','','','1a0a14','ff80b4'),
    n('fil6','p-film','The Rose of Versailles','','','1a0a14','ff80b4'),
    n('fil7','p-film','100 Meters','','','0a0a14','6080ff'),
  ],
  'p-opening': [
    n('op1','p-opening','— À venir —','','','0d0d0d','555555'),
  ],
  'p-ending': [
    n('en1','p-ending','— À venir —','','','0d0d0d','555555'),
  ],
  'p-bo': [
    n('bo1','p-bo','— À venir —','','','0d0d0d','555555'),
  ],
  'p-chanson': [
    n('cs1','p-chanson','— À venir —','','','0d0d0d','555555'),
  ],
  'p-protagoniste': [
    n('pr1','p-protagoniste','Denji','Chainsaw Man','','100010','c000ff'),
    n('pr2','p-protagoniste','Gojo','Jujutsu Kaisen','','0a0a20','6060ff'),
    n('pr3','p-protagoniste','Marin','My Dress-Up Darling','','1a0a14','ff80b4'),
    n('pr4','p-protagoniste','Cheng Xiaoshi','Link Click','','0a0a20','6080ff'),
    n('pr5','p-protagoniste','Lu Guang','Link Click','','0a0a1a','a0c0ff'),
    n('pr6','p-protagoniste','Hikaru','The Summer Hikaru Died','','0a0a1a','80c0ff'),
    n('pr7','p-protagoniste','Tsukasa','Dr. Stone','','0a1008','80e880'),
    n('pr8','p-protagoniste','Senku','Dr. Stone','','0a1008','ffd250'),
    n('pr9','p-protagoniste','Jinwoo','Solo Leveling','','1a0800','ffd250'),
    n('pr10','p-protagoniste','Les héros de To Be Hero X','To Be Hero X','','0a0a20','60a0ff'),
    n('pr11','p-protagoniste','Maomao','The Apothecary Diaries','','0a0a14','c9a227'),
    n('pr12','p-protagoniste','Dante','Devil May Cry','','100010','c000ff'),
    n('pr13','p-protagoniste','Sung Jinwoo','Solo Leveling','','1a0800','ffd250'),
    n('pr14','p-protagoniste','Subaru','Re:Zero','','0a0814','8040c0'),
    n('pr15','p-protagoniste','Sakamoto','Sakamoto Days','','0a0a14','c9a227'),
    n('pr16','p-protagoniste','Natsuko Zenju','Zenshu','','0a0a1a','a0c0ff'),
  ],
  'p-secondaire': [
    n('sc1','p-secondaire','— À venir —','','','0d0d0d','555555'),
  ],
  'p-suite': [
    n('su1','p-suite','— À venir —','','','0d0d0d','555555'),
  ],
  'p-sol': [
    n('sl1','p-sol','— À venir —','','','0d0d0d','555555'),
  ],
  'p-annee': [
    n('ann1','p-annee','Solo Leveling S2','','','1a0800','ffd250'),
    n('ann2','p-annee','Takopi\'s Original Sin','','','0a0a0a','ff80b4'),
    n('ann3','p-annee','Dandadan S2','','','0a0a20','a060ff'),
    n('ann4','p-annee','Kaiju No. 8 S2','','','0a1414','60d0d0'),
    n('ann5','p-annee','The Apothecary Diaries S2','','','0a0a14','c9a227'),
    n('ann6','p-annee','My Hero Academia (Final Season)','','','1a0500','ff4020'),
    n('ann7','p-annee','One Piece (Egghead Arc)','','','1a0800','ff7030'),
    n('ann8','p-annee','Re:Zero S3','','','0a0814','8040c0'),
    n('ann9','p-annee','Gachiakuta','','','1a0800','ff8030'),
    n('ann10','p-annee','To Be Hero X','','','0a0a20','60a0ff'),
  ],
  'p-antagoniste': [
    n('ag1','p-antagoniste','Reze','Chainsaw Man','','100010','c000ff'),
    n('ag2','p-antagoniste','Dabi','My Hero Academia','','1a0a00','6080ff'),
    n('ag3','p-antagoniste','Doma','Demon Slayer','','0a0a1a','a0c0ff'),
    n('ag4','p-antagoniste','All For One','My Hero Academia','','0d0d0d','888888'),
    n('ag5','p-antagoniste','Shigaraki','My Hero Academia','','100010','a000ff'),
    n('ag6','p-antagoniste','Akaza','Demon Slayer','','200010','ff4060'),
    n('ag7','p-antagoniste','Yhwach','Bleach','','0a0a14','6080ff'),
    n('ag8','p-antagoniste','Xeno','Dr. Stone','','0a1008','80e880'),
    n('ag9','p-antagoniste','Stanley','Dr. Stone','','0a0a14','6080ff'),
    n('ag10','p-antagoniste','Jabber','Gachiakuta','','1a0800','ff8030'),
    n('ag11','p-antagoniste','Zodyl','Clevatess','','0a0a1a','80c0ff'),
    n('ag12','p-antagoniste','White Rabbit','Link Click','','0a0a20','a060ff'),
    n('ag13','p-antagoniste','Arthur','Moriarty the Patriot','','0a0a14','c9a227'),
    n('ag14','p-antagoniste','Beru','Solo Leveling','','1a0800','ffd250'),
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
        className="fixed left-0 right-0 z-40 border-b"
        style={{ top: '64px', background: 'rgba(7,6,10,0.95)', backdropFilter: 'blur(16px)', borderColor: 'rgba(201,162,39,0.12)' }}
      >
        <div className="container-mobile flex items-center justify-between" style={{ height: '44px' }}>
          {prevCat ? (
            <Link
              href={`/${locale}/nominees?category=${prevCat.id}`}
              className="flex items-center gap-1 text-xs font-medium transition-colors"
              style={{ color: '#9a8870', maxWidth: '33%' }}
            >
              <ChevronLeft className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{locale === 'fr' ? prevCat.titleFr : prevCat.titleEn}</span>
            </Link>
          ) : <div style={{ width: '33%' }} />}

          <Link
            href={`/${locale}/categories`}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0"
            style={{ color: '#c9a227', border: '1px solid rgba(201,162,39,0.3)' }}
          >
            <LayoutGrid className="w-3 h-3" />
            {locale === 'fr' ? 'Toutes les catégories' : 'All categories'}
          </Link>

          {nextCat ? (
            <Link
              href={`/${locale}/nominees?category=${nextCat.id}`}
              className="flex items-center gap-1 text-xs font-medium transition-colors justify-end"
              style={{ color: '#9a8870', maxWidth: '33%' }}
            >
              <span className="truncate">{locale === 'fr' ? nextCat.titleFr : nextCat.titleEn}</span>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            </Link>
          ) : <div style={{ width: '33%' }} />}
        </div>
      </div>

      <main style={{ background: '#07060a', minHeight: '100vh', paddingTop: '108px', paddingBottom: '5rem' }}>
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
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
