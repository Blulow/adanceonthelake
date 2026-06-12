export default class Song {
    constructor(name, imgSrc, data) {
        this.name = name;
        this.img = new Image();
        this.img.src = imgSrc
        this.data = data;
    }

    addSongTo(songList) {
        const song = document.createElement("li");

        const label = document.createElement("p");
        label.innerText = this.name;
        
        song.appendChild(label);
        song.appendChild(this.img);
        songList.appendChild(song);
    }
}