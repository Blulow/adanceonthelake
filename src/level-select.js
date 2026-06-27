import Chart from "./chart-data";

const chartData = Object.values(import.meta.glob("../assets/chart-data/*.json", { eager: true }));
const chartList = document.getElementById("chart-list");

for (const data of chartData) {
    const chart = new Chart(data);

    chart.addSongTo(chartList);
}

const chartButtons = chartList.children;

function updateChartButtonSize() {
    const center = window.innerHeight / 2;

    [...chartButtons].forEach(e => {
        const rect = e.getBoundingClientRect();
        const _center = rect.top + rect.height / 2;
        const dist = Math.abs(_center - center);

        const _dist = Math.min(dist / center, 1);
        const scale = 1 - _dist * 0.4;

        e.style.transform = `scale(${scale})`;
    });
}

chartList.addEventListener("scroll", updateChartButtonSize);
window.addEventListener("resize", updateChartButtonSize);