-- Table: public.Enemy

-- DROP TABLE IF EXISTS public."Enemy";

CREATE TABLE IF NOT EXISTS public."Enemy"
(
    name text COLLATE pg_catalog."default" NOT NULL,
    enemy_id bigint NOT NULL DEFAULT nextval('"Enemy_eid_seq"'::regclass),
    image_id bigint NOT NULL,
    CONSTRAINT "Enemy_pkey" PRIMARY KEY (enemy_id),
    CONSTRAINT "Enemy_image_id_fkey" FOREIGN KEY (image_id)
        REFERENCES public."Image_Catalog" (img_catalog_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Enemy"
    OWNER to postgres;