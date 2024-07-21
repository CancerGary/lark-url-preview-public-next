export interface Image {
  key: string;
  description: string;
  targetLink?: string;
}
export interface TextPreset {
  value: string;
  description: string;
  targetLink?: string;
  imageKey?: string;
  textOnly?: boolean;
}
export interface TextPresetGroup {
  name: string;
  presets: TextPreset[];
  special?: boolean;
  blockId?: string;
  lang?: string;
}

export interface ImageGroup {
  name: string;
  images: Image[];
  special?: boolean;
  isSlogan?: boolean;
  targetLink?: string;
  lang?: string;
  blockId?: string;
}

export type CollectionData = {
  result: ImageGroup[];
  textPresetResult: TextPresetGroup[];
};
