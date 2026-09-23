# MedicareBenefits.care — deploy notes

Built September 23, 2026 for contract year 2026 (5,556 plans, 3,129 counties, 8,744 pages).

## Hosting (Firebase Hosting, free tier is fine for this size)
1. `npm i -g firebase-tools` → `firebase login` → in this folder `firebase init hosting` (use existing project; public dir `.`; no SPA rewrite).
2. `firebase deploy --only hosting`. Add the custom domain in Firebase console → Hosting → Add custom domain → follow the DNS records at Porkbun.
   (GitHub Pages also works: push this folder; Pages handles ~8,744 static files fine.)

## Revenue wiring
- **Ads:** put your AdSense client id in `mbc_config.json` → `adsense_client`, and your line in `ads.txt`. Rebuild.
- **Pro (B2B data subscription):** Firebase console → Authentication → enable Google sign-in. Extensions → install
  *Run Payments with Stripe* (`invertase/firestore-stripe-payments`): sync customers to Firestore, set the product's
  `firebaseRole` metadata to `pro` so subscribers get the `stripeRole=pro` claim. Create one Stripe price and put its id in
  `mbc_config.json` → `stripe_price_id`. Paste the Firebase web config into `mbc_config.json` → `firebase`. Rebuild.
- **Pro files:** upload the CSVs listed on pro.html to Firebase Storage under `pro/2026/`. `storage.rules` restricts them to
  active subscribers. Generate them from the warehouse with DuckDB `COPY (SELECT * FROM mart.county_plan_answer_2026) TO '...csv'`.
- **Newsletter:** set `newsletter_action` to your Formspree/Buttondown endpoint.

## Compliance posture
This is an informational publisher: no sales, no agent routing, no beneficiary data. The independence disclaimer is in the
banner and footer of every page, and pro.html states the subscription is a data product. Keep it that way — adding lead
capture or paid plan placement would put the site inside CMS third-party marketing rules.
