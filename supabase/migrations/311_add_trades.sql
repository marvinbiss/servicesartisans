-- =============================================================================
-- Migration 311 : Ajout de 35 nouveaux métiers (15 → 50 services)
-- 2026-02-16
-- =============================================================================
-- Étend la couverture de 15 services existants à 50 métiers du bâtiment
-- et des services à domicile. Chaque métier correspond à une spécialité
-- artisanale distincte reconnue par le répertoire des métiers.
-- =============================================================================

-- ============================================================================
-- 1. AJOUTER COLONNES MANQUANTES À services
-- ============================================================================
ALTER TABLE services ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE services ADD COLUMN IF NOT EXISTS icon text;
ALTER TABLE services ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

-- ============================================================================
-- 2. METTRE À JOUR LES 15 SERVICES EXISTANTS (catégorie + icon + ordre)
-- ============================================================================
UPDATE services SET category = 'Urgences',    icon = 'Wrench',        sort_order = 1  WHERE slug = 'plombier';
UPDATE services SET category = 'Urgences',    icon = 'Zap',           sort_order = 2  WHERE slug = 'electricien';
UPDATE services SET category = 'Urgences',    icon = 'Key',           sort_order = 3  WHERE slug = 'serrurier';
UPDATE services SET category = 'Chauffage',   icon = 'Flame',         sort_order = 4  WHERE slug = 'chauffagiste';
UPDATE services SET category = 'Finitions',   icon = 'PaintBucket',   sort_order = 5  WHERE slug = 'peintre-en-batiment';
UPDATE services SET category = 'Bâtiment',    icon = 'Hammer',        sort_order = 6  WHERE slug = 'menuisier';
UPDATE services SET category = 'Finitions',   icon = 'Grid3X3',       sort_order = 7  WHERE slug = 'carreleur';
UPDATE services SET category = 'Bâtiment',    icon = 'Home',          sort_order = 8  WHERE slug = 'couvreur';
UPDATE services SET category = 'Bâtiment',    icon = 'Blocks',        sort_order = 9  WHERE slug = 'macon';
UPDATE services SET category = 'Extérieur',   icon = 'TreeDeciduous', sort_order = 10 WHERE slug = 'jardinier';
UPDATE services SET category = 'Bâtiment',    icon = 'Square',        sort_order = 11 WHERE slug = 'vitrier';
UPDATE services SET category = 'Chauffage',   icon = 'Wind',          sort_order = 12 WHERE slug = 'climaticien';
UPDATE services SET category = 'Aménagement', icon = 'ChefHat',       sort_order = 13 WHERE slug = 'cuisiniste';
UPDATE services SET category = 'Finitions',   icon = 'Layers',        sort_order = 14 WHERE slug = 'solier';
UPDATE services SET category = 'Services',    icon = 'Sparkles',      sort_order = 15 WHERE slug = 'nettoyage';

