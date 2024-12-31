import { DiscordSDK, DiscordSDKMock } from "@discord/embedded-app-sdk";

const queryParams = new URLSearchParams(window.location.search);
const isEmbedded = queryParams.get("frame_id") != null;

let discordSdk: DiscordSDK | DiscordSDKMock;

if (isEmbedded) {
  discordSdk = new DiscordSDK(import.meta.env.VITE_CLIENT_ID);
} else {
  console.error("THIS APP IS MEANT TO BE EMBEDDED IN DISCORD!!!");
}

enum SessionStorageQueryParam {
  user_id = "user_id",
  guild_id = "guild_id",
  channel_id = "channel_id",
}

function getOverrideOrRandomSessionValue(queryParam: `${SessionStorageQueryParam}`) {
  const overrideValue = queryParams.get(queryParam);
  if (overrideValue != null) {
    return overrideValue;
  }

  const currentStoredValue = sessionStorage.getItem(queryParam);
  if (currentStoredValue != null) {
    return currentStoredValue;
  }

  // Set queryParam to a random 8-character string
  const randomString = Math.random().toString(36).slice(2, 10);
  sessionStorage.setItem(queryParam, randomString);
  return randomString;
}

// function setupProxy() {
//   // TODO hide client id
//   patchUrlMappings([
//     {
//       prefix: "https://1262169825308971068.discordsays.com/",
//       target: "https://1262169825308971068.discordsays.com/.proxy/",
//     },
//   ]);
//   // patchUrlMappings([
//   //   {
//   //     prefix: "/",
//   //     target: "/.proxy/",
//   //   },
//   // ]);
// }

// // setupProxy();
export { discordSdk };
