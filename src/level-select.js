import Chart from "./chart-data";

const chartData = Object.values(import.meta.glob("../assets/chart-data/*.json", { eager: true }));
const chartList = document.getElementById("chart-list");

for (const data of chartData) {
    const chart = new Chart(data.name, data.img, data.data);

    chart.addSongTo(chartList);
}