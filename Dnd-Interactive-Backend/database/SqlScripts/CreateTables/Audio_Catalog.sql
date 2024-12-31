-- Table: public.Audio_Catalog

-- DROP TABLE IF EXISTS public."Audio_Catalog";

CREATE TABLE IF NOT EXISTS public."Audio_Catalog"
(
    audio_catalog_id bigint NOT NULL DEFAULT nextval('"Audio_Catalog_audio_catalog_id_seq"'::regclass),
    player_id text COLLATE pg_catalog."default" NOT NULL,
    audio_name text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "Audio_Catalog_pkey" PRIMARY KEY (audio_catalog_id),
    CONSTRAINT "Audio_Catalog_player_id_fkey" FOREIGN KEY (player_id)
        REFERENCES public."Player" (user_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Audio_Catalog"
    OWNER to postgres;