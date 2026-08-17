/** Trusted 90s cues. Wrong song = silence. */

const JUNK = /karaoke|tribute|live at|live from|live in|\blive\b|concert|cover version|8-bit|8 bit|chiptune|lullaby|music box|workout|zoom karaoke|kidz bop|piano tribute|piano guys|string quartet|video game metal|yoga|spa |sleep music|white noise|remix$/i;

const CUES = {
  'sonic the hedgehog': {
    queries: ['Masato Nakamura Green Hill Zone', 'Green Hill Zone Sonic the Hedgehog original soundtrack'],
    want: ['green hill', 'masato', 'nakamura', 'sega'],
    why: 'Green Hill Zone',
  },
  'sonic the hedgehog 2': {
    queries: ['Sonic the Hedgehog 2 Chemical Plant', 'Sonic 2 original soundtrack'],
    want: ['chemical', 'emerald', 'sega', 'sonic'],
    why: 'Sonic 2 stage theme',
  },
  'sonic 3': {
    queries: ['Sonic 3 Ice Cap Zone', 'Sonic the Hedgehog 3 original soundtrack'],
    want: ['ice cap', 'sega', 'sonic'],
    why: 'Sonic 3 stage theme',
  },
  'friends': {
    queries: ["I'll Be There for You The Rembrandts", 'Friends theme song Rembrandts'],
    want: ['rembrandts', "i'll be there"],
    why: "I'll Be There for You",
  },
  'seinfeld': {
    queries: ['Seinfeld Theme Jonathan Wolff', 'Seinfeld original theme'],
    want: ['seinfeld', 'wolff'],
    why: 'Seinfeld theme',
  },
  'the fresh prince of bel-air': {
    queries: ['Fresh Prince of Bel-Air theme Will Smith', 'The Fresh Prince of Bel-Air theme song'],
    want: ['fresh prince', 'will smith'],
    why: 'Fresh Prince theme',
  },
  'saved by the bell': {
    queries: ['Saved by the Bell theme', 'Saved by the Bell original theme song'],
    want: ['saved by the bell'],
    why: 'Saved by the Bell theme',
  },
  'beverly hills, 90210': {
    queries: ['Beverly Hills 90210 theme', '90210 original theme song'],
    want: ['90210', 'beverly hills'],
    why: '90210 theme',
  },
  'the simpsons': {
    queries: ['The Simpsons Theme Danny Elfman', 'Simpsons original theme'],
    want: ['simpsons', 'elfman'],
    why: 'Simpsons theme',
  },
  'rugrats': {
    queries: ['Rugrats theme song', 'Rugrats original theme'],
    want: ['rugrats'],
    why: 'Rugrats theme',
  },
  'the x-files': {
    queries: ['X-Files theme Mark Snow', 'The X-Files original theme'],
    want: ['x-files', 'x files', 'mark snow'],
    why: 'X-Files theme',
  },
  'jurassic park': {
    queries: ['Jurassic Park Theme John Williams', 'Jurassic Park original soundtrack Williams'],
    want: ['jurassic', 'john williams'],
    why: 'Jurassic Park theme',
  },
  'titanic': {
    queries: ['My Heart Will Go On Celine Dion', 'Titanic original soundtrack'],
    want: ['celine', 'heart will go on', 'horner'],
    why: 'My Heart Will Go On',
  },
  'the lion king': {
    queries: ['Circle of Life Elton John', 'Lion King original soundtrack'],
    want: ['circle of life', 'elton', 'hans zimmer'],
    why: 'Circle of Life',
  },
  'ghost': {
    queries: ['Unchained Melody Righteous Brothers', 'Ghost Unchained Melody'],
    want: ['unchained melody', 'righteous'],
    why: 'Unchained Melody',
  },
  'pretty woman': {
    queries: ['Oh Pretty Woman Roy Orbison', 'Pretty Woman soundtrack'],
    want: ['pretty woman', 'orbison'],
    why: 'Pretty Woman',
  },
  'home alone': {
    queries: ['Home Alone Somewhere in My Memory John Williams', 'Home Alone original soundtrack'],
    want: ['home alone', 'john williams', 'somewhere in my memory'],
    why: 'Home Alone score',
  },
  'wannabe': {
    queries: ['Wannabe Spice Girls'],
    want: ['spice girls', 'wannabe'],
    why: 'Wannabe',
  },
  'gettin jiggy wit it': {
    queries: ["Gettin' Jiggy Wit It Will Smith"],
    want: ['jiggy', 'will smith'],
    why: "Gettin' Jiggy Wit It",
  },
  'big willie style': {
    queries: ["Gettin' Jiggy Wit It Will Smith", 'Big Willie Style Will Smith'],
    want: ['jiggy', 'will smith', 'big willie'],
    why: "Gettin' Jiggy Wit It",
  },
  'men in black': {
    queries: ['Men in Black Will Smith', 'Men in Black theme Will Smith'],
    want: ['will smith', 'men in black'],
    why: 'Men in Black',
  },
  'independence day': {
    queries: ['Independence Day original soundtrack David Arnold', 'Independence Day theme'],
    want: ['independence day', 'david arnold'],
    why: 'Independence Day score',
  },
  'the silence of the lambs': {
    queries: ['Silence of the Lambs original soundtrack', 'Silence of the Lambs theme'],
    want: ['silence of the lambs', 'lambs'],
    why: 'Silence of the Lambs score',
  },
  'forrest gump': {
    queries: ['Forrest Gump Suite Alan Silvestri', 'Forrest Gump original soundtrack'],
    want: ['forrest gump', 'silvestri'],
    why: 'Forrest Gump score',
  },
  'pokemon': {
    queries: ['Pokemon Theme song original Gotta catch em all', 'Pokemon Indigo League theme'],
    want: ['pokemon'],
    why: 'Pokémon theme',
  },
  'pokémon': {
    queries: ['Pokemon Theme song original', 'Pokemon Indigo League theme'],
    want: ['pokemon'],
    why: 'Pokémon theme',
  },
  'pokémon red and blue': {
    queries: ['Pokemon Theme song original', 'Pokemon Red Blue opening theme'],
    want: ['pokemon'],
    why: 'Pokémon theme',
  },
  'mighty morphin power rangers': {
    queries: ['Go Go Power Rangers theme original', 'Mighty Morphin Power Rangers theme song'],
    want: ['power ranger'],
    why: 'Go Go Power Rangers',
  },
  'hey arnold!': {
    queries: ['Hey Arnold theme song original', 'Hey Arnold! theme'],
    want: ['arnold'],
    why: 'Hey Arnold! theme',
  },
  "dexter's laboratory": {
    queries: ["Dexter's Laboratory theme song original", 'Dexter Laboratory theme'],
    want: ['dexter'],
    why: "Dexter's Lab theme",
  },
  'animaniacs': {
    queries: ['Animaniacs theme song original', 'Animaniacs opening theme'],
    want: ['animaniacs'],
    why: 'Animaniacs theme',
  },
  'tiny toon adventures': {
    queries: ['Tiny Toon Adventures theme song original', 'Tiny Toons theme'],
    want: ['tiny toon'],
    why: 'Tiny Toons theme',
  },
  'doug': {
    queries: ['Doug theme song original Nickelodeon', 'Doug Funnie theme'],
    want: ['doug'],
    why: 'Doug theme',
  },
  "rocko's modern life": {
    queries: ["Rocko's Modern Life theme song original", 'Rocko Modern Life theme'],
    want: ['rocko'],
    why: "Rocko's theme",
  },
  'recess': {
    queries: ['Recess theme song original Disney', 'Recess TV theme'],
    want: ['recess'],
    why: 'Recess theme',
  },
  'spongebob squarepants': {
    queries: ['SpongeBob SquarePants theme song original', 'SpongeBob theme'],
    want: ['spongebob'],
    why: 'SpongeBob theme',
  },
  'batman: the animated series': {
    queries: ['Batman The Animated Series theme Shirley Walker', 'Batman animated series theme original'],
    want: ['batman'],
    why: 'Batman TAS theme',
  },
  'the powerpuff girls': {
    queries: ['Powerpuff Girls theme song original', 'Powerpuff Girls opening theme'],
    want: ['powerpuff'],
    why: 'Powerpuff Girls theme',
  },
  'home improvement': {
    queries: ['Home Improvement theme song original', 'Home Improvement original theme'],
    want: ['home improvement'],
    why: 'Home Improvement theme',
  },
  'super mario world': {
    queries: ['Super Mario World Athletic theme Koji Kondo', 'Super Mario World original soundtrack'],
    want: ['mario'],
    why: 'Super Mario World',
  },
  'super mario 64': {
    queries: ['Super Mario 64 Dire Dire Docks', 'Super Mario 64 original soundtrack Koji Kondo'],
    want: ['mario'],
    why: 'Mario 64 theme',
  },
  'super mario kart': {
    queries: ['Super Mario Kart Rainbow Road original', 'Super Mario Kart soundtrack'],
    want: ['mario'],
    why: 'Mario Kart theme',
  },
  'goldeneye 007': {
    queries: ['GoldenEye 007 multiplayer theme original', 'GoldenEye 64 soundtrack'],
    want: ['goldeneye'],
    why: 'GoldenEye theme',
  },
  'the legend of zelda: ocarina of time': {
    queries: ['Ocarina of Time title theme Koji Kondo', 'Legend of Zelda Ocarina of Time original soundtrack'],
    want: ['ocarina', 'zelda'],
    why: 'Ocarina of Time',
  },
  'street fighter ii': {
    queries: ['Street Fighter II Ryu stage theme original', 'Street Fighter II original soundtrack'],
    want: ['street fighter'],
    why: 'Street Fighter II',
  },
  'u cant touch this': {
    queries: ["U Can't Touch This MC Hammer"],
    want: ['hammer', 'touch this'],
    why: "U Can't Touch This",
  },
  'smells like teen spirit': {
    queries: ['Smells Like Teen Spirit Nirvana'],
    want: ['nirvana', 'teen spirit'],
    why: 'Smells Like Teen Spirit',
  },
  'mmm bop': {
    queries: ['MMMBop Hanson'],
    want: ['hanson', 'mmmbop'],
    why: 'MMMBop',
  },
  'mmmbop': {
    queries: ['MMMBop Hanson'],
    want: ['hanson', 'mmmbop'],
    why: 'MMMBop',
  },
  'i want it that way': {
    queries: ['I Want It That Way Backstreet Boys'],
    want: ['backstreet', 'that way'],
    why: 'I Want It That Way',
  },
  '...baby one more time': {
    queries: ['Baby One More Time Britney Spears'],
    want: ['britney', 'one more time'],
    why: '...Baby One More Time',
  },
  'all star': {
    queries: ['All Star Smash Mouth'],
    want: ['smash mouth', 'all star'],
    why: 'All Star',
  },
  'macarena': {
    queries: ['Macarena Los del Rio'],
    want: ['macarena', 'los del'],
    why: 'Macarena',
  },
  'jump': {
    queries: ['Jump Kris Kross'],
    want: ['kris kross', 'jump'],
    why: 'Jump',
  },
};

