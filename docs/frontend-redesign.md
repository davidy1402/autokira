# AutoKira frontend redesign

Implemented on 4 October 2026. This is a presentation and interaction change; the calculation utilities, vehicle data, types, translation resources, result store, and calculator state contracts are preserved.

## Screen audit

The old interface defaulted to dark charcoal and amber, used monospace display numbers for ordinary product data, repeated rounded cards at the same importance level, and introduced jargon such as “Driving Cost Intelligence” and “Detailed Analysis Hub.” A fixed bottom CTA and tall sticky header reduced mobile reading space. Small preset buttons, unlabelled numeric inputs, and clickable detail tiles also made the flow harder to use with a thumb or keyboard. Results led with a counting number instead of explaining the decision.

## Direction and UX decisions

The interface is light first for a driver using a phone in daylight. Saved dark preferences are respected. A single teal accent marks actions and selections; one system sans-serif carries headings, labels, and data. Dividers and spacing group the questions instead of making every input a card.

The input flow asks about the car, charging access, monthly distance, and current spending. The selected vehicle is prominent and opens the existing searchable preset picker. Number fields keep an editable draft, so a user can clear a value or type decimals without the display jumping. Blurring an untouched electricity bill does not reconvert it or change the underlying household usage. Presets fill mileage with one tap. Uncommon inputs sit in “Adjust assumptions.” The calculate button follows the form instead of permanently covering the bottom of the screen.

Results begin with a sentence about savings or extra spending. A proportional comparison shows current petrol spending and new charging spending, followed by the home/public charging split. The explanation highlights the household tariff threshold or public charger rate, then asks the user to check that petrol spending and mileage describe the same driving. Yearly projections, TNB details, road tax, vehicle comparisons, loan estimates, tank range, and trip splitting remain optional.

Both modes use visible labels, readable units, 16px numeric inputs, controls at least 44px wide/high, and a 3px keyboard focus indicator. Sheets have dialog names, contain keyboard focus, dismiss with Escape, return focus to their trigger, and lock background scrolling. Motion is limited to short feedback transitions; reduced-motion styles suppress animation and transitions. Pinch zoom is enabled. The document language follows the selected language.

Report contents are preserved. Copy success is displayed only after the clipboard promise succeeds, with an error message when copying fails.

## Preserved assumptions and scope

- Home charging retains the existing 90% home / 10% public split; condo/public charging retains 100% public charging. These are visible beside the choices.
- The EV utility applies a fixed 10% charging overhead. Its existing charging-loss state field is preserved; the redesigned interface describes the fixed overhead rather than presenting a control that the utility ignores.
- Existing tariff, AFA, ToU, petrol price, vehicle, road tax, servicing, route, toll, and loan assumptions are unchanged. They were not researched or refreshed in this redesign. The interface labels estimates and price assumptions instead of implying live quotations.
- EV conclusions compare energy spending; road tax is separate. Petrol running costs include fuel, allocated road tax, and servicing. Purchase price, loans, and insurance are excluded from the primary monthly conclusion. Existing purchase/loan projections remain in detail tools.
- Current petrol spending must represent the same driving distance as the selected mileage. This is explicitly explained rather than silently changing the baseline.

## Verification

`npm run build` passes (TypeScript and Vite production build).

`node scripts/verifyFrontendMath.mjs` compares all returned fields against the pre-redesign implementation at Git HEAD: 105 EV/petrol scenarios and six TNB boundary cases match exactly. Scenarios include zero mileage, home/public charging, ToU, low/high usage, and threshold boundaries. Default home charging retains RM 19.37 monthly savings; the same default mileage with all-public charging at RM 1.40/kWh gives RM 119.84 extra monthly spending. Default petrol mode gives RM 269.16 monthly running cost.

Browser verification used the Codex in-app browser at measured widths of 390px and 1440px. English/Chinese and light/dark primary flows have no horizontal page overflow. Visible controls meet 44px sizing; visible numeric/text inputs are at least 16px and named. All eight EV/petrol detail tools opened and dismissed at 390px, including Chinese wrapping. Preset search/selection, empty number editing, unchanged-bill focus/blur, keyboard focus, Escape dismissal, focus return, and report copying were exercised. The copied EV report retained the RM 19.37 value. No browser warnings or errors were reported in the final check.

The shared palette was checked with WCAG relative luminance: secondary body text on the deepest light/dark neutral surface is 5.45:1 / 6.38:1; primary button text is 6.40:1 / 9.31:1; input/control borders are 3.30:1 / 4.89:1; focus rings on the page are 5.99:1 / 8.99:1. This is a targeted accessibility verification, not a certification across every browser or assistive technology.

Measured browser checks are saved in [frontend-checks.json](frontend-checks.json). Screenshots: [desktop input](screenshots/desktop-input.png), [mobile result](screenshots/mobile-result.png).

## Files changed

