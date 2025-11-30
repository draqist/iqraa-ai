import { Book } from './types';

export const DEMO_BOOKS: Book[] = [
  {
    id: 'b1',
    title_en: 'Surah Al-Fatiha',
    title_ar: 'سُورَةُ الفَاتِحَة',
    author: 'The Holy Quran',
    cover_image: 'https://picsum.photos/400/600',
    nodes: [
      { id: '1', order: 1, node_type: 'verse', text_arabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ', text_english: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.' },
      { id: '2', order: 2, node_type: 'verse', text_arabic: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ', text_english: '[All] praise is [due] to Allah, Lord of the worlds -' },
      { id: '3', order: 3, node_type: 'verse', text_arabic: 'ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ', text_english: 'The Entirely Merciful, the Especially Merciful,' },
      { id: '4', order: 4, node_type: 'verse', text_arabic: 'مَـٰلِكِ يَوْمِ ٱلدِّينِ', text_english: 'Sovereign of the Day of Recompense.' },
      { id: '5', order: 5, node_type: 'verse', text_arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', text_english: 'It is You we worship and You we ask for help.' },
      { id: '6', order: 6, node_type: 'verse', text_arabic: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ', text_english: 'Guide us to the straight path -' },
      { id: '7', order: 7, node_type: 'verse', text_arabic: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ', text_english: 'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.' },
    ]
  },
  {
    id: 'b2',
    title_en: 'Al-Shatibiyyah (Intro)',
    title_ar: 'متن الشاطبية',
    author: 'Imam Al-Shatibi',
    cover_image: 'https://picsum.photos/401/600',
    nodes: [
      { id: 's1', order: 1, node_type: 'line', text_arabic: 'بَدَأْتُ بِبِسْمِ اللهِ في النَّظْمِ أوَّلاً ... تَبَارَكَ رَحْمَاناً رَحِيماً وَمَوْئِلاً', text_english: 'I began with Bismillah in the poem first...' },
      { id: 's2', order: 2, node_type: 'line', text_arabic: 'وَثَنَّيْتُ صَلَّى اللهُ رَبِّي عَلى الرِّضَا ... مُحَمَّدٍ الْمُهْدَى إِلى النَّاسِ مُرْسَلاً', text_english: 'And secondly, may Allah send peace upon the Content One...' },
    ]
  }
];
