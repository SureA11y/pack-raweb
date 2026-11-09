# Rule map review: RAWeb 1.1 against pack-rgaa's links

pack-raweb takes `@surea11y/pack-rgaa`'s rule map for RGAA 4.1.2 and keeps, changes or drops each link where RAWeb 1.1 words a test differently. [`RGAA_COMPARISON.md`](./RGAA_COMPARISON.md) sorts the tests. The 129 links on tests RAWeb leaves unchanged, or changes only in form, carry over as they are. This document records the judgement on the other 47 links: 29 reworded tests and 36 rules.

Each decision rests on RAWeb's wording and on its [revision notes](https://github.com/accessibility-luxembourg/ReferentielAccessibiliteWeb/blob/9ebf98f4e1239ccd99dc95d52c81903562075f78/en/notes-de-revision.md) (commit `9ebf98f`). The rule behaviour is read from each rule's source and its row note in pack-rgaa 1.1. One principle applies throughout: a link that could fail a page RAWeb accepts is dropped or made a question. A question is never a false failure.

## Summary

| | Links |
|---|---:|
| Kept as they are | 35 |
| Kept for some findings only | 3 |
| Dropped | 9 |
| **Reviewed** | **47** |
| Added: rules that check what RAWeb now asks | 3 |

## Kept as they are (35)

