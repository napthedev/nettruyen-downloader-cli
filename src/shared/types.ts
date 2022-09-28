type ImageType = string | undefined;

interface ChapterType {
  title: string;
  url: string;
  images: ImageType[];
}

export { ChapterType, ImageType };
