const express = require("express");
const mongoose = require("mongoose");
const shortid = require("shortid");
const validUrl = require("valid-url");

const Url = require("./models/Url");

const app = express();
app.use(express.json());


mongoose.connect("mongodb://127.0.0.1:27017/urlShortener", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const BASE_URL = "http://localhost:5000";

app.post("/shorten", async (req, res) => {
  const { originalUrl } = req.body;

  // Validate URL
  if (!validUrl.isUri(originalUrl)) {
    return res.status(400).json("Invalid URL");
  }

  try {
    let url = await Url.findOne({ originalUrl });

    if (url) {
      return res.json(url);
    } else {
      const urlCode = shortid.generate();
      const shortUrl = BASE_URL + "/" + urlCode;

      url = new Url({
        originalUrl,
        shortUrl,
        urlCode,
      });

      await url.save();
      return res.json(url);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Server error");
  }
});

app.get("/:code", async (req, res) => {
  try {
    const url = await Url.findOne({ urlCode: req.params.code });

    if (url) {
      return res.redirect(url.originalUrl);
    } else {
      return res.status(404).json("No URL found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Server error");
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));