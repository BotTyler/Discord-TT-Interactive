-- Table: public.Save_History

-- DROP TABLE IF EXISTS public."Save_History";

CREATE TABLE IF NOT EXISTS public."Save_History"
(
    id bigint NOT NULL DEFAULT nextval('"Save_History_id_seq"'::regclass),
    date timestamp with time zone NOT NULL,
    map bigint NOT NULL DEFAULT nextval('"Save_History_map_seq"'::regclass),
    player_id text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "Save_History_pkey" PRIMARY KEY (id),
    CONSTRAINT "Save_History_map_fkey" FOREIGN KEY (map)
        REFERENCES public."Map" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT "Save_History_player_id_fkey" FOREIGN KEY (player_id)
        REFERENCES public."Player" (user_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Save_History"
    OWNER to postgres;