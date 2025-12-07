--
-- PostgreSQL database dump
--

\restrict UDVZtbcotBjwkBqwd7K1t2ZbRdc9zMAchpYD8FtICdfWoHp6BhXc73mmjau5qnb

-- Dumped from database version 18.1 (Debian 18.1-1.pgdg13+2)
-- Dumped by pg_dump version 18.0

-- Started on 2025-12-07 22:20:44 UTC

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 16870)
-- Name: Audio_Catalog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Audio_Catalog" (
    audio_catalog_id bigint NOT NULL,
    player_id text NOT NULL,
    audio_name text NOT NULL
);


ALTER TABLE public."Audio_Catalog" OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16878)
-- Name: Audio_Catalog_audio_catalog_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Audio_Catalog_audio_catalog_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Audio_Catalog_audio_catalog_id_seq" OWNER TO postgres;

--
-- TOC entry 3591 (class 0 OID 0)
-- Dependencies: 220
-- Name: Audio_Catalog_audio_catalog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Audio_Catalog_audio_catalog_id_seq" OWNED BY public."Audio_Catalog".audio_catalog_id;


--
-- TOC entry 221 (class 1259 OID 16879)
-- Name: Enemy; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Enemy" (
    name text NOT NULL,
    enemy_id bigint NOT NULL,
    image_id bigint NOT NULL
);


ALTER TABLE public."Enemy" OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16887)
-- Name: Enemy_Movement_History; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Enemy_Movement_History" (
    id bigint NOT NULL,
    history_id bigint NOT NULL,
    size numeric NOT NULL,
    enemy_id bigint NOT NULL,
    position_lat double precision NOT NULL,
    position_lng double precision NOT NULL,
    initiative bigint DEFAULT 0 NOT NULL,
    health bigint DEFAULT 1 NOT NULL,
    total_health bigint DEFAULT 1 NOT NULL,
    death_saves bigint DEFAULT 0 NOT NULL,
    life_saves bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public."Enemy_Movement_History" OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16908)
-- Name: Enemy_Movement_History_enemy_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Enemy_Movement_History_enemy_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Enemy_Movement_History_enemy_id_seq" OWNER TO postgres;

--
-- TOC entry 3595 (class 0 OID 0)
-- Dependencies: 223
-- Name: Enemy_Movement_History_enemy_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Enemy_Movement_History_enemy_id_seq" OWNED BY public."Enemy_Movement_History".enemy_id;


--
-- TOC entry 224 (class 1259 OID 16909)
-- Name: Enemy_Movement_History_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Enemy_Movement_History_history_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Enemy_Movement_History_history_id_seq" OWNER TO postgres;

--
-- TOC entry 3597 (class 0 OID 0)
-- Dependencies: 224
-- Name: Enemy_Movement_History_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Enemy_Movement_History_history_id_seq" OWNED BY public."Enemy_Movement_History".history_id;


--
-- TOC entry 225 (class 1259 OID 16910)
-- Name: Enemy_Movement_History_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Enemy_Movement_History_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Enemy_Movement_History_id_seq" OWNER TO postgres;

--
-- TOC entry 3599 (class 0 OID 0)
-- Dependencies: 225
-- Name: Enemy_Movement_History_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Enemy_Movement_History_id_seq" OWNED BY public."Enemy_Movement_History".id;


--
-- TOC entry 226 (class 1259 OID 16911)
-- Name: Enemy_eid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Enemy_eid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Enemy_eid_seq" OWNER TO postgres;

--
-- TOC entry 3601 (class 0 OID 0)
-- Dependencies: 226
-- Name: Enemy_eid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Enemy_eid_seq" OWNED BY public."Enemy".enemy_id;


--
-- TOC entry 227 (class 1259 OID 16912)
-- Name: Fog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Fog" (
    id bigint NOT NULL,
    polygon polygon NOT NULL
);


ALTER TABLE public."Fog" OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16919)
-- Name: Fog_State_History; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Fog_State_History" (
    id bigint NOT NULL,
    history_id bigint NOT NULL,
    fog_id bigint NOT NULL,
    visible boolean NOT NULL
);


