import { Show, createMemo, createEffect, onMount, onCleanup } from 'solid-js';
import {
  Chart,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  TimeScale,
  Filler,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(LinearScale, PointElement, LineElement, LineController, TimeScale, Filler);

const CHART_OPTIONS_BASE = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false }
  },
  scales: {
    x: {
      type: 'time',
      display: false,
      grid: { display: false }
    },
    y: {
      display: false,
      grid: { display: false }
    }
  },
  interaction: { enabled: false },
  elements: {
    point: { radius: 0, hoverRadius: 0 },
    line: { borderWidth: 1, tension: 0.3 }
  }
};

function LineChart(props) {
  let chartRef;
  let chartInstance;
  let updateTimeout;

  const zabbixItem = createMemo(() => {
    const { itemConf, host } = props;
    const { items, zabbixHostId } = host || {};
    if (!itemConf?.itemName || !items || !zabbixHostId) return null;
    return items.find(item => 
      item?.name === itemConf.itemName && 
      item.hostid === zabbixHostId
    );
  });

  const historyData = createMemo(() => {
      const { itemConf, host } = props;
      if (!itemConf?.itemName || !host?.historyData) return [];
      
      const rawHistory = host.historyData.get(itemConf.itemName) || [];
      const isInteger = itemConf?.itemType === 'integer';
      
      return rawHistory.map(point => ({
          x: new Date(parseInt(point.clock) * 1000),
          y: isInteger ? parseInt(point.value) : parseFloat(point.value)
      }));
  });

  const chartConfig = createMemo(() => {
    const item = zabbixItem();
    const { itemConf, host } = props;
    
    if (!item) {
      return {
        error: itemConf?.itemName ? `Item '${itemConf.itemName}' not found` : "Missing data",
        minValue: 0,
        maxValue: 100,
        height: itemConf?.height || 30
      };
    }

    let { minValue = 0, maxValue = 100 } = itemConf;
    
    if (typeof maxValue === 'string') {
      const { items, zabbixHostId } = host;
      const maxItem = items.find(item => 
        item?.name?.toLowerCase() === maxValue.toLowerCase() && 
        item.hostid === zabbixHostId
      );
      maxValue = parseFloat(maxItem?.lastvalue) || 100;
    }

    return {
      error: null,
      minValue,
      maxValue,
      height: itemConf?.height || 30
    };
  });

  const chartData = createMemo(() => ({
    historyData: historyData(),
    ...chartConfig()
  }));

  createEffect(() => {
    const data = chartData();
    if (data.historyData.length > 0 && chartInstance) {
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        chartInstance.data.datasets[0].data = data.historyData;
        chartInstance.options.scales.y.min = data.minValue;
        chartInstance.options.scales.y.max = data.maxValue;
        chartInstance.update('none');
      }, 16);
    }
  });

  onMount(() => {
    if (chartRef) {
      const data = chartData();
      chartInstance = new Chart(chartRef, {
        type: 'line',
        data: {
          datasets: [{
            data: data.historyData,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            fill: true,
          }]
        },
        options: {
          ...CHART_OPTIONS_BASE,
          scales: {
            ...CHART_OPTIONS_BASE.scales,
            y: {
              ...CHART_OPTIONS_BASE.scales.y,
              min: data.minValue,
              max: data.maxValue
            }
          }
        }
      });
    }
  });
  
  onCleanup(() => {
    clearTimeout(updateTimeout);
    chartInstance?.destroy();
  });

  return (
    <li class="list-group-item p-1">
      <Show when={chartConfig().error}>
        <div class="alert alert-warning py-1 px-2 small mb-1">
          {chartConfig().error}
        </div>
      </Show>
      <Show when={!chartConfig().error}>
        <div style={`height: ${chartConfig().height}px; position: relative;`}>
          <canvas ref={chartRef}></canvas>
        </div>
      </Show>
    </li>
  );
}

export default LineChart;