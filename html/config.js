// Everything on the loading screen you'd want to change is here.
// Files you add go in the media folder next to this one.

window.LOADING = {
    name: '', // empty uses your server's name from server.cfg
    tagline: 'Serious roleplay, built by its community',
    logo: 'logo.svg',

    // the two colours used for the progress bar and highlights
    accent: '#9c2cf1',
    accent2: '#2bd9cc',

    // images or videos that fade from one to the next, like 'media/city.jpg'
    // or 'media/trailer.webm'. Leave empty for the animated background.
    backgrounds: [],
    slideSeconds: 9,

    // { file: 'media/song.mp3', title: 'Song name', artist: 'Artist' }
    music: [],
    volume: 0.3,
    shuffle: true,

    tips: [
        'Press F1 to open your phone.',
        'Read the rules on our Discord before you start.',
        'Need help in game? Type /report and staff will get to you.',
        'Your car is saved in the garage you last used.',
        'Respect other players and their roleplay.',
    ],
    tipSeconds: 7,

    // shown under the server info. Leave empty for none.
    announcements: [
        // { title: 'Season 2 is live', text: 'New jobs, new businesses and a reworked economy.' },
    ],

    links: [
        { label: 'Discord', url: 'https://discord.gg/yourserver' },
        { label: 'Rules', url: '' },
        { label: 'Website', url: '' },
    ],
};
