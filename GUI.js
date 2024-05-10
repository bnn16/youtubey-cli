import blessed from "blessed";
import contrib from "blessed-contrib";
import { authorize } from "./index.js";
import { searchVideos, getPlaylists, getPlaylistItems } from "./requests.js";

import { spawn } from "child_process";
import { writeFile } from "fs";

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

let mySongs = [];
playLists.on("select", async (data) => {
  authorize(async (auth) => {
    mySongs = [];
    let songs = await getPlaylistItems(auth, playlistId[data.index - 3]);
    songs.data.items.map((item) => {
      mySongs.push({
        titile: item.snippet.title,
        channel: item.snippet.channelTitle,
        vidId: item.snippet.resourceId.videoId,
        string: `${item.snippet.title} - ${item.snippet.channelTitle}`,
        length: item.contentDetails.duration,
      });
    });
    songsBox.clearItems();
    songsBox.setItems([...mySongs.map((song) => song.string)]);
    screen.render();
  });
});

let ffplayProcess;
let durValue;
songsBox.on("select", (data) => {
  const textTitle = data.getText();
  const index = mySongs.findIndex((song) => song.string === textTitle);
  //textBox.setValue(mySongs[index].vidId);
  // ffplay $(youtube-dl --format 249 --get-url https://www.youtube.com/watch\?\v=p0u8ESAThSs) -nodisp

  const videoURL = `https://www.youtube.com/watch?v=${mySongs[index].vidId}`;

  const youtubeDlProcess = spawn("youtube-dl", [
    "--format",
    "249",
    "--get-url",
    videoURL,
  ]);

  let videoUrl = "";
  const regex = /dur=([^&]+)/;

  youtubeDlProcess.stdout.on("data", (data) => {
    videoUrl += data.toString();
  });

  youtubeDlProcess.on("close", (code) => {
    if (code === 0) {
      const durMatch = videoUrl.match(regex);

      if (durMatch) {
        durValue = durMatch[1] / 60;
      }
      ffplayProcess = spawn("ffplay", [videoUrl.trim(), "-nodisp"]);

      ffplayProcess.on("close", (code) => {
        console.log(`ffplay process exited with code ${code}`);
      });
    } else {
      console.error(`youtube-dl process exited with code ${code}`);
    }
  });
  // this is where we will play the song with a sub process
  screen.render();
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

screen.key(["p"], function (ch, key) {
  writeFile("temp.txt", JSON.stringify(durValue), (err) => {
    if (err) throw err;
  });
  if (ffplayProcess) {
    ffplayProcess.kill();
    ffplayProcess = spawn("ffplay", ["-nodisp"]);
  }
});

screen.render();