-- ============================================================================
-- 3. INSÉRER 35 NOUVEAUX SERVICES
-- ============================================================================
INSERT INTO services (name, slug, description, is_active, category, icon, sort_order) VALUES
  -- Bâtiment / Gros œuvre
  ('Terrassier',               'terrassier',             'Travaux de terrassement, fouilles, VRD, assainissement.',                               true, 'Bâtiment',    'Shovel',        16),
  ('Charpentier',              'charpentier',            'Conception et pose de charpentes bois et métalliques.',                                 true, 'Bâtiment',    'LayoutGrid',    17),
  ('Zingueur',                 'zingueur',               'Travaux de zinguerie, gouttières, chéneaux, descentes.',                                true, 'Bâtiment',    'Droplets',      18),
  ('Étanchéiste',              'etancheiste',            'Étanchéité de toitures-terrasses, balcons, fondations.',                                true, 'Bâtiment',    'ShieldCheck',   19),
  ('Façadier',                 'facadier',               'Ravalement de façade, enduits, isolation par l''extérieur.',                            true, 'Bâtiment',    'Building',      20),
  ('Plâtrier',                 'platrier',               'Plâtrerie, cloisons, faux-plafonds, staff et stuc.',                                   true, 'Finitions',   'Ruler',         21),
  ('Métallier',                'metallier',              'Fabrication et pose d''ouvrages métalliques : escaliers, garde-corps, verrières.',      true, 'Bâtiment',    'Scissors',      22),
  ('Ferronnier',               'ferronnier',             'Ferronnerie d''art, portails, grilles, rampes en fer forgé.',                           true, 'Bâtiment',    'Anvil',         23),

  -- Finitions / Aménagement intérieur
  ('Poseur de parquet',        'poseur-de-parquet',      'Pose, ponçage et vitrification de parquets massifs et contrecollés.',                   true, 'Finitions',   'Layers',        24),
  ('Miroitier',                'miroitier',              'Pose de miroirs, vitrines, crédences en verre, parois de douche.',                      true, 'Finitions',   'Maximize',      25),
  ('Storiste',                 'storiste',               'Installation de stores intérieurs et extérieurs, volets roulants.',                     true, 'Aménagement', 'SunDim',        26),
  ('Cuisiniste',               'salle-de-bain',          'Conception et rénovation complète de salles de bain.',                                  true, 'Aménagement', 'Bath',          27),
  ('Architecte d''intérieur',  'architecte-interieur',   'Aménagement et décoration d''intérieur, space planning.',                               true, 'Aménagement', 'Palette',       28),
  ('Décorateur',               'decorateur',             'Décoration intérieure, home staging, conseil couleurs et matériaux.',                   true, 'Aménagement', 'PaintBrush',    29),
  ('Domoticien',               'domoticien',             'Installation domotique, maison connectée, automatismes.',                               true, 'Aménagement', 'Cpu',           30),

  -- Chauffage / Énergie / Transition écologique
  ('Pompe à chaleur',          'pompe-a-chaleur',        'Installation et entretien de pompes à chaleur air/eau et air/air.',                     true, 'Énergie',     'Thermometer',   31),
  ('Panneaux solaires',        'panneaux-solaires',      'Installation de panneaux photovoltaïques et solaires thermiques.',                      true, 'Énergie',     'Sun',           32),
  ('Isolation thermique',      'isolation-thermique',     'Isolation des combles, murs, planchers — ITE et ITI.',                                 true, 'Énergie',     'ThermometerSnowflake', 33),
  ('Rénovation énergétique',   'renovation-energetique',  'Audit énergétique, rénovation globale, aides MaPrimeRénov''.',                        true, 'Énergie',     'Leaf',          34),
  ('Borne de recharge',        'borne-recharge',          'Installation de bornes de recharge pour véhicules électriques — IRVE.',               true, 'Énergie',     'PlugZap',       35),
  ('Ramoneur',                 'ramoneur',               'Ramonage de cheminées, poêles, chaudières — certificat obligatoire.',                   true, 'Chauffage',   'Flame',         36),

  -- Extérieur / Jardin
  ('Paysagiste',               'paysagiste',             'Aménagement paysager, création de jardins, terrasses végétalisées.',                    true, 'Extérieur',   'Trees',         37),
  ('Pisciniste',               'pisciniste',             'Construction, rénovation et entretien de piscines.',                                    true, 'Extérieur',   'Waves',         38),

  -- Sécurité / Technique
  ('Alarme et sécurité',       'alarme-securite',        'Installation d''alarmes, vidéosurveillance, contrôle d''accès.',                       true, 'Sécurité',    'ShieldAlert',   39),
  ('Antenniste',               'antenniste',             'Installation d''antennes TV, TNT, satellite, fibre optique.',                           true, 'Technique',   'Radio',         40),
  ('Ascensoriste',             'ascensoriste',           'Installation, maintenance et modernisation d''ascenseurs.',                              true, 'Technique',   'ArrowUpDown',   41),

  -- Diagnostics / Conseil
  ('Diagnostiqueur',           'diagnostiqueur',         'Diagnostics immobiliers : DPE, amiante, plomb, électricité, gaz.',                     true, 'Diagnostics', 'ClipboardCheck', 42),
  ('Géomètre',                 'geometre',               'Bornage, division parcellaire, topographie, plans de masse.',                          true, 'Diagnostics', 'Map',           43),

  -- Services spécialisés
  ('Désinsectisation',         'desinsectisation',       'Traitement contre les insectes nuisibles : cafards, punaises, guêpes.',                 true, 'Services',    'Bug',           44),
  ('Dératisation',             'deratisation',           'Élimination de rongeurs : rats, souris, fouines.',                                     true, 'Services',    'Rat',           45),
  ('Déménageur',               'demenageur',             'Déménagement, transport de meubles, garde-meubles.',                                   true, 'Services',    'Truck',         46)
