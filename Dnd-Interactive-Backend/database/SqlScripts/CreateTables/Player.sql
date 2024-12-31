-- Table: public.Player

-- DROP TABLE IF EXISTS public."Player";

CREATE TABLE IF NOT EXISTS public."Player"
(
    user_id text COLLATE pg_catalog."default" NOT NULL,
    name text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "Player_pkey" PRIMARY KEY (user_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Player"
    OWNER to postgres;