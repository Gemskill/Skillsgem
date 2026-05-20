# Skillsgem

A UK-wide directory of Special Educational Needs and Disability (SEND) services — special schools, therapists, charities and parent-led groups across the UK, Northern Ireland and the Crown Dependencies (Isle of Man, Jersey, Guernsey).

Built with Next-gen React + Vite, Express, and SQLite. Ships pre-loaded with **216 services across 20 regions**.

---

## What's in this repo

```
skillsgem/
├── client/            React frontend (the website people see)
├── server/            Express backend (API, admin, submit form)
├── shared/            Shared schema and types
├── script/            Build script
├── seed.db            Starter database with 216 services pre-loaded
├── render.yaml        One-click Render deployment config
├── .env.example       Example environment variables
└── package.json
```

---

## Deploying to Render (recommended)

Render is the easiest way to host this. The Hobby/Starter plan ($7/month) keeps the app always-on with a persistent disk for the database.

### Step 1 — Put this code on GitHub

1. Sign in to [github.com](https://github.com) (create a free account if you don't have one)
2. Click the **+** in the top right → **New repository**
3. Name it `skillsgem` (or anything you like)
4. Keep it **Public** or **Private** — both work with Render
5. Click **Create repository**
6. On the next page, copy the URL (looks like `https://github.com/yourname/skillsgem.git`)

Then on your computer (you'll need [Git](https://git-scm.com/downloads) installed):

```bash
cd path/to/this/folder
git init
git add .
git commit -m "Initial Skillsgem deployment"
git branch -M main
git remote add origin https://github.com/yourname/skillsgem.git
git push -u origin main
```

If you'd rather not use the command line, you can upload all the files to GitHub directly in the browser (use the **Add file → Upload files** button on your new empty repo — drag the whole folder in).

### Step 2 — Connect to Render

1. Sign up at [render.com](https://render.com) (free, GitHub login works)
2. From the dashboard, click **New +** → **Blueprint**
3. Connect your GitHub account when prompted, then select the `skillsgem` repo
4. Render reads `render.yaml` and shows you what it'll create:
   - A web service called `skillsgem` on the Starter plan
   - A 1 GB persistent disk mounted at `/data`
5. It'll ask you to set **ADMIN_TOKEN** — type a strong password only you know (e.g. `my-secret-2026-xyz`). Save this somewhere — you'll need it to log into the admin panel.
6. Click **Apply** — Render starts building. First deploy takes ~5 minutes.

### Step 3 — You're live

When Render shows "Live", click the URL at the top (it'll be something like `https://skillsgem.onrender.com`). The site is up with all 216 services.

To access the admin panel:
- Go to `https://skillsgem.onrender.com/#/admin`
- Enter the `ADMIN_TOKEN` you set in step 2
- You can now review submissions and bulk-import CSVs

### Step 4 — Custom domain (optional)

If you've bought a domain (e.g. `skillsgem.co.uk`):

1. In Render, go to your service → **Settings** → **Custom Domains** → **Add**
2. Enter your domain (e.g. `skillsgem.co.uk` and `www.skillsgem.co.uk`)
3. Render shows you DNS records to add at your domain registrar (Namecheap, GoDaddy, etc.)
4. Add them — propagation usually takes 10-60 minutes
5. SSL is automatic and free

---

## Making changes after launch

Every time you push to GitHub, Render auto-deploys.

```bash
# Make your edits, then:
git add .
git commit -m "Updated colours"
git push
```

Render rebuilds and redeploys in ~3-5 minutes. The database on the persistent disk is not touched.

---

## Running locally (optional)

If you want to test changes before pushing:

```bash
# 1. Install Node.js 20+ from nodejs.org
# 2. From this folder:
npm install
cp .env.example .env
# Edit .env and set ADMIN_TOKEN to anything for local testing
npm run dev
```

Visit [http://localhost:5000](http://localhost:5000). The local app uses `data.db` in the project root (created on first run from `seed.db`).

---

## Backing up your database

Your SQLite database lives on the Render persistent disk at `/data/data.db`. To download a backup:

1. In Render dashboard → your service → **Shell** tab
2. Run: `cat /data/data.db | base64` and copy the output
3. On your computer, decode it: `echo "<paste>" | base64 -d > backup.db`

Or use Render's snapshot feature (paid Pro plan).

Do this weekly once you have real submissions you don't want to lose.

---

## Adding services via CSV

The admin panel accepts CSV uploads. Format:

```csv
name,service_type,send_needs,therapies,age_min,age_max,fee_model,region,locality,postcode,website,phone,email,source_name,source_url,description
```

- `service_type`: one of `special_school`, `mainstream_with_resource`, `independent_specialist`, `pru_ap`, `therapy_provider`, `charity_support`, `respite_short_breaks`, `tutor_consultancy`, `advocacy_legal`, `assessment_diagnostic`, `parent_support_group`, `local_offer`, `other`
- `send_needs`: pipe-delimited, e.g. `ASD|ADHD|SpLD` — valid values: ASD, ADHD, SpLD, SEMH, PMLD, SLD, MLD, SLCN, HI, VI, MSI, PD, Medical, Behavioural, Generic
- `therapies`: pipe-delimited, e.g. `SaLT|OT|Sensory_Integration` — valid values: SaLT, OT, Physio, Music_Therapy, Play_Therapy, ABA, Counselling, EP, Sensory_Integration
- `fee_model`: one of `free`, `nhs_funded`, `la_funded`, `means_tested`, `paid`, `mixed`, `unknown`
- `region`: one of 20 regions (see `shared/schema.ts` for the full list)

In the admin panel, tick **"Replace all"** to clear existing services first, or leave unchecked to append.

---

## Costs

| Item | Cost |
|---|---|
| Render Starter web service | $7/mo (~£5.50) |
| 1 GB persistent disk | $0.25/mo |
| Custom domain (optional) | ~£10/year from a registrar |
| GitHub | Free |
| **Total** | **~£6/mo + optional domain** |

---

## Future additions

The codebase is set up so you can add later without rebuilding:
- **Payhip shop** — add a `/shop` page with embedded Payhip buy buttons (for selling worksheets, EHCP templates, etc.)
- **Featured listings** — paid placement for providers
- **Newsletter signup** — connect to Mailchimp / Buttondown
- **Stripe payments** — for direct subscriptions

---

## Troubleshooting

**"Build failed: better-sqlite3"** — Render's Node version might mismatch. In Render, set `NODE_VERSION` env var to `20`.

**"Database is empty after deploy"** — make sure `seed.db` is committed to the repo (`git ls-files seed.db` should show it). The app auto-copies it to `/data/data.db` on first boot only.

**"Can't log into admin"** — double-check the `ADMIN_TOKEN` env var in Render dashboard matches what you're entering at `/#/admin`.

**"Site is slow on first load after idle"** — Starter plan doesn't sleep, so this shouldn't happen. If it does, check Render's status page.

---

## Licence

You own this code — do whatever you want with it.
