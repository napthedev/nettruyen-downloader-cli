type ImageType = string | undefined;

interface ChapterType {
  title: string;
  url: string;
  images: ImageType[];
}

export { ImageType, ChapterType };
