const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const supportedDomains = [
  "facebook.com", "fb.watch",
  "youtube.com", "youtu.be",
  "tiktok.com",
  "instagram.com", "instagr.am",
  "likee.com", "likee.video",
  "capcut.com",
  "spotify.com",
  "terabox.com",
  "twitter.com", "x.com",
  "drive.google.com",
  "soundcloud.com",
  "ndown.app",
  "pinterest.com", "pin.it"
];

module.exports = {
  config: {
    name: "autodl",
    version: "2.0",
    author: "Saimx69x + (modified by tom)",
    role: 0,
    shortDescription: "Auto media downloader 😘",
    longDescription: "Automatically downloads videos or media from supported platforms.",
    category: "utility",
    guide: { en: "Just send supported link 😌" }
  },

  onStart: async function({ api, event }) {
    api.sendMessage(
      "📥 𝐋𝐢𝐧𝐤 𝐝𝐚𝐨 𝐚𝐫 𝐚𝐦𝐢 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐤𝐨𝐫𝐞 𝐝𝐢𝐜𝐜𝐡𝐢 😘",
      event.threadID,
      event.messageID
    );
  },

  onChat: async function({ api, event }) {

    const content = event.body ? event.body.trim() : "";
    if (content.toLowerCase().startsWith("auto")) return;
    if (!content.startsWith("https://")) return;
    if (!supportedDomains.some(domain => content.includes(domain))) return;

    api.setMessageReaction("⌛", event.messageID, () => {}, true);

    const waitMsg = await api.sendMessage(
      "𝐊𝐡𝐚𝐫𝐚 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐤𝐨𝐫𝐞 𝐝𝐢𝐜𝐜𝐡𝐢 🛐",
      event.threadID
    );

    try {
      const GITHUB_RAW = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
      const rawRes = await axios.get(GITHUB_RAW);
      const apiBase = rawRes.data.apiv1;
      const API = `${apiBase}/api/auto?url=${encodeURIComponent(content)}`;
      const res = await axios.get(API);

      if (!res.data) throw new Error("No response from API");

      const mediaURL = res.data.high_quality || res.data.low_quality;
      if (!mediaURL) throw new Error("Media not found");

      const extension = mediaURL.includes(".mp3") ? "mp3" : "mp4";
      const buffer = (await axios.get(mediaURL, { responseType: "arraybuffer" })).data;

      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);

      const filePath = path.join(cacheDir, `auto_media_${Date.now()}.${extension}`);
      fs.writeFileSync(filePath, Buffer.from(buffer));

      api.setMessageReaction("✅", event.messageID, () => {}, true);
      api.unsendMessage(waitMsg.messageID);

      const caption = "";

      api.sendMessage(
        { body: caption, attachment: fs.createReadStream(filePath) },
        event.threadID,
        () => fs.unlinkSync(filePath),
        event.messageID
      );

    } catch (err) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage(
        "𝐔𝐟𝐟 😿 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐡𝐨𝐢𝐭𝐞𝐬𝐞 𝐧𝐚...\n𝐀𝐛𝐚𝐫 𝐜𝐡𝐞𝐬𝐭𝐚 𝐤𝐨𝐫𝐨 😔",
        event.threadID,
        event.messageID
      );
    }
  }
};
