# Changelog

All notable changes to this package are documented here. This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- RAWeb 1.1's reference files in `data/`, byte for byte, with their licence (CC BY 3.0 LU) and attribution, and the tables built from them (`map.js`, `glossary.js`): 17 themes, 136 criteria, 304 tests and the glossary, in RAWeb's own French wording.
- RAWeb's own English version, from `data/en/`, in `map.js` (`RAWEB_TRANSLATIONS`). The generator checks that it lines up with the French test for test.
- The standard (`standard-data.js`), derived with core's `deriveStandard` from `@surea11y/pack-rgaa`'s data: RAWeb's 136 criteria and 304 tests, each based on RGAA's where RGAA has it. Each test's procedure is RAWeb's methodology, in French and English, and the themes are its groups.
- The rule map: pack-rgaa's, changed where RAWeb differs (`docs/RULE_MAP_REVIEW.md`). The pack uses pack-rgaa's rules (core's `uses`) and has none of its own.
- The `raweb-1.1` profile and the law it is used for: the Luxembourg law of 28 May 2019, named with a link to Legilux.
- `docs/RGAA_COMPARISON.md` compares RAWeb's tests, methodology, particular cases, technical notes and glossary with RGAA's.
- Tests: a page for each change to the rule map, and a check that every other row is pack-rgaa's.
