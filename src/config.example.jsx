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
        sort_by: 0, // host item column index to sort by, 0 = first item in itemConfigs
        sort_desc: true, // sort descending
        colum_size: 12,
        column_size_medium: 6,
        column_size_large: 3,
        hosts: [
            {
                displayName: "Ballerbude",
                hostName: 'CounterStrike.Party Ballerbude',
                type: 'DefaultCard', // Optional, defaults to DefaultCard
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
                displayName: "Conquest",
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
            },
            {
                displayName: "Wettkampf",
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
                displayName: "Conquest",
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
                displayName: "Rushers Paradise",
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
            },
            {
                displayName: "SquadSmash",
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
        ]
    }
];

export { ZABBIX_CONFIG, HOST_GROUPS_CONFIG };