/** Trusted 90s cues. Cover mills and karaoke = no song. */

const JUNK = /karaoke|tribute|\bcover\b|lullaby|8-bit|8 bit|chiptune|kidz bop|mr dooves|piano version|piano tribute|music box|hit crew|drew'?s famous|toon tunes|tv themes|television'?s greatest|relaxing|lo-?fi|string quartet|glee cast|workout|yoga|sleep music|white noise|geek music|kids superstars|trap geek|nstens|toonosaurs|warp zone|sheet music boss|vitamin string|zoom karaoke|urock|acapella|a cappella|vgr remix|holiday remix|ottawa guitar|mario piano|gentle game|pokestir|arcade player|retro crowd|8 bit universe|music legends|punk cover|megaraptor|postmodern jukebox|thefatrat|jonathan young|i tromboni|camille berthollet|christian schumann|union of sound|pope brandon|random encounter|syncopix|kids superstars|bobmusic/i;

const CUES = {
  // cartoons
  'captain planet and the planeteers': { queries: ['Captain Planet Tom Worrall soundtrack'], want: ['worrall', 'planeteer'], why: 'Captain Planet theme' },
  'tiny toon adventures': { queries: ['Tiny Toon Adventures theme Warner Bros'], want: ['tiny toon', 'warner'], why: 'Tiny Toons theme' },
  'the simpsons': { queries: ['The Simpsons Theme Danny Elfman'], want: ['elfman', 'simpsons'], why: 'Simpsons theme' },
  'rugrats': { queries: ['Rugrats Theme Mark Mothersbaugh', 'Rugrats original theme song'], want: ['rugrats'], why: 'Rugrats theme' },
  'doug': { queries: ['Doug Funnie theme song original Nickelodeon'], want: ['doug'], why: 'Doug theme' },
  'the ren & stimpy show': { queries: ['Ren and Stimpy Happy Happy Joy Joy original', 'Ren Stimpy theme song original'], want: ['ren', 'stimpy'], why: 'Ren & Stimpy' },
  'batman: the animated series': { queries: ['Batman The Animated Series theme Shirley Walker'], want: ['shirley walker', 'batman'], why: 'Batman TAS theme' },
  'animaniacs': { queries: ['Animaniacs Opening Title Animaniacs'], want: ['animaniacs'], why: 'Animaniacs theme' },
  'mighty morphin power rangers': { queries: ['Go Go Power Rangers Ron Wasserman'], want: ['wasserman', 'power ranger'], why: 'Go Go Power Rangers' },
  "rocko's modern life": { queries: ["Rocko's Modern Life Theme Song Pat Irwin"], want: ['irwin', 'rocko'], why: "Rocko's theme" },
  'gargoyles': { queries: ['Gargoyles Main Title Carl Johnson'], want: ['gargoyles', 'johnson'], why: 'Gargoyles theme' },
  'aaahh!!! real monsters': { queries: ['Aaahh Real Monsters theme song original'], want: ['real monsters'], why: 'Real Monsters theme' },
  'pinky and the brain': { queries: ['Pinky and the Brain Animaniacs'], want: ['pinky', 'brain'], why: 'Pinky and the Brain' },
  'hey arnold!': { queries: ['Hey Arnold theme song original Nickelodeon'], want: ['arnold'], why: 'Hey Arnold! theme' },
  "dexter's laboratory": { queries: ["Dexter's Laboratory theme song original"], want: ['dexter'], why: "Dexter's Lab theme" },
  'the magic school bus': { queries: ['Magic School Bus Little Richard Ride on the Magic School Bus'], want: ['little richard', 'magic school'], why: 'Magic School Bus theme' },
  'recess': { queries: ['Recess theme song original Disney'], want: ['recess'], why: 'Recess theme' },
  'south park': { queries: ['South Park Theme Primus'], want: ['primus', 'south park'], why: 'South Park theme' },
  'the powerpuff girls': { queries: ['Powerpuff Girls Bis Fight', 'Powerpuff Girls theme original'], want: ['powerpuff', 'bis'], why: 'Powerpuff Girls' },
  'pokémon': { queries: ['Pokemon Theme Jason Paige'], want: ['jason paige', 'pokemon'], why: 'Pokémon theme' },
  'catdog': { queries: ['CatDog Theme Song Nickelodeon'], want: ['catdog', 'nickelodeon'], why: 'CatDog theme' },
  'spongebob squarepants': { queries: ['SpongeBob SquarePants Theme Song'], want: ['spongebob'], why: 'SpongeBob theme' },
  'ed, edd n eddy': { queries: ['Ed Edd n Eddy theme original'], want: ['eddy'], why: "Ed, Edd n Eddy theme" },
  'darkwing duck': { queries: ['Darkwing Duck Theme Disney Afternoon Studio Chorus'], want: ['darkwing', 'disney'], why: 'Darkwing Duck theme' },
  'talespin': { queries: ['TaleSpin Theme Disney Afternoon Studio Chorus'], want: ['talespin', 'disney'], why: 'TaleSpin theme' },
  'x-men: the animated series': { queries: ['X-Men Animated Series theme Ron Wasserman', 'X-Men cartoon theme original'], want: ['x-men', 'wasserman'], why: 'X-Men theme' },
  'spider-man: the animated series': { queries: ['Spider-Man 1994 animated series theme'], want: ['spider-man', 'spider man'], why: 'Spider-Man 94 theme' },
  'beavis and butt-head': { queries: ['Beavis and Butt-Head theme original'], want: ['beavis'], why: 'Beavis and Butt-Head' },
  'the tick': { queries: ['The Tick Theme Doug Katsaros'], want: ['katsaros', 'tick'], why: 'The Tick theme' },
  'the angry beavers': { queries: ['Angry Beavers theme original Nickelodeon'], want: ['beaver'], why: 'Angry Beavers theme' },
  'daria': { queries: ['Splendora Youre Standing on My Neck Daria', 'Daria Official MTV Theme Splendora'], want: ['splendora', 'daria'], why: "You're Standing on My Neck" },
  'johnny bravo': { queries: ['Johnny Bravo theme original'], want: ['johnny bravo'], why: 'Johnny Bravo theme' },
  'cow and chicken': { queries: ['Cow and Chicken theme original'], want: ['cow and chicken'], why: 'Cow and Chicken theme' },
  'the wild thornberrys': { queries: ['Wild Thornberrys theme original'], want: ['thornberry'], why: 'Wild Thornberrys theme' },
  'rocket power': { queries: ['Rocket Power Theme The Wipeouters'], want: ['wipeouters', 'rocket power'], why: 'Rocket Power theme' },
  'courage the cowardly dog': { queries: ['Courage the Cowardly Dog theme original'], want: ['courage'], why: 'Courage theme' },
  'sailor moon': { queries: ['Sailor Moon Theme English opening Fighting Evil by Moonlight'], want: ['sailor moon'], why: 'Sailor Moon theme' },
  'dragon ball z': { queries: ['Rock the Dragon Dragon Ball Z', 'Dragon Ball Z Rock the Dragon theme'], want: ['rock the dragon', 'dragon ball'], why: 'Rock the Dragon' },
  'reboot': { queries: ['ReBoot theme original'], want: ['reboot'], why: 'ReBoot theme' },
  'freakazoid!': { queries: ['Freakazoid theme original'], want: ['freakazoid'], why: 'Freakazoid theme' },
  'king of the hill': { queries: ['King of the Hill Theme The Refreshments'], want: ['refreshments', 'king of the hill'], why: 'King of the Hill theme' },
  'futurama': { queries: ['Futurama Main Theme Christopher Tyng'], want: ['tyng', 'futurama'], why: 'Futurama theme' },

  // movies
  'home alone': { queries: ['Somewhere in My Memory John Williams Home Alone'], want: ['john williams', 'home alone', 'memory'], why: 'Somewhere in My Memory' },
  'ghost': { queries: ['Unchained Melody Righteous Brothers'], want: ['righteous', 'unchained'], why: 'Unchained Melody' },
  'pretty woman': { queries: ['Oh Pretty Woman Roy Orbison'], want: ['orbison', 'pretty woman'], why: 'Oh, Pretty Woman' },
  'beauty and the beast': { queries: ['Beauty and the Beast Celine Dion Peabo Bryson'], want: ['celine', 'peabo', 'beauty and the beast'], why: 'Beauty and the Beast' },
  'terminator 2: judgment day': { queries: ['Terminator 2 Theme Brad Fiedel'], want: ['fiedel', 'terminator'], why: 'Terminator 2 theme' },
  'aladdin': { queries: ['A Whole New World Peabo Bryson Regina Belle'], want: ['whole new world', 'peabo'], why: 'A Whole New World' },
  "wayne's world": { queries: ['Bohemian Rhapsody Queen'], want: ['queen', 'bohemian'], why: 'Bohemian Rhapsody' },
  'jurassic park': { queries: ['Jurassic Park Theme John Williams'], want: ['john williams', 'jurassic'], why: 'Jurassic Park theme' },
  'the nightmare before christmas': { queries: ['This Is Halloween Danny Elfman'], want: ['halloween', 'elfman'], why: 'This Is Halloween' },
  'mrs. doubtfire': { queries: ['Mrs Doubtfire Main Title Howard Shore'], want: ['doubtfire', 'shore'], why: 'Mrs. Doubtfire score' },
  'the lion king': { queries: ['Circle of Life Elton John Carmen Twillie'], want: ['circle of life', 'elton'], why: 'Circle of Life' },
  'forrest gump': { queries: ['Forrest Gump Suite Alan Silvestri'], want: ['silvestri', 'forrest gump'], why: 'Forrest Gump Suite' },
  'the mask': { queries: ['Cuban Pete Jim Carrey The Mask'], want: ['cuban pete', 'mask'], why: 'Cuban Pete' },
  'toy story': { queries: ["You've Got a Friend in Me Randy Newman"], want: ['randy newman', 'friend in me'], why: "You've Got a Friend in Me" },
  'clueless': { queries: ['Kids in America Kim Wilde'], want: ['kim wilde', 'kids in america'], why: 'Kids in America' },
  'babe': { queries: ['If I Had Words Babe soundtrack'], want: ['babe', 'words'], why: 'If I Had Words' },
  'independence day': { queries: ['Independence Day theme David Arnold'], want: ['david arnold', 'independence'], why: 'Independence Day score' },
  'space jam': { queries: ['Space Jam Quad City DJs'], want: ['quad city', 'space jam'], why: 'Space Jam' },
  'twister': { queries: ['Humans Being Van Halen Twister'], want: ['van halen', 'humans being'], why: 'Humans Being' },
  'men in black': { queries: ['Men in Black Will Smith'], want: ['will smith', 'men in black'], why: 'Men in Black' },
  'titanic': { queries: ['My Heart Will Go On Celine Dion'], want: ['celine', 'heart will go on'], why: 'My Heart Will Go On' },
  'austin powers': { queries: ['Soul Bossa Nova Quincy Jones'], want: ['quincy', 'soul bossa'], why: 'Soul Bossa Nova' },
  'austin powers: international man of mystery': { queries: ['Soul Bossa Nova Quincy Jones'], want: ['quincy', 'soul bossa'], why: 'Soul Bossa Nova' },
  'the truman show': { queries: ['Truman Sleeps Philip Glass'], want: ['philip glass', 'truman'], why: 'Truman Sleeps' },
  'the rugrats movie': { queries: ['Rugrats Theme Mark Mothersbaugh'], want: ['rugrats'], why: 'Rugrats theme' },
  "a bug's life": { queries: ["A Bug's Life Randy Newman"], want: ['randy newman', 'bug'], why: "A Bug's Life score" },
  'the matrix': { queries: ['Clubbed to Death Rob Dougan Matrix'], want: ['dougan', 'clubbed'], why: 'Clubbed to Death' },
  'toy story 2': { queries: ['When She Loved Me Sarah McLachlan'], want: ['mclachlan', 'loved me'], why: 'When She Loved Me' },
  'the iron giant': { queries: ['The Iron Giant Michael Kamen'], want: ['kamen', 'iron giant'], why: 'Iron Giant score' },
  '10 things i hate about you': { queries: ["Can't Take My Eyes Off You Heath Ledger", "Can't Take My Eyes Off You Frankie Valli"], want: ['eyes off you'], why: "Can't Take My Eyes Off You" },
  'the addams family': { queries: ['Addams Family Theme Vic Mizzy'], want: ['mizzy', 'addams'], why: 'Addams Family theme' },
  'home alone 2: lost in new york': { queries: ['Somewhere in My Memory John Williams Home Alone 2'], want: ['john williams', 'memory'], why: 'Somewhere in My Memory' },
  'the sandlot': { queries: ['The Sandlot theme David Newman'], want: ['sandlot'], why: 'The Sandlot score' },
  'cool runnings': { queries: ['I Can See Clearly Now Jimmy Cliff'], want: ['jimmy cliff', 'clearly'], why: 'I Can See Clearly Now' },
  'the flintstones': { queries: ['Meet the Flintstones'], want: ['flintstones'], why: 'Meet the Flintstones' },
  'the santa clause': { queries: ['The Santa Clause Michael Convertino'], want: ['santa clause'], why: 'The Santa Clause score' },
  'ace ventura: when nature calls': { queries: ['Ace Ventura When Nature Calls soundtrack'], want: ['ace ventura'], why: 'Ace Ventura' },
  'casper': { queries: ['Casper the Friendly Ghost James Horner'], want: ['casper'], why: 'Casper' },
  'jumanji': { queries: ['Jumanji theme James Horner'], want: ['jumanji', 'horner'], why: 'Jumanji score' },
  'apollo 13': { queries: ['Apollo 13 theme James Horner'], want: ['apollo', 'horner'], why: 'Apollo 13 score' },
  'pocahontas': { queries: ['Colors of the Wind Vanessa Williams'], want: ['colors of the wind', 'vanessa'], why: 'Colors of the Wind' },
  'a goofy movie': { queries: ['I 2 I A Goofy Movie Powerline', 'Stand Out A Goofy Movie'], want: ['goofy', 'powerline', 'stand out', 'i 2 i'], why: 'I 2 I' },
  'the hunchback of notre dame': { queries: ['Topsy Turvy Hunchback of Notre Dame'], want: ['topsy', 'hunchback'], why: 'Topsy Turvy' },
  'matilda': { queries: ['Matilda Little Bitty Pretty One'], want: ['matilda'], why: 'Matilda' },
  'hercules': { queries: ['Zero to Hero Hercules Disney'], want: ['zero to hero', 'hercules'], why: 'Zero to Hero' },
  'the fifth element': { queries: ['Diva Dance Eric Serra Fifth Element'], want: ['serra', 'diva', 'fifth element'], why: 'Diva Dance' },
  'mulan': { queries: ["I'll Make a Man Out of You Donny Osmond"], want: ['man out of you', 'mulan'], why: "I'll Make a Man Out of You" },
  'the parent trap': { queries: ['Lets Get Together Hayley Mills Parent Trap'], want: ['get together', 'parent trap'], why: "Let's Get Together" },
  'armageddon': { queries: ["I Don't Want to Miss a Thing Aerosmith"], want: ['aerosmith', 'miss a thing'], why: "I Don't Want to Miss a Thing" },
  'the mask of zorro': { queries: ['I Want to Spend My Lifetime Loving You Marc Anthony Tina Arena'], want: ['lifetime loving you', 'zorro'], why: 'I Want to Spend My Lifetime Loving You' },
  'star wars: episode i – the phantom menace': { queries: ['Duel of the Fates John Williams'], want: ['duel of the fates', 'williams'], why: 'Duel of the Fates' },
  'the sixth sense': { queries: ['The Sixth Sense James Newton Howard'], want: ['sixth sense', 'howard'], why: 'The Sixth Sense score' },
  'the mummy': { queries: ['The Mummy theme Jerry Goldsmith'], want: ['mummy', 'goldsmith'], why: 'The Mummy score' },
  'tarzan': { queries: ["You'll Be in My Heart Phil Collins"], want: ['phil collins', 'heart'], why: "You'll Be in My Heart" },
  "she's all that": { queries: ['Kiss Me Sixpence None the Richer'], want: ['sixpence', 'kiss me'], why: 'Kiss Me' },
  'american pie': { queries: ['American Pie Don McLean'], want: ['don mclean', 'american pie'], why: 'American Pie' },
  'pokémon: the first movie': { queries: ['Pokemon Theme Jason Paige'], want: ['jason paige', 'pokemon'], why: 'Pokémon theme' },

  // games
  'super mario world': { queries: ['Super Mario World Athletic Koji Kondo'], want: ['mario', 'kondo'], why: 'Super Mario World' },
  'sonic the hedgehog': { queries: ['Green Hill Zone Masato Nakamura'], want: ['green hill', 'nakamura'], why: 'Green Hill Zone' },
  'street fighter ii': { queries: ['Street Fighter II Ryu Stage Capcom'], want: ['street fighter', 'ryu'], why: 'Street Fighter II' },
  'sonic the hedgehog 2': { queries: ['Chemical Plant Zone Masato Nakamura Sonic 2'], want: ['chemical plant', 'sonic'], why: 'Chemical Plant Zone' },
  'super mario kart': { queries: ['Super Mario Kart Rainbow Road Koji Kondo'], want: ['mario kart', 'rainbow'], why: 'Rainbow Road' },
  'mortal kombat': { queries: ['Mortal Kombat The Immortals'], want: ['immortals', 'mortal kombat'], why: 'Mortal Kombat' },
  'nba jam': { queries: ['NBA Jam arcade soundtrack'], want: ['nba jam'], why: 'NBA Jam' },
  'doom': { queries: ["At Doom's Gate Robert Prince E1M1"], want: ['doom', 'prince'], why: "At Doom's Gate" },
  'mortal kombat ii': { queries: ['Mortal Kombat The Immortals'], want: ['immortals', 'mortal kombat'], why: 'Mortal Kombat' },
  'star fox': { queries: ['Star Fox Main Theme Nintendo'], want: ['star fox'], why: 'Star Fox theme' },
  "the legend of zelda: link's awakening": { queries: ["Link's Awakening Ballad of the Wind Fish"], want: ['zelda', 'wind fish', 'awakening'], why: "Link's Awakening" },
  'donkey kong country': { queries: ['DK Island Swing David Wise'], want: ['david wise', 'donkey kong'], why: 'DK Island Swing' },
  'super metroid': { queries: ['Super Metroid Theme of Samus Aran'], want: ['metroid', 'samus'], why: 'Super Metroid' },
  'final fantasy vi': { queries: ['Final Fantasy VI Terra Nobuo Uematsu'], want: ['uematsu', 'terra', 'final fantasy'], why: 'Terra' },
  'earthbound': { queries: ['EarthBound Pollyanna Hirokazu Tanaka'], want: ['earthbound', 'pollyanna'], why: 'Pollyanna' },
  'sonic the hedgehog 3': { queries: ['Ice Cap Zone Sonic 3'], want: ['ice cap', 'sonic'], why: 'Ice Cap Zone' },
  'earthworm jim': { queries: ['Earthworm Jim Tommy Tallarico'], want: ['earthworm', 'tallarico'], why: 'Earthworm Jim' },
  'chrono trigger': { queries: ['Chrono Trigger Main Theme Yasunori Mitsuda'], want: ['mitsuda', 'chrono'], why: 'Chrono Trigger' },
  'super mario world 2: yoshi\'s island': { queries: ["Yoshi's Island Athletic Koji Kondo"], want: ['yoshi', 'kondo'], why: "Yoshi's Island" },
  'donkey kong country 2': { queries: ['Stickerbush Symphony David Wise'], want: ['stickerbush', 'david wise'], why: 'Stickerbush Symphony' },
  'twisted metal': { queries: ['Twisted Metal title theme'], want: ['twisted metal'], why: 'Twisted Metal' },
  'super mario 64': { queries: ['Bob-omb Battlefield Koji Kondo Super Mario 64'], want: ['mario 64', 'bob-omb', 'kondo'], why: 'Bob-omb Battlefield' },
  'pokémon red and blue': { queries: ['Pokemon Theme Jason Paige'], want: ['jason paige', 'pokemon'], why: 'Pokémon theme' },
  'crash bandicoot': { queries: ['N Sanity Beach Crash Bandicoot Josh Mancell'], want: ['crash', 'mancell', 'sanity'], why: 'N. Sanity Beach' },
  'tomb raider': { queries: ['Tomb Raider Theme Nathan McCree'], want: ['tomb raider'], why: 'Tomb Raider theme' },
  'resident evil': { queries: ['Resident Evil Save Room theme Capcom'], want: ['resident evil'], why: 'Resident Evil' },
  'mario kart 64': { queries: ['Mario Kart 64 Rainbow Road'], want: ['mario kart', 'rainbow'], why: 'Rainbow Road 64' },
  'quake': { queries: ['Quake theme Trent Reznor'], want: ['quake'], why: 'Quake' },
  'wave race 64': { queries: ['Wave Race 64 theme Nintendo'], want: ['wave race'], why: 'Wave Race 64' },
  'final fantasy vii': { queries: ["Aerith's Theme Nobuo Uematsu Final Fantasy VII"], want: ['uematsu', 'aerith'], why: "Aerith's Theme" },
  'castlevania: symphony of the night': { queries: ["Dracula's Castle Michiru Yamane"], want: ['yamane', 'dracula', 'castlevania'], why: "Dracula's Castle" },
  'star fox 64': { queries: ['Star Fox 64 Corneria theme'], want: ['star fox'], why: 'Star Fox 64' },
  'gran turismo': { queries: ['Moon Over the Castle Gran Turismo Masahiro Andoh'], want: ['gran turismo', 'moon over the castle'], why: 'Moon Over the Castle' },
  'diddy kong racing': { queries: ['Diddy Kong Racing theme'], want: ['diddy kong'], why: 'Diddy Kong Racing' },
  'tekken 3': { queries: ['Tekken 3 opening theme'], want: ['tekken'], why: 'Tekken 3' },
  'the legend of zelda: ocarina of time': { queries: ['Ocarina of Time Title Theme Koji Kondo'], want: ['ocarina', 'zelda', 'kondo'], why: 'Ocarina of Time' },
  'goldeneye 007': { queries: ['GoldenEye 007 multiplayer theme original soundtrack'], want: ['goldeneye'], why: 'GoldenEye 007' },
  'metal gear solid': { queries: ['Theme of Solid Snake Metal Gear Solid'], want: ['solid snake', 'metal gear'], why: 'Theme of Solid Snake' },
  'banjo-kazooie': { queries: ['Spiral Mountain Banjo-Kazooie Grant Kirkhope'], want: ['banjo', 'kirkhope', 'spiral'], why: 'Spiral Mountain' },
  'spyro the dragon': { queries: ['Spyro the Dragon title theme Stewart Copeland'], want: ['spyro'], why: 'Spyro theme' },
  'half-life': { queries: ['Hazardous Environments Half-Life Kelly Bailey'], want: ['half-life', 'hazardous'], why: 'Hazardous Environments' },
  'starcraft': { queries: ['StarCraft Terran Theme Glenn Stafford'], want: ['starcraft', 'terran'], why: 'Terran Theme' },
  'resident evil 2': { queries: ['Resident Evil 2 soundtrack Capcom'], want: ['resident evil'], why: 'Resident Evil 2' },
  'mario party': { queries: ['Mario Party theme Nintendo'], want: ['mario party'], why: 'Mario Party' },
  'super smash bros.': { queries: ['Super Smash Bros Menu Nintendo 64'], want: ['smash'], why: 'Smash Menu' },
  "tony hawk's pro skater": { queries: ['Superman Goldfinger'], want: ['goldfinger', 'superman'], why: 'Superman' },
  'silent hill': { queries: ['Silent Hill Theme Akira Yamaoka'], want: ['yamaoka', 'silent hill'], why: 'Silent Hill' },
  'donkey kong 64': { queries: ['DK Rap Donkey Kong 64'], want: ['dk rap', 'donkey kong'], why: 'DK Rap' },
  'pokémon gold and silver': { queries: ['Pokemon Johto Born to Be a Winner', 'Pokemon Theme Jason Paige'], want: ['pokemon'], why: 'Pokémon Johto' },
  'soulcalibur': { queries: ['Soulcalibur character select theme'], want: ['soulcalibur'], why: 'Soulcalibur' },

  // fads
  'game boy': { queries: ['Tetris Theme Type A Hirokazu Tanaka'], want: ['tetris'], why: 'Tetris' },
  'super nintendo': { queries: ['Super Mario World Athletic Koji Kondo'], want: ['mario', 'kondo'], why: 'Super Mario World' },
  'sega genesis': { queries: ['Green Hill Zone Masato Nakamura'], want: ['green hill', 'nakamura'], why: 'Green Hill Zone' },
  'x-men figures': { queries: ['X-Men Animated Series theme Ron Wasserman'], want: ['x-men'], why: 'X-Men theme' },
  'mighty morphin power rangers figures': { queries: ['Go Go Power Rangers Ron Wasserman'], want: ['wasserman', 'power ranger'], why: 'Go Go Power Rangers' },
  'windows 95': { queries: ['Start Me Up Rolling Stones'], want: ['rolling stones', 'start me up'], why: 'Start Me Up' },
  'nintendo 64': { queries: ['Bob-omb Battlefield Koji Kondo Super Mario 64'], want: ['mario'], why: 'Mario 64' },
  'tickle me elmo': { queries: ['Sesame Street Theme'], want: ['sesame'], why: 'Sesame Street' },
  'sony playstation': { queries: ['N Sanity Beach Crash Bandicoot'], want: ['crash'], why: 'Crash Bandicoot' },
  'pokémon trading cards': { queries: ['Pokemon Theme Jason Paige'], want: ['jason paige', 'pokemon'], why: 'Pokémon theme' },
  'barbie dream house': { queries: ['Barbie Girl Aqua'], want: ['aqua', 'barbie girl'], why: 'Barbie Girl' },
  'spice girls dolls': { queries: ['Wannabe Spice Girls'], want: ['spice girls', 'wannabe'], why: 'Wannabe' },
  'nokia 3310': { queries: ['Nokia Tune Gran Vals'], want: ['nokia'], why: 'Nokia Tune' },
  'gak': { queries: ['Nickelodeon theme song original'], want: ['nickelodeon'], why: 'Nickelodeon' },
};

