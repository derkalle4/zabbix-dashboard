import { getHistoryData } from '../../api.jsx';
import { Show, createMemo, createEffect, createSignal, onMount, onCleanup } from 'solid-js';
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

function LineChart(props) {
  let chartRef;
  let chartInstance;
  const [historyData, setHistoryData] = createSignal([]);
  const [isLoadingHistory, setIsLoadingHistory] = createSignal(false);

  // Memoize Zabbix item lookup to avoid repeated searches
  const zabbixItem = createMemo(() => {
    const { itemConf, rawItemsForHost, zabbixHostId } = props;
    if (!itemConf?.itemName || !rawItemsForHost || !zabbixHostId) return null;
    
    return rawItemsForHost.find(item => 
      item?.name?.toLowerCase() === itemConf.itemName.toLowerCase() && 
      item.hostid === zabbixHostId
    );
  });

  // Separate memoized values calculation
  const chartConfig = createMemo(() => {
    const item = zabbixItem();
    const { itemConf, rawItemsForHost, zabbixHostId } = props;
    
    if (!item) {
      return {
        error: itemConf?.itemName ? `Item '${itemConf.itemName}' not found` : "Missing data",
        minValue: 0,
        maxValue: 100,
        height: itemConf?.height || 30
      };
    }

    let { minValue = 0, maxValue = 100 } = itemConf;
    
    // Only recalculate maxValue if it's a string reference
    if (typeof maxValue === 'string') {
      const maxItem = rawItemsForHost.find(item => 
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

  // Optimize chart data preparation
  const chartData = createMemo(() => {
    const history = historyData();
    const config = chartConfig();
    
    return {
      historyData: history,
      ...config
    };
  });

  // Fetch real history data when component mounts or item changes
  createEffect(async () => {
    const item = zabbixItem();
    if (!item) return;

    setIsLoadingHistory(true);
    try {
      const hoursBack = props.itemConf?.historyHours || 24;
      const timeFrom = Math.floor((Date.now() - hoursBack * 60 * 60 * 1000) / 1000);
      
      const authToken = localStorage.getItem('zabbixAuthToken');
      if (!authToken) {
        throw new Error('No auth token available');
      }

      const history = await getHistoryData(authToken, item.itemid, timeFrom);
      
      const formattedData = history.map(point => ({
        x: new Date(parseInt(point.clock) * 1000),
        y: props.itemConf?.itemType === 'integer' 
          ? parseInt(point.value) 
          : parseFloat(point.value)
      }));
      
      setHistoryData(formattedData);
    } catch (error) {
      console.error('Failed to fetch history data:', error);
      // Fallback to current value only
      setHistoryData([{
        x: new Date(),
        y: parseFloat(item.lastvalue) || 0
      }]);
    } finally {
      setIsLoadingHistory(false);
    }
  });

  // Debounced chart update to prevent excessive re-renders
  let updateTimeout;
  createEffect(() => {
    const data = chartData();
    if (data.historyData.length > 0 && chartInstance) {
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => updateChart(data), 16); // ~60fps
    }
  });

  onMount(() => {
    if (chartRef) {
      initChart();
    }
  });
  
  onCleanup(() => {
    clearTimeout(updateTimeout);
    chartInstance?.destroy();
  });

  // Pre-define chart options to avoid recreation
  const getChartOptions = (minValue, maxValue) => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: false, // Disable animations for better performance
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
        min: minValue,
        max: maxValue,
        display: false,
        grid: { display: false }
      }
    },
    interaction: { enabled: false },
    elements: {
      point: { radius: 0, hoverRadius: 0 },
      line: { borderWidth: 1, tension: 0.3 }
    }
  });

  function initChart() {
    const data = chartData();
    chartInstance?.destroy();

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
      options: getChartOptions(data.minValue, data.maxValue)
    });
  }

  function updateChart(data) {
    if (!chartInstance) return initChart();
    
    // Batch updates for better performance
    chartInstance.data.datasets[0].data = data.historyData;
    chartInstance.options.scales.y.min = data.minValue;
    chartInstance.options.scales.y.max = data.maxValue;
    chartInstance.update('none'); // Use 'none' mode for fastest update
  }

  return (
    <li class="list-group-item p-1">
      <Show when={chartConfig().error}>
        <div class="alert alert-warning py-1 px-2 small mb-1">
          {chartConfig().error}
        </div>
      </Show>
      <div style={`height: ${chartConfig().height}px; position: relative;`}>
        <Show when={isLoadingHistory()}>
          <div class="position-absolute top-50 start-50 translate-middle">
            <span class="text-muted small">empty</span>
          </div>
        </Show>
        <canvas ref={chartRef}></canvas>
      </div>
    </li>
  );
}

export default LineChart;