function norm(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

const CUE_MAP = Object.fromEntries(Object.entries(CUES).map(([k, v]) => [norm(k), v]));

function vehicleFor(item) {
  const note = String(item.note || '');
  const meta = String(item.meta || '');
  const first = note.split(/[.!]/)[0].trim();
  if (item.cat === 'person') {
    if (/fresh prince/i.test(`${note} ${meta}`)) return 'The Fresh Prince of Bel-Air';
    if (/friends/i.test(note)) return 'Friends';
    if (/90210/i.test(note)) return 'Beverly Hills 90210';
    if (/seinfeld/i.test(note)) return 'Seinfeld';
    if (/saved by the bell/i.test(note)) return 'Saved by the Bell';
    if (/gettin.? jigg/i.test(note)) return 'Gettin\' Jiggy Wit It';
    if (/big willie/i.test(note)) return 'Gettin\' Jiggy Wit It';
    if (first && first.length > 3 && first.length < 48 && !/^(actor|musician|director|athlete|comedian)/i.test(first)) {
      return first;
    }
  }
  return '';
}

export function cueFor(item) {
  const titleKey = norm(item.title);
  if (CUE_MAP[titleKey]) return CUE_MAP[titleKey];
  if (item.cat === 'person') {
    const v = vehicleFor(item);
    const vKey = norm(v);
    if (vKey && CUE_MAP[vKey]) return CUE_MAP[vKey];
    if (v) {
      return {
        queries: [`${v} theme song`, `${v} original soundtrack`],
        want: v.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2),
        why: v,
      };
    }
  }
  return null;
}

