# Zen teacher ingest progress

Last updated: 2026-06-30

## Summary

- **Teachers in `src/data/teachers.json`:** 584
- **Added from AZTA + Mandalas import (2026-06-30):** 284 new, 3 enriched, 236 photos downloaded
- **AZTA source members:** 248 total · 239 matched · **9 not ingested**
- **Mandalas list entries:** 115 total · 78 matched · **37 not ingested**
- **Profiles without a local photo:** 50
- **DB seeded:** 584 teachers via `npx tsx scripts/seed-teachers-slugs.ts --all` (2026-06-30)

## Sources

- [AZTA members](https://zenteachers.org/members-of-azta) — active American Zen Teachers Association members (lineage + Zen Order columns)
- [Mandalas Life — prominent American Zen Buddhists](https://mandalas.life/list/the-most-prominent-american-zen-buddhists/) — biographical list (not all are teachers)

## How to run

```bash
# Import / enrich from AZTA + Mandalas (dry run first)
npx tsx scripts/import-zen-teachers.ts --dry-run
npx tsx scripts/import-zen-teachers.ts

# Skip photo downloads during import
npx tsx scripts/import-zen-teachers.ts --skip-photos

# Backfill missing portraits
npm run download-teacher-photos

# Seed Postgres from JSON
npx tsx scripts/seed-teachers-slugs.ts --all

# Seed specific slugs only
npx tsx scripts/seed-teachers-slugs.ts reb-anderson norman-fischer
```

Import script: `scripts/import-zen-teachers.ts`

- Merges AZTA rows with Mandalas bios when names align
- Stores **Zen Order** in the profile `lineage` field (e.g. `Soto Zen / White Plum Asanga`)
- Skips Mandalas-only celebrities (musicians, actors, etc.) unless bio shows Zen teacher role
- Does not overwrite unrelated existing profiles (strict name matching)

## Enriched existing profiles

- Norman Fischer — AZTA location/order + Mandalas bio (replaced disambiguation stub)
- D. T. Suzuki — Mandalas bio
- Taizan Maezumi — Mandalas bio

## Not yet ingested — AZTA

These AZTA members did not match any profile (likely name-order / dharma-name mismatch):

| Name | Center | Lineage | Zen Order |
| --- | --- | --- | --- |
| Bon Yeon Jane Dobisz | Cambridge Zen Center | Korean Chogye | Kwanum Zen School |
| Dae Kwang | Providence Zen Center | Korean Chogye | Kwanum Zen School |
| Gyokuko Carlson | Dharma Rain Zen Center | Soto Zen |  |
| Joen Snyder-Oneal | Compassionate Ocean Dharma Center | Soto Zen |  |
| Ryuun Joriki Baker | Blue Mountain Zendo, Koryu-Ji | Rinzai Zen | Soen linieage |
| Shinge Roko Chayat | Zen Center of Syracuse | Rinzai Zen |  |
| Shinshu Roberts | Ocean Gate Zen Center | Soto Zen | Shunryu Suzuki-roshi lineage |
| Shosan Victoria Austin | San Francisco Zen Center | Soto Zen |  |
| Tom Dharma-Joy Reichert | Zen Center of Los Angeles | Soto/White Plum Asanga |  |

## Not yet ingested — Mandalas list

Excluded celebrities/practitioners or name-match failures:

- Albert Saijo — bio lacks Zen teacher signals
- Andrew Joslyn — bio lacks Zen teacher signals
- Anne Hopkins Aitken
- Anne Rudloe — bio lacks Zen teacher signals
- Anthony Ervin — bio lacks Zen teacher signals
- Anthony Newman — bio lacks Zen teacher signals
- Arthur Braverman
- Chase Twichell — bio lacks Zen teacher signals
- Chris Kattan — bio lacks Zen teacher signals
- Chrisann Brennan — bio lacks Zen teacher signals
- Dae Kwang
- Frank Herbert — bio lacks Zen teacher signals
- Garry Shandling — bio lacks Zen teacher signals
- Gyokuko Carlson
- Issan Dorsey
- James H. Austin
- Jishō Warner
- John Cage — bio lacks Zen teacher signals
- John Tesshin Sanderson
- Lynn Flewelling — bio lacks Zen teacher signals
- Marian Derby
- Michael O’Keefe — bio lacks Zen teacher signals
- Natalie Goldberg — bio lacks Zen teacher signals
- Ocean Vuong — bio lacks Zen teacher signals
- Paul Reps — bio lacks Zen teacher signals
- Peter Coyote — bio lacks Zen teacher signals
- Peter Cunningham — bio lacks Zen teacher signals
- Philip Whalen
- Richard Machowicz — bio lacks Zen teacher signals
- Rob Mounsey — bio lacks Zen teacher signals
- Scott Shaw — bio lacks Zen teacher signals
- Shunryū Suzuki
- Soenghyang
- Stephanie Kaza — bio lacks Zen teacher signals
- Steve Jobs — bio lacks Zen teacher signals
- Subong
- William Nyogen Yeo

## Missing photos (ingested, no local portrait)

- Alan Sanhyō Richardson (`alan-sanhyo-richardson`)
- Bon Soeng Jeffrey Kitzes (`bon-soeng-jeffrey-kitzes`)
- Choan (Denko) Bertelsen (`choan-denko-bertelsen`)
- Cornelia Junfu Shonkwiler (`cornelia-junfu-shonkwiler`)
- Daishin Alfredo Malagodi (`daishin-alfredo-malagodi`)
- Dokuro Jaeckel (`dokuro-jaeckel`)
- Drimed Lodro Rinpoche (`drimed-lodro-rinpoche`)
- Dungse Rigzin Dorje Rinpoche (`dungse-rigzin-dorje-rinpoche`)
- Eishun Anraku Hondorp (`eishun-anraku-hondorp`)
- Ellen Jikai Birx (`ellen-jikai-birx`)
- Eshin John Godfrey (`eshin-john-godfrey`)
- Etsudo Patty Krahl (`etsudo-patty-krahl`)
- Genjo Gallagher (`genjo-gallagher`)
- Geoff Dawson (`geoff-dawson`)
- Hae Kwan Stanley Lombardo (`hae-kwan-stanley-lombardo`)
- Haju Lundquist (`haju-lundquist`)
- Imo Denkei Raul Moncayo (`imo-denkei-raul-moncayo`)
- Isshō Fujita (`issho-fujita`)
- Jane Genshin Shumnan (`jane-genshin-shumnan`)
- Jean Leyshon (`jean-leyshon`)
- Joan Rieck (`joan-rieck`)
- Jody Dungay (`jody-dungay`)
- John Jiyu Gage (`john-jiyu-gage`)
- John Kotatsu Roko Bailes (`john-kotatsu-roko-bailes`)
- Joseph Jarman (`joseph-jarman`)
- Kathy Whilden (`kathy-whilden`)
- Keimyo Doshin Dario Girolami (`keimyo-doshin-dario-girolami`)
- Lee Ann Kyoan Nail (`lee-ann-kyoan-nail`)
- Leonard Kansho Marcel (`leonard-kansho-marcel`)
- Margaret Bushin Koan Syverson (`margaret-bushin-koan-syverson`)
- Mark Shōgen Bloodgood (`mark-shogen-bloodgood`)
- Maura O’Halloran (`maura-o-halloran`)
- Michael Shoryu Fieleke (`michael-shoryu-fieleke`)
- Michael Wenger (`michael-wenger`)
- Myosho Baika Andrea Pratt (`myosho-baika-andrea-pratt`)
- Nenates Pineda (`nenates-pineda`)
- Patricia Shingetsu Guzy (`patricia-shingetsu-guzy`)
- Rachel Mansfield-Howlett (`rachel-mansfield-howlett`)
- Raymond Cicetti (`raymond-cicetti`)
- Ryudo Do’on Weik (`ryudo-do-on-weik`)
- Ryushin Fugan Eugene Bush (`ryushin-fugan-eugene-bush`)
- Sensei Bodhi Murillo (`sensei-bodhi-murillo`)
- Shuichi Thomas Kurai (`shuichi-thomas-kurai`)
- Sosetsu Mark Stauffer (`sosetsu-mark-stauffer`)
- Sylvan Rainwater (`sylvan-rainwater`)
- TaiShin SoZui (`taishin-sozui`)
- Taido Richard Christofferson (`taido-richard-christofferson`)
- Teishin Layla Smith (`teishin-layla-smith`)
- Wendy Johnson Rudnick (`wendy-johnson-rudnick`)
- Zentetsu Tim Burkett (`zentetsu-tim-burkett`)

## Next steps

1. Manually add the 11 AZTA name-mismatch rows (especially dharma-name order variants like `Gyokuko Carlson`, `Shinge Roko Chayat`).
2. Run `npm run download-teacher-photos` for the ~50 profiles still missing images.
3. Optionally ingest remaining Mandalas teachers worth having (historical figures like Nyogen Senzaki, Soyen Shaku — some may already exist under different slug).
4. Re-run `npm run db:seed` after JSON changes.
