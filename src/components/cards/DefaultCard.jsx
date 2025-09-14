import { For, Switch, Match } from 'solid-js';
import SingleItem from '../items/SingleItem';
import CompoundItem from '../items/CompoundItem';

function DefaultCard(props) {
  const host = () => props.host;
  const hostDisplayName = () => host()?.displayName || host()?.hostName || 'Unknown Host';
  const widgets = () => host()?.widgets || [];

  return (
    <div class="card default-card h-100">
      <div class="card-header p-1 bg-primary text-light">
        <h5 class="card-title mb-0 fs-6">{hostDisplayName()}</h5>
      </div>
      <div class="card-body p-0">
        <ul class="list-group list-group-flush">
          <For each={widgets()} fallback={<div class="w-100 text-muted small">No items to display.</div>}>
            {(itemConf) => (
              <Switch fallback={
                <div class="d-inline-flex align-items-baseline p-1 rounded bg-light text-dark">
                  <span class="fw-semibold small me-1">{itemConf.displayName || itemConf.key || itemConf.itemName || 'Item'}:</span>
                  <span class="small text-warning">Unsupported type "{itemConf.type}"</span>
                </div>
              }>
                <Match when={itemConf.type === "single"}>
                  <SingleItem itemConf={itemConf} host={host()} />
                </Match>
                <Match when={itemConf.type === "compound"}>
                  <CompoundItem itemConf={itemConf} host={host()} />
                </Match>
              </Switch>
            )}
          </For>
        </ul>
      </div>
    </div>
  );
}

export default DefaultCard;