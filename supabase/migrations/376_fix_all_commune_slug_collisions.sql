-- Fix ALL commune slug collisions: bare slug → france.ts city, others → dept-suffixed
-- Generated from france.ts + insee-communes.json (same pattern as migration 367).
-- Each UPDATE uses code_insee for safety — never matches wrong communes.

BEGIN;

-- saint-denis: bare slug → dept 93 (INSEE 93066)
UPDATE communes SET slug = 'saint-denis-11' WHERE code_insee = '11339' AND slug = 'saint-denis';
UPDATE communes SET slug = 'saint-denis-30' WHERE code_insee = '30247' AND slug = 'saint-denis';
UPDATE communes SET slug = 'saint-denis-974' WHERE code_insee = '97411' AND slug = 'saint-denis';
UPDATE communes SET slug = 'saint-denis' WHERE code_insee = '93066' AND slug = 'saint-denis-93';

-- montreuil: bare slug → dept 93 (INSEE 93048)
UPDATE communes SET slug = 'montreuil-28' WHERE code_insee = '28267' AND slug = 'montreuil';
UPDATE communes SET slug = 'montreuil-85' WHERE code_insee = '85148' AND slug = 'montreuil';
UPDATE communes SET slug = 'montreuil' WHERE code_insee = '93048' AND slug = 'montreuil-93';

-- saint-paul: bare slug → dept 974 (INSEE 97415)
UPDATE communes SET slug = 'saint-paul-19' WHERE code_insee = '19235' AND slug = 'saint-paul';
UPDATE communes SET slug = 'saint-paul-33' WHERE code_insee = '33458' AND slug = 'saint-paul';
UPDATE communes SET slug = 'saint-paul-60' WHERE code_insee = '60591' AND slug = 'saint-paul';
UPDATE communes SET slug = 'saint-paul-61' WHERE code_insee = '61443' AND slug = 'saint-paul';
UPDATE communes SET slug = 'saint-paul-65' WHERE code_insee = '65394' AND slug = 'saint-paul';
UPDATE communes SET slug = 'saint-paul-87' WHERE code_insee = '87174' AND slug = 'saint-paul';
UPDATE communes SET slug = 'saint-paul-88' WHERE code_insee = '88431' AND slug = 'saint-paul';
UPDATE communes SET slug = 'saint-paul' WHERE code_insee = '97415' AND slug = 'saint-paul-974';

-- saint-pierre: bare slug → dept 974 (INSEE 97416)
UPDATE communes SET slug = 'saint-pierre-15' WHERE code_insee = '15206' AND slug = 'saint-pierre';
UPDATE communes SET slug = 'saint-pierre-31' WHERE code_insee = '31511' AND slug = 'saint-pierre';
UPDATE communes SET slug = 'saint-pierre-39' WHERE code_insee = '39494' AND slug = 'saint-pierre';
UPDATE communes SET slug = 'saint-pierre-51' WHERE code_insee = '51509' AND slug = 'saint-pierre';
UPDATE communes SET slug = 'saint-pierre-67' WHERE code_insee = '67429' AND slug = 'saint-pierre';
UPDATE communes SET slug = 'saint-pierre-972' WHERE code_insee = '97225' AND slug = 'saint-pierre';
UPDATE communes SET slug = 'saint-pierre-975' WHERE code_insee = '97502' AND slug = 'saint-pierre';
UPDATE communes SET slug = 'saint-pierre-04' WHERE code_insee = '04194' AND slug = 'saint-pierre';
UPDATE communes SET slug = 'saint-pierre' WHERE code_insee = '97416' AND slug = 'saint-pierre-974';

-- la-rochelle: bare slug → dept 17 (INSEE 17300)
UPDATE communes SET slug = 'la-rochelle-70' WHERE code_insee = '70450' AND slug = 'la-rochelle';
UPDATE communes SET slug = 'la-rochelle' WHERE code_insee = '17300' AND slug = 'la-rochelle-17';

-- merignac: bare slug → dept 33 (INSEE 33281)
UPDATE communes SET slug = 'merignac-16' WHERE code_insee = '16216' AND slug = 'merignac';
UPDATE communes SET slug = 'merignac-17' WHERE code_insee = '17229' AND slug = 'merignac';
UPDATE communes SET slug = 'merignac' WHERE code_insee = '33281' AND slug = 'merignac-33';

-- saint-nazaire: bare slug → dept 44 (INSEE 44184)
UPDATE communes SET slug = 'saint-nazaire-30' WHERE code_insee = '30288' AND slug = 'saint-nazaire';
UPDATE communes SET slug = 'saint-nazaire-66' WHERE code_insee = '66186' AND slug = 'saint-nazaire';
UPDATE communes SET slug = 'saint-nazaire' WHERE code_insee = '44184' AND slug = 'saint-nazaire-44';

-- valence: bare slug → dept 26 (INSEE 26362)
UPDATE communes SET slug = 'valence-16' WHERE code_insee = '16392' AND slug = 'valence';
UPDATE communes SET slug = 'valence-82' WHERE code_insee = '82186' AND slug = 'valence';
UPDATE communes SET slug = 'valence' WHERE code_insee = '26362' AND slug = 'valence-26';

-- saint-andre: bare slug → dept 974 (INSEE 97409)
UPDATE communes SET slug = 'saint-andre-31' WHERE code_insee = '31468' AND slug = 'saint-andre';
UPDATE communes SET slug = 'saint-andre-32' WHERE code_insee = '32356' AND slug = 'saint-andre';
UPDATE communes SET slug = 'saint-andre-66' WHERE code_insee = '66168' AND slug = 'saint-andre';
UPDATE communes SET slug = 'saint-andre-73' WHERE code_insee = '73223' AND slug = 'saint-andre';
UPDATE communes SET slug = 'saint-andre-81' WHERE code_insee = '81240' AND slug = 'saint-andre';
UPDATE communes SET slug = 'saint-andre' WHERE code_insee = '97409' AND slug = 'saint-andre-974';

-- saint-louis: bare slug → dept 974 (INSEE 97414)
UPDATE communes SET slug = 'saint-louis-57' WHERE code_insee = '57618' AND slug = 'saint-louis';
UPDATE communes SET slug = 'saint-louis-68' WHERE code_insee = '68297' AND slug = 'saint-louis';
UPDATE communes SET slug = 'saint-louis-971' WHERE code_insee = '97126' AND slug = 'saint-louis';
UPDATE communes SET slug = 'saint-louis' WHERE code_insee = '97414' AND slug = 'saint-louis-974';

-- chelles: bare slug → dept 77 (INSEE 77108)
UPDATE communes SET slug = 'chelles-60' WHERE code_insee = '60145' AND slug = 'chelles';
UPDATE communes SET slug = 'chelles' WHERE code_insee = '77108' AND slug = 'chelles-77';

-- massy: bare slug → dept 91 (INSEE 91377)
UPDATE communes SET slug = 'massy-76' WHERE code_insee = '76415' AND slug = 'massy';
UPDATE communes SET slug = 'massy' WHERE code_insee = '91377' AND slug = 'massy-91';

-- saint-priest: bare slug → dept 69 (INSEE 69290)
UPDATE communes SET slug = 'saint-priest-23' WHERE code_insee = '23234' AND slug = 'saint-priest';
UPDATE communes SET slug = 'saint-priest-07' WHERE code_insee = '07288' AND slug = 'saint-priest';
UPDATE communes SET slug = 'saint-priest' WHERE code_insee = '69290' AND slug = 'saint-priest-69';

-- bagneux: bare slug → dept 92 (INSEE 92007)
UPDATE communes SET slug = 'bagneux-36' WHERE code_insee = '36011' AND slug = 'bagneux';
UPDATE communes SET slug = 'bagneux-51' WHERE code_insee = '51032' AND slug = 'bagneux';
UPDATE communes SET slug = 'bagneux-54' WHERE code_insee = '54041' AND slug = 'bagneux';
UPDATE communes SET slug = 'bagneux-02' WHERE code_insee = '02043' AND slug = 'bagneux';
UPDATE communes SET slug = 'bagneux-03' WHERE code_insee = '03015' AND slug = 'bagneux';
UPDATE communes SET slug = 'bagneux' WHERE code_insee = '92007' AND slug = 'bagneux-92';

-- castres: bare slug → dept 81 (INSEE 81065)
UPDATE communes SET slug = 'castres-02' WHERE code_insee = '02142' AND slug = 'castres';
UPDATE communes SET slug = 'castres' WHERE code_insee = '81065' AND slug = 'castres-81';

