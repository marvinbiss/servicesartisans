"""Source data for Wikipedia FR seed articles.

NPOV (Neutral Point of View) MANDATORY. No promotional language —
no superlatives ("leader", "incontournable", "le meilleur"), no
marketing jargon ("révolutionnaire", "disruptif"), no first-person
references ("notre entreprise"). Heuristic check in ``neutrality.py``
will flag drift at build time.

References cite official sources only: Légifrance, ADEME / data.gouv.fr,
the certifying body itself (Qualit'EnR, Qualibat, Qualifelec, OPQIBI,
Cequami), and France Rénov'. Servicesartisans.fr is NEVER used as a
source citation — circular sourcing is grounds for speedy deletion
under WP:CIRCULAR. Where applicable a single SA reference can appear
under "Liens externes" but never inside a <ref> citation.

Symmetry note: each entry mirrors the canonical SA RGE glossary
(memory ``servicesartisans-glossaire-rge-canonical-2026-05-03``),
ensuring narrative-level (Wikipedia) coverage is symmetric to claim-
level (Wikidata, Ralph 5) coverage. Together they form pillar 12+13
of the RGE-OS manifesto.

For lesser-documented qualifications we deliberately ship short stubs
(1-2 sections) rather than fabricate content. Stub minimalism + sourced
facts > long + speculative.
"""

from __future__ import annotations

from typing import Any