ALTER TABLE public."Fog_State_History" OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16926)
-- Name: Fog_State_History_fog_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Fog_State_History_fog_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Fog_State_History_fog_id_seq" OWNER TO postgres;

--
-- TOC entry 3605 (class 0 OID 0)
-- Dependencies: 229
-- Name: Fog_State_History_fog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Fog_State_History_fog_id_seq" OWNED BY public."Fog_State_History".fog_id;


--
-- TOC entry 230 (class 1259 OID 16927)
-- Name: Fog_State_History_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Fog_State_History_history_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Fog_State_History_history_id_seq" OWNER TO postgres;

--
-- TOC entry 3607 (class 0 OID 0)
-- Dependencies: 230
-- Name: Fog_State_History_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Fog_State_History_history_id_seq" OWNED BY public."Fog_State_History".history_id;


--
-- TOC entry 231 (class 1259 OID 16928)
-- Name: Fog_State_History_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Fog_State_History_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Fog_State_History_id_seq" OWNER TO postgres;

--
-- TOC entry 3609 (class 0 OID 0)
-- Dependencies: 231
-- Name: Fog_State_History_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Fog_State_History_id_seq" OWNED BY public."Fog_State_History".id;


--
-- TOC entry 232 (class 1259 OID 16929)
-- Name: Fog_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Fog_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Fog_id_seq" OWNER TO postgres;

--
-- TOC entry 3611 (class 0 OID 0)
-- Dependencies: 232
-- Name: Fog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Fog_id_seq" OWNED BY public."Fog".id;


--
-- TOC entry 233 (class 1259 OID 16930)
-- Name: Image_Catalog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Image_Catalog" (
    img_catalog_id bigint NOT NULL,
    player_id text NOT NULL,
    image_name text NOT NULL,
    width numeric NOT NULL,
    height numeric NOT NULL
);


ALTER TABLE public."Image_Catalog" OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16940)
-- Name: Image_Catalog_img_catalog_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Image_Catalog_img_catalog_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Image_Catalog_img_catalog_id_seq" OWNER TO postgres;

--
-- TOC entry 3614 (class 0 OID 0)
-- Dependencies: 234
-- Name: Image_Catalog_img_catalog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Image_Catalog_img_catalog_id_seq" OWNED BY public."Image_Catalog".img_catalog_id;


--
-- TOC entry 235 (class 1259 OID 16941)
-- Name: Initiative_History; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Initiative_History" (
    id bigint NOT NULL,
    history_id bigint NOT NULL,
    initiative_index bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public."Initiative_History" OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 16948)
-- Name: Initiative_History_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Initiative_History_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Initiative_History_id_seq" OWNER TO postgres;

--
-- TOC entry 3617 (class 0 OID 0)
-- Dependencies: 236
-- Name: Initiative_History_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Initiative_History_id_seq" OWNED BY public."Initiative_History".id;


--
-- TOC entry 237 (class 1259 OID 16949)
-- Name: Map; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Map" (
    id bigint NOT NULL,
    icon_height numeric NOT NULL,
    image_id bigint NOT NULL,
    name text DEFAULT 'BLANK'::text NOT NULL,
    player_id text DEFAULT 'temp'::text NOT NULL
);


ALTER TABLE public."Map" OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 16961)
-- Name: Map_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Map_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Map_id_seq" OWNER TO postgres;

--
-- TOC entry 3620 (class 0 OID 0)
-- Dependencies: 238
-- Name: Map_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Map_id_seq" OWNED BY public."Map".id;


--
-- TOC entry 239 (class 1259 OID 16962)
-- Name: Player; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Player" (
    user_id text NOT NULL,
    name text NOT NULL
);


