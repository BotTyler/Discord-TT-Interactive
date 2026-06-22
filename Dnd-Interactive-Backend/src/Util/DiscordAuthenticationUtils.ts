import { IDiscordGuildsMembersResource, IDiscordUserResource } from "../shared/UserDetails";

export function getUserAvatarUrl(
  guildMember: IDiscordGuildsMembersResource,
  user: IDiscordUserResource,
  cdn: string = `https://cdn.discordapp.com`,
  size: number = 256,
): string {
  if (guildMember.avatar != null) {
    return `${cdn}/guilds/${guildMember.guild_id}/users/${user.id}/avatars/${guildMember.avatar}.png?size=${size}`;
  }
  if (user.avatar != null) {
    return `${cdn}/avatars/${user.id}/${user.avatar}.png?size=${size}`;
  }

  const defaultAvatarIndex = (BigInt(user.id) >> 22n) % 6n;
  return `${cdn}/embed/avatars/${defaultAvatarIndex}.png?size=${size}`;
}

export function getUserDisplayName(
  guildMember: IDiscordGuildsMembersResource,
  user: IDiscordUserResource,
): string {
  if (guildMember.nick != null && guildMember.nick !== "") return guildMember.nick;
  console.log("failed guild check");

  if (user.discriminator !== "0") return `${user.username}#${user.discriminator}`;

  if (user.global_name != null && user.global_name !== "") return user.global_name;

  return user.username;
}
