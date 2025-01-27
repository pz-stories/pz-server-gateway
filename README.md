# BrainSlug Command and Control Server

NodeJS server application for sending commands to and receiving infos from the PZ BrainSlug mod. Find
it [here](https://github.com/r0oto0r/brainslug-mod).

## CONFIG

### Env Variables

| Name                | Type   | Description                                       | Default                                                |
|---------------------|--------|---------------------------------------------------|--------------------------------------------------------|
| DEBUG               | Any    | Enable Debug Logging                              | Off, e.g. DEBUG=*.brainslug                            |
| API_KEY             | String | Command                                           | 1234test                                               |
| EXPRESS_PORT        | Number | Express Server Port                               | 8080                                                   |
| WEBSOCKET_PORT      | Number | Websocketr Server Port                            | 80                                                     |
| INPIPE_FILE_NAME    | String | Path to fifo pipe for sending commands to the mod | ~/Zomboid/mods/BrainSlug/inpipe                        |
| OUTPIPE_FILE_NAME   | String | Path to fifo pipe for receiving data from the mod | ~/Zomboid/mods/BrainSlug/inpipe                        |
| EXPORTED_PLAYERS_DB | String | Path to sqlite3 file for caching data             | ./exportedPlayers.db                                   |
| PZ_PLAYERS_DB       | String | Path to PZ Server players.db                      | e.g. ~/Zomboid/Saves/Multiplayer/SERVERNAME/players.db |
| RCON_HOST           | String | -                                                 | localhost                                              |
| RCON_PORT           | Number | Check PZ server config                            | 27015                                                  |
| RCON_PW             | String | Check PZ server config                            | PZ_RULES                                               |
| PZ_WHITELIST_DB     | String | Path to your whitelist db                         | e.g.Zomboid/Server/{name}.db                           |

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

| Type | Endpoint | Request                                                                                   | Returns                                                                                     |
|------|----------|-------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| GET  | /info    | -                                                                                         | [PZInfo](https://github.com/r0oto0r/brainslug-server/blob/main/src/Interfaces.ts#L202)      |
| POST | /command | [Command](https://github.com/r0oto0r/brainslug-server/blob/main/src/Interfaces.ts#L1)     | -                                                                                           |
| POST | /rcon    | [RCONCommand](https://github.com/r0oto0r/brainslug-server/blob/main/src/Interfaces.ts#L6) | [RCONResponse](https://github.com/r0oto0r/brainslug-server/blob/main/src/Interfaces.ts#L11) |

## WEBSOCKET MESSAGES

### Recieve

| Type          | Payload                                                                                     |
|---------------|---------------------------------------------------------------------------------------------|
| info          | [PZInfo](https://github.com/r0oto0r/brainslug-server/blob/main/src/Interfaces.ts#L202)      |
| rcon-response | [RCONResponse](https://github.com/r0oto0r/brainslug-server/blob/main/src/Interfaces.ts#L11) |

### Send

| Type    | Payload                                                                                   |
|---------|-------------------------------------------------------------------------------------------|
| command | [Command](https://github.com/r0oto0r/brainslug-server/blob/main/src/Interfaces.ts#L1)     |
| rcon    | [RCONCommand](https://github.com/r0oto0r/brainslug-server/blob/main/src/Interfaces.ts#L6) |

### Example Command Requests

Example requests you could send to /command express endpoint or via websocket message

#### slap

```json
{
  "command": "slap",
  "payload": {
    "username": "Ben"
  }
}
```

#### comegetsome

```json
{
  "command": "comegetsome",
  "payload": {
    "username": "Ben"
  }
}
```

#### horde

```json
{
  "command": "horde"
}
```

#### message

```json
{
  "command": "message",
  "payload": {
    "to": "Ben",
    "text": "TEST!"
  }
}
```

#### gift

```json
{
  "command": "gift",
  "payload": {
    "username": "Ben",
    "items": [
      "Base.Pistol"
    ]
  }
}
```

#### storm

```json
{
  "command": "storm"
}
```

#### sunny

```json
{
  "command": "sunny"
}
```

#### climate

```json
{
  "command": "climate",
  "payload": {
    "nightStrength": 0,
    "daylightStrength": 0.8,
    "globalLightIntensity": 1,
    "fogIntensity": 0,
    "snow": true,
    "precipitationIntensity": 0,
    "viewDisctance": 1,
    "temperature": 20,
    "windIntensity": 0,
    "windAngleIntensity": 0,
    "newFogColor": {
      "interior": {
        "a": 40,
        "r": 120,
        "g": 0,
        "b": 0
      },
      "exterior": {
        "a": 80,
        "r": 180,
        "g": 0,
        "b": 0
      }
    }
  }
}
```

#### zombieJumpScare

```json
{
  "command": "zombieJumpScare"
}
```


### Example RCON Requests

Example requests you could send to /rcon express endpoint or via websocket message

#### rcon

```json
{
  "command": "setaccesslevel",
  "args": [
    "Ben",
    "admin"
  ]
}
```

```json
{
  "command": "save",
  "args": []
}
```