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
        sort_by: "players", // host item name to sort by (no sorting if undefined)
        sort_type: "numeric", // "numeric" or "string", defaults to "numeric"
        sort_desc: true, // sort descending
        colum_size: 12,
        column_size_medium: 6,
        column_size_large: 3,
        hosts: [
            {
                displayName: "Ballerbude",
                hostName: 'CounterStrike.Party Ballerbude',
                type: 'DefaultCard', // Optional, defaults to DefaultCard
                widgets: [
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
                    {
                        type: "linechart",
                        itemName: "players", // must match an item name from Zabbix
                        itemType: "integer", // "float" or "integer"
                        minValue: 0, // can be a number or the name of another item
                        maxValue: "max_players", // can be a number or the name of another item
                        height: 30,
                        historyHours: 24,
                    },
                    {
                        type: "button",
                        displayName: "Join Server",
                        url: "steam://connect/144.76.221.102:27030",
                        buttonStyle: "secondary",
                    }
                ]
            },
            {
                displayName: "Conquest",
                hostName: 'CounterStrike.Party Conquest',
                widgets: [
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
                widgets: [
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
                widgets: [
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
                widgets: [
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
                widgets: [
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