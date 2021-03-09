<template>
    <div class="md-layout md-alignment-top-center">
        <div class='chart-container'>
            <div id="chart"></div>
        </div>
    </div>
</template>

<script>
import { createChart } from 'lightweight-charts';

export default {
    name: "MainChart",
    mounted () {
        this.initChart();
    },
    methods: {
        initChart() {
        const chart = createChart('chart');
        const candlestickSeries = chart.addCandlestickSeries();
        
        const container = document.getElementById('chart');
        window.addEventListener('resize', () => chart.resize(container.offsetWidth, container.offsetHeight));
        const data = [];
        candlestickSeries.setData(data);
        setInterval(() => {
            const open = Math.floor(Math.random() * 100);
            const high = Math.floor(Math.random() * 100);
            const low = Math.floor(Math.random() * 100);
            const close = Math.floor(Math.random() * 100);
            data.push({ time: Date.now(), open, high, low, close});
            candlestickSeries.setData(data);
        }, 1000)
        }
    }
}
</script>

<style scpoed>

.chart-container {
    height: 20rem;
    width: 100%;
    padding: 1rem 3rem;
    display: flex;
}

.chart-container #chart {
    width: 100%;
    height: 100%;
}
</style>