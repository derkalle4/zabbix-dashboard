import { For } from 'solid-js';
import HostView from './HostView';

function GroupView(props) {
  return (
    <div class="group-view">
      <h2 class="text-xl font-semibold mb-3">{props.group.groupName}</h2>
      <div class="row g-4">
        <For each={props.group.hostsData?.sort((a, b) => {
          // sorting logic
          if (props.group.sort_by !== undefined && props.group.hostsData.length > 0) {
            const firstHost = props.group.hostsData[0];
            const sortKey = Object.keys(firstHost)[props.group.sort_by];
            if (sortKey) {
              const aValue = a[sortKey];
              const bValue = b[sortKey];
              const isNumeric = !isNaN(parseFloat(firstHost[sortKey])) && isFinite(firstHost[sortKey]);
              
              let comparison;
              if (isNumeric) {
                comparison = parseFloat(aValue) - parseFloat(bValue);
              } else {
                comparison = String(aValue).localeCompare(String(bValue));
              }
              
              return props.group.sort_desc ? -comparison : comparison;
            }
          }
          return 0;
        }) || []}>
          {(host) => (
            <div class={`col-${props.group.column_size || '12'} col-md-${props.group.column_size_medium || '6'} col-lg-${props.group.column_size_large || '4'}`}>
              <HostView host={host} />
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

export default GroupView;