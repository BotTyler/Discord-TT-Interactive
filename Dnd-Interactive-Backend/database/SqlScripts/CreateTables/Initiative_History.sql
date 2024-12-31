-- Table: public.Initiative_History

-- DROP TABLE IF EXISTS public."Initiative_History";

CREATE TABLE IF NOT EXISTS public."Initiative_History"
(
    id bigint NOT NULL DEFAULT nextval('"Initiative_History_id_seq"'::regclass),
    history_id bigint NOT NULL,
    initiative_index bigint NOT NULL DEFAULT 0,
    CONSTRAINT "Initiative_History_pkey" PRIMARY KEY (id),
    CONSTRAINT "Initiative_History_history_id_fkey" FOREIGN KEY (history_id)
        REFERENCES public."Save_History" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Initiative_History"
    OWNER to postgres;