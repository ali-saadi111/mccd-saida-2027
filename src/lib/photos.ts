/**
 * Openly licensed photographs of Saida from Wikimedia Commons, self-hosted in
 * public/photos. They stand in until approved programme photography is supplied.
 * Alt text lives in the message files under `photos.<key>`.
 */
export type PhotoKey =
  | 'seashore'
  | 'castleSea'
  | 'castle2018'
  | 'castleFront'
  | 'oldCity'
  | 'khan'
  | 'palaceArch'
  | 'palaceHall'
  | 'viewCastle'
  | 'alley'
  | 'castle2009'
  | 'castlePano'
  | 'palaceInterior';
export type PhotoCredit = {
  src: string;
  width: number;
  height: number;
  author: string;
  license: string;
  source: string;
};
const commons = 'https://commons.wikimedia.org/wiki/File:';
export const photos: Record<PhotoKey, PhotoCredit> = {
  seashore: {
    src: '/photos/seashore.jpg',
    width: 1920,
    height: 1431,
    author: 'Karensa311',
    license: 'CC BY-SA 4.0',
    source: commons + 'Sidon_seashore_lebanon.jpg',
  },
  castleSea: {
    src: '/photos/castle-sea.jpg',
    width: 1920,
    height: 1079,
    author: 'Vyacheslav Argenberg',
    license: 'CC BY 4.0',
    source: commons + 'Sidon_Sea_Castle,_Mediterranean_Sea,_Sidon,_Lebanon.jpg',
  },
  castle2018: {
    src: '/photos/castle-2018.jpg',
    width: 1600,
    height: 1067,
    author: 'Choinowski',
    license: 'CC BY-SA 4.0',
    source: commons + 'Sidon_Sea_Castle_in_2018.jpg',
  },
  castleFront: {
    src: '/photos/castle-front.jpg',
    width: 1400,
    height: 1050,
    author: 'Vyacheslav Argenberg',
    license: 'CC BY 4.0',
    source: commons + 'Sidon_Sea_Castle,_Sidon,_Lebanon.jpg',
  },
  oldCity: {
    src: '/photos/old-city.jpg',
    width: 1400,
    height: 1050,
    author: 'Vyacheslav Argenberg',
    license: 'CC BY 4.0',
    source: commons + 'Old_city_of_Sidon,_Lebanon.jpg',
  },
  khan: {
    src: '/photos/khan.jpg',
    width: 1600,
    height: 1200,
    author: 'Ankara',
    license: 'CC BY-SA 3.0',
    source: commons + 'Sidon2009c.JPG',
  },
  palaceArch: {
    src: '/photos/palace-arch.jpg',
    width: 1400,
    height: 1050,
    author: 'Elias Ziade',
    license: 'CC BY-SA 4.0',
    source: commons + 'Debbane_Palace_Interior_-_arch.jpg',
  },
  palaceHall: {
    src: '/photos/palace-hall.jpg',
    width: 1400,
    height: 933,
    author: 'Raghad.kabtool',
    license: 'CC BY-SA 4.0',
    source: commons + 'مجلس_الطعام_في_قصر_دبانة_-_صيدا_لبنان.jpg',
  },
  viewCastle: {
    src: '/photos/view-castle.jpg',
    width: 1400,
    height: 787,
    author: 'Vyacheslav Argenberg',
    license: 'CC BY 4.0',
    source: commons + "View_from_Sidon's_Sea_Castle_2,_Sidon,_Lebanon.jpg",
  },
  alley: {
    src: '/photos/alley.jpg',
    width: 1400,
    height: 1050,
    author: 'Vyacheslav Argenberg',
    license: 'CC BY 4.0',
    source: commons + 'Alleyways,_Old_city_of_Sidon,_Lebanon.jpg',
  },
  castle2009: {
    src: '/photos/castle-2009.jpg',
    width: 1400,
    height: 901,
    author: 'Peripitus',
    license: 'CC BY-SA 3.0',
    source: commons + 'Sidon_Sea_Castle_2009.jpg',
  },
  castlePano: {
    src: '/photos/castle-pano.jpg',
    width: 1400,
    height: 610,
    author: 'Heinz Hövel',
    license: 'CC BY-SA 3.0',
    source: commons + 'Sidon_-_Sea_Castle_(Qalat_al-Bahr).jpg',
  },
  palaceInterior: {
    src: '/photos/palace-interior.jpg',
    width: 1400,
    height: 1867,
    author: 'Elias Ziade',
    license: 'CC BY-SA 4.0',
    source: commons + 'Debbane_Palace_Interior.jpg',
  },
};
/** Venue photograph shown until an event supplies its own image. */
export const venuePhoto: Record<string, PhotoKey> = {
  sea: 'castle2018',
  khan: 'khan',
  palace: 'palaceHall',
  square: 'oldCity',
};
const newsPhotos: PhotoKey[] = ['castleFront', 'palaceInterior', 'castlePano'];
export const newsPhoto = (id: string) =>
  newsPhotos[((Number(id.replace(/\D/g, '')) || 1) - 1) % newsPhotos.length];
