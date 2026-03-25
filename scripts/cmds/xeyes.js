const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require("os");

async function downloadFile(url) {
  const filePath = path.join(os.tmpdir(), `${Date.now()}.mp4`);
  const writer = fs.createWriteStream(filePath);

  const res = await axios({
    method: "GET",
    url,
    responseType: "stream"
  });

  res.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve(filePath));
    writer.on("error", reject);
  });
}

module.exports = {
  config: {
    name: "xeyes",
    version: "2.1",
    author: "Jani nh ke manger nati cng marche 🙂 Modified by tom",
    longDescription: "Info about bot and owner",
    category: "Special",
    guide: { en: "{p}owner or just type owner" },
    usePrefix: false
  },

  onStart: async function (context) {
    await module.exports.sendOwnerInfo(context);
  },

  onChat: async function ({ event, message, usersData }) {
    const prefix = global.GoatBot.config.prefix || "";
    const body = (event.body || "").toLowerCase().trim();
    const triggers = ["👀", `${prefix}eyes`];
    if (!triggers.includes(body)) return;
    await module.exports.sendOwnerInfo({ event, message, usersData });
  },

  sendOwnerInfo: async function ({ event, message, usersData }) {
    const videoURL = "https://files.catbox.moe/m7z0mz.mp4";

    try {
      const filePath = await downloadFile(videoURL);

      const id = event.senderID;
      const userData = usersData ? await usersData.get(id) : null;
      const name = userData?.name || "User";

      const info = "𝐌𝐲 𝐊𝐚𝐥𝐮𝐚𝐚 𝐛𝐨𝐬𝐬'𝐬 𝐞𝐲𝐞𝐬!👀";
      const mentions = [{ id, tag: name }];

      const msgData = {
        body: info,
        attachment: fs.createReadStream(filePath),
        mentions
      };

      if (message && typeof message.reply === "function") {
        await message.reply(msgData);
      } else {
        await global.GoatBot.api.sendMessage(msgData, event.threadID);
      }

      fs.unlinkSync(filePath);

    } catch (err) {
      console.log("xeyes error:", err);
      global.GoatBot.api.sendMessage(
        "Video load korte problem hocche.",
        event.threadID
      );
    }
  }
};
