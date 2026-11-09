# RAWeb source data

The files in `fr/` and `en/` are the reference files of the **Référentiel d’évaluation de l’accessibilité web (RAWeb) 1.1** (Web Accessibility Assessment Framework), Luxembourg's framework for assessing the accessibility of websites, copied byte for byte.

- **Title:** Référentiel d’évaluation de l’accessibilité web (RAWeb), version 1.1, published on 6 February 2026: <https://accessibilite.public.lu/fr/raweb1.1/index.html>
- **Author and licensor:** Service information et presse (SIP), Government of the Grand Duchy of Luxembourg.
- **Repository:** <https://github.com/accessibility-luxembourg/ReferentielAccessibiliteWeb>, commit `9ebf98f4e1239ccd99dc95d52c81903562075f78` (16 September 2026).
- **Licence:** [Creative Commons Attribution 3.0 Luxembourg (CC BY 3.0 LU)](https://creativecommons.org/licenses/by/3.0/lu/). Its text, as the repository publishes it, is in [`fr/LICENSE.md`](./fr/LICENSE.md) (French) and [`en/LICENSE.md`](./en/LICENSE.md) (English).

| File here | Repository file | Git blob | Last updated |
|---|---|---|---|
| `fr/criteres.json` | `fr/json/criteres.json` | `36e41dc4a099` | 15 April 2026 (`15c24b2`, links fixed) |
| `fr/methodologies.json` | `fr/json/methodologies.json` | `03fd123fc568` | 15 April 2026 (`15c24b2`) |
| `fr/glossaire.json` | `fr/json/glossaire.json` | `6e40928f4e6e` | 5 February 2026 (`e2f8047`, RAWeb 1.1) |
| `fr/themes.json` | `fr/themes.json` | `541f6a326503` | 14 January 2025 (`da46f02`) |
| `fr/LICENSE.md` | `fr/LICENSE.md` | `6842dcf35316` | 14 January 2025 (`da46f02`) |
| `en/criteres.json` | `en/json/criteres.json` | `1e1c5dee3076` | 15 April 2026 (`15c24b2`) |
| `en/methodologies.json` | `en/json/methodologies.json` | `3b1a0af15138` | 15 April 2026 (`15c24b2`) |
| `en/glossaire.json` | `en/json/glossaire.json` | `39844dfd9ef9` | 5 February 2026 (`e2f8047`) |
| `en/themes.json` | `en/themes.json` | `f9967ab49b0d` | 14 January 2025 (`15a551d`) |
| `en/LICENSE.md` | `en/LICENSE.md` | `d7c080bbb50f` | 14 January 2025 (`15a551d`) |

`tests/data.test.js` checks that each file is still the blob listed here.

## RAWeb's own notice

The repository's README states, and this notice is kept as it is:

> The contents of the RAWeb are licensed under a Creative Commons [CC-BY 3.0 LU](https://creativecommons.org/licenses/by/3.0/lu/) licence, they contain an adapted copy of the [RGAA 4.1.2](https://accessibilite.numerique.gouv.fr/) published by the [DINUM](https://www.numerique.gouv.fr/dinum/). The contents are obtained from the following git repository: [DISIC/RGAA](https://github.com/DISIC/RGAA).
>
> These contents have been adapted to the Luxembourg legal context by the [Service information et presse](https://sip.gouvernement.lu) and are listed in the [changelog](https://github.com/accessibility-luxembourg/ReferentielAccessibiliteWeb/blob/main/en/notes-de-revision.md).
>
> The RGAA technical method is adapted from the RGAA 3 technical framework updated 2017 (list of criteria, glossary, special cases, technical notes, "baseline" test environment) which is itself an adapted copy of the AccessiWeb HTML5/ARIA framework - Working version of 19/12/2013 - Published by the BrailleNet association. Copyright 2013 BrailleNet Association. All rights reserved.

## What this pack does with it

The files here are unchanged. The pack's generator (`scripts/generate-map.js`) builds its tables from them (`map.js`, `glossary.js`), with the French files as the text and the English ones as its English, and the standard (`standard-data.js`) is built from those tables. They are an adaptation, as article 3(b) of the licence calls it: **the original work has been modified**. Its Markdown and HTML markup are removed, and its criteria, tests, methodology and glossary are restructured as data; their wording is RAWeb's own, neither reworded nor translated. Every file that holds RAWeb's text says so.

What the pack adds is its own and not RAWeb's: which rules check which RAWeb test (the rule map), the rules it uses from `@surea11y/pack-rgaa` and `@surea11y/core`, and how results are combined.

Attribution, as article 4(b) asks: « Référentiel d’évaluation de l’accessibilité web (RAWeb) 1.1 », Service information et presse (SIP), Government of Luxembourg, <https://accessibilite.public.lu/fr/raweb1.1/index.html>, under CC BY 3.0 LU; adapted (markup removed, restructured as data) by this pack.

This pack is not affiliated with, sponsored or endorsed by the Service information et presse, the Government of Luxembourg, DINUM, the French State or the BrailleNet association.