-- villepinte: bare slug → dept 93 (INSEE 93078)
UPDATE communes SET slug = 'villepinte-11' WHERE code_insee = '11434' AND slug = 'villepinte';
UPDATE communes SET slug = 'villepinte' WHERE code_insee = '93078' AND slug = 'villepinte-93';

-- saint-joseph: bare slug → dept 974 (INSEE 97412)
UPDATE communes SET slug = 'saint-joseph-42' WHERE code_insee = '42242' AND slug = 'saint-joseph';
UPDATE communes SET slug = 'saint-joseph-50' WHERE code_insee = '50498' AND slug = 'saint-joseph';
UPDATE communes SET slug = 'saint-joseph-972' WHERE code_insee = '97224' AND slug = 'saint-joseph';
UPDATE communes SET slug = 'saint-joseph' WHERE code_insee = '97412' AND slug = 'saint-joseph-974';

-- saint-benoit: bare slug → dept 974 (INSEE 97410)
UPDATE communes SET slug = 'saint-benoit-11' WHERE code_insee = '11333' AND slug = 'saint-benoit';
UPDATE communes SET slug = 'saint-benoit-86' WHERE code_insee = '86214' AND slug = 'saint-benoit';
UPDATE communes SET slug = 'saint-benoit-04' WHERE code_insee = '04174' AND slug = 'saint-benoit';
UPDATE communes SET slug = 'saint-benoit' WHERE code_insee = '97410' AND slug = 'saint-benoit-974';

-- franconville: bare slug → dept 95 (INSEE 95252)
UPDATE communes SET slug = 'franconville-54' WHERE code_insee = '54209' AND slug = 'franconville';
UPDATE communes SET slug = 'franconville' WHERE code_insee = '95252' AND slug = 'franconville-95';

-- saint-raphael: bare slug → dept 83 (INSEE 83118)
UPDATE communes SET slug = 'saint-raphael-24' WHERE code_insee = '24493' AND slug = 'saint-raphael';
UPDATE communes SET slug = 'saint-raphael' WHERE code_insee = '83118' AND slug = 'saint-raphael-83';

-- sainte-marie: bare slug → dept 974 (INSEE 97418)
UPDATE communes SET slug = 'sainte-marie-15' WHERE code_insee = '15198' AND slug = 'sainte-marie';
UPDATE communes SET slug = 'sainte-marie-25' WHERE code_insee = '25523' AND slug = 'sainte-marie';
UPDATE communes SET slug = 'sainte-marie-32' WHERE code_insee = '32388' AND slug = 'sainte-marie';
UPDATE communes SET slug = 'sainte-marie-35' WHERE code_insee = '35294' AND slug = 'sainte-marie';
UPDATE communes SET slug = 'sainte-marie-58' WHERE code_insee = '58253' AND slug = 'sainte-marie';
UPDATE communes SET slug = 'sainte-marie-65' WHERE code_insee = '65391' AND slug = 'sainte-marie';
UPDATE communes SET slug = 'sainte-marie-972' WHERE code_insee = '97228' AND slug = 'sainte-marie';
UPDATE communes SET slug = 'sainte-marie-08' WHERE code_insee = '08390' AND slug = 'sainte-marie';
UPDATE communes SET slug = 'sainte-marie' WHERE code_insee = '97418' AND slug = 'sainte-marie-974';

-- vitrolles: bare slug → dept 13 (INSEE 13117)
UPDATE communes SET slug = 'vitrolles-05' WHERE code_insee = '05184' AND slug = 'vitrolles';
UPDATE communes SET slug = 'vitrolles' WHERE code_insee = '13117' AND slug = 'vitrolles-13';

-- chatillon: bare slug → dept 92 (INSEE 92020)
UPDATE communes SET slug = 'chatillon-39' WHERE code_insee = '39122' AND slug = 'chatillon';
UPDATE communes SET slug = 'chatillon-69' WHERE code_insee = '69050' AND slug = 'chatillon';
UPDATE communes SET slug = 'chatillon-03' WHERE code_insee = '03069' AND slug = 'chatillon';
UPDATE communes SET slug = 'chatillon' WHERE code_insee = '92020' AND slug = 'chatillon-92';

-- sainte-genevieve-des-bois: bare slug → dept 91 (INSEE 91549)
UPDATE communes SET slug = 'sainte-genevieve-des-bois-45' WHERE code_insee = '45278' AND slug = 'sainte-genevieve-des-bois';
UPDATE communes SET slug = 'sainte-genevieve-des-bois' WHERE code_insee = '91549' AND slug = 'sainte-genevieve-des-bois-91';

-- le-port: bare slug → dept 974 (INSEE 97407)
UPDATE communes SET slug = 'le-port-09' WHERE code_insee = '09231' AND slug = 'le-port';
UPDATE communes SET slug = 'le-port' WHERE code_insee = '97407' AND slug = 'le-port-974';

-- goussainville: bare slug → dept 95 (INSEE 95280)
UPDATE communes SET slug = 'goussainville-28' WHERE code_insee = '28185' AND slug = 'goussainville';
UPDATE communes SET slug = 'goussainville' WHERE code_insee = '95280' AND slug = 'goussainville-95';

-- saint-martin: bare slug → dept 978 (INSEE 97801)
UPDATE communes SET slug = 'saint-martin-32' WHERE code_insee = '32389' AND slug = 'saint-martin';
UPDATE communes SET slug = 'saint-martin-54' WHERE code_insee = '54480' AND slug = 'saint-martin';
UPDATE communes SET slug = 'saint-martin-65' WHERE code_insee = '65392' AND slug = 'saint-martin';
UPDATE communes SET slug = 'saint-martin-67' WHERE code_insee = '67426' AND slug = 'saint-martin';
UPDATE communes SET slug = 'saint-martin' WHERE code_insee = '97801' AND slug = 'saint-martin-978';

-- fresnes: bare slug → dept 94 (INSEE 94034)
UPDATE communes SET slug = 'fresnes-21' WHERE code_insee = '21287' AND slug = 'fresnes';
UPDATE communes SET slug = 'fresnes-41' WHERE code_insee = '41094' AND slug = 'fresnes';
UPDATE communes SET slug = 'fresnes-89' WHERE code_insee = '89183' AND slug = 'fresnes';
UPDATE communes SET slug = 'fresnes' WHERE code_insee = '94034' AND slug = 'fresnes-94';

-- grigny: bare slug → dept 91 (INSEE 91286)
UPDATE communes SET slug = 'grigny-62' WHERE code_insee = '62388' AND slug = 'grigny';
UPDATE communes SET slug = 'grigny' WHERE code_insee = '91286' AND slug = 'grigny-91';

-- la-garde: bare slug → dept 83 (INSEE 83062)
UPDATE communes SET slug = 'la-garde-38' WHERE code_insee = '38177' AND slug = 'la-garde';
UPDATE communes SET slug = 'la-garde-04' WHERE code_insee = '04092' AND slug = 'la-garde';
UPDATE communes SET slug = 'la-garde' WHERE code_insee = '83062' AND slug = 'la-garde-83';

-- sainte-suzanne: bare slug → dept 974 (INSEE 97420)
UPDATE communes SET slug = 'sainte-suzanne-25' WHERE code_insee = '25526' AND slug = 'sainte-suzanne';
UPDATE communes SET slug = 'sainte-suzanne-09' WHERE code_insee = '09342' AND slug = 'sainte-suzanne';
UPDATE communes SET slug = 'sainte-suzanne' WHERE code_insee = '97420' AND slug = 'sainte-suzanne-974';

-- vernon: bare slug → dept 27 (INSEE 27681)
UPDATE communes SET slug = 'vernon-86' WHERE code_insee = '86284' AND slug = 'vernon';
UPDATE communes SET slug = 'vernon-07' WHERE code_insee = '07336' AND slug = 'vernon';
UPDATE communes SET slug = 'vernon' WHERE code_insee = '27681' AND slug = 'vernon-27';

-- sainte-anne: bare slug → dept 971 (INSEE 97128)
UPDATE communes SET slug = 'sainte-anne-25' WHERE code_insee = '25513' AND slug = 'sainte-anne';
UPDATE communes SET slug = 'sainte-anne-32' WHERE code_insee = '32357' AND slug = 'sainte-anne';
UPDATE communes SET slug = 'sainte-anne-41' WHERE code_insee = '41200' AND slug = 'sainte-anne';
UPDATE communes SET slug = 'sainte-anne-972' WHERE code_insee = '97226' AND slug = 'sainte-anne';
UPDATE communes SET slug = 'sainte-anne' WHERE code_insee = '97128' AND slug = 'sainte-anne-971';

