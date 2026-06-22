import * as React from "react";

import { GAME_NAME } from "../../src/shared/Constants";
import { State } from "../../src/shared/State";

import Loading from "../Components/Loading";
import { discordSdk } from "./discordSdk";

import { AuthenticationDetail } from "../shared/UserDetails";
import { Client, Room } from "@colyseus/sdk";

// const AuthenticatedContext = React.createContext<TAuthenticatedContext>({
//   user: {
//     id: "",
//     username: "",
//     discriminator: "",
//     avatar: null,
//     public_flags: 0,
//   },
//   access_token: "",
//   scopes: [],
//   expires: "",
//   application: {
//     rpc_origins: undefined,
//     id: "",
//     name: "",
//     icon: null,
//     description: "",
//   },
//   guildMember: null,
//   client: undefined as unknown as Client,
//   room: undefined as unknown as Room,
// });

type ColyseusAuthenticationDetail = {
  client: Client | null;
  room: Room | null;
} & AuthenticationDetail;

const AuthenticatedContext = React.createContext<ColyseusAuthenticationDetail>({
  jwt: "",
  access_token: "",
  user: {
    id: "",
    name: "",
    avartar_uri: "",
    discriminator: ""
  },
  client: null,
  room: null,
});

export function AuthenticatedContextProvider({ children }: { children: React.ReactNode }) {
  const [DevToolShowing, setDevToolShowing] = React.useState<boolean>(false);

  const authenticatedContext = useAuthenticatedContextSetup();

  if (authenticatedContext === null || authenticatedContext.room === null || authenticatedContext.client === null) {
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
                    authenticatedContext.room!.leave(false);
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
function useAuthenticatedContextSetup(): ColyseusAuthenticationDetail | null {


  const [auth, setAuth] = React.useState<ColyseusAuthenticationDetail | null>(null);
  const settingUp = React.useRef(false);

  React.useEffect(() => {
    const setUpDiscordSdk = async () => {
      // Now we create a colyseus client
      // const wsUrl = `wss://${location.host}/.proxy/colyseus`;
      // const wsUrl = "https://brook-remain-narrow-hosts.trycloudflare.com/";
      const wsUrl = `/.proxy/colyseus`;
      const colyseusClientSdk = new Client(wsUrl); // this will be used to connect to express endpoints

      await discordSdk.ready();

      // Authorize with Discord Client
      // Required on the frontend to interface with the active discord session.
      const { code } = await discordSdk.commands.authorize({
        client_id: import.meta.env.VITE_CLIENT_ID,
        response_type: "code",
        state: "",
        prompt: "none",
        // More info on scopes here: https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes
        scope: [
          // https://discord.com/developers/docs/tutorials/developing-a-user-installable-app#configuring-default-install-settings-adding-default-install-settings
          "applications.commands",
          "identify",
          "guilds",
          "guilds.members.read",
          "rpc.voice.read",
        ],
      });

      // Retrieve a JWT for authentication with colyseus
      const authDetail: AuthenticationDetail | null = await colyseusClientSdk.http.post("/token", {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
        }),
      }).then(response => response.data);

      if (authDetail === null || authDetail.access_token === null) {
        throw new Error('Authentication Failed!');
      }

      // Authenticate with Discord client (using the access_token)
      const newAuth = await discordSdk.commands.authenticate({
        access_token: authDetail.access_token,
      });


      // Done with discord-specific setup
      let roomName = "Dnd-Interactive-dev";

      // Requesting the channel in GDMs (when the guild ID is null) requires
      // the dm_channels.read scope which requires Discord approval.
      if (discordSdk.channelId != null && discordSdk.guildId != null) {
        // Over RPC collect info about the channel
        const channel = await discordSdk.commands.getChannel({ channel_id: discordSdk.channelId });
        if (channel.name != null) {
          roomName = channel.name;
        }
      }

      // Finally, we construct our authenticatedContext object to be consumed throughout the app
      const newRoom = joinRoom(colyseusClientSdk, roomName, newAuth, authDetail.user.avartar_uri, authDetail.user.name);
      // setAuth({ ...newAuth, guildMember: guildMember, client: colyseusClientSdk, room: await newRoom });
      setAuth({
        ...newAuth,
        ...authDetail,
        client: colyseusClientSdk,
        room: await newRoom
      });
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

          // Unexpected leave.
          newRoom.onDrop((code: number, _reason?: string): void => {
            attemptReconnect(colyseusClient, newRoom!.reconnectionToken);
          });

          // Intentional Leave
          newRoom.onLeave((code) => {
            console.warn(`Client Leaving!\n${code.toString()}`);
            // attemptReconnect(colyseusClient, newRoom!.reconnectionToken);
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

          // Unexpected leave.
          nRoom.onDrop((code: number, _reason?: string): void => {
            attemptReconnect(colyseusClient, nRoom!.reconnectionToken);
          });

          // Intentional leave.
          nRoom.onLeave((code) => {
            console.warn(`Client Leaving!\n${code.toString()}`);
            // attemptReconnect(colyseusClient, nRoom!.reconnectionToken);
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
