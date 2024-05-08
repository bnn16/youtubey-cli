import blessed from "blessed";
import contrib from "blessed-contrib";
import { authorize } from "./index.js";
import { searchVideos, getPlaylists, getPlaylistItems } from "./requests.js";

const screen = blessed.screen();

screen.title = "Youtubeyy";

//grid.set(row, col, rowSpan, colSpan, obj, opts)

const textBox = blessed.textbox({
  parent: screen,
  top: 0,
  left: 0,
  width: "100%",
  height: 3,
  bg: "transparent",
  fg: "white",
  border: {
    type: "line",
  },
});

const musicBox = blessed.box({
  parent: screen,
  focusable: false,
  top: 3,
  left: 0,
  width: "100%",
  height: "100%-10",
  content: "Music",
  style: {
    invisible: true,
    transparent: true,
  },
  bg: "transparent",
  fg: "transparent",
});

const playlistId = [];

authorize(async (auth) => {
  let playlists = await getPlaylists(auth);
  let myPlaylists = [];

  playlists.data.items.map((item) => {
    playlistId.push(item.id);
    myPlaylists.push(
      `${item.snippet.title} - ${item.contentDetails.itemCount} Vids`,
    );
  });

  playLists.setItems([...myPlaylists]);
  screen.render();
});

const playLists = blessed.list({
  parent: musicBox,
  top: 0,
  left: 0,
  width: "30%",
  height: "100%",
  style: {
    selected: {
      bg: "red",
    },
  },
  border: {
    type: "line",
  },
  keys: true,
  vi: true,
  mouse: true,
});

const songsBox = blessed.list({
  parent: musicBox,
  top: 0,
  right: 0,
  width: "70%",
  height: "100%",
  style: {
    selected: {
      bg: "red",
    },
  },
  border: {
    type: "line",
  },
  keys: true,
  vi: true,
  mouse: true,
});

screen.key(["S-q", "C-c"], function (ch, key) {
  return process.exit(0);
});

const widgets = [textBox, playLists, songsBox];
let currentWidget = 0;
let previousWidget = 0;

const focusNextWidget = () => {
  previousWidget = currentWidget;
  currentWidget = currentWidget + 1 >= widgets.length ? 0 : currentWidget + 1;
  widgets[currentWidget].focus();
  widgets[currentWidget].style.border.fg = "red";
  widgets[previousWidget].style.border.fg = "white";
  screen.render();
};

screen.key(["tab"], function (ch, key) {
  focusNextWidget();
});

playLists.on("select", async (data) => {
  authorize(async (auth) => {
    let songs = await getPlaylistItems(auth, playlistId[data.index - 3]);
    let mySongs = [];
    songs.data.items.map((item) => {
      mySongs.push(`${item.snippet.title} - ${item.snippet.channelTitle}`);
    });
    songsBox.clearItems();
    songsBox.setItems([...mySongs]);
    screen.render();
  });
});

let query = "";
if (textBox.focused) {
  textBox.key(["i"], function (ch, key) {
    textBox.readInput((err, value) => {
      query = value;
      if (err) throw err;
      if (!query?.trim()) return;
      authorize(async (auth) => {
        let temp = await searchVideos(auth, query);
        let songs = [];
        temp.data.items.map((item) => {
          songs.push(`${item.snippet.title} - ${item.snippet.channelTitle}`);
        });
        songsBox.clearItems();
        songsBox.setItems([...songs]);
        textBox.clearValue();
        screen.render();
      });
    });
  });

  textBox.key("escape", function (ch, key) {
    textBox.clearValue();
    screen.render();
  });
}
screen.render();
