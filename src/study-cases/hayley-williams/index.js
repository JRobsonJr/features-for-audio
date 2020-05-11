const getAudioFeatures = require('../../scripts/get-audio-features');
const data = require('./album-data');
const token = 'spotify-token';

getAudioFeatures(data, token, './audio-features.csv', './album-summaries.csv')
  .then(() => console.log('Done!'));
