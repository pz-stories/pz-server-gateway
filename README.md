# BrainSlug Command and Control Server

NodeJS server application for sending commands to and receiving infos from the PZ BrainSlug mod. Find it [here](https://github.com/r0oto0r/brainslug-mod).

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
| GET         | /info       | -           | [PZInfo](https://github.com/r0oto0r/brainslug-server/blob/main/src/Interfaces.ts#L202)      |
| POST        | /command    | [Command](https://github.com/r0oto0r/brainslug-server/blob/main/src/Interfaces.ts#L1)     | -           |
| POST        | /rcon       | [RCONCommand](https://github.com/r0oto0r/brainslug-server/blob/main/src/Interfaces.ts#L6) | [RCONResponse](https://github.com/r0oto0r/brainslug-server/blob/main/src/Interfaces.ts#L11) |

## WEBSOCKET MESSAGES
### Recieve
| Type        | Payload     |
| ----------- | ----------- |
| info        | [PZInfo](https://github.com/r0oto0r/brainslug-server/blob/main/src/Interfaces.ts#L202)      |
| rcon-response | [RCONResponse](https://github.com/r0oto0r/brainslug-server/blob/main/src/Interfaces.ts#L11) |
### Send
| Type        | Payload     |
| ----------- | ----------- |
| command     | [Command](https://github.com/r0oto0r/brainslug-server/blob/main/src/Interfaces.ts#L1)     |
| rcon        | [RCONCommand](https://github.com/r0oto0r/brainslug-server/blob/main/src/Interfaces.ts#L6) |

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
#### info
Example Response:
```json
{
	"data": {
		"game": {
			"femaleOutfits": [
				"1RJTest",
				"AirCrew",
				"AmbulanceDriver",
				"ArmyCamoDesert",
				"ArmyCamoGreen",
				"ArmyServiceUniform",
				"Bandit",
				"BaseballFan_KY",
				"BaseballFan_Rangers",
                ........
			],
			"recipes": [
				"Smash Bottle",
				"Make Stake",
				"Make Mortar and Pestle",
				"Build Spiked Baseball Bat",
				"Saw Off Shotgun",
				"Saw Off Double Barrel Shotgun",
				"Build Spiked Plank",
				"Open Egg Carton",
				"Put Eggs in Carton",
				"Empty Frying Pan",
                ........
			],
			"climate": {
				"ambient": 0,
				"cloudIntensity": 0,
				"daylightStrength": 0,
				"desaturation": 0,
				"fogIntensity": 0,
				"globalLightColor": {
					"exterior": {
						"a": 1,
						"b": 0,
						"g": 0,
						"r": 0
					},
					"interior": {
						"a": 1,
						"b": 0,
						"g": 0,
						"r": 0
					}
				},
				"globalLightIntensity": 0,
				"humidity": 0,
				"newFogColor": {
					"exterior": {
						"a": 255,
						"b": 242,
						"g": 229,
						"r": 229
					},
					"interior": {
						"a": 255,
						"b": 242,
						"g": 229,
						"r": 229
					}
				},
				"nightStrength": 0,
				"precipitationIntensity": 0,
				"snow": false,
				"temperature": 0,
				"viewDistance": 0,
				"windAngleIntensity": 0,
				"windIntensity": 0
			},
			"hourMinute": "1:00",
			"paused": true
		},
		"server": {
			"options": [
				{
					"defaultValue": true,
					"name": "PVP",
					"value": false
				},
				{
					"defaultValue": true,
					"name": "PauseEmpty",
					"value": true
				},
				{
					"defaultValue": true,
					"name": "GlobalChat",
					"value": true
				},
				{
					"defaultValue": "s,r,a,w,y,sh,f,all",
					"name": "ChatStreams",
					"value": "s,r,a,w,y,sh,f,all"
				},
				{
					"defaultValue": true,
					"name": "Open",
					"value": true
				},
				{
					"defaultValue": "Welcome to Project Zomboid Multiplayer! <LINE> <LINE> To interact with the Chat panel: press Tab, T, or Enter. <LINE> <LINE> The Tab key will change the target stream of the message. <LINE> <LINE> Global Streams: /all <LINE> Local Streams: /say, /yell <LINE> Special Steams: /whisper, /safehouse, /faction. <LINE> <LINE> Press the Up arrow to cycle through your message history. Click the Gear icon to customize chat. <LINE> <LINE> Happy surviving!",
					"name": "ServerWelcomeMessage",
					"value": "Welcome to Project Zomboid Multiplayer! <LINE> <LINE> To interact with the Chat panel: press Tab, T, or Enter. <LINE> <LINE> The Tab key will change the target stream of the message. <LINE> <LINE> Global Streams: /all <LINE> Local Streams: /say, /yell <LINE> Special Steams: /whisper, /safehouse, /faction. <LINE> <LINE> Press the Up arrow to cycle through your message history. Click the Gear icon to customize chat. <LINE> <LINE> Happy surviving!"
				},
				{
					"defaultValue": false,
					"name": "AutoCreateUserInWhiteList",
					"value": true
				},
				{
					"defaultValue": true,
					"name": "DisplayUserName",
					"value": true
				},
				{
					"defaultValue": false,
					"name": "ShowFirstAndLastName",
					"value": false
				},
				{
					"defaultValue": "0,0,0",
					"name": "SpawnPoint",
					"value": "7250,8393,0"
				},
				{
					"defaultValue": true,
					"name": "SafetySystem",
					"value": true
				},
				{
					"defaultValue": true,
					"name": "ShowSafety",
					"value": true
				},
				{
					"defaultValue": 2,
					"name": "SafetyToggleTimer",
					"value": 2
				},
				{
					"defaultValue": 3,
					"name": "SafetyCooldownTimer",
					"value": 3
				},
				{
					"defaultValue": "",
					"name": "SpawnItems",
					"value": ""
				},
				{
					"defaultValue": 16261,
					"name": "DefaultPort",
					"value": 16261
				},
				{
					"defaultValue": 893023388,
					"name": "ResetID",
					"value": 4655617
				},
				{
					"defaultValue": "",
					"name": "Mods",
					"value": "BrainSlug"
				},
				{
					"defaultValue": "Muldraugh, KY",
					"name": "Map",
					"value": "Riverside, KY"
				},
				..........
			]
		},
		"players": [
			{
				"id": 1,
				"accessLevel": "Admin",
				"displayName": "Ben",
				"foreName": "Mitchell",
				"hoursSurvived": 10.915070234870655,
				"inventory": [
					{
						"name": "Tank Top",
						"num": 1,
						"type": "Vest_DefaultTEXTURE_TINT"
					},
					{
						"name": "Blue Police T-shirt",
						"num": 1,
						"type": "Tshirt_Profession_PoliceBlue"
					},
					{
						"name": "Long Socks",
						"num": 1,
						"type": "Socks_Long"
					},
					{
						"name": "Police Trooper Pants",
						"num": 1,
						"type": "Trousers_Police"
					},
					{
						"name": "Shoes",
						"num": 1,
						"type": "Shoes_Random"
					},
					{
						"name": "Mitchell Eastman's Key Ring",
						"num": 1,
						"type": "KeyRing"
					},
					{
						"name": "Belt",
						"num": 1,
						"type": "Belt2"
					},
					{
						"name": "Black Digital Watch",
						"num": 1,
						"type": "WristWatch_Left_DigitalBlack"
					},
					{
						"name": "House Key",
						"num": 1,
						"type": "Key4"
					},
					{
						"name": "Hoodie",
						"num": 1,
						"type": "HoodieUP_WhiteTINT"
					},
					{
						"name": "Jacket",
						"num": 1,
						"type": "Jacket_WhiteTINT"
					},
					{
						"name": "Duffel Bag",
						"num": 1,
						"type": "Bag_WorkerBag"
					},
					{
						"name": "JS-2000 Shotgun",
						"num": 1,
						"type": "Shotgun"
					},
					{
						"name": "Sling",
						"num": 1,
						"type": "Sling"
					},
					{
						"name": "Shotgun Shells",
						"num": 200,
						"type": "ShotgunShells"
					}
				],
				"moodles": [],
				"nutrition": {
					"calories": 800,
					"carbohydrates": 0,
					"lipids": 0,
					"proteins": 0,
					"weight": 80
				},
				"onlineId": 0,
				"perks": [
					{
						"level": 7,
						"name": "Aiming"
					},
					{
						"level": 5,
						"name": "Reloading"
					},
					{
						"level": 3,
						"name": "Fitness"
					},
					{
						"level": 5,
						"name": "Strength"
					},
					{
						"level": 1,
						"name": "Sprinting"
					},
					{
						"level": 1,
						"name": "Nimble"
					}
				],
				"playerBody": {
					"infectionLevel": 0,
					"isInfected": false,
					"isOnFire": false,
					"isSneezingCoughing": 0,
					"parts": [
						{
							"bandaged": false,
							"bitten": false,
							"bleeding": false,
							"deepWounded": false,
							"health": 100,
							"isBurnt": false,
							"isCut": false,
							"name": "Left Hand",
							"scratched": false,
							"stitched": false
						},
						{
							"bandaged": false,
							"bitten": false,
							"bleeding": false,
							"deepWounded": false,
							"health": 100,
							"isBurnt": false,
							"isCut": false,
							"name": "Right Hand",
							"scratched": false,
							"stitched": false
						},
						{
							"bandaged": false,
							"bitten": false,
							"bleeding": false,
							"deepWounded": false,
							"health": 100,
							"isBurnt": false,
							"isCut": false,
							"name": "Left Forearm",
							"scratched": false,
							"stitched": false
						},
						{
							"bandaged": false,
							"bitten": false,
							"bleeding": false,
							"deepWounded": false,
							"health": 100,
							"isBurnt": false,
							"isCut": false,
							"name": "Right Forearm",
							"scratched": false,
							"stitched": false
						},
						{
							"bandaged": false,
							"bitten": false,
							"bleeding": false,
							"deepWounded": false,
							"health": 100,
							"isBurnt": false,
							"isCut": false,
							"name": "Left Upper Arm",
							"scratched": false,
							"stitched": false
						},
						{
							"bandaged": false,
							"bitten": false,
							"bleeding": false,
							"deepWounded": false,
							"health": 100,
							"isBurnt": false,
							"isCut": false,
							"name": "Right Upper Arm",
							"scratched": false,
							"stitched": false
						},
						{
							"bandaged": false,
							"bitten": false,
							"bleeding": false,
							"deepWounded": false,
							"health": 100,
							"isBurnt": false,
							"isCut": false,
							"name": "Upper Torso",
							"scratched": false,
							"stitched": false
						},
						{
							"bandaged": false,
							"bitten": false,
							"bleeding": false,
							"deepWounded": false,
							"health": 100,
							"isBurnt": false,
							"isCut": false,
							"name": "Lower Torso",
							"scratched": false,
							"stitched": false
						},
						{
							"bandaged": false,
							"bitten": false,
							"bleeding": false,
							"deepWounded": false,
							"health": 100,
							"isBurnt": false,
							"isCut": false,
							"name": "Head",
							"scratched": false,
							"stitched": false
						},
						{
							"bandaged": false,
							"bitten": false,
							"bleeding": false,
							"deepWounded": false,
							"health": 100,
							"isBurnt": false,
							"isCut": false,
							"name": "Neck",
							"scratched": false,
							"stitched": false
						},
						{
							"bandaged": false,
							"bitten": false,
							"bleeding": false,
							"deepWounded": false,
							"health": 100,
							"isBurnt": false,
							"isCut": false,
							"name": "Groin",
							"scratched": false,
							"stitched": false
						},
						{
							"bandaged": false,
							"bitten": false,
							"bleeding": false,
							"deepWounded": false,
							"health": 100,
							"isBurnt": false,
							"isCut": false,
							"name": "Left Thigh",
							"scratched": false,
							"stitched": false
						},
						{
							"bandaged": false,
							"bitten": false,
							"bleeding": false,
							"deepWounded": false,
							"health": 100,
							"isBurnt": false,
							"isCut": false,
							"name": "Right Thigh",
							"scratched": false,
							"stitched": false
						},
						{
							"bandaged": false,
							"bitten": false,
							"bleeding": false,
							"deepWounded": false,
							"health": 100,
							"isBurnt": false,
							"isCut": false,
							"name": "Left Shin",
							"scratched": false,
							"stitched": false
						},
						{
							"bandaged": false,
							"bitten": false,
							"bleeding": false,
							"deepWounded": false,
							"health": 100,
							"isBurnt": false,
							"isCut": false,
							"name": "Right Shin",
							"scratched": false,
							"stitched": false
						},
						{
							"bandaged": false,
							"bitten": false,
							"bleeding": false,
							"deepWounded": false,
							"health": 100,
							"isBurnt": false,
							"isCut": false,
							"name": "Left Foot",
							"scratched": false,
							"stitched": false
						},
						{
							"bandaged": false,
							"bitten": false,
							"bleeding": false,
							"deepWounded": false,
							"health": 100,
							"isBurnt": false,
							"isCut": false,
							"name": "Right Foot",
							"scratched": false,
							"stitched": false
						}
					]
				},
				"stats": {
					"anger": 0,
					"boredom": 0,
					"drunkenness": 0,
					"endurance": 1,
					"enduranceDanger": 0.25,
					"enduranceLast": 1,
					"enduranceRecharging": false,
					"enduranceWarn": 0.5,
					"fatigue": 0,
					"fear": 0,
					"fitness": 1,
					"hunger": 0,
					"idleBoredom": 0,
					"maxStressFromCigarettes": 0.5099999904632568,
					"numChasingZombies": 0,
					"numVeryCloseZombies": 0,
					"numVisibleZombies": 0,
					"pain": 0,
					"sanity": 1,
					"sickness": 0,
					"stress": 0,
					"stressFromCigarettes": 0,
					"thirst": 0,
					"tripping": false,
					"trippingRotAngle": 0,
					"visibleZombies": 0
				},
				"steamId": 76561197971309840,
				"surName": "Eastman",
				"traits": [
					"Conspicuous",
					"Cowardly",
					"SlowReader",
					"NightVision",
					"Herbalist",
					"Organized",
					"Out of Shape"
				],
				"username": "Ben",
				"x": 7276.13720703125,
				"y": 8491.71484375,
				"z": 0,
				"zombieKills": 151,
				"lastSeen": "2022-08-29 22:25:59",
				"online": false,
				"isDead": false
			}
		],
		"safeHouses": [
			{
				"h": 17,
				"id": "7295,8456 at 1663354926382",
				"items": [],
				"owner": "Ben",
				"players": [
					"Ben"
				],
				"title": "Ben's Zombothek",
				"w": 15,
				"x": 7295,
				"y": 8456
			}
		]
	},
	"lastUpdated": "2022-09-17T01:00:10.021Z"
}
```

### Example RCON Requests
Example requests you could send to /rcon express endpoint or via websocket message

#### rcon
```json
{
	"command": "setaccesslevel",
	"args": ["Ben", "admin"]
}
```
```json
{
	"command": "save",
	"args": []
}
```