| Test | Rules | Why the change doesn't affect them |
|---|---|---|
| 1.2.1 | `image-redundant-alt`, `rgaa-img-no-alt-decorative` | RAWeb adds a third way to mark a decorative `<img>`: `role="presentation"` or `"none"` with no `title`, `aria-label` or `aria-labelledby`. The first rule only asks. The second already leaves out images with those roles, so it fails only an `<img>` none of the three conditions accept. |
| 1.2.4 | `rgaa-svg-decorative-aria-hidden` | RAWeb keeps the one condition this rule checks: a decorative `<svg>` has `aria-hidden="true"`. |
| 1.3.1 | `image-redundant-alt`, `img-alt-quality`, `rgaa-img-decorative-no-alternative` | Only "pour" ("for") is added at the start. |
| 1.4.4 to 1.4.7 | `rgaa-captcha-review` | RAWeb removes `alt` from objects, embeds, SVG and canvas, which have no such attribute. The rule only asks. |
| 4.4.1 | `video-caption` | RAWeb says what relevant captions are (in the video's language, relevant, synchronised) and asks it of at least one track. The rule asks whether the captions are relevant, and that question still holds. |
| 8.1.1 | `rgaa-doctype-present` | "Is each page defined by a document type?" A page with no doctype isn't. |
| 8.2.1 | `duplicate-id`, `rgaa-aria-attribute-conformance`, `rgaa-aria-role-conformance`, `rgaa-html-elements-attributes-valid`, `rgaa-html-nesting-valid`, `rgaa-markup-validation-review` | RAWeb asks the whole question, "is the generated source valid for the document type?", in place of RGAA's list of conditions. Each rule fails a defect that makes the source invalid. RAWeb relates 8.1 and 8.2 to WCAG 4.1.1, so its profile keeps 4.1.1 (`keepsParsing`), as pack-rgaa's does. |
| 10.7.1 | `css-focus-indicator-suppressed`, `css-hidden-focus`, `manual-review`, `rgaa-focus-indicator-contrast` | "Du clavier" ("keyboard") is added: the revision notes say the test concerns keyboard focus, not mouse focus. The rules already check keyboard focus. |
| 10.12.1 | `avoid-inline-spacing`, `text-spacing-content-loss` | "Increased to" becomes "set to at least". The values are WCAG 1.4.12's, which both rules apply. |
| 10.13.2 | `rgaa-tooltip-review` | An accent only. |
| 11.1.3 | `form-control-label-quality`, `form-control-programmatic-label-quality`, `rgaa-field-hidden-label-review` | A typo only. |
| 11.10.2 | `rgaa-required-field-indication` | RAWeb adds two ways to pass: a visible indication that names the field, and one in the group's legend. The rule fails a field only when its label, linked passages and surroundings show no indication, and asks when one is in the legend or next to the field. A general sentence such as "all fields are required" still fails, because it doesn't name the field. |
| 11.10.4 | `invalid-field-error-message` | RAWeb extends the test from required fields to every field with `aria-invalid="true"`. The rule asks about every such field, so the link fits better than before. |
| 13.5.1 | `rgaa-cryptic-content-review` | RAWeb no longer accepts a `title`; the meaning must be in the adjacent context or given in a way assistive technologies support. The rule asks about cryptic content that has no `title`. Content that has one isn't asked about, which is a gap but never a false failure (see the gaps below). |
| 13.8.1, 13.8.2 | `rgaa-moving-content-review` | RAWeb adds "excluding special cases": essential movement, and loaders. The rule only asks. |
| 13.9.1 | `css-orientation-lock`, `rgaa-orientation-content-parity` | Grammar only ("peut" becomes "peuvent"). |

## Kept for some findings only (3)

| Test | Rule | Decision | Why |
|---|---|---|---|
| 1.2.1 | `rgaa-img-decorative-no-alternative` | `hiddenImgHasAlternative` (an `<img aria-hidden="true">` with a `title` or ARIA name) becomes a question under 1.1.1, in place of a failure of 1.2.1. | Condition 2 accepts `aria-hidden="true"` alone, and the revision notes say it is enough for the image to be ignored. If the image is decorative, it passes 1.2.1. If it carries information, hiding it fails 1.1.1, which only a person can tell. The other code, `decorativeImgHasAlternative` (`alt=""` or a presentation role with a name), is a question under 1.2.1, 1.1.1 and 1.3.1, as before: condition 1 and the new condition 3 both forbid the name. |
| 9.2.1 | `rgaa-main-element-structure` | Only `noMain`, `mainMayBeInFrame` and `allHidden` count. `roleMainOnly`, `roleZoneOnly`, `extraMain`, `revealableMain` and `hiddenByAncestor` count toward no test. | RAWeb asks for a computed role (`banner`, `navigation`, `search`, `main`, `contentinfo`), given by the HTML element or by `role`. So `role="main"` on a `<div>` passes, and so do the other zone roles on any element. RAWeb also dropped the single visible `<main>` condition. A second `<main>` without `hidden` is still invalid HTML, and `rgaa-html-nesting-valid` fails it under 8.2.1. |
| 11.10.1 | `rgaa-required-field-indication` | Only `signMayMeanOther` and `markerExplainedAfter` count. `requiredNotIndicated`, `allFieldsRequiredSentence` and `markerNotExplained` count toward 11.10.2 alone. | Those three codes are given only for fields with `required` or `aria-required="true"`, and condition 2 of 11.10.1 accepts such a field. RGAA 4.1.2 has the same condition, so pack-rgaa has the same slip: it counts them toward 11.10.1 too. The criterion's verdict is right either way, because 11.10.2 fails. The test it's attributed to is wrong, and this will be fixed in pack-rgaa. |

## Dropped (9)

| Test | Rule | Why |
|---|---|---|
| 1.2.4 | `rgaa-svg-hidden-no-alternative` | RAWeb removes conditions 2 to 4 (no text alternative, no `<title>` or `<desc>`, no `title`): `aria-hidden="true"` is enough, as the revision notes say. An `<svg aria-hidden="true">` with a name passes 1.2.4. The rule's question under 1.1.5 (is the image informative, and so wrongly hidden?) stays. |
| 1.2.4 | `svg-text-alternative-quality` | For the same reason, an `<svg>` that turns out to be decorative and keeps its alternative no longer fails 1.2.4. The question stays under 1.3.6. |
| 1.9.1 to 1.9.5 | `rgaa-figure-caption-structure` | RAWeb removes the conditions this rule checks: `role="figure"` or `"group"` on `<figure>`, and an `aria-label` matching the caption. The conditions RAWeb keeps (the image and caption in a `<figure>`, the caption in a `<figcaption>`) are what make the rule apply, so it checks nothing RAWeb asks. |
| 6.2.1 | `rgaa-link-content-label-present` | RAWeb 6.2.1 asks only for an accessible name. Its revision notes and glossary drop RGAA's requirement for content between `<a>` and `</a>`, and the note that discounted text generated by CSS. A link named by `aria-label`, `aria-labelledby` or `title` passes, and this rule fails it. |
| 12.6.1 | `rgaa-page-zones-reachable` | RAWeb 12.6.1 now excludes the main zones (header, navigation, main content, footer, search), which move to 9.2.1. Those zones are exactly what this rule looks for, and its questions follow RGAA's 12.6 conditions. |

## Added (3)

| Test | Rule | Why |
|---|---|---|
| 6.2.1 | `link-name-present` (core) | It fails a link with no accessible name at all, which is exactly what RAWeb 6.2.1 now asks. pack-rgaa leaves it unlinked because RGAA asked for more. |
| 8.1.1 | `rgaa-doctype-valid`, `rgaa-doctype-position` | RAWeb asks whether each page is defined by a document type, in place of RGAA's three tests (present, valid, before `<html>`). A doctype named other than `html`, or written after `<html>` (which the parser drops), doesn't define the page for user agents, and that is how the glossary "Type de document" ("document type") describes its purpose. `rgaa-doctype-valid`'s question about an unknown public identifier stays a question. |

## Gaps (what no rule checks yet)

These are recorded and not filled now. Each would need a rule or a change to one.

- **9.2.1:** the computed roles of the header, navigation, search and footer zones. Only the main zone is checked. RAWeb's new tests 9.2.2 to 9.2.4 have no rule either.
- **9.2.1 on a page whose doctype isn't HTML5:** `rgaa-main-element-structure` doesn't apply there, though RAWeb removed that special case. The result is no finding, never a false one.
- **12.6.1:** no rule. Which blocks are grouping zones present on several pages is a person's call.
- **1.9.1 to 1.9.5:** no rule checks that a captioned image and its caption sit in a `<figure>` with a `<figcaption>`.
- **13.5.1:** cryptic content with a `title` isn't asked about, though RAWeb no longer accepts a `title`.
