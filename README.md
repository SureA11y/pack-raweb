# @surea11y/pack-raweb

RAWeb 1.1 (Référentiel d’évaluation de l’accessibilité web, Luxembourg's Web Accessibility Assessment Framework) as a pack for [`@surea11y/core`](https://www.npmjs.com/package/@surea11y/core): its criteria and tests, one result per criterion, and the `raweb-1.1` profile.

RAWeb is an adapted copy of RGAA 4.1.2: it keeps RGAA's 106 criteria and their numbers, rewords many of their tests, and adds 30 criteria of its own, from EN 301 549 V3.2.1. The pack is built the same way: its standard is derived from [`@surea11y/pack-rgaa`](https://www.npmjs.com/package/@surea11y/pack-rgaa)'s data, and it uses pack-rgaa's rules (core's `uses`) instead of copying them, so a scan passes both packs.

## Use

```js
const rgaa = require('@surea11y/pack-rgaa');
const raweb = require('@surea11y/pack-raweb');

// Both packs, in the same scan: RAWeb runs pack-rgaa's rules.
const engineOptions = { packs: [rgaa, raweb], profile: 'raweb-1.1' };
```

The `raweb-1.1` profile runs the rules the pack's map links to a RAWeb test, pack-rgaa's and core's, and reports RAWeb's criteria alone, judged by WCAG 2.1 with 4.1.1 Parsing kept, as RAWeb 8.1 and 8.2 refer to it. Results name the law the profile is used for, the Luxembourg law of 28 May 2019 on the accessibility of public sector websites and mobile applications, with a link to its official text. The pack identifies the law and doesn't document it.

A scan with only `raweb` skips it and says why, in `skippedPacks`: it needs the pack-rgaa it was built with.

## What it checks

RAWeb keeps RGAA's test numbers, so the pack takes pack-rgaa's rule map and changes it only where RAWeb says something different:

- tests it rewords;
- methodology, particular cases and glossary entries it changes;
- tests it adds.

[`docs/RULE_MAP_REVIEW.md`](./docs/RULE_MAP_REVIEW.md) records each decision and how it was checked, and [`docs/RGAA_COMPARISON.md`](./docs/RGAA_COMPARISON.md), generated, shows every difference between the two texts. A link that could fail a page RAWeb accepts is dropped or made a question for a person. `tests/standard.test.js` has a page for each change.

Each test's procedure is RAWeb's methodology, in its French and its own English. RAWeb publishes none for 8.1.1 and 8.2.1, so the pack gives those two tests steps of its own and says so.

Messages from pack-rgaa's rules still name RGAA where they cite a test (« fails RGAA 11.10.2 »). The test numbers are RAWeb's too, but read them as RAWeb's.

## The data and its licence

`data/` holds RAWeb 1.1's reference files, byte for byte, as the Service information et presse (SIP) of the Government of Luxembourg publishes them under the [Creative Commons Attribution 3.0 Luxembourg licence (CC BY 3.0 LU)](https://creativecommons.org/licenses/by/3.0/lu/), with the licence's text. [`data/README.md`](./data/README.md) gives their source, commits and dates, and RAWeb's own notice, which credits DINUM's RGAA 4.1.2 and the AccessiWeb framework it descends from.

`npm run map` builds `map.js` and `glossary.js` from them. Those tables, and the standard's data in `standard-data.js`, are an adaptation: **the original work has been modified**, its markup removed and its content restructured as data, its wording unchanged, in RAWeb's French and its own English. The rule map, the steps for 8.1.1 and 8.2.1, the rules and how results are combined are not RAWeb's: they are this pack's and pack-rgaa's.

Attribution: « Référentiel d’évaluation de l’accessibilité web (RAWeb) 1.1 », Service information et presse (SIP), Government of Luxembourg, <https://accessibilite.public.lu/fr/raweb1.1/index.html>, under CC BY 3.0 LU; adapted by this pack.

This pack is not affiliated with, sponsored or endorsed by the Service information et presse, the Government of Luxembourg, DINUM, the French State or the BrailleNet association.

## Licence

The code is under the [Mozilla Public License 2.0](./LICENSE), as `@surea11y/core` is. RAWeb's text, in `data/` and in `map.js`, `glossary.js` and `standard-data.js`, is under CC BY 3.0 LU ([`data/README.md`](./data/README.md)). The package's licence is therefore `MPL-2.0 AND LicenseRef-CC-BY-3.0-LU`; SPDX has no identifier for the Luxembourg version of CC BY 3.0, so it is named by reference, with its text in `data/`.
