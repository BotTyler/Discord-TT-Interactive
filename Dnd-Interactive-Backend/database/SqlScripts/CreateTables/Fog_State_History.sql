-- Table: public.Fog_State_History

-- DROP TABLE IF EXISTS public."Fog_State_History";

CREATE TABLE IF NOT EXISTS public."Fog_State_History"
(
    id bigint NOT NULL DEFAULT nextval('"Fog_State_History_id_seq"'::regclass),
    history_id bigint NOT NULL DEFAULT nextval('"Fog_State_History_history_id_seq"'::regclass),
    fog_id bigint NOT NULL DEFAULT nextval('"Fog_State_History_fog_id_seq"'::regclass),
    visible boolean NOT NULL,
    CONSTRAINT "Fog_State_History_pkey" PRIMARY KEY (id),
    CONSTRAINT "Fog_State_History_fog_id_fkey" FOREIGN KEY (fog_id)
        REFERENCES public."Fog" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT "Fog_State_History_history_id_fkey" FOREIGN KEY (history_id)
        REFERENCES public."Save_History" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Fog_State_History"
    OWNER to postgres;