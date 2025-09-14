import { For, Show, Match, Switch } from 'solid-js';
import SingleItem from '../items/SingleItem';
import CompoundItem from '../items/CompoundItem';
import LineChartItem from '../items/LineChart';

function GameserverCard(props) {
  const host = () => props.host;
  const hostDisplayName = () => host()?.displayName || host()?.hostName || 'Host';
  const widgets = () => host()?.widgets || [];
  const rawItemsForHost = () => host()?.items;

  const getCardVariant = () => {
    const playersItem = rawItemsForHost()?.find(item => 
      (item.key?.includes('players') && !item.key?.includes('max_players')) || 
      (item.name?.toLowerCase().includes('players') && !item.name?.toLowerCase().includes('max'))
    );
    
    if (!playersItem?.lastvalue) return 'secondary';
    
    const playersValue = parseInt(playersItem.lastvalue);
    return isNaN(playersValue) ? 'danger' : playersValue > 0 ? 'primary' : 'secondary';
  };

  const ItemComponent = {
    single: SingleItem,
    compound: CompoundItem,
    linechart: LineChartItem
  };

  return (
    <div class="card default-card h-100">
      <div class={`card-header p-1 bg-${getCardVariant()} text-light`}>
        <h5 class="card-title mb-0 fs-6">{hostDisplayName()}</h5>
      </div>
      <div class="card-body p-0">
        <ul class="list-group list-group-flush">
          <For each={widgets()} fallback={<div class="w-100 text-muted small">No items to display.</div>}>
            {(itemConf) => {
              const Component = ItemComponent[itemConf.type];
              return Component ? (
                <Component itemConf={itemConf} host={host()} />
              ) : (
                <div class="d-inline-flex align-items-baseline p-1 rounded bg-light text-dark">
                  <span class="fw-semibold small me-1">{itemConf.displayName || itemConf.key || itemConf.itemName || 'Item'}:</span>
                  <span class="small text-warning">Unsupported type "{itemConf.type}"</span>
                </div>
              );
            }}
          </For>
        </ul>
      </div>
    </div>
  );
}

export default GameserverCard;