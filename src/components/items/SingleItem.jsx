import { Show, createMemo } from 'solid-js';

function SingleItem(props) {
  const processedData = createMemo(() => {
    const { itemName, displayUnits, sourceUnits, decimals, units: confUnits = "" } = props.itemConf || {};
    const rawItems = props.host?.items;
    const hostId = props.host?.zabbixHostId;

    if (!itemName || !Array.isArray(rawItems) || !hostId) {
      return {
        value: "N/A",
        units: confUnits,
        error: !itemName ? "Configuration missing" : !hostId ? "Host ID missing" : "Raw items data not available",
        state: 0,
      };
    }

    const zabbixItem = rawItems.find(item => 
      item?.name?.toLowerCase() === itemName.toLowerCase() && item.hostid === hostId
    );

    if (!zabbixItem) {
      return {
        value: "N/A (not found)",
        units: confUnits,
        error: `Item '${itemName}' not found for host ID '${hostId}'.`,
        state: 0,
      };
    }

    const state = parseInt(zabbixItem.state, 10) || 0;
    
    if (zabbixItem.error?.trim()) {
      return {
        value: "Error",
        units: "",
        error: zabbixItem.error,
        state,
      };
    }

    let value = zabbixItem.lastvalue;
    let units = zabbixItem.units || confUnits;

    if (displayUnits && typeof formatUnits === 'function' && value !== '') {
      const sourceUnitsForFormatting = sourceUnits || units || 'B';
      const formattedString = formatUnits(value, displayUnits, sourceUnitsForFormatting, decimals);
      const parts = formattedString.split(' ');
      
      if (parts.length > 1 && parts[parts.length - 1].toLowerCase() === displayUnits.toLowerCase()) {
        value = parts.slice(0, -1).join(' ');
        units = parts[parts.length - 1];
      } else {
        value = formattedString;
        units = parts.length === 1 && displayUnits ? "" : units;
      }
    }

    return {
      value: String(value),
      units,
      error: null,
      state,
    };
  });

  const itemConf = () => props.itemConf;
  const data = processedData();

  return (
    <li class="list-group-item d-flex justify-content-between">
      <span class="fw-semibold small me-1" title={data.error || itemConf()?.itemName || 'Item'}>
        {itemConf()?.displayName || 'Item'}:
      </span>
      <span class="badge bg-primary rounded-pill justify-content-end">
        {data.value}
        <Show when={data.units && data.value !== "Error" && !data.value.startsWith("N/A")}>
          <span class="small ms-1">{data.units}</span>
        </Show>
      </span>
    </li>
  );
}

export default SingleItem;