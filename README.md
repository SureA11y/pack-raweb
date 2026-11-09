# @surea11y/pack-raweb

RAWeb 1.1 (Référentiel d’évaluation de l’accessibilité web, Luxembourg's Web Accessibility Assessment Framework) as a pack for [`@surea11y/core`](https://www.npmjs.com/package/@surea11y/core): its criteria and tests, one result per criterion, and the `raweb-1.1` profile.

RAWeb is an adapted copy of RGAA 4.1.2: it keeps RGAA's 106 criteria and their numbers, rewords many of their tests, and adds 30 criteria of its own, from EN 301 549 V3.2.1. The pack is built the same way: its standard is derived from [`@surea11y/pack-rgaa`](https://www.npmjs.com/package/@surea11y/pack-rgaa)'s data, and it uses pack-rgaa's rules (core's `uses`) instead of copying them, so a scan passes both packs.

**In development.** It needs `@surea11y/core` 1.17, which is not released yet.

## The data and its licence

`data/` holds RAWeb 1.1's reference files, byte for byte, as the Service information et presse (SIP) of the Government of Luxembourg publishes them under the [Creative Commons Attribution 3.0 Luxembourg licence (CC BY 3.0 LU)](https://creativecommons.org/licenses/by/3.0/lu/), with the licence's text. [`data/README.md`](./data/README.md) gives their source, commits and dates, and RAWeb's own notice, which credits DINUM's RGAA 4.1.2 and the AccessiWeb framework it descends from.

`npm run map` builds `map.js` and `glossary.js` from them. Those tables are an adaptation: **the original work has been modified**, its markup removed and its content restructured as data, its wording unchanged. The rule map, the rules and how results are combined are this pack's own, not RAWeb's.

Attribution: « Référentiel d’évaluation de l’accessibilité web (RAWeb) 1.1 », Service information et presse (SIP), Government of Luxembourg, <https://accessibilite.public.lu/fr/raweb1.1/index.html>, under CC BY 3.0 LU; adapted by this pack.

This pack is not affiliated with, sponsored or endorsed by the Service information et presse, the Government of Luxembourg, DINUM, the French State or the BrailleNet association.

## Licence

The code is under the [Mozilla Public License 2.0](./LICENSE), as `@surea11y/core` is. RAWeb's text, in `data/` and in `map.js` and `glossary.js`, is under CC BY 3.0 LU ([`data/README.md`](./data/README.md)). The package's licence is therefore `MPL-2.0 AND LicenseRef-CC-BY-3.0-LU`; SPDX has no identifier for the Luxembourg version of CC BY 3.0, so it is named by reference, with its text in `data/`.
