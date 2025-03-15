import { Router } from "express";
import axios from "axios";
import fs from "fs";

const taskRouter = Router();

taskRouter.post("/add-urls", addUrlsHander);
taskRouter.get("/getdata", getdata);
taskRouter.get("/dummy", dummyurls);

export default taskRouter;

const DATA_FILE = "./data";

// Function to load saved responses
const loadResponses = () => {
  if (!fs.existsSync(DATA_FILE)) return {};
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
};

// Function to save responses to file
const saveResponses = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
};

// **POST Route: Save responses for multiple URLs**
async function addUrlsHander(req, res) {
  const { urls } = req.body;

  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: "Invalid URL array." });
  }

  let responses = loadResponses();

  try {
    const fetchPromises = urls.map(async (url) => {
      try {
        const response = await axios.get(url, { responseType: "arraybuffer" });
        const contentType = response.headers["content-type"];
        const isImage = contentType.startsWith("image");
        responses[url] = isImage
          ? `${Buffer.from(response.data).toString("base64")}`
          : response.data.toString("utf8");
      } catch (error) {
        responses[url] = { error: "Failed to fetch URL." };
      }
    });

    await Promise.all(fetchPromises);
    saveResponses(responses);

    res.json({ message: "Responses saved successfully.", savedUrls: urls });
  } catch (error) {
    res.status(500).json({ error: "Error saving responses." });
  }
}

async function getdata(req, res) {
  const { url } = req.query;

  if (!url)
    return res.status(400).json({ error: "URL query parameter is required." });
  const responses = loadResponses();
  if (responses[url]) {
    return res.json({ url, response: responses[url] });
  } else {
    return res.status(404).json({ error: "Response not found for this URL." });
  }
}

async function dummyurls(req, res) {
  try {
    res.status(200).json({ data: "dummy data for result" });
  } catch (error) {
    return res.status(404).json({ error: "Response not found for dummy" });
  }
}

// fs.writeFile(
//   "image.png",
//   responses[url],
//   { encoding: "base64" },
//   function (err) {
//     console.log("File created");
//   }
// );