export function queriesFor(item) {
  const cue = cueFor(item);
  if (cue) return cue.queries;
  const title = item.title;
  const meta = item.meta || '';
  switch (item.cat) {
    case 'music':
      return [`${title} ${meta}`, title];
    case 'movie':
      return [`${title} original soundtrack theme`, `${title} theme song`];
    case 'tv':
    case 'cartoon':
      return [`${title} theme song original`, `${title} TV theme`];
    case 'game':
      return [`${title} original soundtrack`, `${title} video game soundtrack`];
    case 'sport':
      return [`${title} anthem`, `${title} theme`];
    case 'toy':
    case 'food':
    case 'tech':
      return [`${title} commercial jingle`, `${title} theme song`, title];
    default:
      return [];
  }
}

function blobOf(t) {
  return `${t.trackName} ${t.artistName} ${t.collectionName}`.toLowerCase();
}

function isJunk(t) {
  return JUNK.test(blobOf(t));
}

export function pickTrack(results, item) {
  const cue = cueFor(item);
  const want = (cue?.want || []).map((w) => String(w).toLowerCase());
  const titleBits = norm(item.title).split(' ').filter((w) => w.length > 2);
  const hits = (results || []).filter((t) => t.previewUrl && !isJunk(t));
  if (!hits.length) return null;
  const scored = hits.map((t) => {
    const blob = blobOf(t);
    let score = 0;
    want.forEach((w) => { if (w && blob.includes(w)) score += 4; });
    titleBits.forEach((w) => { if (blob.includes(w)) score += 1; });
    if (/original soundtrack|official soundtrack|theme/.test(blob)) score += 2;
    if (item.cat === 'music' && blob.includes(norm(item.title).slice(0, 18))) score += 6;
    if (item.cat === 'music') {
      const artistBits = norm(item.meta).split(' ').filter((w) => w.length > 3);
      if (artistBits.length) {
        const hits = artistBits.filter((w) => blob.includes(w)).length;
        if (!hits) score = -1;
        else score += hits * 3;
      }
    }
    if (cue) {
      const must = want.slice(0, 2);
      if (must.length && !must.some((w) => blob.includes(w))) score = -1;
      const wantHits = want.filter((w) => w && blob.includes(w)).length;
      if (want.length >= 2 && wantHits < 2) score = -1;
    }
    return { t, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];
  if (!best) return null;
  if (item.cat === 'music') return best.score >= 3 ? best.t : null;
  if (cue) return best.score >= 4 ? best.t : null;
  return best.score >= 3 ? best.t : null;
}

export function labelFor(track, item) {
  const cue = cueFor(item);
  const name = `${track.trackName} · ${track.artistName}`;
  if (cue?.why) return `${cue.why} · ${track.artistName}`;
  return name;
}
