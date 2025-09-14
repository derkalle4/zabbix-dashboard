import { For, createMemo } from 'solid-js';
import HostView from './HostView';

function GroupView(props) {
  const sortedHosts = createMemo(() => {
    if (!props.group.hostsData || !props.group.sort_by) {
      return props.group.hostsData || [];
    }

    const { sort_by: sortKey, sort_type: sortType = 'numeric', sort_desc } = props.group;
    
    return [...props.group.hostsData].sort((a, b) => {
      const aItem = a.items?.find(item => item.name === sortKey);
      const bItem = b.items?.find(item => item.name === sortKey);
      
      const aValue = aItem?.lastvalue;
      const bValue = bItem?.lastvalue;

      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return sort_desc ? -1 : 1;
      if (bValue === undefined) return sort_desc ? 1 : -1;
      
      let comparison;
      if (sortType === 'numeric') {
        const aNum = Number(aValue);
        const bNum = Number(bValue);
        comparison = (!isNaN(aNum) && !isNaN(bNum) && isFinite(aNum) && isFinite(bNum))
          ? aNum - bNum
          : String(aValue).localeCompare(String(bValue));
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }
      
      return sort_desc ? -comparison : comparison;
    });
  });

  const columnClasses = () => {
    const { column_size = '12', column_size_medium = '6', column_size_large = '4' } = props.group;
    return `col-${column_size} col-md-${column_size_medium} col-lg-${column_size_large}`;
  };

  return (
    <div class="group-view">
      <h2 class="text-xl font-semibold mb-3">{props.group.groupName}</h2>
      <div class="row g-4">
        <For each={sortedHosts()}>
          {(host) => (
            <div class={columnClasses()}>
              <HostView host={host} />
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

export default GroupView;