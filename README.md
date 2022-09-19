# BrainSlug Command and Control Server

## CONFIG

### Env Variabls

| Name                | Type           | Description                                       | Default                         |
| ------------------- | -------------- | ------------------------------------------------- | ------------------------------- |
| DEBUG               | Any            | Enable Debug Logging                              | Off, e.g. DEBUG=*.brainslug     |
| API_KEY             | String         | Command                                           | 1234test                        |
| EXPRESS_PORT        | Number         | Express Server Port                               | 8080                            |
| WEBSOCKET_PORT      | Number         | Websocketr Server Port                            | 80                              |
| INPIPE_FILE_NAME    | String         | Path to fifo pipe for sending commands to the mod | ~/Zomboid/mods/BrainSlug/inpipe |
| OUTPIPE_FILE_NAME   | String         | Path to fifo pipe for receiving data from the mod | ~/Zomboid/mods/BrainSlug/inpipe |
| EXPORTED_PLAYERS_DB | String         | Path to sqlite3 file for caching data             | ./exportedPlayers.db            |
| PZ_PLAYERS_DB       | String         | Path to PZ Server players.db                      | e.g. ~/Zomboid/Saves/Multiplayer/SERVERNAME/players.db |
| RCON_HOST           | String         | -                                                 | localhost                       |
| RCON_PORT           | Number         | Check PZ server config                            | 27015                           |
| RCON_PW             | String         | Check PZ server config                            | PZ_RULES                        |

## BUILD & RUN
* Requires nodejs >= 16
  
### Build
```bash
npm run install
npm run tsc
```
### Transpile & Run
```bash
npm run exec
```

## EXPRESS API

| Type        | Endpoint    | Request     | Returns     |
| ----------- | ----------- | ----------- | ----------- |
| GET         | /info       | -           | PZInfo      |
| POST        | /command    | Command     | -           |
| POST        | /rcon       | RCONCommand | RCONResponse|

## WEBSOCKET MESSAGES
### Recieve
| Type        | Payload     |
| ----------- | ----------- |
| info        | /PZInfo     |

### Send
| Type        | Payload     |
| ----------- | ----------- |
| command     | Command     |
| rcon        | RCONCommand |
