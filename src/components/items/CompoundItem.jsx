import { Show, createEffect, createSignal, onCleanup } from 'solid-js';

function CompoundItem(props) {
  const [compoundData, setCompoundData] = createSignal({ currentValue: 'N/A', totalValue: 'N/A', units: '', error: null });
  const itemConf = () => props.itemConf;
  const rawItemsForHost = () => props.rawItemsForHost;
  const zabbixHostId = () => props.zabbixHostId;

  createEffect(() => {
    const conf = itemConf();
    const rawItems = rawItemsForHost();
    const currentItemConfigName = conf?.itemNames?.current;
    const totalItemConfigName = conf?.itemNames?.total;

    if (!conf || !currentItemConfigName || !totalItemConfigName) {
      setCompoundData({ currentValue: 'N/A', totalValue: 'N/A', units: conf?.displayUnits || '', error: 'Config itemNames missing (current/total)' });
      return;
    }

    let currentVal = 'N/A', totalVal = 'N/A', units = conf.displayUnits || conf.units || '', error = null;

    const findItemByName = (name) => {
      if (!name || !rawItems || !Array.isArray(rawItems)) return undefined;
      const hostId = zabbixHostId(); 
      return rawItems.find(item => {
        const itemNameLower = item.name && typeof item.name === 'string' ? item.name.toLowerCase() : null;
        const configNameLower = typeof name === 'string' ? name.toLowerCase() : null;
        return itemNameLower && configNameLower && itemNameLower === configNameLower && String(item.hostid) === String(hostId);
      });
    };

    const currentRawItem = findItemByName(currentItemConfigName);
    const totalRawItem = findItemByName(totalItemConfigName);
    
    if (currentRawItem && totalRawItem) {
        units = conf.displayUnits || conf.sourceUnits || currentRawItem.units || totalRawItem.units || "";

        if(currentRawItem.error || totalRawItem.error) {
            let currentErrorMsg = currentRawItem.error ? `Current ('${currentItemConfigName}'): ${currentRawItem.error}` : '';
            let totalErrorMsg = totalRawItem.error ? `Total ('${totalItemConfigName}'): ${totalRawItem.error}` : '';
            error = [currentErrorMsg, totalErrorMsg].filter(Boolean).join('; ');
            currentVal = currentRawItem.error ? "Error" : currentRawItem.lastvalue;
            totalVal = totalRawItem.error ? "Error" : totalRawItem.lastvalue;
        } else {
            currentVal = currentRawItem.lastvalue;
            totalVal = totalRawItem.lastvalue;

            // Simplified unit formatting logic for this example, adapt your formatUnits logic here
            if (conf.displayUnits) {
                // Placeholder for your formatUnits logic if needed
                // currentVal = formatUnits(currentVal, conf.displayUnits, ...);
                // totalVal = formatUnits(totalVal, conf.displayUnits, ...);
                units = conf.displayUnits;
            }
        }
    } else {
        error = "Partial or no data. ";
        if (!currentRawItem) error += `Current ('${currentItemConfigName}') missing. `;
        if (!totalRawItem) error += `Total ('${totalItemConfigName}') missing.`;
        currentVal = currentRawItem ? currentRawItem.lastvalue : "N/A";
        totalVal = totalRawItem ? totalRawItem.lastvalue : "N/A";
    }
    
    setCompoundData({ currentValue: currentVal, totalValue: totalVal, units: units, error: error });
  });

  const currentData = () => compoundData();
  const titleText = () => {
    const conf = itemConf();
    if (conf?.itemNames?.current && conf?.itemNames?.total) {
      return `Current: ${conf.itemNames.current}, Total: ${conf.itemNames.total}`;
    }
    return conf?.key || '';
  };

  return (
    <li class="list-group-item d-flex justify-content-between">
      <span class="fw-semibold small me-1" title={titleText()}>{itemConf()?.displayName || 'Compound Item'}:</span>
        <span class="badge bg-success rounded-pill justify-content-end">
          {String(currentData().currentValue)}/{String(currentData().totalValue)}
          <Show when={currentData().units}>
            <span class="small me-2">{currentData().units}</span>
          </Show>
          <Show when={currentData().error}>
            <span class="small me-1" title={currentData().error}>(Error)</span>
          </Show>
          </span>
    </li>
  );
}

export default CompoundItem;