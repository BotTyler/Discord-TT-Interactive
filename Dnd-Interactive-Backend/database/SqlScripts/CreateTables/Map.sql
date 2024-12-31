-- Table: public.Map

-- DROP TABLE IF EXISTS public."Map";

CREATE TABLE IF NOT EXISTS public."Map"
(
    id bigint NOT NULL DEFAULT nextval('"Map_id_seq"'::regclass),
    map_image bigint NOT NULL DEFAULT nextval('"Map_map_image_seq"'::regclass),
    width numeric NOT NULL,
    height numeric NOT NULL,
    icon_height numeric NOT NULL,
    CONSTRAINT "Map_pkey" PRIMARY KEY (id),
    CONSTRAINT "Map_map_image_fkey" FOREIGN KEY (map_image)
        REFERENCES public."Image" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Map"
    OWNER to postgres;