ALTER TABLE public."Player" OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 16969)
-- Name: Player_Movement_History; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Player_Movement_History" (
    pmh_id bigint NOT NULL,
    history_id bigint NOT NULL,
    player_id text NOT NULL,
    position_lat double precision NOT NULL,
    position_lng double precision NOT NULL,
    initiative bigint DEFAULT 0 NOT NULL,
    health bigint DEFAULT 1 NOT NULL,
    total_health bigint DEFAULT 1 NOT NULL,
    death_saves bigint DEFAULT 0 NOT NULL,
    life_saves bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public."Player_Movement_History" OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 16989)
-- Name: Player_Movement_History_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Player_Movement_History_history_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Player_Movement_History_history_id_seq" OWNER TO postgres;

--
-- TOC entry 3624 (class 0 OID 0)
-- Dependencies: 241
-- Name: Player_Movement_History_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Player_Movement_History_history_id_seq" OWNED BY public."Player_Movement_History".history_id;


--
-- TOC entry 242 (class 1259 OID 16990)
-- Name: Player_Movement_History_pmh_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Player_Movement_History_pmh_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Player_Movement_History_pmh_id_seq" OWNER TO postgres;

--
-- TOC entry 3626 (class 0 OID 0)
-- Dependencies: 242
-- Name: Player_Movement_History_pmh_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Player_Movement_History_pmh_id_seq" OWNED BY public."Player_Movement_History".pmh_id;


--
-- TOC entry 243 (class 1259 OID 16991)
-- Name: Save_History; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Save_History" (
    id bigint NOT NULL,
    date timestamp with time zone NOT NULL,
    map bigint NOT NULL,
    player_id text NOT NULL
);


ALTER TABLE public."Save_History" OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 17000)
-- Name: Save_History_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Save_History_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Save_History_id_seq" OWNER TO postgres;

--
-- TOC entry 3629 (class 0 OID 0)
-- Dependencies: 244
-- Name: Save_History_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Save_History_id_seq" OWNED BY public."Save_History".id;


--
-- TOC entry 245 (class 1259 OID 17001)
-- Name: Save_History_map_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Save_History_map_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Save_History_map_seq" OWNER TO postgres;

--
-- TOC entry 3631 (class 0 OID 0)
-- Dependencies: 245
-- Name: Save_History_map_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Save_History_map_seq" OWNED BY public."Save_History".map;


--
-- TOC entry 3345 (class 2604 OID 17002)
-- Name: Audio_Catalog audio_catalog_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Audio_Catalog" ALTER COLUMN audio_catalog_id SET DEFAULT nextval('public."Audio_Catalog_audio_catalog_id_seq"'::regclass);


--
-- TOC entry 3346 (class 2604 OID 17003)
-- Name: Enemy enemy_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Enemy" ALTER COLUMN enemy_id SET DEFAULT nextval('public."Enemy_eid_seq"'::regclass);


--
-- TOC entry 3347 (class 2604 OID 17004)
-- Name: Enemy_Movement_History id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Enemy_Movement_History" ALTER COLUMN id SET DEFAULT nextval('public."Enemy_Movement_History_id_seq"'::regclass);


--
-- TOC entry 3348 (class 2604 OID 17005)
-- Name: Enemy_Movement_History history_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Enemy_Movement_History" ALTER COLUMN history_id SET DEFAULT nextval('public."Enemy_Movement_History_history_id_seq"'::regclass);


--
-- TOC entry 3349 (class 2604 OID 17006)
-- Name: Enemy_Movement_History enemy_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Enemy_Movement_History" ALTER COLUMN enemy_id SET DEFAULT nextval('public."Enemy_Movement_History_enemy_id_seq"'::regclass);


--
-- TOC entry 3355 (class 2604 OID 17007)
-- Name: Fog id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Fog" ALTER COLUMN id SET DEFAULT nextval('public."Fog_id_seq"'::regclass);


--
-- TOC entry 3356 (class 2604 OID 17008)
-- Name: Fog_State_History id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Fog_State_History" ALTER COLUMN id SET DEFAULT nextval('public."Fog_State_History_id_seq"'::regclass);


