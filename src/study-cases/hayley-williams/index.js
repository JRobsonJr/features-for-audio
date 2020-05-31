const { main: getAudioFeatures, getAlbumSummary } = require('../../scripts/get-audio-features');
const writeAudioFeatures = require('../../scripts/write-audio-features');

const data = require('./album-data');
const token = 'spotify-token';

getAudioFeatures(data, token, './audio-features.csv', './album-summaries.csv')
  .then(({ audioFeatures }) => {
    const paramore = audioFeatures.filter(aF => aF.albumName !== 'Petals For Armor');
    const hayley = audioFeatures.filter(aF => aF.albumName === 'Petals For Armor');
    const paramoreSummary = getAlbumSummary(paramore, 'Paramore Discography');
    const hayleySummary = getAlbumSummary(hayley, 'Petals For Armor');
    writeAudioFeatures('albums', [...paramoreSummary, ...hayleySummary], './hayley-v-paramore.csv');
    console.log('Done!');
  });
