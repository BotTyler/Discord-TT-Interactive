-- Table: public.Enemy_Movement_History

-- DROP TABLE IF EXISTS public."Enemy_Movement_History";

CREATE TABLE IF NOT EXISTS public."Enemy_Movement_History"
(
    id bigint NOT NULL DEFAULT nextval('"Enemy_Movement_History_id_seq"'::regclass),
    history_id bigint NOT NULL DEFAULT nextval('"Enemy_Movement_History_history_id_seq"'::regclass),
    size numeric NOT NULL,
    enemy_id bigint NOT NULL DEFAULT nextval('"Enemy_Movement_History_enemy_id_seq"'::regclass),
    position_lat double precision NOT NULL,
    position_lng double precision NOT NULL,
    initiative bigint NOT NULL DEFAULT 0,
    health bigint NOT NULL DEFAULT 1,
    total_health bigint NOT NULL DEFAULT 1,
    death_saves bigint NOT NULL DEFAULT 0,
    life_saves bigint NOT NULL DEFAULT 0,
    CONSTRAINT "Enemy_Movement_History_pkey" PRIMARY KEY (id),
    CONSTRAINT "Enemy_Movement_History_enemy_id_fkey" FOREIGN KEY (enemy_id)
        REFERENCES public."Enemy" (enemy_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT "Enemy_Movement_History_history_id_fkey" FOREIGN KEY (history_id)
        REFERENCES public."Save_History" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Enemy_Movement_History"
    OWNER to postgres;