# MedicareBenefits.care — deploy notes

Built September 23, 2026 for contract year 2026 (5,556 plans, 3,137 counties, 8,753 pages). Live on GitHub Pages
(repo medicarebenefits/medicarebenefits-care, branch main, CNAME medicarebenefits.care). To publish: rebuild into this folder, `git add -A && git commit && git push`.

## Revenue wiring (each feature stays hidden until configured)
- **Ads:** `adsense_client` in mbc_config.json → ad units render and ads.txt is written. Block the Insurance category in AdSense.
- **Pro:** Firebase web config + `stripe_price_id` in mbc_config.json → the Pro page shows sign-in / subscribe / download states.
  Firebase: enable Google sign-in; install the *Run Payments with Stripe* extension with product metadata `firebaseRole=pro`;
  upload `site_data/2026/pro/*.csv` to Storage under `pro/2026/` (storage.rules gates them to subscribers).
- **Notifications:** `newsletter_action` (Formspree/Buttondown endpoint) → the notify card appears on every page.
- **Analytics:** `clarity_id` (Microsoft Clarity project id) → the Clarity tag is emitted in every page head and the Privacy page discloses it. Search and email inputs carry `data-clarity-mask`.
- **Search engines:** `google_site_verification` / `bing_site_verification` (meta-tag tokens from Search Console / Bing Webmaster Tools) → verification tags in every head. Submit `https://medicarebenefits.care/sitemap.xml` in both consoles after verifying.
- **Pro leads:** `pro_lead_action` (Formspree/Buttondown endpoint) → a "Request early access" form (work email + organization) on pro.html. Professionals only; keep it off consumer pages.
- **ZIP lookup:** built from the Census ZCTA-county file into `data/zip/NNN.json`; the home search resolves 5-digit ZIPs client-side.

## Compliance posture
Informational publisher: no sales, no agent routing, no beneficiary data, no paid placement. Independence disclaimer in the
banner and footer of every page; pro.html states the subscription is a data product with uniform pricing.
