// Daily devotional content. No licensed or verified devotional dataset is bundled in v1.0.0,
// so this list is intentionally empty and the Devotional page explains this honestly.
//
// To add content, push objects with this shape (all text must be content you have the right to distribute):
// {
//   id: 'unique-id',
//   dayOfYear: 1,                       // 1-366, shown on that day of the year
//   title: { en: '', es: '', ht: '' },
//   body:  { en: '', es: '', ht: '' },
//   reference: { book: 'psalms', chapter: 23, verse: 1 }
// }
export const DEVOTIONALS = [];