function norm(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

const CUE_MAP = Object.fromEntries(Object.entries(CUES).map(([k, v]) => [norm(k), v]));

export function cueFor(item) {
  return CUE_MAP[norm(item.title)] || null;
}

export function queriesFor(item) {
  const cue = cueFor(item);
  if (cue?.queries?.length) return cue.queries;
  if (item.cat === 'music') return [`${item.title} ${item.meta || ''}`, item.title];
  if (item.cue) return [item.cue];
  return [];
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
    want.forEach((w) => { if (w && blob.includes(w)) score += 5; });
    titleBits.forEach((w) => { if (blob.includes(w)) score += 1; });
    if (/original soundtrack|official|theme song|main title/.test(blob)) score += 2;

    if (item.cat === 'music') {
      const artistBits = norm(item.meta).split(' ').filter((w) => w.length > 2 && !['the', 'and'].includes(w));
      const artistHits = artistBits.filter((w) => blob.includes(w)).length;
      if (artistBits.length && !artistHits) score = -99;
      else score += artistHits * 6;
      if (blob.includes(norm(item.title).slice(0, 16))) score += 6;
    } else if (cue) {
      const wantHits = want.filter((w) => w && blob.includes(w)).length;
      if (!wantHits) score = -99;
      if (want.length >= 2 && wantHits < 1) score = -99;
    }
    return { t, score };
  }).filter((row) => row.score >= 6);

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.t || null;
}

export function labelFor(track, item) {
  const cue = cueFor(item);
  if (cue?.why) return `${cue.why} · ${track.artistName}`;
  return `${track.artistName} — ${track.trackName}`;
}
