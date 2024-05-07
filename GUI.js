import blessed from "blessed";
import contrib from "blessed-contrib";

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

const playLists = blessed.list({
  parent: musicBox,
  top: 0,
  left: 0,
  width: "30%",
  height: "100%",
  items: ["Playlist 1", "Playlist 2", "Playlist 3"],
  style: {
    selected: {
      bg: "blue",
    },
  },
  border: {
    type: "line",
  },
  keys: true,
  vi: true,
  mouse: true,
});

let songsList = ["Song 1", "Song 2", "Song 3"];
const songs = blessed.list({
  parent: musicBox,
  top: 0,
  right: 0,
  width: "70%",
  height: "100%",
  items: songsList,
  style: {
    selected: {
      bg: "blue",
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

const widgets = [textBox, playLists, songs];
let currentWidget = 0;
let previousWidget = 0;

const focusNextWidget = () => {
  previousWidget = currentWidget;
  currentWidget = currentWidget + 1 >= widgets.length ? 0 : currentWidget + 1;
  widgets[currentWidget].focus();
  widgets[currentWidget].style.border.fg = "blue";
  widgets[previousWidget].style.border.fg = "white";
  screen.render();
};

screen.key(["tab"], function (ch, key) {
  focusNextWidget();
});

let query = "";
if (textBox.focused) {
  textBox.key(["i"], function (ch, key) {
    textBox.readInput((err, value) => {
      if (err) throw err;
      query = value;
      songsList.push(query);
      songs.clearItems();
      songs.setItems([...songsList]);
      textBox.clearValue();
      screen.render();
    });
  });

  textBox.key("escape", function (ch, key) {
    textBox.clearValue();
    screen.render();
  });
}
screen.render();
