import { MARKER_SIZE_CATEGORIES } from "./MarkerOptions";

export interface PlayerSaveState {
  pmh_id: number;
  history_id: number;
  player_id: string;
  position_lat: number;
  position_lng: number;
  initiative: number;
  health: number;
  total_health: number;
  death_saves: number;
  life_saves: number;
  statuses: string[];
}

export interface ShJoinInterface {
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

export interface LoadSaveHistory {
  id: number;
  date: Date;
  map: number;
  player_id: string;
  player_size: number;
}

export interface LoadImage {
  image_name: string;
}

export interface CampaignsDao {
  id: number;
  image_name: string;
  width: number;
  height: number;
  name: string;
  player_id: string;
}

export interface LoadCampaign {
  id: number;
  player_size: number;
  name: string;
  width: number;
  height: number;
  image_name: string;
}
