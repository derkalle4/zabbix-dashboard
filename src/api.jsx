import { ZABBIX_CONFIG } from './config.jsx';

/**
 * Sends a request to the Zabbix API.
 * @param {string} method - The Zabbix API method to call.
 * @param {object} params - The parameters for the API method.
 * @param {string|null} authToken - The authentication token (if logged in).
 * @returns {Promise<object>} - The API response.
 */
async function zabbixApiRequest(method, params, authToken = null) {
    const requestBody = {
        jsonrpc: '2.0',
        method: method,
        params: params,
        id: Math.floor(Math.random() * 100000) + 1
    };

    const headers = {
        'Content-Type': 'application/json-rpc',
    };

    if (authToken) {
        if (ZABBIX_CONFIG.zabbixApiUsesBearerAuth) {
            headers['Authorization'] = `Bearer ${authToken}`;
        } else {
            // For non-bearer auth, the token is often part of the request body's "auth" param,
            // which is handled by specific methods like login or if params include it.
            // If Zabbix version expects auth token in params for every call after login:
            requestBody.auth = authToken;
        }
    }
    
    // Special handling for login if not using Bearer auth and token needs to be in params
    // However, user.login itself doesn't use an existing authToken.
    // The `auth` property in requestBody is generally for API calls *after* login.
    // The login call itself sends user/password in params.

    if (method === 'user.login') {
        console.debug('Zabbix API Request (user.login) - Target URL:', ZABBIX_CONFIG.serverUrl);
    }

    try {
        const response = await fetch(ZABBIX_CONFIG.serverUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Zabbix API request failed:', response.status, errorText);
            throw new Error(`Zabbix API request failed: ${response.status} ${response.statusText}. Details: ${errorText}`);
        }

        const data = await response.json();

        if (data.error) {
            console.error('Zabbix API Error:', JSON.stringify(data.error, null, 2));
            throw new Error(`Zabbix API Error: ${data.error.message} - ${data.error.data}`);
        }
        return data.result;
    } catch (error) {
        console.error(`Error in zabbixApiRequest for method ${method}:`, error);
        throw error; // Re-throw the error to be caught by the calling function
    }
}

export async function loginToZabbix() {
    try {
        const loginParams = (ZABBIX_CONFIG.zabbixApiUsesBearerAuth) ?
            { username: ZABBIX_CONFIG.username, password: ZABBIX_CONFIG.password } : // Newer Zabbix with token-based auth
            { user: ZABBIX_CONFIG.username, password: ZABBIX_CONFIG.password }; // Older Zabbix with user/password
        
        // For non-bearer auth, Zabbix might expect 'user' instead of 'username'
        // The zabbixApiRequest handles adding the auth token to header for Bearer,
        // or to body for other methods if needed, but login is special.
        const result = await zabbixApiRequest('user.login', loginParams);
        // The result for user.login is typically the auth token string directly,
        // or an object containing the token (e.g. { sessionid: "...", token: "..." })
        // The Dashboard.jsx handles extracting the token from the result.
        return result;
    } catch (error) {
        console.error('Zabbix login failed. Verify credentials, API permissions, URL, and zabbixApiUsesBearerAuth setting in config.jsx.');
        throw error;
    }
}

export async function getHostsByNames(authToken, hostNames) {
    if (!authToken) throw new Error("Authentication token is required for getHostsByNames.");
    if (!hostNames || hostNames.length === 0) return [];
    try {
        return await zabbixApiRequest('host.get', {
            output: ['hostid', 'name', 'host'], // 'host' is often the technical/interface name
            filter: { name: hostNames }, // Filter by visible name
            selectInterfaces: ['ip', 'dns', 'port', 'type', 'main', 'useip'],
        }, authToken);
    } catch (error) {
        console.error(`Failed to get hosts by names: ${hostNames.join(', ')}. Error: ${error.message}`);
        throw error;
    }
}

export async function getItemsData(authToken, hostIds, itemKeys = null) {
    if (!authToken) throw new Error("Authentication token is required for getItemsData.");
    if (!hostIds || hostIds.length === 0) {
        console.warn("getItemsData called with no hostIds. Returning empty array.");
        return [];
    }

    const fetchSpecificKeys = itemKeys && itemKeys.length > 0;

    try {
        const params = {
            output: ['itemid', 'name', 'key_', 'lastvalue', 'hostid', 'units', 'value_type', 'state', 'error'],
            hostids: hostIds,
            sortfield: 'name',
        };

        if (fetchSpecificKeys) {
            params.filter = { key_: itemKeys };
            // Using 'search' might be more flexible if itemKeys are partial or need wildcard,
            // but 'filter' is for exact matches of keys.
            // params.search = { key_: itemKeys.join(' or ') }; // Example if search is preferred
        }
        // If not fetchSpecificKeys, no item-specific filter is added, so API returns all items for hostids.

        return await zabbixApiRequest('item.get', params, authToken);
    } catch (error) {
        console.error(`Failed to get items data for hostIds [${hostIds.join(', ')}]. Error: ${error.message}`);
        throw error;
    }
}

export async function getHistoryData(authToken, itemId, timeFrom, timeTill = null) {
    if (!authToken) throw new Error("Authentication token is required for getHistoryData.");
    
    try {
        const params = {
            output: 'extend',
            itemids: [itemId],
            time_from: timeFrom,
            sortfield: 'clock',
            sortorder: 'ASC'
        };
        
        if (timeTill) {
            params.time_till = timeTill;
        }
        
        return await zabbixApiRequest('history.get', params, authToken);
    } catch (error) {
        console.error(`Failed to get history data for item ${itemId}:`, error);
        throw error;
    }
}