export interface UserDetail {
  id: string;
  name: string;
  discriminator: string;
  avartar_uri: string;
}

export interface AuthenticationDetail {
  user: UserDetail;
  jwt: string;
  access_token: string;
}

// export type TAuthenticatedContext = CommandResponse<"authenticate"> & {
//   guildMember: IGuildsMembersRead | null;
// } & IColyseus;

/*
==============================================================================
Discord information
https://docs.discord.com/developers/resources/user
==============================================================================
*/
export interface IDiscordGuildsMembersResource {
  guild_id: string;
  roles: string[];
  nick: string | null;
  avatar: string | null;
  premium_since: string | null;
  joined_at: string;
  is_pending: boolean;
  pending: boolean;
  communication_disabled_until: string | null;
  user: {
    id: string;
    username: string;
    avatar: string | null;
    discriminator: string;
    public_flags: number;
  };
  mute: boolean;
  deaf: boolean;
}

export interface IDiscordUserResource {
  id: string;
  username: string;
  global_name?: string;
  discriminator: string;
  avatar: string;
  verified: boolean;
  email: string;
  flags: number;
  banner: string;
  accent_color: number;
  premium_type: number;
  public_flags: number;
  avatar_decoration_data: {
    sku_id: string;
    asset: string;
  };
  collectibles: {
    nameplate: {
      sku_id: string;
      asset: string;
      label: string;
      palette: string;
    };
  };
  primary_guild: {
    identity_guild_id: string;
    identity_enabled: boolean;
    tag: string;
    badge: string;
  };
}
