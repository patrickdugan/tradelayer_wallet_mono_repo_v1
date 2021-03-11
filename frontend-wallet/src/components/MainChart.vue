<template>
    <div class="md-layout md-alignment-top-center">
        <div class='chart-container'>
            <div id="chart"></div>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { createChart } from 'lightweight-charts';

export default {
    name: "MainChart",
    mounted () {
        this.feedBtc();
        this.initChart();
    },
    computed: {
        ...mapGetters('prices', ['getRawBtcPrice'])
    },
    watch: {
    getRawBtcPrice: function (value) {
        if(!value) return;
            this.candlestickSeries.setData(value);
        }
    },
    methods: {
        ...mapActions("prices", ['feedBtc']),
        initChart() {
            const chartOptions = {
                watermark: {
                    color: '#E0E0E0',
                    visible: true,
                    text: 'TradeLayer',
                    fontSize: 100,
                },
                layout: {
                    backgroundColor: '#F5F5F5',
                },
                timeScale: {
                    tickMarkFormatter: (a, b, c) => {
                        const [month, date, year] = new Date().toLocaleDateString("en-US").split("/");
                        const [hour, minute, second] = new Date(a * 1000).toLocaleTimeString("en-US").split(/:| /);
                        const time = `${hour}:${minute}:${second}`
                        return a ? time : 'error'
                    }
                }
            };
            
            const chart = createChart('chart', chartOptions);
            const candlestickSeries = chart.addCandlestickSeries();
            const container = document.getElementById('chart');
            window.addEventListener('resize', () => chart.resize(container.offsetWidth, container.offsetHeight));
            this.candlestickSeries = candlestickSeries;
        },

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