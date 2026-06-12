export default class Song {
    constructor() {
        this.name;
        this.img;
        this.data;
    }

    addSong(songList) {
        const song = document.createElement("li");
        song.classList.add("song");

        const nameLabel = document.createElement("p");
    }
}