export interface PromptContent {
  type: 'text' | 'image-reference';
  value: string; // Text content or ReferenceImage.id
}