-- olivet: bare slug → dept 45 (INSEE 45232)
UPDATE communes SET slug = 'olivet-53' WHERE code_insee = '53169' AND slug = 'olivet';
UPDATE communes SET slug = 'olivet' WHERE code_insee = '45232' AND slug = 'olivet-45';

-- rochefort: bare slug → dept 17 (INSEE 17299)
UPDATE communes SET slug = 'rochefort-73' WHERE code_insee = '73214' AND slug = 'rochefort';
UPDATE communes SET slug = 'rochefort' WHERE code_insee = '17299' AND slug = 'rochefort-17';

-- torcy: bare slug → dept 77 (INSEE 77468)
UPDATE communes SET slug = 'torcy-62' WHERE code_insee = '62823' AND slug = 'torcy';
UPDATE communes SET slug = 'torcy-71' WHERE code_insee = '71540' AND slug = 'torcy';
UPDATE communes SET slug = 'torcy' WHERE code_insee = '77468' AND slug = 'torcy-77';

-- acheres: bare slug → dept 78 (INSEE 78005)
UPDATE communes SET slug = 'acheres-18' WHERE code_insee = '18001' AND slug = 'acheres';
UPDATE communes SET slug = 'acheres' WHERE code_insee = '78005' AND slug = 'acheres-78';

-- fontaine: bare slug → dept 38 (INSEE 38169)
UPDATE communes SET slug = 'fontaine-10' WHERE code_insee = '10150' AND slug = 'fontaine';
UPDATE communes SET slug = 'fontaine-90' WHERE code_insee = '90047' AND slug = 'fontaine';
UPDATE communes SET slug = 'fontaine' WHERE code_insee = '38169' AND slug = 'fontaine-38';

-- saint-gratien: bare slug → dept 95 (INSEE 95555)
UPDATE communes SET slug = 'saint-gratien-80' WHERE code_insee = '80704' AND slug = 'saint-gratien';
UPDATE communes SET slug = 'saint-gratien' WHERE code_insee = '95555' AND slug = 'saint-gratien-95';

-- chaumont: bare slug → dept 52 (INSEE 52121)
UPDATE communes SET slug = 'chaumont-18' WHERE code_insee = '18060' AND slug = 'chaumont';
UPDATE communes SET slug = 'chaumont-61' WHERE code_insee = '61103' AND slug = 'chaumont';
UPDATE communes SET slug = 'chaumont-74' WHERE code_insee = '74065' AND slug = 'chaumont';
UPDATE communes SET slug = 'chaumont-89' WHERE code_insee = '89093' AND slug = 'chaumont';
UPDATE communes SET slug = 'chaumont' WHERE code_insee = '52121' AND slug = 'chaumont-52';

-- maurepas: bare slug → dept 78 (INSEE 78383)
UPDATE communes SET slug = 'maurepas-80' WHERE code_insee = '80521' AND slug = 'maurepas';
UPDATE communes SET slug = 'maurepas' WHERE code_insee = '78383' AND slug = 'maurepas-78';

-- croix: bare slug → dept 59 (INSEE 59163)
UPDATE communes SET slug = 'croix-90' WHERE code_insee = '90030' AND slug = 'croix';
UPDATE communes SET slug = 'croix' WHERE code_insee = '59163' AND slug = 'croix-59';

-- moulins: bare slug → dept 03 (INSEE 03190)
UPDATE communes SET slug = 'moulins-35' WHERE code_insee = '35198' AND slug = 'moulins';
UPDATE communes SET slug = 'moulins-02' WHERE code_insee = '02530' AND slug = 'moulins';
UPDATE communes SET slug = 'moulins' WHERE code_insee = '03190' AND slug = 'moulins-03';

-- le-pontet: bare slug → dept 84 (INSEE 84092)
UPDATE communes SET slug = 'le-pontet-73' WHERE code_insee = '73205' AND slug = 'le-pontet';
UPDATE communes SET slug = 'le-pontet' WHERE code_insee = '84092' AND slug = 'le-pontet-84';

-- floirac: bare slug → dept 33 (INSEE 33167)
UPDATE communes SET slug = 'floirac-17' WHERE code_insee = '17160' AND slug = 'floirac';
UPDATE communes SET slug = 'floirac-46' WHERE code_insee = '46106' AND slug = 'floirac';
UPDATE communes SET slug = 'floirac' WHERE code_insee = '33167' AND slug = 'floirac-33';

-- sainte-rose: bare slug → dept 971 (INSEE 97129)
UPDATE communes SET slug = 'sainte-rose-974' WHERE code_insee = '97419' AND slug = 'sainte-rose';
UPDATE communes SET slug = 'sainte-rose' WHERE code_insee = '97129' AND slug = 'sainte-rose-971';

-- blanquefort: bare slug → dept 33 (INSEE 33056)
UPDATE communes SET slug = 'blanquefort-32' WHERE code_insee = '32056' AND slug = 'blanquefort';
UPDATE communes SET slug = 'blanquefort' WHERE code_insee = '33056' AND slug = 'blanquefort-33';

-- verdun: bare slug → dept 55 (INSEE 55545)
UPDATE communes SET slug = 'verdun-09' WHERE code_insee = '09328' AND slug = 'verdun';
UPDATE communes SET slug = 'verdun' WHERE code_insee = '55545' AND slug = 'verdun-55';

-- bois-d-arcy: bare slug → dept 78 (INSEE 78073)
UPDATE communes SET slug = 'bois-d-arcy-89' WHERE code_insee = '89049' AND slug = 'bois-d-arcy';
UPDATE communes SET slug = 'bois-d-arcy' WHERE code_insee = '78073' AND slug = 'bois-d-arcy-78';

-- rumilly: bare slug → dept 74 (INSEE 74225)
UPDATE communes SET slug = 'rumilly-62' WHERE code_insee = '62729' AND slug = 'rumilly';
UPDATE communes SET slug = 'rumilly' WHERE code_insee = '74225' AND slug = 'rumilly-74';

-- beaucaire: bare slug → dept 30 (INSEE 30032)
UPDATE communes SET slug = 'beaucaire-32' WHERE code_insee = '32035' AND slug = 'beaucaire';
UPDATE communes SET slug = 'beaucaire' WHERE code_insee = '30032' AND slug = 'beaucaire-30';

-- francheville: bare slug → dept 69 (INSEE 69089)
UPDATE communes SET slug = 'francheville-21' WHERE code_insee = '21284' AND slug = 'francheville';
UPDATE communes SET slug = 'francheville-39' WHERE code_insee = '39236' AND slug = 'francheville';
UPDATE communes SET slug = 'francheville-51' WHERE code_insee = '51259' AND slug = 'francheville';
UPDATE communes SET slug = 'francheville-54' WHERE code_insee = '54208' AND slug = 'francheville';
UPDATE communes SET slug = 'francheville-61' WHERE code_insee = '61176' AND slug = 'francheville';
UPDATE communes SET slug = 'francheville' WHERE code_insee = '69089' AND slug = 'francheville-69';

-- avrille: bare slug → dept 49 (INSEE 49015)
UPDATE communes SET slug = 'avrille-85' WHERE code_insee = '85010' AND slug = 'avrille';
UPDATE communes SET slug = 'avrille' WHERE code_insee = '49015' AND slug = 'avrille-49';

-- senlis: bare slug → dept 60 (INSEE 60612)
UPDATE communes SET slug = 'senlis-62' WHERE code_insee = '62790' AND slug = 'senlis';
UPDATE communes SET slug = 'senlis' WHERE code_insee = '60612' AND slug = 'senlis-60';

-- saint-gilles: bare slug → dept 30 (INSEE 30258)
UPDATE communes SET slug = 'saint-gilles-35' WHERE code_insee = '35275' AND slug = 'saint-gilles';
UPDATE communes SET slug = 'saint-gilles-36' WHERE code_insee = '36196' AND slug = 'saint-gilles';
UPDATE communes SET slug = 'saint-gilles-50' WHERE code_insee = '50483' AND slug = 'saint-gilles';
UPDATE communes SET slug = 'saint-gilles-51' WHERE code_insee = '51484' AND slug = 'saint-gilles';
UPDATE communes SET slug = 'saint-gilles-71' WHERE code_insee = '71425' AND slug = 'saint-gilles';
UPDATE communes SET slug = 'saint-gilles' WHERE code_insee = '30258' AND slug = 'saint-gilles-30';

