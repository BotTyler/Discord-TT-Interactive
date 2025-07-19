import { Types } from "@discord/embedded-app-sdk";
import { IGuildsMembersRead } from "../Types/types";

interface GetUserDisplayNameArgs {
  guildMember: IGuildsMembersRead | null;
  user: Partial<Types.User>;
}

export function getUserDisplayName({ guildMember, user }: GetUserDisplayNameArgs) {
  if (guildMember?.nick != null && guildMember.nick !== "") return guildMember.nick;
  console.log("failed guild check")

  if (user.discriminator !== "0") return `${user.username}#${user.discriminator}`;

  if (user.global_name != null && user.global_name !== "") return user.global_name;

  return user.username;
}
