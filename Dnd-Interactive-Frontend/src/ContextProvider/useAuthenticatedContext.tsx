import { Client, Room } from "colyseus.js";
import * as React from "react";

import { GAME_NAME } from "../../src/shared/Constants";
import { State } from "../../src/shared/State";

import Loading from "../Components/Loading";
import { getUserAvatarUrl } from "../Util/getUserAvatarUrl";
import { discordSdk } from "./discordSdk";

import type { IGuildsMembersRead, TAuthenticatedContext } from "../Types/types";
import { getUserDisplayName } from "../Util/getUserDisplayName";

const AuthenticatedContext = React.createContext<TAuthenticatedContext>({
  user: {
    id: "",
    username: "",
    discriminator: "",
    avatar: null,
    public_flags: 0,
  },
  access_token: "",
  scopes: [],
  expires: "",
  application: {
    rpc_origins: undefined,
    id: "",
    name: "",
    icon: null,
    description: "",
  },
  guildMember: null,
  client: undefined as unknown as Client,
  room: undefined as unknown as Room,
});

export function AuthenticatedContextProvider({ children }: { children: React.ReactNode }) {
  const [DevToolShowing, setDevToolShowing] = React.useState<boolean>(false);

  const authenticatedContext = useAuthenticatedContextSetup();

  if (authenticatedContext === null) {
    return <Loading></Loading>;
  }
  const isDevToolsActive = authenticatedContext.user.id === "740743332338073701";

  return (
    <AuthenticatedContext.Provider value={authenticatedContext}>
      <div className="position-relative w-100 h-100">
        {isDevToolsActive ? (
          <div
            className="position-absolute rounded-circle"
            style={{ width: "50px", height: "50px", bottom: "10px", right: "10px" }}
            onClick={() => {
              setDevToolShowing((prev) => {
                return !prev;
              });
            }}
          >
            <i style={{ fontSize: "30px" }} className="bi bi-gear" />
            <div className={`h-auto w-auto ${DevToolShowing ? "" : "d-none"} position-absolute`} style={{ right: "0px", bottom: "120%" }}>
              <div className="d-grid gap-2">
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => {
                    authenticatedContext.room.leave(false);
                  }}
                >
                  DC
                </button>
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
        {children}
      </div>
    </AuthenticatedContext.Provider>
  );
}

export function useAuthenticatedContext() {
  return React.useContext(AuthenticatedContext);
}

/**
 * This is a helper hook which is used to connect your embedded app with Discord and Colyseus
 */
function useAuthenticatedContextSetup() {
  const [auth, setAuth] = React.useState<TAuthenticatedContext | null>(null);
  const settingUp = React.useRef(false);

  React.useEffect(() => {
    const setUpDiscordSdk = async () => {
      await discordSdk.ready();
      // Now we create a colyseus client
      // const wsUrl = `wss://${location.host}/.proxy/colyseus`;
      // const wsUrl = "https://brook-remain-narrow-hosts.trycloudflare.com/";
      const wsUrl = `/.proxy/colyseus`;
      const colyseusClientSdk = new Client(wsUrl); // this will be used to connect to express endpoints

      // To avoid build time compilations. This needs to be passed in from an API request.
      const res = await fetch("/colyseus/discord");
      const res_json: any = await res.json();

      // Authorize with Discord Client
      const { code } = await discordSdk.commands.authorize({
        client_id: res_json.client_id,
        response_type: "code",
        state: "",
        prompt: "none",
        // More info on scopes here: https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes
        scope: [
          // Activities will launch through app commands and interactions of user-installable apps.
          // https://discord.com/developers/docs/tutorials/developing-a-user-installable-app#configuring-default-install-settings-adding-default-install-settings
          "applications.commands",

          // "applications.builds.upload",
          // "applications.builds.read",
          // "applications.store.update",
          // "applications.entitlements",
          // "bot",
          "identify",
          // "connections",
          // "email",
          // "gdm.join",
          "guilds",
          // "guilds.join",
          "guilds.members.read",
          // "messages.read",
          // "relationships.read",
          // 'rpc.activities.write',
          // "rpc.notifications.read",
          // "rpc.voice.write",
          "rpc.voice.read",
          // "webhook.incoming",
        ],
      });

      // Retrieve an access_token from your embedded app's server
      const { data } = await colyseusClientSdk.http.post("/token", {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
        }),
      });

      if (!data.access_token) {
        throw new Error('Check if your "Discord Client ID" and "Secret" are correct in your server-side.');
      }

      // Authenticate with Discord client (using the access_token)
      const newAuth = await discordSdk.commands.authenticate({
        access_token: data.access_token,
      });

      // Get guild specific nickname and avatar, and fallback to user name and avatar
      const guildMember: IGuildsMembersRead | null = await fetch(`https://discord.com/api/users/@me/guilds/${discordSdk.guildId}/member`, {
        method: "get",
        headers: { Authorization: `Bearer ${data.access_token}` },
      })
        .then(async (j) => j.json())
        .catch((e) => {
          console.log(e);
          return null;
        });

      // Done with discord-specific setup

      let roomName = "Channel";

      // Requesting the channel in GDMs (when the guild ID is null) requires
      // the dm_channels.read scope which requires Discord approval.
      if (discordSdk.channelId != null && discordSdk.guildId != null) {
        // Over RPC collect info about the channel
        const channel = await discordSdk.commands.getChannel({ channel_id: discordSdk.channelId });
        if (channel.name != null) {
          roomName = channel.name;
        }
      }

      // Get the user's guild-specific avatar uri
      // If none, fall back to the user profile avatar
      // If no main avatar, use a default avatar
      const avatarUri = getUserAvatarUrl({
        guildMember: guildMember,
        user: newAuth.user,
      });

      // Get the user's guild nickname. If none set, fall back to global_name, or username
      // Note - this name is note guaranteed to be unique
      const name = getUserDisplayName({
        guildMember: guildMember,
        user: newAuth.user,
      });

      const newRoom = joinRoom(colyseusClientSdk, roomName, newAuth, avatarUri, name ?? "NAN");
      // Finally, we construct our authenticatedContext object to be consumed throughout the app
      setAuth({ ...newAuth, guildMember: guildMember, client: colyseusClientSdk, room: await newRoom });
    };

    async function joinRoom(colyseusClient: Client, roomName: string, newAuth: any, avatarUri: string, name: string): Promise<Room<State>> {
      // The second argument has to include for the room as well as the current player
      let newRoom: Room<State> | undefined = undefined;
      while (!newRoom) {
        try {
          newRoom = await colyseusClient.joinOrCreate<State>(GAME_NAME, {
            channelId: discordSdk.channelId,
            roomName,
            userId: newAuth.user.id,
            name,
            avatarUri,
          });

          newRoom.onLeave((code) => {
            console.warn(`Client Leaving!\n${code.toString()}`);
            attemptReconnect(colyseusClient, newRoom!.reconnectionToken);
          });

          newRoom.onError((err) => {
            console.error(`ClientError: \n ${err.toString()}`);
            attemptReconnect(colyseusClient, newRoom!.reconnectionToken);
          });

          return newRoom;
        } catch (err) {
          console.error(`Something Went Wrong Joining Room: ${err}`);
        }
      }

      return newRoom;
    }
    function attemptReconnect(colyseusClient: Client, reconnectionToken: string) {
      let attempt = 0;
      const maxAttempts = 200;
      const reconnectIntervalms = 2000;

      const reconnectInterval = setInterval(async () => {
        if (attempt > maxAttempts) {
          clearInterval(reconnectInterval);
          return;
        }

        try {
          console.log("Reconnecting...");
          const nRoom = await colyseusClient.reconnect(reconnectionToken);
          nRoom.onLeave((code) => {
            console.warn(`Client Leaving!\n${code.toString()}`);
            attemptReconnect(colyseusClient, nRoom!.reconnectionToken);
          });

          nRoom.onError((err) => {
            console.error(`ClientError: \n ${err.toString()}`);
            attemptReconnect(colyseusClient, nRoom!.reconnectionToken);
          });

          setAuth((prev: any) => {
            return { ...prev, room: nRoom };
          });
          clearInterval(reconnectInterval);
        } catch (e) {
          console.error(`Error Reconnecting: ${e}`);
        }
        attempt++;
      }, reconnectIntervalms);
    }
    if (!settingUp.current) {
      settingUp.current = true;
      setUpDiscordSdk();
    }
  }, []);

  return auth;
}