- `src/pages/cockpit.page.tsx`: guided EV input screen and mode selection.
- `src/pages/results.page.tsx`: monthly decision flow, projections, optional tools, report actions.
- `src/components/DrivingForm.tsx`: shared header, vehicle selection, editable number fields, presets, disclosures.
- `src/components/MonthlyDecision.tsx`: conclusion, comparison, charging breakdown, main factors.
- `src/components/EvResultSheets.tsx`: retained EV detail sheets and vehicle comparison logic, separated from the page.
- `src/components/IceCockpitSection.tsx`: guided petrol inputs and disclosed assumptions.
- `src/components/IceResultsSection.tsx`: petrol monthly conclusion and optional existing tools.
- `src/components/VehiclePickerSheet.tsx`: accessible dialog, labelled search, language-aware specification copy.
- `src/components/ResultSheetModal.tsx` and `src/hooks/useModalFocus.ts`: sheet keyboard and focus behavior.
- `src/components/RoadTripSplitterCard.tsx`: input labels, readable layout, selection states, clipboard feedback; trip formulas unchanged.
- `src/index.css`: shared theme, typography, spacing, touch sizing, contrast, focus, wrapping, reduced motion.
- `src/App.tsx`: document language/theme colors and focus on screen transitions.
- `src/stores/calculator.store.ts`: only the unsaved default theme changes from dark to light.
- `index.html`: light-first bootstrap, product metadata, zoom support, system typography.
- `scripts/verifyFrontendMath.mjs`: comparison against original calculator outputs.
- `docs/frontend-checks.json`, `docs/screenshots/`, and this note: verification evidence.

No dependencies were added. Legacy components not mounted by App were left in place.

## Follow-up refinement

Following user review, the dark theme now uses neutral charcoal surfaces instead of green-tinted surfaces. Teal is concentrated in the Kira wordmark, actions, and current selections. The selected vehicle has a stronger name hierarchy and a quiet tinted surface.

The introductory slogan and long scope paragraph were removed. The input introduction now contains a short title and one explanatory sentence; mode-specific cost scope sits next to the calculate action. At 390px, the Chinese intro itself measures 63px high. The existing layout and question order are preserved.

Both shared sheet variants replace their X with a visible Done / 完成 button. Dragging, backdrop dismissal, Escape, keyboard focus containment, and return to the triggering control are preserved. The Done button measures 60 × 44px on mobile.

English/Chinese and light/dark input screens were checked at 390px, plus desktop layouts at 1440px. No page overflow, undersized visible controls, or unlabelled visible inputs were detected. Click-to-dismiss and Escape both return focus to vehicle selection. The default result still displays RM 19.37 savings; the production build and all 105 calculation scenarios plus six TNB cases pass.

Follow-up evidence: [measured checks](refinement-checks.json), [light mobile](screenshots/mobile-light-refined.png), [charcoal dark mobile](screenshots/mobile-dark-refined.png).

## Responsive typography follow-up

Unified the shared typography utilities and component sizes in `src/index.css` around rem roles. Mobile/tablet headings no longer use viewport-relative sizing or a separate 640px type jump. Default mobile sizes: 26px input title, 28px result title, 18px section headings, 16px body/input text, 14px labels, and 13px notes. Only main titles increase at 900px. Inputs keep a 16px minimum while following larger default text sizes. Labels can wrap, and the bill/unit row can reflow.

Explicitly retained 100% text-size-adjust (Tailwind already included the WebKit-prefixed rule) and unrestricted page zoom. The existing system font stack remains, so platform glyph shapes and user/browser text preferences can still differ. This change does not establish the cause of the reported S24 Ultra/iPhone 15 Pro difference, and no physical-device test was performed.

Measured viewport checks cover 320, 390, 393, 412, 430, 768 and 1440px. At 393 and 412px, the default computed input title, section title and input sizes match exactly. EV/petrol inputs and results plus all eight detail tools were checked across selected English/Chinese and light/dark states. No horizontal page overflow, visible inputs below 16px, or visible controls below 44px were detected. Production build passes. Evidence: `typography-checks.json` and `screenshots/mobile-type-scale.png`.

## Desktop browser workspace

At widths of 1100px and above, the input page now uses a scenario summary beside a two-column form. EV vehicle/charging controls and distance/spending controls share the workspace; petrol inputs use the same structure. Assumptions start expanded on desktop and remain natively collapsible. Mobile keeps the existing single-column flow.

Both result modes place monthly costs beside the expanded detail/tool panel. Vehicle selection and result sheets become centered desktop dialogs, retaining mobile sheets, focus containment, Escape dismissal and focus return. Desktop dialogs do not use touch drag dismissal.

Validation: production build and `verifyFrontendMath.mjs` pass (105 EV/petrol scenarios and six TNB boundary cases). Chromium checks cover 44 input/result layouts across English/Chinese and 320–1920px widths, with no horizontal overflow or runtime errors. All eight EV/petrol tools opened and dismissed with Escape; EV report copy feedback and theme switching were exercised. Physical devices and other browser engines were not tested for this follow-up.

Evidence: [desktop checks](desktop-checks.json), [Chinese desktop input](screenshots/desktop-workspace-zh.png), [desktop result](screenshots/desktop-workspace-results.png), [mobile check](screenshots/mobile-workspace-check.png).
