-- Table: public.Fog

-- DROP TABLE IF EXISTS public."Fog";

CREATE TABLE IF NOT EXISTS public."Fog"
(
    id bigint NOT NULL DEFAULT nextval('"Fog_id_seq"'::regclass),
    polygon polygon NOT NULL,
    CONSTRAINT "Fog_pkey" PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Fog"
    OWNER to postgres;