--
-- TOC entry 3357 (class 2604 OID 17009)
-- Name: Fog_State_History history_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Fog_State_History" ALTER COLUMN history_id SET DEFAULT nextval('public."Fog_State_History_history_id_seq"'::regclass);


--
-- TOC entry 3358 (class 2604 OID 17010)
-- Name: Fog_State_History fog_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Fog_State_History" ALTER COLUMN fog_id SET DEFAULT nextval('public."Fog_State_History_fog_id_seq"'::regclass);


--
-- TOC entry 3359 (class 2604 OID 17011)
-- Name: Image_Catalog img_catalog_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Image_Catalog" ALTER COLUMN img_catalog_id SET DEFAULT nextval('public."Image_Catalog_img_catalog_id_seq"'::regclass);


--
-- TOC entry 3360 (class 2604 OID 17012)
-- Name: Initiative_History id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Initiative_History" ALTER COLUMN id SET DEFAULT nextval('public."Initiative_History_id_seq"'::regclass);


--
-- TOC entry 3362 (class 2604 OID 17013)
-- Name: Map id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Map" ALTER COLUMN id SET DEFAULT nextval('public."Map_id_seq"'::regclass);


--
-- TOC entry 3365 (class 2604 OID 17014)
-- Name: Player_Movement_History pmh_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Player_Movement_History" ALTER COLUMN pmh_id SET DEFAULT nextval('public."Player_Movement_History_pmh_id_seq"'::regclass);


--
-- TOC entry 3366 (class 2604 OID 17015)
-- Name: Player_Movement_History history_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Player_Movement_History" ALTER COLUMN history_id SET DEFAULT nextval('public."Player_Movement_History_history_id_seq"'::regclass);


--
-- TOC entry 3372 (class 2604 OID 17016)
-- Name: Save_History id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Save_History" ALTER COLUMN id SET DEFAULT nextval('public."Save_History_id_seq"'::regclass);


--
-- TOC entry 3373 (class 2604 OID 17017)
-- Name: Save_History map; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Save_History" ALTER COLUMN map SET DEFAULT nextval('public."Save_History_map_seq"'::regclass);


--
-- TOC entry 3558 (class 0 OID 16870)
-- Dependencies: 219
-- Data for Name: Audio_Catalog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Audio_Catalog" (audio_catalog_id, player_id, audio_name) FROM stdin;
\.


--
-- TOC entry 3560 (class 0 OID 16879)
-- Dependencies: 221
-- Data for Name: Enemy; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Enemy" (name, enemy_id, image_id) FROM stdin;
\.


--
-- TOC entry 3561 (class 0 OID 16887)
-- Dependencies: 222
-- Data for Name: Enemy_Movement_History; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Enemy_Movement_History" (id, history_id, size, enemy_id, position_lat, position_lng, initiative, health, total_health, death_saves, life_saves) FROM stdin;
\.


--
-- TOC entry 3566 (class 0 OID 16912)
-- Dependencies: 227
-- Data for Name: Fog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Fog" (id, polygon) FROM stdin;
\.


--
-- TOC entry 3567 (class 0 OID 16919)
-- Dependencies: 228
-- Data for Name: Fog_State_History; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Fog_State_History" (id, history_id, fog_id, visible) FROM stdin;
\.


--
-- TOC entry 3572 (class 0 OID 16930)
-- Dependencies: 233
-- Data for Name: Image_Catalog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Image_Catalog" (img_catalog_id, player_id, image_name, width, height) FROM stdin;
\.


--
-- TOC entry 3574 (class 0 OID 16941)
-- Dependencies: 235
-- Data for Name: Initiative_History; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Initiative_History" (id, history_id, initiative_index) FROM stdin;
\.


--
-- TOC entry 3576 (class 0 OID 16949)
-- Dependencies: 237
-- Data for Name: Map; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Map" (id, icon_height, image_id, name, player_id) FROM stdin;
\.


--
-- TOC entry 3578 (class 0 OID 16962)
-- Dependencies: 239
-- Data for Name: Player; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Player" (user_id, name) FROM stdin;
\.


