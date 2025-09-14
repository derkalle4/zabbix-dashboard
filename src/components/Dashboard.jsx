import { createSignal, createEffect, onCleanup, For } from 'solid-js';
import { APP_CONFIG, HOST_GROUPS_CONFIG } from '../config.jsx';
import { loginToZabbix, getHostsByNames, getItemsData, getHistoryData } from '../api.jsx';
import GroupView from './GroupView';

function Dashboard() {
    const [dashboardData, setDashboardData] = createSignal(
        HOST_GROUPS_CONFIG.map(groupConfig => ({
            ...groupConfig,
            hostsData: groupConfig.hosts.map(hostConfig => ({
                ...hostConfig,
                zabbixHostId: null,
                items: [],
                historyData: new Map(),
                loading: true
            }))
        }))
    );
    const [setIsLoading] = createSignal(false);
    const [error, setError] = createSignal(null);
    const [authToken, setAuthToken] = createSignal(
        typeof window !== 'undefined' ? localStorage.getItem('zabbixAuthToken') : null
    );

    const clearAuth = () => {
        setAuthToken(null);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('zabbixAuthToken');
        }
    };

    const handleAuthError = (err) => {
        const message = err.message?.toLowerCase() || '';
        if (message.includes('not authorised') || message.includes('session id') || message.includes('invalid session')) {
            clearAuth();
        }
    };

    const getAuthToken = async () => {
        let currentAuthToken = authToken();
        if (currentAuthToken) return currentAuthToken;

        const loginResult = await loginToZabbix();
        const newAuthToken = typeof loginResult === 'string' 
            ? loginResult 
            : loginResult?.token || loginResult?.sessionid;

        if (!newAuthToken) {
            throw new Error("Authentication failed: No token received.");
        }

        setAuthToken(newAuthToken);
        if (typeof window !== 'undefined') {
            localStorage.setItem('zabbixAuthToken', newAuthToken);
        }
        return newAuthToken;
    };

    const createDataMaps = (allItems, allHistoryData) => {
        const itemsByHostId = new Map();
        const historyByItemId = new Map();

        allItems.forEach(item => {
            if (!itemsByHostId.has(item.hostid)) {
                itemsByHostId.set(item.hostid, []);
            }
            itemsByHostId.get(item.hostid).push(item);
        });

        allHistoryData.forEach(historyPoint => {
            if (!historyByItemId.has(historyPoint.itemid)) {
                historyByItemId.set(historyPoint.itemid, []);
            }
            historyByItemId.get(historyPoint.itemid).push(historyPoint);
        });

        return { itemsByHostId, historyByItemId };
    };

    const collectHistoryItemIds = (hostIdMap, itemsByHostId) => {
        const historyItemIds = [];
        
        HOST_GROUPS_CONFIG.forEach(groupConfig => {
            groupConfig.hosts.forEach(hostConfig => {
                const hostId = hostIdMap.get(hostConfig.hostName);
                if (!hostId || !hostConfig.widgets) return;

                const itemsForHost = itemsByHostId.get(hostId) || [];
                hostConfig.widgets.forEach(itemConfig => {
                    if (itemConfig.type.toLowerCase() === 'linechart' && itemConfig.itemName) {
                        const item = itemsForHost.find(item => item.name === itemConfig.itemName);
                        if (item) {
                            historyItemIds.push(item.itemid);
                        }
                    }
                });
            });
        });

        return historyItemIds;
    };

    const processGroupData = (hostIdMap, itemsByHostId, historyByItemId) => {
        return HOST_GROUPS_CONFIG.map(groupConfig => ({
            ...groupConfig,
            hostsData: groupConfig.hosts.map(hostConfig => {
                const hostId = hostIdMap.get(hostConfig.hostName);
                
                if (!hostId) {
                    return {
                        ...hostConfig,
                        zabbixHostId: null,
                        items: [],
                        historyData: new Map(),
                        loading: false,
                        error: `Host not found in Zabbix.`
                    };
                }
                
                const itemsForHost = itemsByHostId.get(hostId) || [];
                const hostHistoryData = new Map();
                
                hostConfig.widgets?.forEach(widget => {
                    if (widget.type.toLowerCase() === 'linechart' && widget.itemName) {
                        const item = itemsForHost.find(item => item.name === widget.itemName);
                        if (item) {
                            const historyForItem = historyByItemId.get(item.itemid) || [];
                            hostHistoryData.set(widget.itemName, historyForItem);
                        }
                    }
                });
                
                return { 
                    ...hostConfig, 
                    zabbixHostId: hostId, 
                    items: itemsForHost,
                    historyData: hostHistoryData,
                    loading: false
                };
            })
        }));
    };

    async function fetchData() {
        setIsLoading(true);
        setError(null);

        try {
            const currentAuthToken = await getAuthToken();
            
            const allHostNames = [...new Set(
                HOST_GROUPS_CONFIG.flatMap(group => 
                    group.hosts.map(h => h.hostName)
                )
            )];

            const allZabbixHosts = await getHostsByNames(currentAuthToken, allHostNames);
            const hostIdMap = new Map(allZabbixHosts.map(zh => [zh.name, zh.hostid]));
            const allHostIds = Array.from(hostIdMap.values()).filter(Boolean);
            
            const allItems = await getItemsData(currentAuthToken, allHostIds);
            const { itemsByHostId } = createDataMaps(allItems, []);
            
            const historyItemIds = collectHistoryItemIds(hostIdMap, itemsByHostId);
            
            let allHistoryData = [];
            if (historyItemIds.length > 0) {
                const historyTimeFrom = Math.floor(Date.now() / 1000) - (24 * 60 * 60);
                allHistoryData = await getHistoryData(currentAuthToken, historyItemIds, historyTimeFrom);
            }

            const { historyByItemId } = createDataMaps([], allHistoryData);
            const processedGroupData = processGroupData(hostIdMap, itemsByHostId, historyByItemId);
            
            setDashboardData(processedGroupData);
        } catch (err) {
            console.error("Failed to fetch dashboard data:", err);
            setError(err.message || "An unknown error occurred.");
            handleAuthError(err);
            
            // On error, update existing hosts to show error state but keep them visible
            setDashboardData(current => current.map(group => ({
                ...group,
                hostsData: group.hostsData.map(host => ({
                    ...host,
                    loading: false,
                    error: err.message || "Failed to load data"
                }))
            })));
        } finally {
            setIsLoading(false);
        }
    }

    createEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, APP_CONFIG.reloadInterval);
        onCleanup(() => clearInterval(intervalId));
    });

    return (
        <div class="dashboard-container p-4">
            <h1 class="text-2xl font-bold mb-4">{APP_CONFIG.pageTitle}</h1>
            {error() && <p class="text-red-500">Error: {error()}</p>}
            <For each={dashboardData()}>
                {(group) => <GroupView group={group} />}
            </For>
        </div>
    );
}

export default Dashboard;