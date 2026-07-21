UPDATE "ontology_nodes"
SET "label" = 'Nonduality', "filter_id" = 'Nonduality'
WHERE "slug" = 'non-dualism'
   OR "filter_id" IN ('Non-Dualism', 'Non-dualism')
   OR "label" IN ('Non-Dualism', 'Non-dualism');

UPDATE "ontology_nodes"
SET "label" = 'Contemplative Christianity', "filter_id" = 'Contemplative Christianity'
WHERE "slug" = 'contemplative-christian'
   OR "filter_id" = 'Contemplative Christian'
   OR "label" = 'Contemplative Christian';

UPDATE "teachers"
SET "tradition" = 'Nonduality'
WHERE "tradition" IN ('Non-Dualism', 'Non-dualism');

UPDATE "teachers"
SET "tradition" = 'Contemplative Christianity'
WHERE "tradition" = 'Contemplative Christian';

UPDATE "places"
SET "tradition" = 'Nonduality'
WHERE "tradition" IN ('Non-Dualism', 'Non-dualism');

UPDATE "places"
SET "tradition" = 'Contemplative Christianity'
WHERE "tradition" = 'Contemplative Christian';
