export const multiImagePrompt = (type: string) => {
  switch (type) {
    case 'try-on':
      return 'make this person wear the clothes in the second image. exact same person with same face with exact same clothes. white background. only one person on the image';
    case 'landscape':
      return 'A landscape of a person';
    default:
      return 'make this person wear the clothes in the second image. exact same person with same face with exact same clothes. white background. only one person on the image';
  }
};
