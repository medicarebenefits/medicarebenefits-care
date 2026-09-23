# MedicareBenefits.care — deploy notes

Built September 23, 2026 for contract year 2026 (5,556 plans, 3,129 counties, 8,744 pages). Live on GitHub Pages
(repo medicarebenefits/medicarebenefits-care, branch main, CNAME medicarebenefits.care). To publish: rebuild into this folder, `git add -A && git commit && git push`.

## Revenue wiring (each feature stays hidden until configured)
- **Ads:** `adsense_client` in mbc_config.json → ad units render and ads.txt is written. Block the Insurance category in AdSense.
- **Pro:** Firebase web config + `stripe_price_id` in mbc_config.json → the Pro page shows sign-in / subscribe / download states.
  Firebase: enable Google sign-in; install the *Run Payments with Stripe* extension with product metadata `firebaseRole=pro`;
  upload `site_data/2026/pro/*.csv` to Storage under `pro/2026/` (storage.rules gates them to subscribers).
- **Notifications:** `newsletter_action` (Formspree/Buttondown endpoint) → the notify card appears on every page.

## Compliance posture
Informational publisher: no sales, no agent routing, no beneficiary data, no paid placement. Independence disclaimer in the
banner and footer of every page; pro.html states the subscription is a data product with uniform pricing.
