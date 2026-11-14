/* SPDX-License-Identifier: MPL-2.0 */

'use strict';

/**
 * RAWeb 1.1, Luxembourg's framework for assessing the accessibility of
 * websites, as a pack for @surea11y/core. Passed to a scan in
 * engineOptions.packs with @surea11y/pack-rgaa, which it builds on, it brings
 * the standard (RAWeb's criteria and tests, in its own French and English,
 * standard-data.js), one rollup per criterion, the raweb-1.1 profile and the
 * law it is used for, and RAWeb's methodology as the procedures a person
 * follows.
 *
 * RAWeb is an adaptation of RGAA 4.1.2: the pack takes pack-rgaa's data and
 * rule map (core's deriveStandard) and runs pack-rgaa's rules (uses), with
 * the changes RAWeb's wording requires (docs/RULE_MAP_REVIEW.md). It has no
 * rules of its own.
 */

const { definePack, standardFromData } = require('@surea11y/core/pack');
const rgaa = require('@surea11y/pack-rgaa');
const { name, version } = require('./package.json');
const { STANDARD_DATA } = require('./standard-data');

const standard = standardFromData(STANDARD_DATA, {
  report: { titleLang: 'fr' }
});

module.exports = definePack({
  name,
  version,
  namespace: 'raweb',
  // The pack uses other packs (uses), its standard is derived from
  // pack-rgaa's data, and it routes findings by fields of pack-rgaa's rules:
  // core's APIs for these are experimental until 1.18.0 or later, so the
  // range takes no later minor.
  core: '~1.17.0',
  description: 'RAWeb 1.1, the Luxembourg accessibility framework',
  uses: [rgaa],
  rules: [],
  standard
});