--
-- TOC entry 3579 (class 0 OID 16969)
-- Dependencies: 240
-- Data for Name: Player_Movement_History; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Player_Movement_History" (pmh_id, history_id, player_id, position_lat, position_lng, initiative, health, total_health, death_saves, life_saves) FROM stdin;
\.


--
-- TOC entry 3582 (class 0 OID 16991)
-- Dependencies: 243
-- Data for Name: Save_History; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Save_History" (id, date, map, player_id) FROM stdin;
\.


--
-- TOC entry 3633 (class 0 OID 0)
-- Dependencies: 220
-- Name: Audio_Catalog_audio_catalog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Audio_Catalog_audio_catalog_id_seq"', 7, true);


--
-- TOC entry 3634 (class 0 OID 0)
-- Dependencies: 223
-- Name: Enemy_Movement_History_enemy_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Enemy_Movement_History_enemy_id_seq"', 1, false);


--
-- TOC entry 3635 (class 0 OID 0)
-- Dependencies: 224
-- Name: Enemy_Movement_History_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Enemy_Movement_History_history_id_seq"', 1, false);


--
-- TOC entry 3636 (class 0 OID 0)
-- Dependencies: 225
-- Name: Enemy_Movement_History_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Enemy_Movement_History_id_seq"', 389, true);


--
-- TOC entry 3637 (class 0 OID 0)
-- Dependencies: 226
-- Name: Enemy_eid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Enemy_eid_seq"', 235, true);


--
-- TOC entry 3638 (class 0 OID 0)
-- Dependencies: 229
-- Name: Fog_State_History_fog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Fog_State_History_fog_id_seq"', 1, false);


--
-- TOC entry 3639 (class 0 OID 0)
-- Dependencies: 230
-- Name: Fog_State_History_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Fog_State_History_history_id_seq"', 1, false);


--
-- TOC entry 3640 (class 0 OID 0)
-- Dependencies: 231
-- Name: Fog_State_History_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Fog_State_History_id_seq"', 60, true);


--
-- TOC entry 3641 (class 0 OID 0)
-- Dependencies: 232
-- Name: Fog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Fog_id_seq"', 42, true);


--
-- TOC entry 3642 (class 0 OID 0)
-- Dependencies: 234
-- Name: Image_Catalog_img_catalog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Image_Catalog_img_catalog_id_seq"', 90, true);


--
-- TOC entry 3643 (class 0 OID 0)
-- Dependencies: 236
-- Name: Initiative_History_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Initiative_History_id_seq"', 110, true);


--
-- TOC entry 3644 (class 0 OID 0)
-- Dependencies: 238
-- Name: Map_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Map_id_seq"', 85, true);


--
-- TOC entry 3645 (class 0 OID 0)
-- Dependencies: 241
-- Name: Player_Movement_History_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Player_Movement_History_history_id_seq"', 1, false);


--
-- TOC entry 3646 (class 0 OID 0)
-- Dependencies: 242
-- Name: Player_Movement_History_pmh_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Player_Movement_History_pmh_id_seq"', 258, true);


--
-- TOC entry 3647 (class 0 OID 0)
-- Dependencies: 244
-- Name: Save_History_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Save_History_id_seq"', 183, true);


--
-- TOC entry 3648 (class 0 OID 0)
-- Dependencies: 245
-- Name: Save_History_map_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Save_History_map_seq"', 1, false);


--
-- TOC entry 3375 (class 2606 OID 17019)
-- Name: Audio_Catalog Audio_Catalog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Audio_Catalog"
    ADD CONSTRAINT "Audio_Catalog_pkey" PRIMARY KEY (audio_catalog_id);


--
-- TOC entry 3379 (class 2606 OID 17021)
-- Name: Enemy_Movement_History Enemy_Movement_History_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Enemy_Movement_History"
    ADD CONSTRAINT "Enemy_Movement_History_pkey" PRIMARY KEY (id);


