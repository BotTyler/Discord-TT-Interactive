import { MARKER_SIZE_CATEGORIES } from "./MarkerOptions";

export interface LoadMapInterface {
  id: number;
  width: number;
  height: number;
  player_id: string;
  image_name: string;
}

export interface LoadPlayerInterface {
  player_id: string;
  position_lat: number;
  position_lng: number;
  initiative: number;
  health: number;
  totalHealth: number;
  deathSaves: number;
  lifeSaves: number;
  statuses: string[];
}

export interface LoadEnemyInterface {
  size_category: MARKER_SIZE_CATEGORIES;
  enemy_id: number;
  position_lat: number;
  position_lng: number;
  name: string;
  image_name: string;
  initiative: number;
  health: number;
  total_health: number;
  death_saves: number;
  life_saves: number;
  is_visible: boolean;
  statuses: string[];
}

export interface LoadFogInterface {
  fog_id: number;
  visible: boolean;
  polygon: string; // this will definitely need to be changed
}

export interface LoadSaveHistory {
  id: number;
  date: Date;
  map: number;
  player_size: number;
}

export interface LoadImage {
  image_name: string;
}

export interface LoadCampaign {
  id: number;
  image_name: string;
  name: string;
  height: number;
  width: number;
}

export interface LoadSummonsInterface {
  id: number;
  summons_id: number;
  history_id: number;
  player_id: string;
  size_category: MARKER_SIZE_CATEGORIES;
  position_lat: number;
  position_lng: number;
  name: string;
  image_name: string;
  health: number;
  total_health: number;
  death_saves: number;
  life_saves: number;
  is_visible: boolean;
  statuses: string[];
}
