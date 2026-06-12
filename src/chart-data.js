export default class Chart {
    constructor(name, imgSrc, data) {
        this.name = name;
        this.img = new Image();
        this.img.src = imgSrc
        this.data = data;
    }

    addSongTo(chartList) {
        const chart = document.createElement("li");

        const label = document.createElement("p");
        label.innerText = this.name;
        
        chart.appendChild(label);
        chart.appendChild(this.img);
        chartList.appendChild(chart);
    }
}