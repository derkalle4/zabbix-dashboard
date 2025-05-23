import { For } from 'solid-js';
import HostView from './HostView';

function GroupView(props) {
  return (
    <div class="group-view">
      <h2 class="text-xl font-semibold mb-3">{props.group.groupName}</h2>
      <div class="row g-4">
        <For each={props.group.hostsData}>
          {(host) => (
            <div class="col-12 col-md-6 col-lg-4">
              <HostView host={host} />
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

export default GroupView;