import { ZABBIX_CONFIG } from './config.jsx';

async function zabbixApiRequest(method, params, authToken = null) {
    const requestBody = {
        jsonrpc: '2.0',
        method: method,
        params: params,
        id: Math.floor(Math.random() * 100000) + 1
    };

    const headers = {
        'Content-Type': 'application/json-rpc',
        'Accept-Encoding': 'gzip, deflate, br', // Request compression
    };

    if (authToken) {
        if (ZABBIX_CONFIG.zabbixApiUsesBearerAuth) {
            headers['Authorization'] = `Bearer ${authToken}`;
        } else {
            requestBody.auth = authToken;
        }
    }

    if (method === 'user.login') {
        console.debug('Zabbix API Request (user.login) - Target URL:', ZABBIX_CONFIG.serverUrl);
    }

    const response = await fetch(ZABBIX_CONFIG.serverUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Zabbix API request failed: ${response.status} ${response.statusText}. Details: ${errorText}`);
    }

    const data = await response.json();

    if (data.error) {
        throw new Error(`Zabbix API Error: ${data.error.message} - ${data.error.data}`);
    }
    return data.result;
}

export async function loginToZabbix() {
    const loginParams = ZABBIX_CONFIG.zabbixApiUsesBearerAuth ?
        { username: ZABBIX_CONFIG.username, password: ZABBIX_CONFIG.password } :
        { user: ZABBIX_CONFIG.username, password: ZABBIX_CONFIG.password };
    
    return await zabbixApiRequest('user.login', loginParams);
}

export async function getHostsByNames(authToken, hostNames) {
    if (!authToken) throw new Error("Authentication token is required for getHostsByNames.");
    if (!hostNames?.length) return [];
    
    return await zabbixApiRequest('host.get', {
        output: ['hostid', 'name', 'host'],
        filter: { name: hostNames },
        selectInterfaces: ['ip', 'dns', 'port', 'type', 'main', 'useip'],
    }, authToken);
}

export async function getItemsData(authToken, hostIds, itemKeys = null) {
    if (!authToken) throw new Error("Authentication token is required for getItemsData.");
    if (!hostIds?.length) return [];

    const params = {
        output: ['itemid', 'name', 'key_', 'lastvalue', 'hostid', 'units', 'value_type', 'state', 'error'],
        hostids: hostIds,
        sortfield: 'name',
    };

    if (itemKeys?.length > 0) {
        params.filter = { key_: itemKeys };
    }

    return await zabbixApiRequest('item.get', params, authToken);
}

export async function getHistoryData(authToken, itemId, timeFrom, timeTill = null, useTrends = false) {
    if (!authToken) throw new Error("Authentication token is required for getHistoryData.");
    
    if (useTrends) {
        // First check if the item supports trends (numeric types only)
        const items = await zabbixApiRequest('item.get', {
            output: ['itemid', 'value_type'],
            itemids: Array.isArray(itemId) ? itemId : [itemId]
        }, authToken);
        
        const hasNonNumericItems = items.some(item => 
            !['0', '3'].includes(item.value_type) // 0=float, 3=integer
        );
        
        if (hasNonNumericItems) {
            console.warn('Some items are not numeric, falling back to history.get');
            useTrends = false;
        }
    }
    
    const method = useTrends ? 'trend.get' : 'history.get';
    const output = useTrends ? ['itemid', 'clock', 'value_avg', 'value_min', 'value_max'] : 'extend';
    
    const params = {
        output: output,
        itemids: Array.isArray(itemId) ? itemId : [itemId],
        time_from: timeFrom,
        sortfield: 'clock',
        sortorder: 'ASC'
    };
    
    if (timeTill) {
        params.time_till = timeTill;
    }
    
    const result = await zabbixApiRequest(method, params, authToken);
    
    // If trends return empty but we expected data, fallback to history
    if (useTrends && (!result || result.length === 0)) {
        console.warn('Trends returned empty, falling back to history.get');
        return await getHistoryData(authToken, itemId, timeFrom, timeTill, false);
    }
    
    return result;
}
