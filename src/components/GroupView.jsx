import { For } from 'solid-js';
import HostView from './HostView';

function GroupView(props) {
  return (
    <div class="group-view">
      <h2 class="text-xl font-semibold mb-3">{props.group.groupName}</h2>
      <div class="row g-4">
        <For each={props.group.hostsData ? [...props.group.hostsData].sort((a, b) => {
          if (props.group.sort_by !== undefined) {
            const sortKey = props.group.sort_by;
            const sortType = props.group.sort_type || 'numeric';
            
            // Find the item by name and get its lastvalue
            const aItem = a.items?.find(item => item.name === sortKey);
            const bItem = b.items?.find(item => item.name === sortKey);
            
            const aValue = aItem?.lastvalue;
            const bValue = bItem?.lastvalue;

            // Handle undefined values - skip sorting if both are undefined
            if (aValue === undefined && bValue === undefined) {
              return 0;
            }
            if (aValue === undefined) {
              return props.group.sort_desc ? -1 : 1; // undefined goes to end
            }
            if (bValue === undefined) {
              return props.group.sort_desc ? 1 : -1; // undefined goes to end
            }
            
            let comparison;
            if (sortType === 'numeric') {
              // Convert to numbers
              const aNum = Number(aValue);
              const bNum = Number(bValue);
              // Check if we got valid numbers
              if (!isNaN(aNum) && !isNaN(bNum) && isFinite(aNum) && isFinite(bNum)) {
                comparison = aNum - bNum; // ascending order
              } else {
                // Fallback to string comparison if numbers are invalid
                comparison = String(aValue).localeCompare(String(bValue));
              }
            } else {
              // string comparison
              comparison = String(aValue).localeCompare(String(bValue));
            }
            
            // Apply sort direction (default ascending, reverse if sort_desc is true)
            return props.group.sort_desc ? -comparison : comparison;
          }
          return 0;
        }) : []}>
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