-- bailleul: bare slug → dept 59 (INSEE 59043)
UPDATE communes SET slug = 'bailleul-61' WHERE code_insee = '61023' AND slug = 'bailleul';
UPDATE communes SET slug = 'bailleul-80' WHERE code_insee = '80051' AND slug = 'bailleul';
UPDATE communes SET slug = 'bailleul' WHERE code_insee = '59043' AND slug = 'bailleul-59';

-- saint-maurice: bare slug → dept 94 (INSEE 94069)
UPDATE communes SET slug = 'saint-maurice-52' WHERE code_insee = '52453' AND slug = 'saint-maurice';
UPDATE communes SET slug = 'saint-maurice-58' WHERE code_insee = '58257' AND slug = 'saint-maurice';
UPDATE communes SET slug = 'saint-maurice-63' WHERE code_insee = '63378' AND slug = 'saint-maurice';
UPDATE communes SET slug = 'saint-maurice-67' WHERE code_insee = '67427' AND slug = 'saint-maurice';
UPDATE communes SET slug = 'saint-maurice' WHERE code_insee = '94069' AND slug = 'saint-maurice-94';

-- flers: bare slug → dept 61 (INSEE 61169)
UPDATE communes SET slug = 'flers-62' WHERE code_insee = '62337' AND slug = 'flers';
UPDATE communes SET slug = 'flers-80' WHERE code_insee = '80314' AND slug = 'flers';
UPDATE communes SET slug = 'flers' WHERE code_insee = '61169' AND slug = 'flers-61';

-- saint-omer: bare slug → dept 62 (INSEE 62765)
UPDATE communes SET slug = 'saint-omer-14' WHERE code_insee = '14635' AND slug = 'saint-omer';
UPDATE communes SET slug = 'saint-omer' WHERE code_insee = '62765' AND slug = 'saint-omer-62';

-- morangis: bare slug → dept 91 (INSEE 91432)
UPDATE communes SET slug = 'morangis-51' WHERE code_insee = '51384' AND slug = 'morangis';
UPDATE communes SET slug = 'morangis' WHERE code_insee = '91432' AND slug = 'morangis-91';

-- lieusaint: bare slug → dept 77 (INSEE 77251)
UPDATE communes SET slug = 'lieusaint-50' WHERE code_insee = '50270' AND slug = 'lieusaint';
UPDATE communes SET slug = 'lieusaint' WHERE code_insee = '77251' AND slug = 'lieusaint-77';

-- avon: bare slug → dept 77 (INSEE 77014)
UPDATE communes SET slug = 'avon-79' WHERE code_insee = '79023' AND slug = 'avon';
UPDATE communes SET slug = 'avon' WHERE code_insee = '77014' AND slug = 'avon-77';

-- amilly: bare slug → dept 45 (INSEE 45004)
UPDATE communes SET slug = 'amilly-28' WHERE code_insee = '28006' AND slug = 'amilly';
UPDATE communes SET slug = 'amilly' WHERE code_insee = '45004' AND slug = 'amilly-45';

-- bonneville: bare slug → dept 74 (INSEE 74042)
UPDATE communes SET slug = 'bonneville-80' WHERE code_insee = '80113' AND slug = 'bonneville';
UPDATE communes SET slug = 'bonneville' WHERE code_insee = '74042' AND slug = 'bonneville-74';

-- vernouillet: bare slug → dept 28 (INSEE 28404)
UPDATE communes SET slug = 'vernouillet-78' WHERE code_insee = '78643' AND slug = 'vernouillet';
UPDATE communes SET slug = 'vernouillet' WHERE code_insee = '28404' AND slug = 'vernouillet-28';

-- saint-cyprien: bare slug → dept 66 (INSEE 66171)
UPDATE communes SET slug = 'saint-cyprien-19' WHERE code_insee = '19195' AND slug = 'saint-cyprien';
UPDATE communes SET slug = 'saint-cyprien-24' WHERE code_insee = '24396' AND slug = 'saint-cyprien';
UPDATE communes SET slug = 'saint-cyprien-42' WHERE code_insee = '42211' AND slug = 'saint-cyprien';
UPDATE communes SET slug = 'saint-cyprien' WHERE code_insee = '66171' AND slug = 'saint-cyprien-66';

-- cernay: bare slug → dept 68 (INSEE 68063)
UPDATE communes SET slug = 'cernay-14' WHERE code_insee = '14147' AND slug = 'cernay';
UPDATE communes SET slug = 'cernay-28' WHERE code_insee = '28067' AND slug = 'cernay';
UPDATE communes SET slug = 'cernay-86' WHERE code_insee = '86047' AND slug = 'cernay';
UPDATE communes SET slug = 'cernay' WHERE code_insee = '68063' AND slug = 'cernay-68';

-- marly: bare slug → dept 59 (INSEE 59383)
UPDATE communes SET slug = 'marly-57' WHERE code_insee = '57447' AND slug = 'marly';
UPDATE communes SET slug = 'marly' WHERE code_insee = '59383' AND slug = 'marly-59';

-- pace: bare slug → dept 35 (INSEE 35210)
UPDATE communes SET slug = 'pace-61' WHERE code_insee = '61321' AND slug = 'pace';
UPDATE communes SET slug = 'pace' WHERE code_insee = '35210' AND slug = 'pace-35';

-- mericourt: bare slug → dept 62 (INSEE 62570)
UPDATE communes SET slug = 'mericourt-78' WHERE code_insee = '78391' AND slug = 'mericourt';
UPDATE communes SET slug = 'mericourt' WHERE code_insee = '62570' AND slug = 'mericourt-62';

-- la-trinite: bare slug → dept 972 (INSEE 97230)
UPDATE communes SET slug = 'la-trinite-27' WHERE code_insee = '27659' AND slug = 'la-trinite';
UPDATE communes SET slug = 'la-trinite-50' WHERE code_insee = '50607' AND slug = 'la-trinite';
UPDATE communes SET slug = 'la-trinite-73' WHERE code_insee = '73302' AND slug = 'la-trinite';
UPDATE communes SET slug = 'la-trinite-06' WHERE code_insee = '06149' AND slug = 'la-trinite';
UPDATE communes SET slug = 'la-trinite' WHERE code_insee = '97230' AND slug = 'la-trinite-972';

-- lavaur: bare slug → dept 81 (INSEE 81140)
UPDATE communes SET slug = 'lavaur-24' WHERE code_insee = '24232' AND slug = 'lavaur';
UPDATE communes SET slug = 'lavaur' WHERE code_insee = '81140' AND slug = 'lavaur-81';

-- passy: bare slug → dept 74 (INSEE 74208)
UPDATE communes SET slug = 'passy-71' WHERE code_insee = '71344' AND slug = 'passy';
UPDATE communes SET slug = 'passy-89' WHERE code_insee = '89291' AND slug = 'passy';
UPDATE communes SET slug = 'passy' WHERE code_insee = '74208' AND slug = 'passy-74';

-- igny: bare slug → dept 91 (INSEE 91312)
UPDATE communes SET slug = 'igny-70' WHERE code_insee = '70289' AND slug = 'igny';
UPDATE communes SET slug = 'igny' WHERE code_insee = '91312' AND slug = 'igny-91';

-- allonnes: bare slug → dept 72 (INSEE 72003)
UPDATE communes SET slug = 'allonnes-28' WHERE code_insee = '28004' AND slug = 'allonnes';
UPDATE communes SET slug = 'allonnes-49' WHERE code_insee = '49002' AND slug = 'allonnes';
UPDATE communes SET slug = 'allonnes' WHERE code_insee = '72003' AND slug = 'allonnes-72';

-- beaumont: bare slug → dept 63 (INSEE 63032)
UPDATE communes SET slug = 'beaumont-19' WHERE code_insee = '19020' AND slug = 'beaumont';
UPDATE communes SET slug = 'beaumont-32' WHERE code_insee = '32037' AND slug = 'beaumont';
UPDATE communes SET slug = 'beaumont-43' WHERE code_insee = '43022' AND slug = 'beaumont';
UPDATE communes SET slug = 'beaumont-54' WHERE code_insee = '54057' AND slug = 'beaumont';
UPDATE communes SET slug = 'beaumont-74' WHERE code_insee = '74031' AND slug = 'beaumont';
UPDATE communes SET slug = 'beaumont-89' WHERE code_insee = '89031' AND slug = 'beaumont';
UPDATE communes SET slug = 'beaumont-07' WHERE code_insee = '07029' AND slug = 'beaumont';
UPDATE communes SET slug = 'beaumont' WHERE code_insee = '63032' AND slug = 'beaumont-63';

