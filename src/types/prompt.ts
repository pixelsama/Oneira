export interface PromptContent {
  type: 'text' | 'image-reference' | 'resource-reference';
  value: string; // Text content or ReferenceImage.id
}
