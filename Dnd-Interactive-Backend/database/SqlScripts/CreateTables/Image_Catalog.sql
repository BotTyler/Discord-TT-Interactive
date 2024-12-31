-- Table: public.Image_Catalog

-- DROP TABLE IF EXISTS public."Image_Catalog";

CREATE TABLE IF NOT EXISTS public."Image_Catalog"
(
    img_catalog_id bigint NOT NULL DEFAULT nextval('"Image_Catalog_img_catalog_id_seq"'::regclass),
    player_id text COLLATE pg_catalog."default" NOT NULL,
    image_name text COLLATE pg_catalog."default" NOT NULL,
    width numeric NOT NULL,
    height numeric NOT NULL,
    CONSTRAINT "Image_Catalog_pkey" PRIMARY KEY (img_catalog_id),
    CONSTRAINT "Image_Catalog_image_name_key" UNIQUE (image_name),
    CONSTRAINT "Image_Catalog_player_id_fkey" FOREIGN KEY (player_id)
        REFERENCES public."Player" (user_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Image_Catalog"
    OWNER to postgres;