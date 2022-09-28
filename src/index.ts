import axios from "axios";
import fs from "fs";
import inquirer from "inquirer";
import ora from "ora";
import path from "path";
import PDFDocument from "pdfkit";
import { cluster, parallel, retry } from "radash";
import sharp from "sharp";

import { getChapImages } from "./services/chap.js";
import { getComicInfo } from "./services/comic.js";
import { FALLBACK_IMAGE, URL_REGEX } from "./shared/constants.js";
import type { ChapterType, ImageType } from "./shared/types.js";
import { md5 } from "./shared/utils.js";

const { comicURL } = await inquirer.prompt({
  type: "input",
  message: "Enter the comic URL: ",
  validate: (value) => (URL_REGEX.test(value) ? true : "Invalid URL format"),
  name: "comicURL",
});

const spinner = ora({ text: "Validating...", hideCursor: false }).start();

const info = await getComicInfo(comicURL).catch(() => {
  spinner.fail("Failed to fetch comic info");
  process.exit(1);
});

spinner.succeed(`Comic title: ${info.title}`);

console.log("\nThis script will download the comic into groups of chapters");

const { groupItemCount } = await inquirer.prompt({
  type: "input",
  message: "Group item count:",
  validate: (value) => {
    if (!value || Number.isNaN(value)) return "Input must be a number";
    if (+value < 1) return "Count must not be less than 1";
    if (+value > info.chapters.length)
      return "Count must not be more than chapters count";
    return true;
  },
  name: "groupItemCount",
});

const { downloadType } = await inquirer.prompt({
  type: "list",
  message: "Choose download type:",
  choices: ["Download all parts", "Select parts"],
  name: "downloadType",
});

const { outputFolder } = await inquirer.prompt({
  type: "input",
  message: "Enter the output folder:",
  name: "outputFolder",
});

fs.mkdirSync(path.resolve(process.cwd(), outputFolder), { recursive: true });

fs.mkdirSync(path.resolve(process.cwd(), outputFolder, "images"), {
  recursive: true,
});

fs.mkdirSync(path.resolve(process.cwd(), outputFolder, "output"), {
  recursive: true,
});

const fetchChapSpinner = ora({
  text: "Fetching chapter...",
  hideCursor: false,
});

const images: ImageType[] = [];

let fetchedChaptersCount = 0;

let groups = cluster(info.chapters, +groupItemCount);
let groupIndexes: number[] = [];

if (downloadType === "Select parts") {
  const { selectedParts } = await inquirer.prompt({
    type: "checkbox",
    message: "Select parts",
    choices: groups.map((_, index) => `Part ${index + 1}`),
    validate: (value: string[]) => {
      if (value.length < 1)
        return "Number of selected parts must not be less than 1";
      return true;
    },
    name: "selectedParts",
  });
  groups = (selectedParts as string[]).map((a) => {
    groupIndexes = [...groupIndexes, +a.split(" ")[1] - 1];
    return groups[+a.split(" ")[1] - 1];
  });
}

fetchChapSpinner.start();

await parallel(20, ([] as ChapterType[]).concat(...groups), async (chapter) => {
  fetchChapSpinner.text = `Fetching chapter ${++fetchedChaptersCount}`;
  const chapImages = await getChapImages(chapter.url);
  chapter.images = chapImages;
  images.push(...chapImages);
});

fetchChapSpinner.succeed("Fetched all chapters successfully");

const fetchImageSpinner = ora({
  text: "Fetching images...",
  hideCursor: false,
}).start();

let fetchedImageCount = 0;

await parallel(10, images, async (image) => {
  if (!image) {
    return;
  }

  const hashed = md5(image);

  await retry({ times: 10 }, async () => {
    fetchImageSpinner.text = `Fetching images (${++fetchedImageCount}/${
      images.length
    }) ...`;
    if (
      fs.existsSync(
        path.resolve(process.cwd(), outputFolder, "images", `${hashed}.jpg`)
      )
    ) {
      return;
    }

    const response = await axios.get(image, {
      responseType: "arraybuffer",
      headers: {
        referer: new URL(comicURL).origin,
        origin: new URL(comicURL).origin,
      },
    });

    let data = response.data;

    try {
      data = await sharp(response.data).jpeg({ quality: 60 }).toBuffer();
    } catch (error) {
      data = Buffer.from(FALLBACK_IMAGE, "base64");
    }

    await new Promise((res) => {
      fs.writeFile(
        path.resolve(process.cwd(), outputFolder, "images", `${hashed}.jpg`),
        data,
        res
      );
    });
  });
});

fetchImageSpinner.succeed("Fetched all images successfully");

const convertPartSpinner = ora({
  text: "Converting parts...",
  hideCursor: false,
}).start();

for (const [index, group] of groups.entries()) {
  convertPartSpinner.text = `Converting parts (${index + 1}/${
    groups.length
  }) ...`;

  convertPartSpinner.render();

  const images = group.reduce(
    (prev, current) => [...prev, ...current.images],
    [] as ImageType[]
  );

  let doc;

  for (const image of images) {
    if (!image) {
      continue;
    }

    const buffer = fs.readFileSync(
      path.resolve(process.cwd(), outputFolder, "images", `${md5(image)}.jpg`)
    );

    const metadata = await sharp(buffer).metadata();

    if (typeof doc === "undefined") {
      doc = new PDFDocument({
        size: [metadata.width || 1000, metadata.height || 1000],
      });
    } else {
      doc.addPage({ size: [metadata.width || 1000, metadata.height || 1000] });
    }

    doc.image(buffer, 0, 0, { width: metadata.width, height: metadata.height });
  }

  const stream = doc?.pipe(
    fs.createWriteStream(
      path.resolve(
        process.cwd(),
        outputFolder,
        "output",
        `${info.title} Part ${groupIndexes[index] + 1}.pdf`
      )
    )
  );

  doc?.end();

  await new Promise((res) => {
    stream?.on("finish", res);
  });
}

convertPartSpinner.succeed("Converted to PDF successfully");

console.log(
  `🎉 Congratulations! Your PDF files are at ${path.resolve(
    process.cwd(),
    outputFolder,
    "output"
  )}`
);