-- saint-barthelemy: bare slug → dept 977 (INSEE 97701)
UPDATE communes SET slug = 'saint-barthelemy-38' WHERE code_insee = '38363' AND slug = 'saint-barthelemy';
UPDATE communes SET slug = 'saint-barthelemy-40' WHERE code_insee = '40251' AND slug = 'saint-barthelemy';
UPDATE communes SET slug = 'saint-barthelemy-50' WHERE code_insee = '50450' AND slug = 'saint-barthelemy';
UPDATE communes SET slug = 'saint-barthelemy-56' WHERE code_insee = '56207' AND slug = 'saint-barthelemy';
UPDATE communes SET slug = 'saint-barthelemy-70' WHERE code_insee = '70459' AND slug = 'saint-barthelemy';
UPDATE communes SET slug = 'saint-barthelemy-77' WHERE code_insee = '77402' AND slug = 'saint-barthelemy';
UPDATE communes SET slug = 'saint-barthelemy' WHERE code_insee = '97701' AND slug = 'saint-barthelemy-977';

-- hericourt: bare slug → dept 70 (INSEE 70285)
UPDATE communes SET slug = 'hericourt-62' WHERE code_insee = '62433' AND slug = 'hericourt';
UPDATE communes SET slug = 'hericourt' WHERE code_insee = '70285' AND slug = 'hericourt-70';

-- clermont: bare slug → dept 60 (INSEE 60157)
UPDATE communes SET slug = 'clermont-40' WHERE code_insee = '40084' AND slug = 'clermont';
UPDATE communes SET slug = 'clermont-74' WHERE code_insee = '74078' AND slug = 'clermont';
UPDATE communes SET slug = 'clermont-09' WHERE code_insee = '09097' AND slug = 'clermont';
UPDATE communes SET slug = 'clermont' WHERE code_insee = '60157' AND slug = 'clermont-60';

-- auterive: bare slug → dept 31 (INSEE 31033)
UPDATE communes SET slug = 'auterive-32' WHERE code_insee = '32019' AND slug = 'auterive';
UPDATE communes SET slug = 'auterive-82' WHERE code_insee = '82006' AND slug = 'auterive';
UPDATE communes SET slug = 'auterive' WHERE code_insee = '31033' AND slug = 'auterive-31';

-- mondeville: bare slug → dept 14 (INSEE 14437)
UPDATE communes SET slug = 'mondeville-91' WHERE code_insee = '91412' AND slug = 'mondeville';
UPDATE communes SET slug = 'mondeville' WHERE code_insee = '14437' AND slug = 'mondeville-14';

-- arue: bare slug → dept 987 (INSEE 98712)
UPDATE communes SET slug = 'arue-40' WHERE code_insee = '40014' AND slug = 'arue';
UPDATE communes SET slug = 'arue' WHERE code_insee = '98712' AND slug = 'arue-987';

-- buxerolles: bare slug → dept 86 (INSEE 86041)
UPDATE communes SET slug = 'buxerolles-21' WHERE code_insee = '21123' AND slug = 'buxerolles';
UPDATE communes SET slug = 'buxerolles' WHERE code_insee = '86041' AND slug = 'buxerolles-86';

-- saint-claude: bare slug → dept 971 (INSEE 97124)
UPDATE communes SET slug = 'saint-claude-39' WHERE code_insee = '39478' AND slug = 'saint-claude';
UPDATE communes SET slug = 'saint-claude' WHERE code_insee = '97124' AND slug = 'saint-claude-971';

-- saint-pierre-du-mont: bare slug → dept 40 (INSEE 40281)
UPDATE communes SET slug = 'saint-pierre-du-mont-14' WHERE code_insee = '14652' AND slug = 'saint-pierre-du-mont';
UPDATE communes SET slug = 'saint-pierre-du-mont-58' WHERE code_insee = '58263' AND slug = 'saint-pierre-du-mont';
UPDATE communes SET slug = 'saint-pierre-du-mont' WHERE code_insee = '40281' AND slug = 'saint-pierre-du-mont-40';

-- saint-gregoire: bare slug → dept 35 (INSEE 35278)
UPDATE communes SET slug = 'saint-gregoire-81' WHERE code_insee = '81253' AND slug = 'saint-gregoire';
UPDATE communes SET slug = 'saint-gregoire' WHERE code_insee = '35278' AND slug = 'saint-gregoire-35';

-- merville: bare slug → dept 59 (INSEE 59400)
UPDATE communes SET slug = 'merville-31' WHERE code_insee = '31341' AND slug = 'merville';
UPDATE communes SET slug = 'merville' WHERE code_insee = '59400' AND slug = 'merville-59';

-- revel: bare slug → dept 31 (INSEE 31451)
UPDATE communes SET slug = 'revel-38' WHERE code_insee = '38334' AND slug = 'revel';
UPDATE communes SET slug = 'revel' WHERE code_insee = '31451' AND slug = 'revel-31';

-- aucamville: bare slug → dept 31 (INSEE 31022)
UPDATE communes SET slug = 'aucamville-82' WHERE code_insee = '82005' AND slug = 'aucamville';
UPDATE communes SET slug = 'aucamville' WHERE code_insee = '31022' AND slug = 'aucamville-31';

-- l-isle-jourdain: bare slug → dept 32 (INSEE 32160)
UPDATE communes SET slug = 'l-isle-jourdain-86' WHERE code_insee = '86112' AND slug = 'l-isle-jourdain';
UPDATE communes SET slug = 'l-isle-jourdain' WHERE code_insee = '32160' AND slug = 'l-isle-jourdain-32';

-- arques: bare slug → dept 62 (INSEE 62040)
UPDATE communes SET slug = 'arques-11' WHERE code_insee = '11015' AND slug = 'arques';
UPDATE communes SET slug = 'arques-12' WHERE code_insee = '12010' AND slug = 'arques';
UPDATE communes SET slug = 'arques' WHERE code_insee = '62040' AND slug = 'arques-62';

-- sainte-luce: bare slug → dept 972 (INSEE 97227)
UPDATE communes SET slug = 'sainte-luce-38' WHERE code_insee = '38414' AND slug = 'sainte-luce';
UPDATE communes SET slug = 'sainte-luce' WHERE code_insee = '97227' AND slug = 'sainte-luce-972';

-- mont-saint-martin: bare slug → dept 54 (INSEE 54382)
UPDATE communes SET slug = 'mont-saint-martin-38' WHERE code_insee = '38258' AND slug = 'mont-saint-martin';
UPDATE communes SET slug = 'mont-saint-martin-02' WHERE code_insee = '02523' AND slug = 'mont-saint-martin';
UPDATE communes SET slug = 'mont-saint-martin-08' WHERE code_insee = '08308' AND slug = 'mont-saint-martin';
UPDATE communes SET slug = 'mont-saint-martin' WHERE code_insee = '54382' AND slug = 'mont-saint-martin-54';

-- le-passage: bare slug → dept 47 (INSEE 47201)
UPDATE communes SET slug = 'le-passage-38' WHERE code_insee = '38296' AND slug = 'le-passage';
UPDATE communes SET slug = 'le-passage' WHERE code_insee = '47201' AND slug = 'le-passage-47';

-- ussel: bare slug → dept 19 (INSEE 19275)
UPDATE communes SET slug = 'ussel-15' WHERE code_insee = '15244' AND slug = 'ussel';
UPDATE communes SET slug = 'ussel-46' WHERE code_insee = '46323' AND slug = 'ussel';
UPDATE communes SET slug = 'ussel' WHERE code_insee = '19275' AND slug = 'ussel-19';

-- breuillet: bare slug → dept 91 (INSEE 91105)
UPDATE communes SET slug = 'breuillet-17' WHERE code_insee = '17064' AND slug = 'breuillet';
UPDATE communes SET slug = 'breuillet' WHERE code_insee = '91105' AND slug = 'breuillet-91';

-- les-angles: bare slug → dept 30 (INSEE 30011)
UPDATE communes SET slug = 'les-angles-65' WHERE code_insee = '65011' AND slug = 'les-angles';
UPDATE communes SET slug = 'les-angles-66' WHERE code_insee = '66004' AND slug = 'les-angles';
UPDATE communes SET slug = 'les-angles' WHERE code_insee = '30011' AND slug = 'les-angles-30';

-- perigny: bare slug → dept 17 (INSEE 17274)
UPDATE communes SET slug = 'perigny-14' WHERE code_insee = '14496' AND slug = 'perigny';
UPDATE communes SET slug = 'perigny-41' WHERE code_insee = '41174' AND slug = 'perigny';
UPDATE communes SET slug = 'perigny-94' WHERE code_insee = '94056' AND slug = 'perigny';
UPDATE communes SET slug = 'perigny-03' WHERE code_insee = '03205' AND slug = 'perigny';
UPDATE communes SET slug = 'perigny' WHERE code_insee = '17274' AND slug = 'perigny-17';