--
-- TOC entry 3377 (class 2606 OID 17023)
-- Name: Enemy Enemy_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Enemy"
    ADD CONSTRAINT "Enemy_pkey" PRIMARY KEY (enemy_id);


--
-- TOC entry 3383 (class 2606 OID 17025)
-- Name: Fog_State_History Fog_State_History_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Fog_State_History"
    ADD CONSTRAINT "Fog_State_History_pkey" PRIMARY KEY (id);


--
-- TOC entry 3381 (class 2606 OID 17027)
-- Name: Fog Fog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Fog"
    ADD CONSTRAINT "Fog_pkey" PRIMARY KEY (id);


--
-- TOC entry 3385 (class 2606 OID 17029)
-- Name: Image_Catalog Image_Catalog_image_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Image_Catalog"
    ADD CONSTRAINT "Image_Catalog_image_name_key" UNIQUE (image_name);


--
-- TOC entry 3387 (class 2606 OID 17031)
-- Name: Image_Catalog Image_Catalog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Image_Catalog"
    ADD CONSTRAINT "Image_Catalog_pkey" PRIMARY KEY (img_catalog_id);


--
-- TOC entry 3389 (class 2606 OID 17033)
-- Name: Initiative_History Initiative_History_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Initiative_History"
    ADD CONSTRAINT "Initiative_History_pkey" PRIMARY KEY (id);


--
-- TOC entry 3391 (class 2606 OID 17035)
-- Name: Map Map_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Map"
    ADD CONSTRAINT "Map_pkey" PRIMARY KEY (id);


--
-- TOC entry 3395 (class 2606 OID 17037)
-- Name: Player_Movement_History Player_Movement_History_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Player_Movement_History"
    ADD CONSTRAINT "Player_Movement_History_pkey" PRIMARY KEY (pmh_id);


--
-- TOC entry 3393 (class 2606 OID 17039)
-- Name: Player Player_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Player"
    ADD CONSTRAINT "Player_pkey" PRIMARY KEY (user_id);


--
-- TOC entry 3397 (class 2606 OID 17041)
-- Name: Save_History Save_History_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Save_History"
    ADD CONSTRAINT "Save_History_pkey" PRIMARY KEY (id);


--
-- TOC entry 3398 (class 2606 OID 17042)
-- Name: Audio_Catalog Audio_Catalog_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Audio_Catalog"
    ADD CONSTRAINT "Audio_Catalog_player_id_fkey" FOREIGN KEY (player_id) REFERENCES public."Player"(user_id);


--
-- TOC entry 3400 (class 2606 OID 17047)
-- Name: Enemy_Movement_History Enemy_Movement_History_enemy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Enemy_Movement_History"
    ADD CONSTRAINT "Enemy_Movement_History_enemy_id_fkey" FOREIGN KEY (enemy_id) REFERENCES public."Enemy"(enemy_id) NOT VALID;


--
-- TOC entry 3401 (class 2606 OID 17052)
-- Name: Enemy_Movement_History Enemy_Movement_History_history_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Enemy_Movement_History"
    ADD CONSTRAINT "Enemy_Movement_History_history_id_fkey" FOREIGN KEY (history_id) REFERENCES public."Save_History"(id);


--
-- TOC entry 3399 (class 2606 OID 17057)
-- Name: Enemy Enemy_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Enemy"
    ADD CONSTRAINT "Enemy_image_id_fkey" FOREIGN KEY (image_id) REFERENCES public."Image_Catalog"(img_catalog_id) NOT VALID;


--
-- TOC entry 3402 (class 2606 OID 17062)
-- Name: Fog_State_History Fog_State_History_fog_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Fog_State_History"
    ADD CONSTRAINT "Fog_State_History_fog_id_fkey" FOREIGN KEY (fog_id) REFERENCES public."Fog"(id);


--
-- TOC entry 3403 (class 2606 OID 17067)
-- Name: Fog_State_History Fog_State_History_history_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Fog_State_History"
    ADD CONSTRAINT "Fog_State_History_history_id_fkey" FOREIGN KEY (history_id) REFERENCES public."Save_History"(id);