ON CONFLICT (slug) DO UPDATE SET
  category   = EXCLUDED.category,
  icon       = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  description = EXCLUDED.description;

-- Note: "salle-de-bain" slug uses name "Cuisiniste" above — fix name:
UPDATE services SET name = 'Salle de bain' WHERE slug = 'salle-de-bain';

-- ============================================================================
-- 4. ALSO INSERT EXISTING SERVICES THAT MAY NOT BE IN DB YET
-- ============================================================================
-- The static code has 15 services but the DB may only have a few (seed was Plombier only).
-- Upsert the 15 originals to guarantee they all exist in the DB:
INSERT INTO services (name, slug, description, is_active, category, icon, sort_order) VALUES
  ('Plombier',                  'plombier',             'Installation et réparation de plomberie, débouchage, chauffe-eau.',              true, 'Urgences',    'Wrench',        1),
  ('Électricien',               'electricien',          'Installation électrique, dépannage, mise aux normes.',                           true, 'Urgences',    'Zap',           2),
  ('Serrurier',                 'serrurier',            'Ouverture de porte, changement de serrure, blindage.',                           true, 'Urgences',    'Key',           3),
  ('Chauffagiste',              'chauffagiste',         'Installation et entretien de chaudières, pompes à chaleur.',                     true, 'Chauffage',   'Flame',         4),
  ('Peintre en bâtiment',       'peintre-en-batiment',  'Peinture intérieure et extérieure, ravalement de façade.',                      true, 'Finitions',   'PaintBucket',   5),
  ('Menuisier',                 'menuisier',            'Fabrication et pose de menuiseries, escaliers, placards.',                       true, 'Bâtiment',    'Hammer',        6),
  ('Carreleur',                 'carreleur',            'Pose de carrelage, faïence, mosaïque.',                                         true, 'Finitions',   'Grid3X3',       7),
  ('Couvreur',                  'couvreur',             'Réparation et rénovation de toiture, zinguerie.',                                true, 'Bâtiment',    'Home',          8),
  ('Maçon',                     'macon',                'Construction, rénovation, extension de maison.',                                 true, 'Bâtiment',    'Blocks',        9),
  ('Jardinier',                 'jardinier',            'Entretien de jardin, taille, élagage.',                                         true, 'Extérieur',   'TreeDeciduous', 10),
  ('Vitrier',                   'vitrier',              'Remplacement de vitres, double vitrage, miroirs.',                               true, 'Bâtiment',    'Square',        11),
  ('Climaticien',               'climaticien',          'Installation et entretien de climatisation, réversible.',                        true, 'Chauffage',   'Wind',          12),
  ('Cuisiniste',                'cuisiniste',           'Conception, fabrication et installation de cuisines sur mesure.',                 true, 'Aménagement', 'ChefHat',       13),
  ('Solier',                    'solier',               'Pose de revêtements de sols : parquet, moquette, lino, carrelage souple.',       true, 'Finitions',   'Layers',        14),
  ('Nettoyage',                 'nettoyage',            'Nettoyage professionnel, ménage, entretien de locaux.',                          true, 'Services',    'Sparkles',      15)
ON CONFLICT (slug) DO UPDATE SET
  category   = EXCLUDED.category,
  icon       = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order;

-- ============================================================================
-- 5. INDEX SUR CATEGORY
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_services_sort ON services(sort_order);
