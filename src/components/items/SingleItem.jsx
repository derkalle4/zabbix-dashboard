import { Show, createMemo } from 'solid-js';

function SingleItem(props) {
  const processedData = createMemo(() => {
    if (!props.itemConf || !props.rawItemsForHost || !props.zabbixHostId) {
      return {
        value: "N/A",
        units: "",
        error: "Configuration or raw data missing for SingleItem processing",
        state: null,
      };
    }

    const { itemConf, rawItemsForHost, zabbixHostId } = props;
    const configItemName = itemConf.itemName;

    if (!Array.isArray(rawItemsForHost)) {
        return {
            value: "N/A",
            units: itemConf.units || "",
            error: "Raw items data is not available or not an array.",
            state: 0,
        };
    }

    const zabbixItem = rawItemsForHost.find(item => {
      const itemNameLower = item && item.name && typeof item.name === 'string' ? item.name.toLowerCase() : null;
      const configItemNameLower = configItemName && typeof configItemName === 'string' ? configItemName.toLowerCase() : null;
      return itemNameLower && configItemNameLower && itemNameLower === configItemNameLower && item.hostid === zabbixHostId;
    });

    let value = "N/A";
    let units = itemConf.units || "";
    let error = null;
    let state = 0;

    if (zabbixItem) {
      state = parseInt(zabbixItem.state, 10) || 0;
      if (zabbixItem.error && zabbixItem.error.trim() !== "") {
        error = zabbixItem.error;
        value = "Error";
        units = "";
      } else {
        value = zabbixItem.lastvalue;
        units = zabbixItem.units || "";

        if (itemConf.displayUnits && typeof formatUnits === 'function') {
          const sourceUnitsForFormatting = itemConf.sourceUnits || units || 'B';
          const valueToFormat = (typeof zabbixItem.lastvalue === 'number' || typeof zabbixItem.lastvalue === 'string') ? zabbixItem.lastvalue : '';
          
          if (valueToFormat !== '') {
            const formattedString = formatUnits(valueToFormat, itemConf.displayUnits, sourceUnitsForFormatting, itemConf.decimals);
            const parts = formattedString.split(' ');
            if (parts.length > 1 && parts[parts.length -1].toLowerCase() === itemConf.displayUnits.toLowerCase()) {
              value = parts.slice(0, -1).join(' ');
              units = parts[parts.length - 1];
            } else {
              value = formattedString;
              units = (parts.length === 1 && itemConf.displayUnits) ? "" : units; 
            }
          } else {
            value = "N/A (invalid value)";
          }
        }
      }
    } else {
      error = `Item '${configItemName}' not found for host ID '${zabbixHostId}'.`;
      value = "N/A (not found)";
    }

    return {
      value: String(value),
      units: units,
      error: error,
      state: state,
    };
  });

  return (
    <li class="list-group-item d-flex justify-content-between">
      <span class="fw-semibold small me-1" title={processedData().error || (props.itemConf?.itemName || 'Item')}>{props.itemConf?.displayName || 'Item'}:</span>
      <span class="badge bg-primary rounded-pill justify-content-end">
        {processedData().value}
        <Show when={processedData().units && processedData().value !== "Error" && !processedData().value.startsWith("N/A")}>
          <span class="small ms-1">{processedData().units}</span>
        </Show>
      </span>
    </li>
  );
}

export default SingleItem;