--
-- TOC entry 3404 (class 2606 OID 17072)
-- Name: Image_Catalog Image_Catalog_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Image_Catalog"
    ADD CONSTRAINT "Image_Catalog_player_id_fkey" FOREIGN KEY (player_id) REFERENCES public."Player"(user_id) NOT VALID;


--
-- TOC entry 3405 (class 2606 OID 17077)
-- Name: Initiative_History Initiative_History_history_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Initiative_History"
    ADD CONSTRAINT "Initiative_History_history_id_fkey" FOREIGN KEY (history_id) REFERENCES public."Save_History"(id);


--
-- TOC entry 3406 (class 2606 OID 17082)
-- Name: Map Map_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Map"
    ADD CONSTRAINT "Map_image_id_fkey" FOREIGN KEY (image_id) REFERENCES public."Image_Catalog"(img_catalog_id) NOT VALID;


--
-- TOC entry 3407 (class 2606 OID 17087)
-- Name: Player_Movement_History Player_Movement_History_history_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Player_Movement_History"
    ADD CONSTRAINT "Player_Movement_History_history_id_fkey" FOREIGN KEY (history_id) REFERENCES public."Save_History"(id);


--
-- TOC entry 3408 (class 2606 OID 17092)
-- Name: Player_Movement_History Player_Movement_History_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Player_Movement_History"
    ADD CONSTRAINT "Player_Movement_History_player_id_fkey" FOREIGN KEY (player_id) REFERENCES public."Player"(user_id);


--
-- TOC entry 3409 (class 2606 OID 17097)
-- Name: Save_History Save_History_map_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Save_History"
    ADD CONSTRAINT "Save_History_map_fkey" FOREIGN KEY (map) REFERENCES public."Map"(id);


--
-- TOC entry 3410 (class 2606 OID 17102)
-- Name: Save_History Save_History_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Save_History"
    ADD CONSTRAINT "Save_History_player_id_fkey" FOREIGN KEY (player_id) REFERENCES public."Player"(user_id) NOT VALID;


--
-- TOC entry 3590 (class 0 OID 0)
-- Dependencies: 219
-- Name: TABLE "Audio_Catalog"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."Audio_Catalog" TO "dnd-prod-user";


--
-- TOC entry 3592 (class 0 OID 0)
-- Dependencies: 220
-- Name: SEQUENCE "Audio_Catalog_audio_catalog_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public."Audio_Catalog_audio_catalog_id_seq" TO "dnd-prod-user";


--
-- TOC entry 3593 (class 0 OID 0)
-- Dependencies: 221
-- Name: TABLE "Enemy"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."Enemy" TO "dnd-prod-user";


--
-- TOC entry 3594 (class 0 OID 0)
-- Dependencies: 222
-- Name: TABLE "Enemy_Movement_History"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."Enemy_Movement_History" TO "dnd-prod-user";


--
-- TOC entry 3596 (class 0 OID 0)
-- Dependencies: 223
-- Name: SEQUENCE "Enemy_Movement_History_enemy_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public."Enemy_Movement_History_enemy_id_seq" TO "dnd-prod-user";


--
-- TOC entry 3598 (class 0 OID 0)
-- Dependencies: 224
-- Name: SEQUENCE "Enemy_Movement_History_history_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public."Enemy_Movement_History_history_id_seq" TO "dnd-prod-user";


--
-- TOC entry 3600 (class 0 OID 0)
-- Dependencies: 225
-- Name: SEQUENCE "Enemy_Movement_History_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public."Enemy_Movement_History_id_seq" TO "dnd-prod-user";


--
-- TOC entry 3602 (class 0 OID 0)
-- Dependencies: 226
-- Name: SEQUENCE "Enemy_eid_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public."Enemy_eid_seq" TO "dnd-prod-user";


--
-- TOC entry 3603 (class 0 OID 0)
-- Dependencies: 227
-- Name: TABLE "Fog"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."Fog" TO "dnd-prod-user";