-- roussillon: bare slug → dept 38 (INSEE 38344)
UPDATE communes SET slug = 'roussillon-84' WHERE code_insee = '84102' AND slug = 'roussillon';
UPDATE communes SET slug = 'roussillon' WHERE code_insee = '38344' AND slug = 'roussillon-38';

-- rouvroy: bare slug → dept 62 (INSEE 62724)
UPDATE communes SET slug = 'rouvroy-02' WHERE code_insee = '02659' AND slug = 'rouvroy';
UPDATE communes SET slug = 'rouvroy' WHERE code_insee = '62724' AND slug = 'rouvroy-62';

-- saint-vallier: bare slug → dept 71 (INSEE 71486)
UPDATE communes SET slug = 'saint-vallier-16' WHERE code_insee = '16357' AND slug = 'saint-vallier';
UPDATE communes SET slug = 'saint-vallier-26' WHERE code_insee = '26333' AND slug = 'saint-vallier';
UPDATE communes SET slug = 'saint-vallier-88' WHERE code_insee = '88437' AND slug = 'saint-vallier';
UPDATE communes SET slug = 'saint-vallier' WHERE code_insee = '71486' AND slug = 'saint-vallier-71';

-- bassens: bare slug → dept 33 (INSEE 33032)
UPDATE communes SET slug = 'bassens-73' WHERE code_insee = '73031' AND slug = 'bassens';
UPDATE communes SET slug = 'bassens' WHERE code_insee = '33032' AND slug = 'bassens-33';

-- marseillan: bare slug → dept 34 (INSEE 34150)
UPDATE communes SET slug = 'marseillan-32' WHERE code_insee = '32238' AND slug = 'marseillan';
UPDATE communes SET slug = 'marseillan-65' WHERE code_insee = '65301' AND slug = 'marseillan';
UPDATE communes SET slug = 'marseillan' WHERE code_insee = '34150' AND slug = 'marseillan-34';

-- salles: bare slug → dept 33 (INSEE 33498)
UPDATE communes SET slug = 'salles-47' WHERE code_insee = '47284' AND slug = 'salles';
UPDATE communes SET slug = 'salles-65' WHERE code_insee = '65400' AND slug = 'salles';
UPDATE communes SET slug = 'salles-79' WHERE code_insee = '79303' AND slug = 'salles';
UPDATE communes SET slug = 'salles-81' WHERE code_insee = '81275' AND slug = 'salles';
UPDATE communes SET slug = 'salles' WHERE code_insee = '33498' AND slug = 'salles-33';

-- sorbiers: bare slug → dept 42 (INSEE 42302)
UPDATE communes SET slug = 'sorbiers-05' WHERE code_insee = '05169' AND slug = 'sorbiers';
UPDATE communes SET slug = 'sorbiers' WHERE code_insee = '42302' AND slug = 'sorbiers-42';

-- monts: bare slug → dept 37 (INSEE 37159)
UPDATE communes SET slug = 'monts-60' WHERE code_insee = '60427' AND slug = 'monts';
UPDATE communes SET slug = 'monts' WHERE code_insee = '37159' AND slug = 'monts-37';

-- vineuil: bare slug → dept 41 (INSEE 41295)
UPDATE communes SET slug = 'vineuil-36' WHERE code_insee = '36247' AND slug = 'vineuil';
UPDATE communes SET slug = 'vineuil' WHERE code_insee = '41295' AND slug = 'vineuil-41';

-- bellegarde: bare slug → dept 30 (INSEE 30034)
UPDATE communes SET slug = 'bellegarde-32' WHERE code_insee = '32041' AND slug = 'bellegarde';
UPDATE communes SET slug = 'bellegarde-45' WHERE code_insee = '45031' AND slug = 'bellegarde';
UPDATE communes SET slug = 'bellegarde' WHERE code_insee = '30034' AND slug = 'bellegarde-30';

-- aureilhan: bare slug → dept 65 (INSEE 65047)
UPDATE communes SET slug = 'aureilhan-40' WHERE code_insee = '40019' AND slug = 'aureilhan';
UPDATE communes SET slug = 'aureilhan' WHERE code_insee = '65047' AND slug = 'aureilhan-65';

-- contes: bare slug → dept 06 (INSEE 06048)
UPDATE communes SET slug = 'contes-62' WHERE code_insee = '62236' AND slug = 'contes';
UPDATE communes SET slug = 'contes' WHERE code_insee = '06048' AND slug = 'contes-06';

-- lure: bare slug → dept 70 (INSEE 70310)
UPDATE communes SET slug = 'lure-42' WHERE code_insee = '42125' AND slug = 'lure';
UPDATE communes SET slug = 'lure' WHERE code_insee = '70310' AND slug = 'lure-70';

-- claix: bare slug → dept 38 (INSEE 38111)
UPDATE communes SET slug = 'claix-16' WHERE code_insee = '16101' AND slug = 'claix';
UPDATE communes SET slug = 'claix' WHERE code_insee = '38111' AND slug = 'claix-38';

-- bompas: bare slug → dept 66 (INSEE 66021)
UPDATE communes SET slug = 'bompas-09' WHERE code_insee = '09058' AND slug = 'bompas';
UPDATE communes SET slug = 'bompas' WHERE code_insee = '66021' AND slug = 'bompas-66';

-- chessy: bare slug → dept 77 (INSEE 77111)
UPDATE communes SET slug = 'chessy-69' WHERE code_insee = '69056' AND slug = 'chessy';
UPDATE communes SET slug = 'chessy' WHERE code_insee = '77111' AND slug = 'chessy-77';

-- beynes: bare slug → dept 78 (INSEE 78062)
UPDATE communes SET slug = 'beynes-04' WHERE code_insee = '04028' AND slug = 'beynes';
UPDATE communes SET slug = 'beynes' WHERE code_insee = '78062' AND slug = 'beynes-78';

-- falaise: bare slug → dept 14 (INSEE 14258)
UPDATE communes SET slug = 'falaise-08' WHERE code_insee = '08164' AND slug = 'falaise';
UPDATE communes SET slug = 'falaise' WHERE code_insee = '14258' AND slug = 'falaise-14';

-- langon: bare slug → dept 33 (INSEE 33227)
UPDATE communes SET slug = 'langon-35' WHERE code_insee = '35145' AND slug = 'langon';
UPDATE communes SET slug = 'langon' WHERE code_insee = '33227' AND slug = 'langon-33';

-- villars: bare slug → dept 42 (INSEE 42330)
UPDATE communes SET slug = 'villars-24' WHERE code_insee = '24582' AND slug = 'villars';
UPDATE communes SET slug = 'villars-28' WHERE code_insee = '28411' AND slug = 'villars';
UPDATE communes SET slug = 'villars-84' WHERE code_insee = '84145' AND slug = 'villars';
UPDATE communes SET slug = 'villars' WHERE code_insee = '42330' AND slug = 'villars-42';

-- saint-prix: bare slug → dept 95 (INSEE 95574)
UPDATE communes SET slug = 'saint-prix-71' WHERE code_insee = '71472' AND slug = 'saint-prix';
UPDATE communes SET slug = 'saint-prix-03' WHERE code_insee = '03257' AND slug = 'saint-prix';
UPDATE communes SET slug = 'saint-prix-07' WHERE code_insee = '07290' AND slug = 'saint-prix';
UPDATE communes SET slug = 'saint-prix' WHERE code_insee = '95574' AND slug = 'saint-prix-95';

-- saint-apollinaire: bare slug → dept 21 (INSEE 21540)
UPDATE communes SET slug = 'saint-apollinaire-05' WHERE code_insee = '05130' AND slug = 'saint-apollinaire';
UPDATE communes SET slug = 'saint-apollinaire' WHERE code_insee = '21540' AND slug = 'saint-apollinaire-21';

-- chateaubourg: bare slug → dept 35 (INSEE 35068)
UPDATE communes SET slug = 'chateaubourg-07' WHERE code_insee = '07059' AND slug = 'chateaubourg';
UPDATE communes SET slug = 'chateaubourg' WHERE code_insee = '35068' AND slug = 'chateaubourg-35';

-- trois-rivieres: bare slug → dept 971 (INSEE 97132)
UPDATE communes SET slug = 'trois-rivieres-80' WHERE code_insee = '80625' AND slug = 'trois-rivieres';
UPDATE communes SET slug = 'trois-rivieres' WHERE code_insee = '97132' AND slug = 'trois-rivieres-971';

