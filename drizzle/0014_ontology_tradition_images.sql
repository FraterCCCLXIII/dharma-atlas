ALTER TABLE "ontology_nodes" ADD COLUMN "default_image_path" text;

UPDATE "ontology_nodes" SET "default_image_path" = '/traditions/buddhist.jpg' WHERE "slug" = 'buddhist';
UPDATE "ontology_nodes" SET "default_image_path" = '/traditions/zen.jpg' WHERE "slug" = 'zen';
UPDATE "ontology_nodes" SET "default_image_path" = '/traditions/tibetan.jpg' WHERE "slug" = 'tibetan';
UPDATE "ontology_nodes" SET "default_image_path" = '/traditions/theravada.jpg' WHERE "slug" = 'theravada';
UPDATE "ontology_nodes" SET "default_image_path" = '/traditions/southeast-asian.jpg' WHERE "slug" = 'southeast-asian';
UPDATE "ontology_nodes" SET "default_image_path" = '/traditions/pure-land.jpg' WHERE "slug" = 'pure-land';
UPDATE "ontology_nodes" SET "default_image_path" = '/traditions/won-buddhism.jpg' WHERE "slug" = 'won';
UPDATE "ontology_nodes" SET "default_image_path" = '/traditions/mahayana.jpg' WHERE "slug" = 'mahayana';
UPDATE "ontology_nodes" SET "default_image_path" = '/traditions/hindu.jpg' WHERE "slug" = 'hindu';
