import Song from "./song-data";

const songData = Object.values(import.meta.glob("../assets/song-data/*.json", { eager: true }));
const songList = document.getElementById("song-list");

for (const data of songData) {
    const song = new Song(data.name, data.img, data.data);

    song.addSongTo(songList);
}