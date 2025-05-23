import { createSignal, createEffect, onCleanup, For } from 'solid-js';
import { APP_CONFIG, HOST_GROUPS_CONFIG } from '../config.jsx';
import { loginToZabbix, getHostsByNames, getItemsData } from '../api.jsx';
import GroupView from './GroupView';


function Dashboard() {
    const [dashboardData, setDashboardData] = createSignal([]);
    const [isLoading, setIsLoading] = createSignal(true);
    const [error, setError] = createSignal(null);
    // Load token from localStorage on initialization, fallback to null if localStorage is not available
    const [authToken, setAuthToken] = createSignal(
        typeof window !== 'undefined' ? localStorage.getItem('zabbixAuthToken') : null
    );

    async function fetchData() {
        setIsLoading(true);
        setError(null);
        let currentAuthToken = authToken();

        try {
            // 1. Login if no token is currently available (either not in state or not in localStorage).
            if (!currentAuthToken) {
                const loginResult = await loginToZabbix();
                let newAuthToken = null;

                // Extract token from Zabbix API response
                if (typeof loginResult === 'string') {
                    newAuthToken = loginResult;
                } else if (loginResult && loginResult.token) {
                    newAuthToken = loginResult.token;
                } else if (loginResult && loginResult.sessionid) { // Older Zabbix versions might use sessionid
                    newAuthToken = loginResult.sessionid;
                }

                if (newAuthToken) {
                    currentAuthToken = newAuthToken;
                    setAuthToken(currentAuthToken);
                    // Save the new token to localStorage if available
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('zabbixAuthToken', currentAuthToken);
                    }
                } else {
                    console.error("Login response did not contain a token:", loginResult);
                    throw new Error("Authentication failed: No token received.");
                }
            }

            const processedGroupData = [];

            for (const groupConfig of HOST_GROUPS_CONFIG) {
                const hostNames = groupConfig.hosts.map(h => h.hostName);
                if (hostNames.length === 0) {
                    processedGroupData.push({ ...groupConfig, hostsData: [] });
                    continue;
                }

                const zabbixHosts = await getHostsByNames(currentAuthToken, hostNames);
                const hostIdMap = new Map(zabbixHosts.map(zh => [zh.name, zh.hostid]));

                const hostsData = [];
                for (const hostConfig of groupConfig.hosts) {
                    const hostId = hostIdMap.get(hostConfig.hostName);
                    if (!hostId) {
                        console.warn(`Host ${hostConfig.hostName} not found in Zabbix or no ID returned.`);
                        hostsData.push({
                            ...hostConfig,
                            zabbixHostId: null,
                            items: [],
                            error: `Host not found in Zabbix.`
                        });
                        continue;
                    }
                    const itemsRaw = await getItemsData(currentAuthToken, [hostId], []);
                    hostsData.push({ ...hostConfig, zabbixHostId: hostId, items: itemsRaw });
                }
                processedGroupData.push({ ...groupConfig, hostsData: hostsData });
            }

            setDashboardData(processedGroupData);
        } catch (err) {
            console.error("Failed to fetch dashboard data:", err);
            setError(err.message || "An unknown error occurred.");
            // If auth error (e.g., "Not authorised", "Session ID" issues),
            // clear token from state and localStorage to force re-login on next attempt.
            if (err.message && (err.message.includes("Not authorised") || err.message.includes("Session ID") || err.message.toLowerCase().includes("invalid session"))) {
                setAuthToken(null);
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('zabbixAuthToken');
                }
            }
        } finally {
            setIsLoading(false);
        }
    }

    createEffect(() => {
        fetchData(); // Initial fetch
        const intervalId = setInterval(fetchData, APP_CONFIG.reloadInterval);
        onCleanup(() => clearInterval(intervalId));
    });

    return (
        <div class="dashboard-container p-4">
            <h1 class="text-2xl font-bold mb-4">{APP_CONFIG.pageTitle}</h1>
            {isLoading() && <p>Loading dashboard data...</p>}
            {error() && <p class="text-red-500">Error: {error()}</p>}
            {!isLoading() && !error() && (
                <For each={dashboardData()}>
                    {(group) => (
                        <GroupView group={group} />
                    )}
                </For>
            )}
        </div>
    );
}

export default Dashboard;