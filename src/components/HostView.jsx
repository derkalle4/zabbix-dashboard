import { For, Show } from 'solid-js';
import DefaultCard from './cards/DefaultCard';
import GameserverCard from './cards/GameserverCard';

function HostView(props) {
  const host = () => props.host;
  const hostDisplayName = () => host()?.displayName || host()?.hostName || "Host";
  const zabbixHostId = () => host()?.zabbixHostId;
  const rawItemsForHost = () => host()?.items;
  const widgets = () => host()?.widgets || [];

  const hasError = () => host()?.error;
  const hasItems = () => rawItemsForHost()?.length > 0;
  const hasCompoundWidgets = () => widgets().some(ic => ic.type === 'compound');
  const hasWidgets = () => widgets().length > 0;
  const shouldShowCard = () => !hasError() && zabbixHostId() && (hasItems() || hasCompoundWidgets()) && hasWidgets();

  return (
    <div class="host-view mb-3">
      <Show when={hasError()}>
        <div class="alert alert-danger p-2" role="alert">
          {hostDisplayName()}: {host().error}
        </div>
      </Show>

      <Show when={!hasError() && zabbixHostId() && !hasWidgets()}>
        <div class="alert alert-info p-2" role="alert">
          {hostDisplayName()}: No items configured for this host in the dashboard configuration.
        </div>
      </Show>

      <Show when={!hasError() && zabbixHostId() && hasWidgets() && !hasItems() && !hasCompoundWidgets()}>
        <div class="alert alert-warning p-2" role="alert">
          {hostDisplayName()}: Items are configured, but no (or empty) raw item data was found from Zabbix for this host.
        </div>
      </Show>
      
      <Show when={shouldShowCard()}>
        <Show when={host()?.type === 'GameserverCard'} fallback={<DefaultCard host={host()} />}>
          <GameserverCard host={host()} />
        </Show>
      </Show>
    </div>
  );
}

export default HostView;