--
-- TOC entry 3604 (class 0 OID 0)
-- Dependencies: 228
-- Name: TABLE "Fog_State_History"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."Fog_State_History" TO "dnd-prod-user";


--
-- TOC entry 3606 (class 0 OID 0)
-- Dependencies: 229
-- Name: SEQUENCE "Fog_State_History_fog_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public."Fog_State_History_fog_id_seq" TO "dnd-prod-user";


--
-- TOC entry 3608 (class 0 OID 0)
-- Dependencies: 230
-- Name: SEQUENCE "Fog_State_History_history_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public."Fog_State_History_history_id_seq" TO "dnd-prod-user";


--
-- TOC entry 3610 (class 0 OID 0)
-- Dependencies: 231
-- Name: SEQUENCE "Fog_State_History_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public."Fog_State_History_id_seq" TO "dnd-prod-user";


--
-- TOC entry 3612 (class 0 OID 0)
-- Dependencies: 232
-- Name: SEQUENCE "Fog_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public."Fog_id_seq" TO "dnd-prod-user";


--
-- TOC entry 3613 (class 0 OID 0)
-- Dependencies: 233
-- Name: TABLE "Image_Catalog"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."Image_Catalog" TO "dnd-prod-user";


--
-- TOC entry 3615 (class 0 OID 0)
-- Dependencies: 234
-- Name: SEQUENCE "Image_Catalog_img_catalog_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public."Image_Catalog_img_catalog_id_seq" TO "dnd-prod-user";


--
-- TOC entry 3616 (class 0 OID 0)
-- Dependencies: 235
-- Name: TABLE "Initiative_History"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."Initiative_History" TO "dnd-prod-user";


--
-- TOC entry 3618 (class 0 OID 0)
-- Dependencies: 236
-- Name: SEQUENCE "Initiative_History_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public."Initiative_History_id_seq" TO "dnd-prod-user";


--
-- TOC entry 3619 (class 0 OID 0)
-- Dependencies: 237
-- Name: TABLE "Map"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."Map" TO "dnd-prod-user";


--
-- TOC entry 3621 (class 0 OID 0)
-- Dependencies: 238
-- Name: SEQUENCE "Map_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public."Map_id_seq" TO "dnd-prod-user";


--
-- TOC entry 3622 (class 0 OID 0)
-- Dependencies: 239
-- Name: TABLE "Player"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."Player" TO "dnd-prod-user";


--
-- TOC entry 3623 (class 0 OID 0)
-- Dependencies: 240
-- Name: TABLE "Player_Movement_History"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."Player_Movement_History" TO "dnd-prod-user";


--
-- TOC entry 3625 (class 0 OID 0)
-- Dependencies: 241
-- Name: SEQUENCE "Player_Movement_History_history_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public."Player_Movement_History_history_id_seq" TO "dnd-prod-user";


--
-- TOC entry 3627 (class 0 OID 0)
-- Dependencies: 242
-- Name: SEQUENCE "Player_Movement_History_pmh_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public."Player_Movement_History_pmh_id_seq" TO "dnd-prod-user";


--
-- TOC entry 3628 (class 0 OID 0)
-- Dependencies: 243
-- Name: TABLE "Save_History"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."Save_History" TO "dnd-prod-user";


--
-- TOC entry 3630 (class 0 OID 0)
-- Dependencies: 244
-- Name: SEQUENCE "Save_History_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public."Save_History_id_seq" TO "dnd-prod-user";


--
-- TOC entry 3632 (class 0 OID 0)
-- Dependencies: 245
-- Name: SEQUENCE "Save_History_map_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public."Save_History_map_seq" TO "dnd-prod-user";


--
-- TOC entry 2107 (class 826 OID 17107)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO "dnd-prod-user";


-- Completed on 2025-12-07 22:20:44 UTC

--
-- PostgreSQL database dump complete
--

\unrestrict UDVZtbcotBjwkBqwd7K1t2ZbRdc9zMAchpYD8FtICdfWoHp6BhXc73mmjau5qnb

