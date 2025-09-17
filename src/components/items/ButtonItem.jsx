import { Show, createMemo } from 'solid-js';

function ButtonItem(props) {
  const processedData = createMemo(() => {
    const { itemName, displayUnits, sourceUnits, decimals, units: confUnits = "" } = props.itemConf || {};
    const rawItems = props.host?.items;
    const hostId = props.host?.zabbixHostId;

    if (!itemName || !Array.isArray(rawItems) || !hostId) {
      return {
        value: "?",
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
        value: "? (not found)",
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
    <a 
      href={itemConf()?.url || '#'} 
      target={itemConf()?.newWindow ? "_blank" : undefined}
      rel="noopener noreferrer" 
      class={`btn btn-${itemConf()?.buttonStyle || 'primary'}`}
    >
      {itemConf()?.displayName || 'Unknown'}
    </a>
  );
}

export default ButtonItem;