-- orgeval: bare slug → dept 78 (INSEE 78466)
UPDATE communes SET slug = 'orgeval-02' WHERE code_insee = '02573' AND slug = 'orgeval';
UPDATE communes SET slug = 'orgeval' WHERE code_insee = '78466' AND slug = 'orgeval-78';

-- peronne: bare slug → dept 80 (INSEE 80620)
UPDATE communes SET slug = 'peronne-71' WHERE code_insee = '71345' AND slug = 'peronne';
UPDATE communes SET slug = 'peronne' WHERE code_insee = '80620' AND slug = 'peronne-80';

-- saint-andre-des-eaux: bare slug → dept 44 (INSEE 44151)
UPDATE communes SET slug = 'saint-andre-des-eaux-22' WHERE code_insee = '22274' AND slug = 'saint-andre-des-eaux';
UPDATE communes SET slug = 'saint-andre-des-eaux' WHERE code_insee = '44151' AND slug = 'saint-andre-des-eaux-44';

-- etrechy: bare slug → dept 91 (INSEE 91226)
UPDATE communes SET slug = 'etrechy-18' WHERE code_insee = '18090' AND slug = 'etrechy';
UPDATE communes SET slug = 'etrechy-51' WHERE code_insee = '51239' AND slug = 'etrechy';
UPDATE communes SET slug = 'etrechy' WHERE code_insee = '91226' AND slug = 'etrechy-91';

-- lesigny: bare slug → dept 77 (INSEE 77249)
UPDATE communes SET slug = 'lesigny-86' WHERE code_insee = '86129' AND slug = 'lesigny';
UPDATE communes SET slug = 'lesigny' WHERE code_insee = '77249' AND slug = 'lesigny-77';

-- change: bare slug → dept 72 (INSEE 72058)
UPDATE communes SET slug = 'change-53' WHERE code_insee = '53054' AND slug = 'change';
UPDATE communes SET slug = 'change-71' WHERE code_insee = '71085' AND slug = 'change';
UPDATE communes SET slug = 'change' WHERE code_insee = '72058' AND slug = 'change-72';

-- gignac: bare slug → dept 34 (INSEE 34114)
UPDATE communes SET slug = 'gignac-46' WHERE code_insee = '46118' AND slug = 'gignac';
UPDATE communes SET slug = 'gignac-84' WHERE code_insee = '84048' AND slug = 'gignac';
UPDATE communes SET slug = 'gignac' WHERE code_insee = '34114' AND slug = 'gignac-34';

-- grenay: bare slug → dept 62 (INSEE 62386)
UPDATE communes SET slug = 'grenay-38' WHERE code_insee = '38184' AND slug = 'grenay';
UPDATE communes SET slug = 'grenay' WHERE code_insee = '62386' AND slug = 'grenay-62';

-- thoiry: bare slug → dept 01 (INSEE 01419)
UPDATE communes SET slug = 'thoiry-73' WHERE code_insee = '73293' AND slug = 'thoiry';
UPDATE communes SET slug = 'thoiry-78' WHERE code_insee = '78616' AND slug = 'thoiry';
UPDATE communes SET slug = 'thoiry' WHERE code_insee = '01419' AND slug = 'thoiry-01';

-- saint-juery: bare slug → dept 81 (INSEE 81257)
UPDATE communes SET slug = 'saint-juery-12' WHERE code_insee = '12233' AND slug = 'saint-juery';
UPDATE communes SET slug = 'saint-juery-48' WHERE code_insee = '48161' AND slug = 'saint-juery';
UPDATE communes SET slug = 'saint-juery' WHERE code_insee = '81257' AND slug = 'saint-juery-81';

-- rives: bare slug → dept 38 (INSEE 38337)
UPDATE communes SET slug = 'rives-47' WHERE code_insee = '47223' AND slug = 'rives';
UPDATE communes SET slug = 'rives' WHERE code_insee = '38337' AND slug = 'rives-38';

-- saint-alban: bare slug → dept 31 (INSEE 31467)
UPDATE communes SET slug = 'saint-alban-22' WHERE code_insee = '22273' AND slug = 'saint-alban';
UPDATE communes SET slug = 'saint-alban-01' WHERE code_insee = '01331' AND slug = 'saint-alban';
UPDATE communes SET slug = 'saint-alban' WHERE code_insee = '31467' AND slug = 'saint-alban-31';

-- la-montagne: bare slug → dept 44 (INSEE 44101)
UPDATE communes SET slug = 'la-montagne-70' WHERE code_insee = '70352' AND slug = 'la-montagne';
UPDATE communes SET slug = 'la-montagne' WHERE code_insee = '44101' AND slug = 'la-montagne-44';

-- saint-remy: bare slug → dept 71 (INSEE 71475)
UPDATE communes SET slug = 'saint-remy-12' WHERE code_insee = '12242' AND slug = 'saint-remy';
UPDATE communes SET slug = 'saint-remy-14' WHERE code_insee = '14656' AND slug = 'saint-remy';
UPDATE communes SET slug = 'saint-remy-19' WHERE code_insee = '19238' AND slug = 'saint-remy';
UPDATE communes SET slug = 'saint-remy-21' WHERE code_insee = '21568' AND slug = 'saint-remy';
UPDATE communes SET slug = 'saint-remy-24' WHERE code_insee = '24494' AND slug = 'saint-remy';
UPDATE communes SET slug = 'saint-remy-79' WHERE code_insee = '79293' AND slug = 'saint-remy';
UPDATE communes SET slug = 'saint-remy-88' WHERE code_insee = '88435' AND slug = 'saint-remy';
UPDATE communes SET slug = 'saint-remy-01' WHERE code_insee = '01385' AND slug = 'saint-remy';
UPDATE communes SET slug = 'saint-remy' WHERE code_insee = '71475' AND slug = 'saint-remy-71';

-- saint-marcel: bare slug → dept 71 (INSEE 71445)
UPDATE communes SET slug = 'saint-marcel-27' WHERE code_insee = '27562' AND slug = 'saint-marcel';
UPDATE communes SET slug = 'saint-marcel-36' WHERE code_insee = '36200' AND slug = 'saint-marcel';
UPDATE communes SET slug = 'saint-marcel-54' WHERE code_insee = '54478' AND slug = 'saint-marcel';
UPDATE communes SET slug = 'saint-marcel-56' WHERE code_insee = '56228' AND slug = 'saint-marcel';
UPDATE communes SET slug = 'saint-marcel-70' WHERE code_insee = '70468' AND slug = 'saint-marcel';
UPDATE communes SET slug = 'saint-marcel-73' WHERE code_insee = '73253' AND slug = 'saint-marcel';
UPDATE communes SET slug = 'saint-marcel-01' WHERE code_insee = '01371' AND slug = 'saint-marcel';
UPDATE communes SET slug = 'saint-marcel-08' WHERE code_insee = '08389' AND slug = 'saint-marcel';
UPDATE communes SET slug = 'saint-marcel' WHERE code_insee = '71445' AND slug = 'saint-marcel-71';

-- prades: bare slug → dept 66 (INSEE 66149)
UPDATE communes SET slug = 'prades-43' WHERE code_insee = '43155' AND slug = 'prades';
UPDATE communes SET slug = 'prades-81' WHERE code_insee = '81212' AND slug = 'prades';
UPDATE communes SET slug = 'prades-07' WHERE code_insee = '07182' AND slug = 'prades';
UPDATE communes SET slug = 'prades-09' WHERE code_insee = '09232' AND slug = 'prades';
UPDATE communes SET slug = 'prades' WHERE code_insee = '66149' AND slug = 'prades-66';

-- bois-le-roi: bare slug → dept 77 (INSEE 77037)
UPDATE communes SET slug = 'bois-le-roi-27' WHERE code_insee = '27073' AND slug = 'bois-le-roi';
UPDATE communes SET slug = 'bois-le-roi' WHERE code_insee = '77037' AND slug = 'bois-le-roi-77';

-- beauvoisin: bare slug → dept 30 (INSEE 30033)
UPDATE communes SET slug = 'beauvoisin-26' WHERE code_insee = '26043' AND slug = 'beauvoisin';
UPDATE communes SET slug = 'beauvoisin' WHERE code_insee = '30033' AND slug = 'beauvoisin-30';

-- le-castellet: bare slug → dept 83 (INSEE 83035)
UPDATE communes SET slug = 'le-castellet-04' WHERE code_insee = '04041' AND slug = 'le-castellet';
UPDATE communes SET slug = 'le-castellet' WHERE code_insee = '83035' AND slug = 'le-castellet-83';

