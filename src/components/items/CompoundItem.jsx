import { Show, createEffect, createSignal } from 'solid-js';

function CompoundItem(props) {
  const [compoundData, setCompoundData] = createSignal({ 
    currentValue: '?', 
    totalValue: '?', 
    units: '', 
    error: null 
  });

  createEffect(() => {
    const conf = props.itemConf;
    const rawItems = props.host?.items || [];
    const hostId = props.host?.zabbixHostId;
    const { current: currentName, total: totalName } = conf?.itemNames || {};

    if (!conf || !currentName || !totalName) {
      setCompoundData({ 
        currentValue: 'N/A', 
        totalValue: 'N/A', 
        units: conf?.displayUnits || '', 
        error: 'Config itemNames missing (current/total)' 
      });
      return;
    }

    const findItem = (name) => rawItems.find(item => 
      item.name?.toLowerCase() === name.toLowerCase() && 
      String(item.hostid) === String(hostId)
    );

    const currentItem = findItem(currentName);
    const totalItem = findItem(totalName);
    
    let currentVal = 'N/A', totalVal = 'N/A', units = '', error = null;

    if (currentItem && totalItem) {
      units = conf.displayUnits || conf.sourceUnits || currentItem.units || totalItem.units || '';
      
      if (currentItem.error || totalItem.error) {
        const errors = [
          currentItem.error && `Current ('${currentName}'): ${currentItem.error}`,
          totalItem.error && `Total ('${totalName}'): ${totalItem.error}`
        ].filter(Boolean);
        
        error = errors.join('; ');
        currentVal = currentItem.error ? 'Error' : currentItem.lastvalue;
        totalVal = totalItem.error ? 'Error' : totalItem.lastvalue;
      } else {
        currentVal = currentItem.lastvalue;
        totalVal = totalItem.lastvalue;
        if (conf.displayUnits) units = conf.displayUnits;
      }
    } else {
      const missing = [];
      if (!currentItem) missing.push(`Current ('${currentName}')`);
      if (!totalItem) missing.push(`Total ('${totalName}')`);
      
      error = `${missing.join(' and ')} missing`;
      currentVal = currentItem?.lastvalue || 'N/A';
      totalVal = totalItem?.lastvalue || 'N/A';
    }
    
    setCompoundData({ currentValue: currentVal, totalValue: totalVal, units, error });
  });

  const titleText = () => {
    const conf = props.itemConf;
    const { current, total } = conf?.itemNames || {};
    return current && total ? `Current: ${current}, Total: ${total}` : conf?.key || '';
  };

  return (
    <li class="list-group-item d-flex justify-content-between">
      <span class="fw-semibold small me-1" title={titleText()}>
        {props.itemConf?.displayName || 'Compound Item'}:
      </span>
      <span class="badge bg-success rounded-pill justify-content-end">
        {String(compoundData().currentValue)}/{String(compoundData().totalValue)}
        <Show when={compoundData().units}>
          <span class="small me-2">{compoundData().units}</span>
        </Show>
        <Show when={compoundData().error}>
          <span class="small me-1" title={compoundData().error}>(Error)</span>
        </Show>
      </span>
    </li>
  );
}

export default CompoundItem;