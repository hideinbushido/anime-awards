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
    n('d1','p-drama','Vinland Saga S2','Vinland Saga','Un voyage vers la paix intérieure','1a0a0a','e8a87c'),
    n('d2','p-drama','Frieren','Sousou no Frieren','Le deuil et la mémoire à travers les âges','0a0a1a','a0c0ff'),
    n('d3','p-drama','Oshi no Ko','Oshi no Ko','Les dessous sombres de l\'industrie du spectacle','0a0a0a','ff80b4'),
    n('d4','p-drama','Banana Fish','Banana Fish','Un amour impossible dans l\'ombre des gangs','0d0d0d','f5e090'),
    n('d5','p-drama','Mashle S2','Mashle','Magie, pouvoir et injustice sociale','0a0a14','c9a227'),
  ],
  'p-romance': [
    n('r1','p-romance','Horimiya','Horimiya','Deux visages cachés qui se découvrent','1a0a10','ff80b4'),
    n('r2','p-romance','Kaguya-sama','Kaguya-sama wa Kokurasetai','Une guerre d\'ego et de sentiments refoulés','140a0a','e8a87c'),
    n('r3','p-romance','Your Lie in April','Shigatsu wa Kimi no Uso','La musique comme dernière lettre d\'amour','0a0a1a','a0c0ff'),
    n('r4','p-romance','Tonikawa','Tonikawa: Over the Moon','Un mariage avant la romance','1a0a14','ff80b4'),
    n('r5','p-romance','Quintessential','Go-Toubun no Hanayome','Cinq sœurs, un seul cœur à conquérir','0a0a10','f0c0ff'),
  ],
  'p-decors': [
    n('dc1','p-decors','Made in Abyss','Made in Abyss','Un abîme d\'une beauté terrifiante','0a100a','80e880'),
    n('dc2','p-decors','Frieren','Sousou no Frieren','Paysages féeriques d\'un monde post-épique','0a0a1a','a0c0ff'),
    n('dc3','p-decors','Attack on Titan','Shingeki no Kyojin','Un monde fermé aux horizons infinis','0f0d09','c9a227'),
    n('dc4','p-decors','Violet Evergarden','Violet Evergarden','Des aquarelles animées d\'une douceur absolue','0a0a14','d0b0ff'),
    n('dc5','p-decors','Demon Slayer','Kimetsu no Yaiba','L\'ukiyo-e en mouvement','1a0a0a','ff8060'),
  ],
  'p-seinen': [
    n('s1','p-seinen','Berserk','Berserk','La lutte contre un destin maudit','100505','cc4444'),
    n('s2','p-seinen','Vinland Saga','Vinland Saga','Un viking en quête de sa vraie force','0a0a0a','e8a87c'),
    n('s3','p-seinen','Vagabond','Vagabond','La voie du sabre et de l\'âme','0d0d0a','c9a227'),
    n('s4','p-seinen','Dungeon Meshi','Delicious in Dungeon','Survivre en mangeant les monstres','0a1008','80d880'),
    n('s5','p-seinen','Oyasumi Punpun','Goodnight Punpun','Une enfance qui ne cicatrise jamais','0a0a0a','9090a0'),
  ],
  'p-action': [
    n('a1','p-action','Gojo Satoru','Jujutsu Kaisen','L\'infini comme terrain de jeu','200a00','ff6420'),
    n('a2','p-action','Tanjiro','Kimetsu no Yaiba','La respiration totale concentrée','1a0a00','ff8060'),
    n('a3','p-action','Luffy Gear 5','One Piece','La liberté absolue en combat','1a0500','ff4020'),
    n('a4','p-action','Levi Ackerman','Shingeki no Kyojin','Le plus fort de l\'humanité','0d0d0a','c9a227'),
    n('a5','p-action','Yuta Okkotsu','Jujutsu Kaisen','Une maîtrise du cursed energy hors norme','1a0800','ff7030'),
  ],
  'p-animation': [
    n('an1','p-animation','Demon Slayer S4','Kimetsu no Yaiba','Ufotable à son apogée absolu','1a0a00','ff8060'),
    n('an2','p-animation','Jujutsu Kaisen S2','Jujutsu Kaisen','MAPPA qui redéfinit les standards','1a0a20','c060ff'),
    n('an3','p-animation','Frieren','Sousou no Frieren','Madhouse et la fluidité du temps','0a0a1a','a0c0ff'),
    n('an4','p-animation','Spy x Family S2','Spy x Family','WIT Studio et la comédie visuelle','0a1418','60d0d0'),
    n('an5','p-animation','Solo Leveling','Solo Leveling','A-1 Pictures et ses séquences de boss','0d0d0a','c9a227'),
  ],
  'p-masculin': [
    n('m1','p-masculin','Gojo Satoru','Jujutsu Kaisen','Le personnage le plus charismatique de sa génération','0a0a20','6060ff'),
    n('m2','p-masculin','Loid Forger','Spy x Family','Espion, père, mari — un équilibre parfait','0a1414','60d0c0'),
    n('m3','p-masculin','Thorfinn','Vinland Saga','D\'une vengeance aveugle à la sérénité','0d0d0a','c9a227'),
    n('m4','p-masculin','Ryomen Sukuna','Jujutsu Kaisen','L\'antagoniste le plus puissant de l\'ère moderne','1a0020','a000ff'),
    n('m5','p-masculin','Luffy','One Piece','Le roi des pirates qui refuse tout compromis','1a0500','ff4020'),
  ],
  'p-feminin': [
    n('f1','p-feminin','Frieren','Sousou no Frieren','Une elfe millénaire qui redécouvre l\'humanité','0a0a1a','a0c0ff'),
    n('f2','p-feminin','Yor Forger','Spy x Family','Tueuse à gages et mère dévouée','1a0a14','ff80b4'),
    n('f3','p-feminin','Makima','Chainsaw Man','Une domination absolue cachée sous un sourire','200010','c000a0'),
    n('f4','p-feminin','Nezuko','Kimetsu no Yaiba','La tendresse comme arme ultime','1a0a00','ff8060'),
    n('f5','p-feminin','Anya Forger','Spy x Family','L\'innocence espion à la puissance max','0a1414','60d0c0'),
  ],
  'p-deception': [
    n('de1','p-deception','Anime X','Saison tant attendue','Les attentes n\'ont pas été à la hauteur','0d0d0d','666666'),
    n('de2','p-deception','Suite Y','Saga populaire','Un budget inexistant pour une suite ratée','0d0d0d','888888'),
    n('de3','p-deception','Film Z','Film très attendu','Une adaptation qui a trahi le manga','0d0d0d','777777'),
    n('de4','p-deception','Saison 2 A','Hit de la saison passée','Une deuxième saison sans âme ni rythme','0d0d0d','555555'),
    n('de5','p-deception','Projet B','Studio prometteur','Un projet ambitieux qui s\'est effondré','0d0d0d','666677'),
  ],
  'p-developpement': [
    n('dv1','p-developpement','Thorfinn','Vinland Saga','De guerrier brutal à homme de paix','0a1a0a','80e880'),
    n('dv2','p-developpement','Zenitsu','Kimetsu no Yaiba','La peur transcendée en force','1a0a00','ff8060'),
    n('dv3','p-developpement','Zoro','One Piece','Chaque arc le forge davantage','0d0d0a','c9a227'),
    n('dv4','p-developpement','Megumi Fushiguro','Jujutsu Kaisen','Une évolution tragique et inévitable','0a0a14','6060c0'),
    n('dv5','p-developpement','Anya','Spy x Family','Grandir sans jamais perdre son sourire','0a1414','60d0c0'),
  ],
  'p-comedie': [
    n('co1','p-comedie','Anya Forger','Spy x Family','Chaque réaction est un chef-d\'œuvre comique','0a1414','60d0c0'),
    n('co2','p-comedie','Kaguya-sama','Kaguya-sama wa Kokurasetai','La guerre psychologique la plus drôle du jeu','140a0a','ffd250'),
    n('co3','p-comedie','Gintoki','Gintama','L\'humour absurde élevé au rang d\'art','0d0d0a','c9a227'),
    n('co4','p-comedie','Bocchi','Bocchi the Rock!','L\'anxiété sociale transformée en comédie','0a0a1a','ff80b4'),
    n('co5','p-comedie','Konosuba','KonoSuba','Une équipe catastrophique pour des aventures hilarantes','0a0a20','a060ff'),
  ],
  'p-nouveaute': [
    n('nv1','p-nouveaute','Solo Leveling','Solo Leveling','Le manhwa le plus attendu enfin adapté','0d0d0a','c9a227'),
    n('nv2','p-nouveaute','Dungeon Meshi','Delicious in Dungeon','Une pépite qui a surpris tout le monde','0a1008','80d880'),
    n('nv3','p-nouveaute','Mashle S2','Mashle','Un shōnen parodique mais terriblement efficace','0a0a14','a060ff'),
    n('nv4','p-nouveaute','Shy','Shy','Une héroïne timide aux super-pouvoirs','1a0a14','ff80b4'),
    n('nv5','p-nouveaute','Sousou no Frieren','Frieren: Beyond Journey\'s End','Une révolution dans le fantasy post-quête','0a0a1a','a0c0ff'),
  ],
  'p-sensei': [
    n('se1','p-sensei','Kakashi Hatake','Naruto','Le maître qui enseigne par l\'exemple','0a0a14','a0c0ff'),
    n('se2','p-sensei','Satoru Gojo','Jujutsu Kaisen','Le prof le plus puissant et le plus excentrique','0a0a20','6060ff'),
    n('se3','p-sensei','Master Roshi','Dragon Ball','La sagesse du vieux maître aux méthodes douteuses','1a0800','ff7030'),
    n('se4','p-sensei','Aizawa','My Hero Academia','Un professeur qui pousse toujours plus loin','0a1414','60d0c0'),
    n('se5','p-sensei','Bisco','Sabikui Bisco','Un guide de survie dans un monde hostile','0a1008','80d880'),
  ],
  'p-isekai': [
    n('i1','p-isekai','Rudeus','Mushoku Tensei','Recommencer une vie avec la sagesse du passé','0a0814','8040c0'),
    n('i2','p-isekai','Rimuru','Tensura','Un slime qui conquiert un monde entier','0a0a20','6060ff'),
    n('i3','p-isekai','Ainz','Overlord','Un squelette tout-puissant dans un jeu devenu réel','100814','8030a0'),
    n('i4','p-isekai','Kazuma','KonoSuba','L\'isekai le plus raté avec la meilleure équipe','0a0a20','a060ff'),
    n('i5','p-isekai','Subaru','Re:Zero','La mort comme outil de croissance','0a0814','8040c0'),
  ],
  'p-chara': [
    n('ch1','p-chara','Demon Slayer','Kimetsu no Yaiba','Des costumes aux motifs inimitables','1a0a00','ff8060'),
    n('ch2','p-chara','JoJo\'s','JoJo\'s Bizarre Adventure','Un style iconique traversant les décennies','1a0020','c000a0'),
    n('ch3','p-chara','Bocchi','Bocchi the Rock!','Des designs expressifs et attachants','0a0a1a','ff80b4'),
    n('ch4','p-chara','Frieren','Sousou no Frieren','Une esthétique elfe intemporelle','0a0a14','a0c0ff'),
    n('ch5','p-chara','Solo Leveling','Solo Leveling','Des armures épiques au design de manhwa','0d0d0a','c9a227'),
  ],
  'p-attachant': [
    n('at1','p-attachant','Anya Forger','Spy x Family','Le personnage le plus aimé de l\'année','0a1414','60d0c0'),
    n('at2','p-attachant','Nezuko','Kimetsu no Yaiba','Mignonne et puissante, une combinaison parfaite','1a0a00','ff8060'),
    n('at3','p-attachant','Chopper','One Piece','Le docteur en coton qui ne laisse personne indifférent','1a0800','ff7030'),
    n('at4','p-attachant','Bocchi','Bocchi the Rock!','Attachante grâce à ses failles et son courage','0a0a1a','ff80b4'),
    n('at5','p-attachant','Gon','Hunter x Hunter','L\'innocence la plus pure du shōnen','0a1008','80d880'),
  ],
  'p-film': [
    n('fi1','p-film','One Piece Film Red','One Piece','Uta et la plus belle chanson du monde de One Piece','1a0800','ff7030'),
    n('fi2','p-film','Suzume','Suzume no Tojimari','Makoto Shinkai et les portes de l\'âme','0a0a1a','a0c0ff'),
    n('fi3','p-film','Dragon Ball Super','Dragon Ball Super: Broly','Le meilleur film Dragon Ball de tous les temps','1a0500','ff4020'),
    n('fi4','p-film','Jujutsu Kaisen 0','Jujutsu Kaisen 0','Yuta et Rika — une love story déchirante','0a0020','8000ff'),
    n('fi5','p-film','Your Name','Kimi no Na wa.','Une histoire de destin qui transcende le temps','0a0a14','d0b0ff'),
  ],
  'p-opening': [
    n('op1','p-opening','Idol — Oshi no Ko','Oshi no Ko','L\'opening qui a tout cassé dès le départ','1a0a14','ff80b4'),
    n('op2','p-opening','Hollow — Solo Leveling','Solo Leveling','Une montée en puissance irrésistible','0d0d0a','c9a227'),
    n('op3','p-opening','The Rumbling — AoT','Attack on Titan','Un cri de guerre qui annonce la fin','1a0a00','ff6420'),
    n('op4','p-opening','Blessings — Konosuba','KonoSuba','Un opening joyeux et accrocheur','0a0a20','a060ff'),
    n('op5','p-opening','Ao no Sumika','Jujutsu Kaisen','Une mélodie qui colle à l\'âme','1a1000','ffd250'),
  ],
  'p-ending': [
    n('en1','p-ending','Aqua — Oshi no Ko','Oshi no Ko','Un ending doux qui contraste avec l\'intrigue','1a0a14','ff80b4'),
    n('en2','p-ending','Zankyou Sanka','Demon Slayer','La résilience en musique','1a0a00','ff8060'),
    n('en3','p-ending','Ref:rain','Jujutsu Kaisen S1','Mélancolie et espoir mêlés','0a0a14','a0c0ff'),
    n('en4','p-ending','Toast — SxF','Spy x Family','Un ending familial et chaleureux','0a1414','60d0c0'),
    n('en5','p-ending','Dying Wish','Solo Leveling','Une montée d\'adrénaline post-épisode','0d0d0a','c9a227'),
  ],
  'p-bo': [
    n('bo1','p-bo','Frieren OST','Sousou no Frieren','Evan Call signe son chef-d\'œuvre','0a0a1a','a0c0ff'),
    n('bo2','p-bo','Demon Slayer OST','Kimetsu no Yaiba','Yuki Kajiura pour une épopée sonore','1a0a00','ff8060'),
    n('bo3','p-bo','Attack on Titan OST','Shingeki no Kyojin','Sawano Hiroyuki — des musiques qui restent à vie','0d0d0a','c9a227'),
    n('bo4','p-bo','Violet Evergarden OST','Violet Evergarden','La délicatesse orchestrale absolue','0a0a14','d0b0ff'),
    n('bo5','p-bo','Solo Leveling OST','Solo Leveling','Une bande-son qui amplifie chaque combat','1a1000','ffd250'),
  ],
  'p-chanson': [
    n('ch1s','p-chanson','Idol','Oshi no Ko','Yoasobi et l\'hymne qui a tout dominé','1a0a14','ff80b4'),
    n('ch2s','p-chanson','Hollow','Solo Leveling','L\'ouverture la plus électrisante de l\'année','0d0d0a','c9a227'),
    n('ch3s','p-chanson','The Rumbling','Attack on Titan','SiM et un punk metal qui annonce l\'apocalypse','1a0a00','ff6420'),
    n('ch4s','p-chanson','Ao no Sumika','Jujutsu Kaisen','Tatsuya Kitani et une mélodie inoubliable','1a1000','ffd250'),
    n('ch5s','p-chanson','Racing into the Night','Yoasobi','La chanson qui a lancé une ère Yoasobi','0a0a1a','a0c0ff'),
  ],
  'p-protagoniste': [
    n('pr1','p-protagoniste','Frieren','Sousou no Frieren','Une protagoniste au regard sur le temps unique','0a0a1a','a0c0ff'),
    n('pr2','p-protagoniste','Luffy','One Piece','Le roi des pirates par la volonté pure','1a0500','ff4020'),
    n('pr3','p-protagoniste','Thorfinn','Vinland Saga','L\'arc du héros le plus accompli de la décennie','0d0d0a','c9a227'),
    n('pr4','p-protagoniste','Denji','Chainsaw Man','Un héros brutal, sincère et terriblement humain','1a0a00','ff6420'),
    n('pr5','p-protagoniste','Sung Jinwoo','Solo Leveling','Du rang E à la domination absolue','1a1000','ffd250'),
  ],
  'p-secondaire': [
    n('sc1','p-secondaire','Zenitsu','Kimetsu no Yaiba','Le comic relief qui devient un pilier','1a0a00','ff8060'),
    n('sc2','p-secondaire','Nanami','Jujutsu Kaisen','Le salarié le plus badass de l\'univers du sorcier','0a0a14','a0c0ff'),
    n('sc3','p-secondaire','Chopper','One Piece','Toujours présent, toujours utile, toujours aimé','1a0800','ff7030'),
    n('sc4','p-secondaire','Fern','Sousou no Frieren','La magie discrète au service du groupe','0a0a1a','d0b0ff'),
    n('sc5','p-secondaire','Nobara','Jujutsu Kaisen','Une combattante avec un style inimitable','1a0a14','ff80b4'),
  ],
  'p-suite': [
    n('su1','p-suite','Demon Slayer S4','Kimetsu no Yaiba','Pillar Training Arc — enfin mis en images','1a0a00','ff8060'),
    n('su2','p-suite','AoT Final Part','Shingeki no Kyojin','La conclusion qui a divisé et passionné','0d0d0a','c9a227'),
    n('su3','p-suite','JJK S2','Jujutsu Kaisen','Shibuya Arc — la meilleure suite de l\'année','0a0a20','a060ff'),
    n('su4','p-suite','Konosuba S3','KonoSuba','Un retour attendu et réussi','0a0a20','ffd250'),
    n('su5','p-suite','Overlord S4','Overlord','Le règne d\'Ainz s\'étend encore','100814','8030a0'),
  ],
  'p-sol': [
    n('sl1','p-sol','Bocchi the Rock!','Bocchi the Rock!','La musique comme thérapie pour une introvertie','0a0a1a','ff80b4'),
    n('sl2','p-sol','Yuru Camp','Laid-Back Camp','Le camping comme art de vivre','0a1008','80d880'),
    n('sl3','p-sol','Mushishi','Mushishi','Une contemplation du monde naturel et surnaturel','0a1414','60d0c0'),
    n('sl4','p-sol','March comes in like a Lion','3-gatsu no Lion','Les échecs comme métaphore de la solitude','0a0a14','a0c0ff'),
    n('sl5','p-sol','Spy x Family','Spy x Family','Une famille fonctionnelle bâtie sur des mensonges','1a1000','ffd250'),
  ],
  'p-annee': [
    n('ay1','p-annee','Frieren','Sousou no Frieren','Le chef-d\'œuvre qui redéfinit la fantasy','0a0a1a','e8c54a'),
    n('ay2','p-annee','Jujutsu Kaisen S2','Jujutsu Kaisen','Shibuya Arc — un arc qui restera dans l\'histoire','0d0d0a','c9a227'),
    n('ay3','p-annee','Demon Slayer S4','Kimetsu no Yaiba','Ufotable une fois de plus au sommet','1a0a00','f5e090'),
    n('ay4','p-annee','Solo Leveling','Solo Leveling','L\'adaptation la plus attendue de la décennie','1a1000','e8c54a'),
    n('ay5','p-annee','Dungeon Meshi','Delicious in Dungeon','La surprise absolue de l\'année','0a0a0a','c9a227'),
  ],
  'p-antagoniste': [
    n('ag1','p-antagoniste','Ryomen Sukuna','Jujutsu Kaisen','Le roi des malédictions — peur et fascination absolues','200010','c000ff'),
    n('ag2','p-antagoniste','Makima','Chainsaw Man','La manipulation comme art — un antagoniste culte','1a0020','c000a0'),
    n('ag3','p-antagoniste','Eren Yeager','Attack on Titan','Le héros devenu l\'ennemi le plus complexe du genre','1a0a00','ff6420'),
    n('ag4','p-antagoniste','Muzan Kibutsuji','Kimetsu no Yaiba','La peur incarnée sous un masque humain','100010','a000ff'),
    n('ag5','p-antagoniste','Griffith','Berserk','La trahison la plus marquante de l\'histoire du manga','100505','cc4444'),
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
