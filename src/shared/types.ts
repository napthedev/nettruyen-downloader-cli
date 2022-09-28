import { DOWNLOAD_TYPES } from "./constants.js";

type ImageType = string | undefined;

interface ChapterType {
  title: string;
  url: string;
  images: ImageType[];
}

type DownloadTypesType = typeof DOWNLOAD_TYPES[number];

export { ChapterType, DownloadTypesType, ImageType };
