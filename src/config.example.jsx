export const APP_CONFIG = {
    pageTitle: "Zabbix Monitoring",
    reloadInterval: 60 * 1000, // 60 seconds
};

const ZABBIX_CONFIG = {
    serverUrl: 'https://zabbix/api_jsonrpc.php',
    username: 'user',
    password: 'pass',
    zabbixApiUsesBearerAuth: true,
};

const HOST_GROUPS_CONFIG = [
    {
        groupName: 'Counterstrike',
        hosts: [
            {
                hostName: 'CounterStrike.Party Ballerbude',
                itemConfigs: [
                    {
                        type: "compound",
                        displayName: "Players",
                        itemNames: { current: "players", total: "max_players" },
                        sourceUnits: "",
                        displayUnits: "",
                    },
                    {
                        type: "single",
                        itemName: "map",
                        displayName: "Map",
                        sourceUnits: "",
                        displayUnits: ""
                    },
                ]
            },
            {
                hostName: 'CounterStrike.Party Conquest',
                itemConfigs: [
                    {
                        type: "compound",
                        displayName: "Players",
                        itemNames: { current: "players", total: "max_players" },
                        sourceUnits: "",
                        displayUnits: "",
                    },
                    {
                        type: "single",
                        itemName: "map",
                        displayName: "Map",
                        sourceUnits: "",
                        displayUnits: ""
                    },
                ]
            },            {
                hostName: 'CounterStrike.Party Wettkampf',
                itemConfigs: [
                    {
                        type: "compound",
                        displayName: "Players",
                        itemNames: { current: "players", total: "max_players" },
                        sourceUnits: "",
                        displayUnits: "",
                    },
                    {
                        type: "single",
                        itemName: "map",
                        displayName: "Map",
                        sourceUnits: "",
                        displayUnits: ""
                    },
                ]
            },
        ]
    },
    {
            groupName: 'Battlefield',
            hosts: [
                {
                    hostName: 'Battlefield.onl Conquest',
                    itemConfigs: [
                        {
                            type: "compound",
                            displayName: "Players",
                            itemNames: { current: "players", total: "max_players" },
                            sourceUnits: "",
                            displayUnits: "",
                        },
                        {
                            type: "single",
                            itemName: "map",
                            displayName: "Map",
                            sourceUnits: "",
                            displayUnits: ""
                        },
                    ]
                },
                {
                    hostName: 'Battlefield.onl Rushers Paradise',
                    itemConfigs: [
                        {
                            type: "compound",
                            displayName: "Players",
                            itemNames: { current: "players", total: "max_players" },
                            sourceUnits: "",
                            displayUnits: "",
                        },
                        {
                            type: "single",
                            itemName: "map",
                            displayName: "Map",
                            sourceUnits: "",
                            displayUnits: ""
                        },
                    ]
                },            {
                    hostName: 'Battlefield.onl SquadSmash',
                    itemConfigs: [
                        {
                            type: "compound",
                            displayName: "Players",
                            itemNames: { current: "players", total: "max_players" },
                            sourceUnits: "",
                            displayUnits: "",
                        },
                        {
                            type: "single",
                            itemName: "map",
                            displayName: "Map",
                            sourceUnits: "",
                            displayUnits: ""
                        },
                    ]
                },
                {
                    hostName: 'Battlefield.onl Rushers Paradise Vietnam',
                    itemConfigs: [
                        {
                            type: "compound",
                            displayName: "Players",
                            itemNames: { current: "players", total: "max_players" },
                            sourceUnits: "",
                            displayUnits: "",
                        },
                        {
                            type: "single",
                            itemName: "map",
                            displayName: "Map",
                            sourceUnits: "",
                            displayUnits: ""
                        },
                    ]
                },            {
                    hostName: 'Battlefield.onl SquadSmash Vietnam',
                    itemConfigs: [
                        {
                            type: "compound",
                            displayName: "Players",
                            itemNames: { current: "players", total: "max_players" },
                            sourceUnits: "",
                            displayUnits: "",
                        },
                        {
                            type: "single",
                            itemName: "map",
                            displayName: "Map",
                            sourceUnits: "",
                            displayUnits: ""
                        },
                    ]
                },
            ]
        }
];

export { ZABBIX_CONFIG, HOST_GROUPS_CONFIG };