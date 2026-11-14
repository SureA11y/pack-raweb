# Changelog

All notable changes to this package are documented here. This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-11-14

First release. Needs `@surea11y/core` 1.17.0 or a later 1.17 release, and `@surea11y/pack-rgaa` 1.2.1 or a later 1.2 release, which it builds on and which a scan takes in the same packs (`packs: [rgaa, raweb]`). The pack uses experimental APIs of core (standard data and derivation, laws, `uses`), so its range takes no later minor.

### Added

- RAWeb 1.1's reference files in `data/`, byte for byte, with their licence (CC BY 3.0 LU) and attribution, and the tables built from them (`map.js`, `glossary.js`): 17 themes, 136 criteria, 304 tests and the glossary, in RAWeb's own French wording, and RAWeb's own English version (`RAWEB_TRANSLATIONS`), which the generator checks lines up with the French test for test.
- The standard (`standard-data.js`), derived with core's `deriveStandard` from `@surea11y/pack-rgaa`'s data: RAWeb's 136 criteria and 304 tests, each based on RGAA's where RGAA has it. Each test's procedure is RAWeb's methodology, in French and English, and the themes are its groups. RAWeb publishes no methodology for 8.1.1 and 8.2.1: the pack gives them steps of its own, and says so.
- The rule map: pack-rgaa's, changed where RAWeb differs, each change recorded with its reason in `docs/RULE_MAP_REVIEW.md`. A link that could fail a page RAWeb accepts is dropped or made a question for a person. The pack uses pack-rgaa's rules (core's `uses`) and has none of its own. Core's `page-zones-landmark` asks under 9.2.1, 9.2.3 and 9.2.4, and pack-rgaa's `titleOnly` under 13.5.1.
- The `raweb-1.1` profile, judged by WCAG 2.1 with 4.1.1 Parsing kept, and the law it is used for: the Luxembourg law of 28 May 2019, named with a link to Legilux.
- `docs/RGAA_COMPARISON.md` compares RAWeb's tests, methodology, particular cases, technical notes and glossary with RGAA's.
- Tests: a page for each change to the rule map, a check that every other row is pack-rgaa's, and RGAA's results unchanged when RAWeb is in the scan.