RGE_QUALIFICATIONS: list[dict[str, Any]] = [
    {
        "title": "QualiPAC",
        "category": "rge_qualification",
        "summary": (
            "QualiPAC est une qualification française attribuée aux entreprises qui "
            "installent des pompes à chaleur. Elle est délivrée par l'organisme "
            "Qualit'EnR depuis 2007. La qualification fait partie du dispositif "
            "Reconnu Garant de l'Environnement (RGE), conditionnant l'éligibilité "
            "des particuliers aux aides MaPrimeRénov' et aux certificats d'économies "
            "d'énergie pour ce geste."
        ),
        "infobox_template": "Infobox Certification",
        "infobox_fields": {
            "nom": "QualiPAC",
            "organisme": "Qualit'EnR",
            "domaine": "Pompes à chaleur",
            "date_creation": "2007",
            "pays": "France",
        },
        "sections": [
            {
                "heading": "Historique",
                "body_wikitext": (
                    "La qualification QualiPAC a été créée en 2007 par l'association "
                    "Qualit'EnR, fondée la même année par des acteurs français des "
                    "énergies renouvelables thermiques.<ref name=\"qualitenr_about\" />"
                ),
                "references": [
                    {
                        "title": "À propos de Qualit'EnR",
                        "url": "https://www.qualit-enr.org/qui-sommes-nous/",
                        "publisher": "Qualit'EnR",
                        "date": "2026-04-15",
                    }
                ],
            },
            {
                "heading": "Conditions d'obtention",
                "body_wikitext": (
                    "L'obtention de la qualification QualiPAC requiert une formation "
                    "technique des installateurs, un référencement de l'entreprise, "
                    "une assurance responsabilité civile professionnelle, et des "
                    "audits réguliers de chantiers.<ref name=\"qualitenr_conditions\" />"
                ),
                "references": [
                    {
                        "title": "Conditions d'attribution QualiPAC",
                        "url": "https://www.qualit-enr.org/qualifications/qualipac/",
                        "publisher": "Qualit'EnR",
                        "date": "2026-04-15",
                    }
                ],
            },
            {
                "heading": "Lien avec les aides publiques",
                "body_wikitext": (
                    "Depuis 2015, le label Reconnu Garant de l'Environnement (RGE) "
                    "conditionne l'éligibilité aux aides publiques à la rénovation "
                    "énergétique. QualiPAC est l'une des qualifications RGE éligibles "
                    "pour les installations de pompes à chaleur.<ref name=\"france_renov_rge\" />"
                ),
                "references": [
                    {
                        "title": "Les aides MaPrimeRénov'",
                        "url": "https://france-renov.gouv.fr/aides/maprimerenov",
                        "publisher": "France Rénov'",
                        "date": "2026-04-15",
                    }
                ],
            },
        ],
        "categories": [
            "Catégorie:Certification française",
            "Catégorie:Rénovation énergétique en France",
            "Catégorie:Pompe à chaleur",
        ],
    },
    {
        "title": "Qualibat 5911",
        "category": "rge_qualification",
        "summary": (
            "Qualibat 5911 est une qualification française dédiée à l'isolation "
            "thermique par l'extérieur des bâtiments. Elle est délivrée par "
            "l'organisme Qualibat. La qualification fait partie du dispositif "
            "Reconnu Garant de l'Environnement (RGE)."
        ),
        "infobox_template": "Infobox Certification",
        "infobox_fields": {
            "nom": "Qualibat 5911",
            "organisme": "Qualibat",
            "domaine": "Isolation thermique par l'extérieur",
            "pays": "France",
        },
        "sections": [
            {
                "heading": "Objet",
                "body_wikitext": (
                    "La qualification 5911 atteste de la capacité d'une entreprise à "
                    "exécuter des travaux d'isolation thermique par l'extérieur dans "
                    "le cadre du dispositif RGE.<ref name=\"qualibat_5911\" />"
                ),
                "references": [
                    {
                        "title": "Nomenclature Qualibat 5911",
                        "url": "https://www.qualibat.com/nomenclature/",
                        "publisher": "Qualibat",
                        "date": "2026-04-15",
                    }
                ],
            },
            {
                "heading": "Conditions d'obtention",
                "body_wikitext": (
                    "L'obtention de la qualification suppose des références chantiers, "
                    "une formation technique, une assurance professionnelle et des "
                    "audits périodiques effectués par Qualibat.<ref name=\"qualibat_proc\" />"
                ),
                "references": [
                    {
                        "title": "Procédure de qualification Qualibat",
                        "url": "https://www.qualibat.com/qualification/",
                        "publisher": "Qualibat",
                        "date": "2026-04-15",
                    }
                ],
            },
        ],
        "categories": [
            "Catégorie:Certification française",
            "Catégorie:Rénovation énergétique en France",
            "Catégorie:Isolation thermique",
        ],
    },
    {
        "title": "Qualifelec",
        "category": "rge_qualification",
        "summary": (
            "Qualifelec est une association française qui qualifie les entreprises "
            "du génie électrique et énergétique. Fondée en 1955, elle délivre des "
            "qualifications dont plusieurs sont reconnues dans le cadre du dispositif "
            "Reconnu Garant de l'Environnement (RGE)."
        ),
        "infobox_template": "Infobox Organisation",
        "infobox_fields": {
            "nom": "Qualifelec",
            "type": "Association loi 1901",
            "date_creation": "1955",
            "domaine": "Génie électrique et énergétique",
            "pays": "France",
        },
        "sections": [
            {
                "heading": "Historique",
                "body_wikitext": (
                    "Qualifelec a été fondée en 1955. L'association regroupe des "
                    "représentants professionnels, des maîtres d'ouvrage et des "
                    "organismes consulaires.<ref name=\"qualifelec_about\" />"
                ),
                "references": [
                    {
                        "title": "À propos de Qualifelec",
                        "url": "https://www.qualifelec.fr/qui-sommes-nous/",
                        "publisher": "Qualifelec",
                        "date": "2026-04-15",
                    }
                ],
            },
            {
                "heading": "Qualifications RGE délivrées",
                "body_wikitext": (
                    "Qualifelec délivre notamment des qualifications RGE pour "
                    "l'installation de bornes de recharge pour véhicules électriques "
                    "(IRVE) et pour le photovoltaïque raccordé au réseau.<ref name=\"qualifelec_rge\" />"
                ),
                "references": [
                    {
                        "title": "Qualifications RGE Qualifelec",
                        "url": "https://www.qualifelec.fr/qualifications-rge/",
                        "publisher": "Qualifelec",
                        "date": "2026-04-15",
                    }
                ],
            },
        ],
        "categories": [
            "Catégorie:Organisme de certification français",
            "Catégorie:Génie électrique",
            "Catégorie:Rénovation énergétique en France",
        ],
    },
    {
        "title": "OPQIBI",
        "category": "rge_qualification",
        "summary": (
            "OPQIBI (Organisme Professionnel de Qualification de l'Ingénierie du "
            "Bâtiment et de l'Industrie) est un organisme français accrédité Cofrac "
            "qui qualifie les structures d'ingénierie. Plusieurs de ses "
            "qualifications sont reconnues dans le cadre du dispositif Reconnu "
            "Garant de l'Environnement (RGE)."
        ),
        "infobox_template": "Infobox Organisation",
        "infobox_fields": {
            "nom": "OPQIBI",
            "type": "Organisme de qualification",
            "accreditation": "Cofrac",
            "pays": "France",
        },
        "sections": [
            {
                "heading": "Objet",
                "body_wikitext": (
                    "OPQIBI qualifie les bureaux d'ingénierie dans une dizaine de "
                    "domaines techniques, dont l'efficacité énergétique et l'audit "
                    "énergétique des bâtiments tertiaires.<ref name=\"opqibi_about\" />"
                ),
                "references": [
                    {
                        "title": "Présentation OPQIBI",
                        "url": "https://www.opqibi.com/qui-sommes-nous",
                        "publisher": "OPQIBI",
                        "date": "2026-04-15",
                    }
                ],
            },
        ],
        "categories": [
            "Catégorie:Organisme de certification français",
            "Catégorie:Ingénierie",
            "Catégorie:Rénovation énergétique en France",
        ],
    },
    {
        "title": "QualiSol",
        "category": "rge_qualification",
        "summary": (
            "QualiSol est une qualification française attribuée aux entreprises "
            "installant des systèmes solaires thermiques. Elle est délivrée par "
            "l'organisme Qualit'EnR et fait partie du dispositif Reconnu Garant "
            "de l'Environnement (RGE)."
        ),
        "infobox_template": "Infobox Certification",
        "infobox_fields": {
            "nom": "QualiSol",
            "organisme": "Qualit'EnR",
            "domaine": "Solaire thermique",
            "pays": "France",
        },
        "sections": [
            {
                "heading": "Périmètre",
                "body_wikitext": (
                    "La qualification QualiSol couvre la production d'eau chaude "
                    "sanitaire solaire individuelle, les systèmes solaires combinés "
                    "et les installations collectives.<ref name=\"qualisol_scope\" />"
                ),
                "references": [
                    {
                        "title": "Périmètre QualiSol",
                        "url": "https://www.qualit-enr.org/qualifications/qualisol/",
                        "publisher": "Qualit'EnR",
                        "date": "2026-04-15",
                    }
                ],
            },
        ],
        "categories": [
            "Catégorie:Certification française",
            "Catégorie:Rénovation énergétique en France",
            "Catégorie:Énergie solaire",
        ],
    },
    {
        "title": "QualiBois",
        "category": "rge_qualification",
        "summary": (
            "QualiBois est une qualification française attribuée aux entreprises "
            "installant des appareils de chauffage au bois. Elle est délivrée "
            "par l'organisme Qualit'EnR et fait partie du dispositif Reconnu "
            "Garant de l'Environnement (RGE)."
        ),
        "infobox_template": "Infobox Certification",
        "infobox_fields": {
            "nom": "QualiBois",
            "organisme": "Qualit'EnR",
            "domaine": "Chauffage au bois",
            "pays": "France",
        },
        "sections": [
            {
                "heading": "Périmètre",
                "body_wikitext": (
                    "La qualification QualiBois concerne les poêles à bûches, les "
                    "poêles à granulés, les inserts, les foyers fermés et les "
                    "chaudières biomasse.<ref name=\"qualibois_scope\" />"
                ),
                "references": [
                    {
                        "title": "Périmètre QualiBois",
                        "url": "https://www.qualit-enr.org/qualifications/qualibois/",
                        "publisher": "Qualit'EnR",
                        "date": "2026-04-15",
                    }
                ],
            },
        ],
        "categories": [
            "Catégorie:Certification française",
            "Catégorie:Rénovation énergétique en France",
            "Catégorie:Chauffage au bois",
        ],
    },
    {
        "title": "QualiPV",
        "category": "rge_qualification",
        "summary": (
            "QualiPV est une qualification française attribuée aux entreprises "
            "installant des systèmes photovoltaïques raccordés au réseau. Elle est "
            "délivrée par l'organisme Qualit'EnR et fait partie du dispositif "
            "Reconnu Garant de l'Environnement (RGE)."
        ),
        "infobox_template": "Infobox Certification",
        "infobox_fields": {
            "nom": "QualiPV",
            "organisme": "Qualit'EnR",
            "domaine": "Photovoltaïque",
            "pays": "France",
        },
        "sections": [
            {
                "heading": "Périmètre",
                "body_wikitext": (
                    "La qualification QualiPV couvre les installations "
                    "photovoltaïques raccordées au réseau public d'électricité, "
                    "qu'elles soient résidentielles ou tertiaires.<ref name=\"qualipv_scope\" />"
                ),
                "references": [
                    {
                        "title": "Périmètre QualiPV",
                        "url": "https://www.qualit-enr.org/qualifications/qualipv/",
                        "publisher": "Qualit'EnR",
                        "date": "2026-04-15",
                    }
                ],
            },
        ],
        "categories": [
            "Catégorie:Certification française",
            "Catégorie:Rénovation énergétique en France",
            "Catégorie:Énergie solaire photovoltaïque",
        ],
    },
    {
        "title": "Cequami",
        "category": "rge_qualification",
        "summary": (
            "Cequami est un organisme français de certification dans le domaine "
            "de la rénovation énergétique des maisons individuelles. Il délivre "
            "notamment la certification NF Maison Rénovée RGE."
        ),
        "infobox_template": "Infobox Organisation",
        "infobox_fields": {
            "nom": "Cequami",
            "type": "Organisme de certification",
            "domaine": "Rénovation énergétique des maisons individuelles",
            "pays": "France",
        },
        "sections": [
            {
                "heading": "Activité",
                "body_wikitext": (
                    "Cequami est filiale de l'Association française de "
                    "normalisation (AFNOR) et du Centre scientifique et technique "
                    "du bâtiment (CSTB). L'organisme certifie des entreprises "
                    "engagées dans la rénovation globale.<ref name=\"cequami_about\" />"
                ),
                "references": [
                    {
                        "title": "Présentation Cequami",
                        "url": "https://www.cequami.fr/qui-sommes-nous",
                        "publisher": "Cequami",
                        "date": "2026-04-15",
                    }
                ],
            },
        ],
        "categories": [
            "Catégorie:Organisme de certification français",
            "Catégorie:Rénovation énergétique en France",
        ],
    },
    {
        "title": "Éco Artisan",
        "category": "rge_qualification",
        "summary": (
            "Éco Artisan est une mention française attribuée par la Confédération "
            "de l'Artisanat et des Petites Entreprises du Bâtiment (CAPEB) aux "
            "artisans engagés dans la rénovation énergétique. La mention est "
            "reconnue dans le cadre du dispositif Reconnu Garant de l'Environnement "
            "(RGE)."
        ),
        "infobox_template": "Infobox Certification",
        "infobox_fields": {
            "nom": "Éco Artisan",
            "organisme": "CAPEB",
            "domaine": "Artisanat du bâtiment",
            "pays": "France",
        },
        "sections": [
            {
                "heading": "Objet",
                "body_wikitext": (
                    "La mention atteste de la capacité de l'artisan à réaliser une "
                    "évaluation thermique sommaire du logement et à conseiller un "
                    "bouquet de travaux cohérent.<ref name=\"eco_artisan_about\" />"
                ),
                "references": [
                    {
                        "title": "Mention Éco Artisan",
                        "url": "https://www.capeb.fr/eco-artisan",
                        "publisher": "CAPEB",
                        "date": "2026-04-15",
                    }
                ],
            },
        ],
        "categories": [
            "Catégorie:Certification française",
            "Catégorie:Rénovation énergétique en France",
            "Catégorie:Artisanat",
        ],
    },
    {
        "title": "Pros de la Performance Énergétique",
        "category": "rge_qualification",
        "summary": (
            "Pros de la Performance Énergétique est une mention française "
            "attribuée par la Fédération française du bâtiment (FFB) aux "
            "entreprises engagées dans la rénovation énergétique. La mention "
            "est reconnue dans le cadre du dispositif Reconnu Garant de "
            "l'Environnement (RGE)."
        ),
        "infobox_template": "Infobox Certification",
        "infobox_fields": {
            "nom": "Pros de la Performance Énergétique",
            "organisme": "Fédération française du bâtiment",
            "domaine": "Rénovation énergétique",
            "pays": "France",
        },
        "sections": [
            {
                "heading": "Objet",
                "body_wikitext": (
                    "La mention atteste de la capacité de l'entreprise à conseiller, "
                    "dimensionner et exécuter des travaux de rénovation énergétique "
                    "selon une démarche formalisée.<ref name=\"prosperf_about\" />"
                ),
                "references": [
                    {
                        "title": "Mention Pros de la Performance Énergétique",
                        "url": "https://www.ffbatiment.fr/federation-francaise-du-batiment/pros-performance-energetique",
                        "publisher": "Fédération française du bâtiment",
                        "date": "2026-04-15",
                    }
                ],
            },
        ],
        "categories": [
            "Catégorie:Certification française",
            "Catégorie:Rénovation énergétique en France",
        ],
    },
    {
        "title": "Qualit'EnR",
        "category": "rge_qualification",
        "summary": (
            "Qualit'EnR est une association française fondée en 2006 qui qualifie "
            "les entreprises installant des équipements à énergies renouvelables "
            "thermiques et électriques chez les particuliers. Plusieurs de ses "
            "qualifications sont reconnues dans le cadre du dispositif Reconnu "
            "Garant de l'Environnement (RGE)."
        ),
        "infobox_template": "Infobox Organisation",
        "infobox_fields": {
            "nom": "Qualit'EnR",
            "type": "Association loi 1901",
            "date_creation": "2006",
            "domaine": "Énergies renouvelables",
            "pays": "France",
        },
        "sections": [
            {
                "heading": "Historique",
                "body_wikitext": (
                    "Qualit'EnR a été fondée en 2006 par les principaux acteurs "
                    "français des énergies renouvelables thermiques. L'association "
                    "regroupe des organisations professionnelles, des entreprises "
                    "et des partenaires institutionnels.<ref name=\"qualitenr_about\" />"
                ),
                "references": [
                    {
                        "title": "À propos de Qualit'EnR",
                        "url": "https://www.qualit-enr.org/qui-sommes-nous/",
                        "publisher": "Qualit'EnR",
                        "date": "2026-04-15",
                    }
                ],
            },
            {
                "heading": "Qualifications délivrées",
                "body_wikitext": (
                    "Qualit'EnR délivre les qualifications QualiPAC, QualiSol, "
                    "QualiBois, QualiPV, QualiForage et Chauffage+. Toutes ces "
                    "qualifications sont reconnues RGE pour les filières "
                    "correspondantes.<ref name=\"qualitenr_quals\" />"
                ),
                "references": [
                    {
                        "title": "Liste des qualifications Qualit'EnR",
                        "url": "https://www.qualit-enr.org/qualifications/",
                        "publisher": "Qualit'EnR",
                        "date": "2026-04-15",
                    }
                ],
            },
        ],
        "categories": [
            "Catégorie:Association française",
            "Catégorie:Énergies renouvelables en France",
            "Catégorie:Rénovation énergétique en France",
        ],
    },
    {
        "title": "OPQTECC",
        "category": "rge_qualification",
        "summary": (
            "OPQTECC (Organisme Professionnel de Qualification Technique des "
            "Économistes de la Construction et des Coordonnateurs) est un "
            "organisme français de qualification des économistes de la "
            "construction. Une partie de ses qualifications est reconnue dans "
            "le cadre du dispositif Reconnu Garant de l'Environnement (RGE)."
        ),
        "infobox_template": "Infobox Organisation",
        "infobox_fields": {
            "nom": "OPQTECC",
            "type": "Organisme de qualification",
            "domaine": "Économie de la construction",
            "pays": "France",
        },
        "sections": [
            {
                "heading": "Objet",
                "body_wikitext": (
                    "OPQTECC qualifie les économistes de la construction et les "
                    "coordonnateurs de travaux. Certaines de ses qualifications "
                    "couvrent l'audit énergétique des bâtiments.<ref name=\"opqtecc_about\" />"
                ),
                "references": [
                    {
                        "title": "Présentation OPQTECC",
                        "url": "https://www.opqtecc.fr/qui-sommes-nous/",
                        "publisher": "OPQTECC",
                        "date": "2026-04-15",
                    }
                ],
            },
        ],
        "categories": [
            "Catégorie:Organisme de certification français",
            "Catégorie:Économie de la construction",
            "Catégorie:Rénovation énergétique en France",
        ],
    },
    {
        "title": "RGE Études",
        "category": "rge_qualification",
        "summary": (
            "RGE Études est une appellation française regroupant les "
            "qualifications RGE délivrées à des bureaux d'études pour des "
            "prestations intellectuelles de la rénovation énergétique, "
            "notamment l'audit énergétique. Elle est délivrée par OPQIBI, "
            "OPQTECC, Qualibat et l'Afnor Certification."
        ),
        "infobox_template": "Infobox Certification",
        "infobox_fields": {
            "nom": "RGE Études",
            "domaine": "Audit énergétique et études",
            "pays": "France",
        },
        "sections": [
            {
                "heading": "Périmètre",
                "body_wikitext": (
                    "RGE Études couvre l'audit énergétique réglementaire des "
                    "logements et tertiaires, la maîtrise d'œuvre en rénovation "
                    "énergétique et les études thermiques.<ref name=\"rge_etudes_scope\" />"
                ),
                "references": [
                    {
                        "title": "Le label RGE Études",
                        "url": "https://france-renov.gouv.fr/audit-energetique",
                        "publisher": "France Rénov'",
                        "date": "2026-04-15",
                    }
                ],
            },
        ],
        "categories": [
            "Catégorie:Certification française",
            "Catégorie:Rénovation énergétique en France",
            "Catégorie:Audit énergétique",
        ],
    },
]