-- montdidier: bare slug → dept 80 (INSEE 80561)
UPDATE communes SET slug = 'montdidier-57' WHERE code_insee = '57478' AND slug = 'montdidier';
UPDATE communes SET slug = 'montdidier' WHERE code_insee = '80561' AND slug = 'montdidier-80';

-- roye: bare slug → dept 80 (INSEE 80685)
UPDATE communes SET slug = 'roye-70' WHERE code_insee = '70455' AND slug = 'roye';
UPDATE communes SET slug = 'roye' WHERE code_insee = '80685' AND slug = 'roye-80';

-- buc: bare slug → dept 78 (INSEE 78117)
UPDATE communes SET slug = 'buc-90' WHERE code_insee = '90020' AND slug = 'buc';
UPDATE communes SET slug = 'buc' WHERE code_insee = '78117' AND slug = 'buc-78';

-- viry: bare slug → dept 74 (INSEE 74309)
UPDATE communes SET slug = 'viry-39' WHERE code_insee = '39579' AND slug = 'viry';
UPDATE communes SET slug = 'viry-71' WHERE code_insee = '71586' AND slug = 'viry';
UPDATE communes SET slug = 'viry' WHERE code_insee = '74309' AND slug = 'viry-74';

-- fenouillet: bare slug → dept 31 (INSEE 31182)
UPDATE communes SET slug = 'fenouillet-66' WHERE code_insee = '66077' AND slug = 'fenouillet';
UPDATE communes SET slug = 'fenouillet' WHERE code_insee = '31182' AND slug = 'fenouillet-31';

-- melle: bare slug → dept 79 (INSEE 79174)
UPDATE communes SET slug = 'melle-35' WHERE code_insee = '35174' AND slug = 'melle';
UPDATE communes SET slug = 'melle' WHERE code_insee = '79174' AND slug = 'melle-79';

-- orgeres: bare slug → dept 35 (INSEE 35208)
UPDATE communes SET slug = 'orgeres-61' WHERE code_insee = '61317' AND slug = 'orgeres';
UPDATE communes SET slug = 'orgeres' WHERE code_insee = '35208' AND slug = 'orgeres-35';

-- ligne: bare slug → dept 44 (INSEE 44082)
UPDATE communes SET slug = 'ligne-16' WHERE code_insee = '16185' AND slug = 'ligne';
UPDATE communes SET slug = 'ligne' WHERE code_insee = '44082' AND slug = 'ligne-44';

-- port-louis: bare slug → dept 971 (INSEE 97122)
UPDATE communes SET slug = 'port-louis-56' WHERE code_insee = '56181' AND slug = 'port-louis';
UPDATE communes SET slug = 'port-louis' WHERE code_insee = '97122' AND slug = 'port-louis-971';

-- ternay: bare slug → dept 69 (INSEE 69297)
UPDATE communes SET slug = 'ternay-41' WHERE code_insee = '41255' AND slug = 'ternay';
UPDATE communes SET slug = 'ternay-86' WHERE code_insee = '86269' AND slug = 'ternay';
UPDATE communes SET slug = 'ternay' WHERE code_insee = '69297' AND slug = 'ternay-69';

-- genay: bare slug → dept 69 (INSEE 69278)
UPDATE communes SET slug = 'genay-21' WHERE code_insee = '21291' AND slug = 'genay';
UPDATE communes SET slug = 'genay' WHERE code_insee = '69278' AND slug = 'genay-69';

-- roquemaure: bare slug → dept 30 (INSEE 30221)
UPDATE communes SET slug = 'roquemaure-81' WHERE code_insee = '81228' AND slug = 'roquemaure';
UPDATE communes SET slug = 'roquemaure' WHERE code_insee = '30221' AND slug = 'roquemaure-30';

-- saint-mars-du-desert: bare slug → dept 44 (INSEE 44179)
UPDATE communes SET slug = 'saint-mars-du-desert-53' WHERE code_insee = '53236' AND slug = 'saint-mars-du-desert';
UPDATE communes SET slug = 'saint-mars-du-desert' WHERE code_insee = '44179' AND slug = 'saint-mars-du-desert-44';

-- ollainville: bare slug → dept 91 (INSEE 91461)
UPDATE communes SET slug = 'ollainville-88' WHERE code_insee = '88336' AND slug = 'ollainville';
UPDATE communes SET slug = 'ollainville' WHERE code_insee = '91461' AND slug = 'ollainville-91';

-- la-ferriere: bare slug → dept 85 (INSEE 85089)
UPDATE communes SET slug = 'la-ferriere-37' WHERE code_insee = '37106' AND slug = 'la-ferriere';
UPDATE communes SET slug = 'la-ferriere' WHERE code_insee = '85089' AND slug = 'la-ferriere-85';

-- roques: bare slug → dept 31 (INSEE 31458)
UPDATE communes SET slug = 'roques-32' WHERE code_insee = '32351' AND slug = 'roques';
UPDATE communes SET slug = 'roques' WHERE code_insee = '31458' AND slug = 'roques-31';

-- plouhinec: bare slug → dept 56 (INSEE 56169)
UPDATE communes SET slug = 'plouhinec-29' WHERE code_insee = '29197' AND slug = 'plouhinec';
UPDATE communes SET slug = 'plouhinec' WHERE code_insee = '56169' AND slug = 'plouhinec-56';

-- saint-astier: bare slug → dept 24 (INSEE 24372)
UPDATE communes SET slug = 'saint-astier-47' WHERE code_insee = '47229' AND slug = 'saint-astier';
UPDATE communes SET slug = 'saint-astier' WHERE code_insee = '24372' AND slug = 'saint-astier-24';

-- chagny: bare slug → dept 71 (INSEE 71073)
UPDATE communes SET slug = 'chagny-08' WHERE code_insee = '08095' AND slug = 'chagny';
UPDATE communes SET slug = 'chagny' WHERE code_insee = '71073' AND slug = 'chagny-71';

-- champniers: bare slug → dept 16 (INSEE 16078)
UPDATE communes SET slug = 'champniers-86' WHERE code_insee = '86054' AND slug = 'champniers';
UPDATE communes SET slug = 'champniers' WHERE code_insee = '16078' AND slug = 'champniers-16';

-- gorges: bare slug → dept 44 (INSEE 44064)
UPDATE communes SET slug = 'gorges-50' WHERE code_insee = '50210' AND slug = 'gorges';
UPDATE communes SET slug = 'gorges-80' WHERE code_insee = '80381' AND slug = 'gorges';
UPDATE communes SET slug = 'gorges' WHERE code_insee = '44064' AND slug = 'gorges-44';

-- jonquieres: bare slug → dept 84 (INSEE 84056)
UPDATE communes SET slug = 'jonquieres-11' WHERE code_insee = '11176' AND slug = 'jonquieres';
UPDATE communes SET slug = 'jonquieres-34' WHERE code_insee = '34122' AND slug = 'jonquieres';
UPDATE communes SET slug = 'jonquieres-60' WHERE code_insee = '60326' AND slug = 'jonquieres';
UPDATE communes SET slug = 'jonquieres-81' WHERE code_insee = '81109' AND slug = 'jonquieres';
UPDATE communes SET slug = 'jonquieres' WHERE code_insee = '84056' AND slug = 'jonquieres-84';

-- pont-l-eveque: bare slug → dept 14 (INSEE 14514)
UPDATE communes SET slug = 'pont-l-eveque-60' WHERE code_insee = '60506' AND slug = 'pont-l-eveque';
UPDATE communes SET slug = 'pont-l-eveque' WHERE code_insee = '14514' AND slug = 'pont-l-eveque-14';

-- saint-cheron: bare slug → dept 91 (INSEE 91540)
UPDATE communes SET slug = 'saint-cheron-51' WHERE code_insee = '51475' AND slug = 'saint-cheron';
UPDATE communes SET slug = 'saint-cheron' WHERE code_insee = '91540' AND slug = 'saint-cheron-91';

-- beaurepaire: bare slug → dept 38 (INSEE 38034)
UPDATE communes SET slug = 'beaurepaire-60' WHERE code_insee = '60056' AND slug = 'beaurepaire';
UPDATE communes SET slug = 'beaurepaire-76' WHERE code_insee = '76064' AND slug = 'beaurepaire';
UPDATE communes SET slug = 'beaurepaire-85' WHERE code_insee = '85017' AND slug = 'beaurepaire';
UPDATE communes SET slug = 'beaurepaire' WHERE code_insee = '38034' AND slug = 'beaurepaire-38';

COMMIT;