-- Table: public.Player_Movement_History

-- DROP TABLE IF EXISTS public."Player_Movement_History";

CREATE TABLE IF NOT EXISTS public."Player_Movement_History"
(
    pmh_id bigint NOT NULL DEFAULT nextval('"Player_Movement_History_pmh_id_seq"'::regclass),
    history_id bigint NOT NULL DEFAULT nextval('"Player_Movement_History_history_id_seq"'::regclass),
    player_id text COLLATE pg_catalog."default" NOT NULL,
    position_lat double precision NOT NULL,
    position_lng double precision NOT NULL,
    initiative bigint NOT NULL DEFAULT 0,
    health bigint NOT NULL DEFAULT 1,
    total_health bigint NOT NULL DEFAULT 1,
    death_saves bigint NOT NULL DEFAULT 0,
    life_saves bigint NOT NULL DEFAULT 0,
    CONSTRAINT "Player_Movement_History_pkey" PRIMARY KEY (pmh_id),
    CONSTRAINT "Player_Movement_History_history_id_fkey" FOREIGN KEY (history_id)
        REFERENCES public."Save_History" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT "Player_Movement_History_player_id_fkey" FOREIGN KEY (player_id)
        REFERENCES public."Player" (user_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Player_Movement_History"
    OWNER to postgres;