CEE_CONCEPTS: list[dict[str, Any]] = [
    {
        "title": "Coup de pouce économies d'énergie",
        "category": "cee_concept",
        "summary": (
            "Le « Coup de pouce économies d'énergie » est un dispositif français "
            "d'aide à la rénovation énergétique mis en place dans le cadre des "
            "certificats d'économies d'énergie (CEE). Il propose des primes "
            "bonifiées pour certains gestes de rénovation, notamment le "
            "remplacement de chaudière et l'isolation."
        ),
        "infobox_template": "Infobox Dispositif",
        "infobox_fields": {
            "nom": "Coup de pouce économies d'énergie",
            "type": "Dispositif d'aide à la rénovation",
            "pays": "France",
        },
        "sections": [
            {
                "heading": "Origine",
                "body_wikitext": (
                    "Le dispositif a été instauré par arrêté du ministère de la "
                    "Transition écologique. Il s'inscrit dans la quatrième période "
                    "des certificats d'économies d'énergie (CEE).<ref name=\"coup_pouce_legifrance\" />"
                ),
                "references": [
                    {
                        "title": "Arrêté Coup de pouce économies d'énergie",
                        "url": "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000038289728",
                        "publisher": "Légifrance",
                        "date": "2026-04-15",
                    }
                ],
            },
            {
                "heading": "Gestes éligibles",
                "body_wikitext": (
                    "Plusieurs gestes sont éligibles selon les périodes : "
                    "remplacement de chaudière par une pompe à chaleur, "
                    "isolation des combles, raccordement à un réseau de chaleur, "
                    "rénovation performante.<ref name=\"coup_pouce_renov\" />"
                ),
                "references": [
                    {
                        "title": "Coup de pouce : les opérations concernées",
                        "url": "https://france-renov.gouv.fr/aides/coup-de-pouce",
                        "publisher": "France Rénov'",
                        "date": "2026-04-15",
                    }
                ],
            },
        ],
        "categories": [
            "Catégorie:Politique énergétique en France",
            "Catégorie:Rénovation énergétique en France",
            "Catégorie:Certificat d'économies d'énergie",
        ],
    },
    {
        "title": "kWh cumac",
        "category": "cee_concept",
        "summary": (
            "Le kWh cumac (kilowattheure cumulé et actualisé) est une unité "
            "française utilisée pour quantifier les économies d'énergie générées "
            "par une opération de rénovation dans le cadre des certificats "
            "d'économies d'énergie (CEE). Elle représente les économies "
            "d'énergie cumulées sur la durée de vie de l'opération, actualisées "
            "à un taux annuel."
        ),
        "sections": [
            {
                "heading": "Définition",
                "body_wikitext": (
                    "Le calcul du kWh cumac combine deux opérations : le cumul "
                    "des économies d'énergie sur la durée de vie de l'équipement "
                    "et l'actualisation à un taux fixé par arrêté.<ref name=\"cumac_definition\" />"
                ),
                "references": [
                    {
                        "title": "Définition du kWh cumac",
                        "url": "https://www.ecologie.gouv.fr/dispositif-des-certificats-deconomies-denergie",
                        "publisher": "Ministère de la Transition écologique",
                        "date": "2026-04-15",
                    }
                ],
            },
            {
                "heading": "Usage",
                "body_wikitext": (
                    "Le kWh cumac sert d'unité de compte pour les obligés et les "
                    "éligibles du dispositif CEE. Les fiches d'opérations "
                    "standardisées publiées par le ministère fixent le forfait "
                    "en kWh cumac par opération.<ref name=\"cumac_fiches\" />"
                ),
                "references": [
                    {
                        "title": "Fiches d'opérations standardisées",
                        "url": "https://www.ecologie.gouv.fr/fiches-doperations-standardisees",
                        "publisher": "Ministère de la Transition écologique",
                        "date": "2026-04-15",
                    }
                ],
            },
        ],
        "categories": [
            "Catégorie:Unité de mesure",
            "Catégorie:Politique énergétique en France",
            "Catégorie:Certificat d'économies d'énergie",
        ],
    },
    {
        "title": "MWh cumac",
        "category": "cee_concept",
        "summary": (
            "Le MWh cumac (mégawattheure cumulé et actualisé) est un multiple du "
            "kWh cumac, unité française utilisée dans le dispositif des "
            "certificats d'économies d'énergie (CEE). Un MWh cumac vaut 1 000 "
            "kWh cumac."
        ),
        "sections": [
            {
                "heading": "Définition",
                "body_wikitext": (
                    "Le MWh cumac est l'unité utilisée dans les volumes "
                    "d'obligation des fournisseurs d'énergie et dans les "
                    "publications statistiques mensuelles du registre EMMY.<ref name=\"emmy_stats\" />"
                ),
                "references": [
                    {
                        "title": "Statistiques du registre EMMY",
                        "url": "https://www.emmy.fr/public/donnees-statistiques",
                        "publisher": "Registre national des CEE",
                        "date": "2026-04-15",
                    }
                ],
            },
        ],
        "categories": [
            "Catégorie:Unité de mesure",
            "Catégorie:Politique énergétique en France",
            "Catégorie:Certificat d'économies d'énergie",
        ],
    },
    {
        "title": "Délégataire CEE",
        "category": "cee_concept",
        "summary": (
            "Un délégataire dans le dispositif français des certificats "
            "d'économies d'énergie (CEE) est une personne morale à laquelle un "
            "obligé délègue tout ou partie de son obligation. Le délégataire "
            "agit pour le compte de l'obligé auprès du Pôle national des "
            "certificats d'économies d'énergie (PNCEE)."
        ),
        "sections": [
            {
                "heading": "Cadre juridique",
                "body_wikitext": (
                    "Le statut de délégataire est défini par le code de l'énergie. "
                    "La délégation doit être enregistrée auprès du PNCEE et "
                    "publiée au registre EMMY.<ref name=\"delegataire_legifrance\" />"
                ),
                "references": [
                    {
                        "title": "Code de l'énergie, article R221-5",
                        "url": "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000023983208/LEGISCTA000023985776/",
                        "publisher": "Légifrance",
                        "date": "2026-04-15",
                    }
                ],
            },
            {
                "heading": "Mandataire",
                "body_wikitext": (
                    "Une figure distincte du délégataire est le mandataire, qui "
                    "accompagne les bénéficiaires dans le montage de leurs "
                    "dossiers sans porter l'obligation. Le mandataire est défini "
                    "à l'article 7 du règlement intérieur du registre EMMY.<ref name=\"mandataire_emmy\" />"
                ),
                "references": [
                    {
                        "title": "Règlement intérieur du registre EMMY",
                        "url": "https://www.emmy.fr/public/reglement-interieur",
                        "publisher": "Registre national des CEE",
                        "date": "2026-04-15",
                    }
                ],
            },
        ],
        "categories": [
            "Catégorie:Politique énergétique en France",
            "Catégorie:Certificat d'économies d'énergie",
        ],
    },
    {
        "title": "EMMY (registre)",
        "category": "cee_concept",
        "summary": (
            "EMMY est le registre national français des certificats d'économies "
            "d'énergie (CEE). Il enregistre la délivrance, la détention et les "
            "transactions de CEE. Le registre est tenu par un opérateur privé "
            "désigné par le ministère chargé de l'énergie."
        ),
        "sections": [
            {
                "heading": "Mission",
                "body_wikitext": (
                    "EMMY enregistre les comptes des obligés, des éligibles et "
                    "des délégataires, instruit les demandes de délivrance de "
                    "certificats, et publie des statistiques mensuelles agrégées "
                    "sur le marché des CEE.<ref name=\"emmy_mission\" />"
                ),
                "references": [
                    {
                        "title": "Présentation du registre EMMY",
                        "url": "https://www.emmy.fr/public/accueil",
                        "publisher": "Registre national des CEE",
                        "date": "2026-04-15",
                    }
                ],
            },
            {
                "heading": "Données publiques",
                "body_wikitext": (
                    "Les statistiques mensuelles publiées par EMMY incluent les "
                    "volumes de CEE délivrés, les prix de transaction SPOT et la "
                    "ventilation par filière. Ces données sont diffusées sous "
                    "licence ouverte.<ref name=\"emmy_stats\" />"
                ),
                "references": [
                    {
                        "title": "Données statistiques EMMY",
                        "url": "https://www.emmy.fr/public/donnees-statistiques",
                        "publisher": "Registre national des CEE",
                        "date": "2026-04-15",
                    }
                ],
            },
        ],
        "categories": [
            "Catégorie:Registre public en France",
            "Catégorie:Politique énergétique en France",
            "Catégorie:Certificat d'économies d'énergie",
        ],
    },
]


ALL_ENTRIES: list[dict[str, Any]] = RGE_QUALIFICATIONS + CEE_CONCEPTS
