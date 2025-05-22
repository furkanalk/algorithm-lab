import * as ChartMod from 'https://cdn.jsdelivr.net/npm/chart.js@4.4.9/+esm';
const { Chart, registerables } = ChartMod;
Chart.register(...registerables);
import DataLabels from 'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0/+esm';
Chart.register(DataLabels);
export { Chart };
