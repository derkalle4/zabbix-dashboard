import { For, Show } from 'solid-js';
import DefaultCard from './cards/DefaultCard';

function HostView(props) {
  const hostDisplayName = () => props.host?.displayName || props.host?.hostName || "Host";
  const zabbixHostId = () => props.host?.zabbixHostId;
  const rawItemsForHost = () => props.host?.items;
  const itemConfigs = () => props.host?.itemConfigs || [];

  return (
    <div class="host-view mb-3">
      <Show when={props.host?.error}>
        <div class="alert alert-danger p-2" role="alert">
          {hostDisplayName()}: {props.host.error}
        </div>
      </Show>

      <Show when={!props.host?.error && zabbixHostId() && itemConfigs().length === 0}>
        <div class="alert alert-info p-2" role="alert">
          {hostDisplayName()}: No items configured for this host in the dashboard configuration.
        </div>
      </Show>

      <Show when={!props.host?.error && zabbixHostId() && itemConfigs().length > 0 && (!rawItemsForHost() || (Array.isArray(rawItemsForHost()) && rawItemsForHost().length === 0))}>
        <div class="alert alert-warning p-2" role="alert">
          {hostDisplayName()}: Items are configured, but no (or empty) raw item data was found from Zabbix for this host.
        </div>
      </Show>
      
      <Show when={!props.host?.error && zabbixHostId() && (rawItemsForHost() && rawItemsForHost()?.length > 0 || itemConfigs().some(ic => ic.type === 'compound')) && itemConfigs().length > 0}>
        <DefaultCard
          hostDisplayName={hostDisplayName()}
          itemConfigs={itemConfigs()}
          rawItemsForHost={rawItemsForHost()} 
          zabbixHostId={zabbixHostId()} 
        />
      </Show>
    </div>
  );
}

export default HostView;