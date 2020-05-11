const spotify = require('spotify-web-sdk');
const fs = require('fs');
const _ = require('lodash');

const attributes = [ 
  'name', 'trackNumber', 'albumName', 'id', 'acousticness', 'danceability',
  'durationMs', 'energy', 'instrumentalness', 'key', 'liveness', 'loudness',
  'mode', 'speechiness', 'tempo', 'timeSignature', 'valence'
];
const albumSummaryFeatures = [
  'acousticness', 'danceability', 'durationMs', 'energy', 'instrumentalness',
  'liveness', 'loudness', 'speechiness', 'tempo', 'valence'
];

const main = async (albums, spotifyToken, audioFeaturesFilePath, albumSummariesFilePath) => {
  let audioFeatures = [];
  let albumSummaries = [];
  for (const { name, tracks } of albums) {
    console.log(`Retrieving from album ${name}...`);
    const albumAudioFeatures = await getAlbumAudioFeatures(spotifyToken, tracks, name);
    audioFeatures = audioFeatures.concat(albumAudioFeatures);
    albumSummaries = albumSummaries.concat(getAlbumSummary(albumAudioFeatures, name));
  }
  writeTracksAudioFeatures(audioFeatures, audioFeaturesFilePath);
  writeAlbumSummaries(albumSummaries, albumSummariesFilePath);
}


const getAlbumAudioFeatures = async (spotifyToken, tracks, albumName) => {
  spotify.init({ token: spotifyToken });
  const albumAudioFeatures = await spotify.getAudioFeaturesForSeveralTracks(
    tracks.map(item => item.id)
  );
  return albumAudioFeatures.map((trackAudioFeatures, index) => ({
    ...trackAudioFeatures,
    albumName,
    name: tracks.find(track => track.id === trackAudioFeatures.id).name,
    trackNumber: index + 1
  }));
}

const getAlbumSummary = (albumAudioFeatures, albumName) => {
  const average = albumSummaryFeatures.map(feature => ({
    feature,
    albumName,
    value: _.sumBy(albumAudioFeatures, feature) / albumAudioFeatures.length
  }));

  const max = albumSummaryFeatures.map(feature => ({
    feature,
    albumName: `${albumName}_max`,
    value: _.maxBy(albumAudioFeatures, feature)[feature]
  }));

  const min = albumSummaryFeatures.map(feature => ({
    feature,
    albumName: `${albumName}_min`,
    value: _.minBy(albumAudioFeatures, feature)[feature]
  }));

  return [].concat(average, max, min);
}

const writeTracksAudioFeatures = (audioFeatures, filePath) => {
  const stream = fs.createWriteStream(filePath);
  stream.once('open', () => {
    stream.write(`${attributes.join(',')}\n`);
    audioFeatures.forEach(track => {
      const values = attributes.map(attribute => track[attribute]);
      stream.write(`${values.join(',')}\n`);
    })
    stream.end();
  });
}

const writeAlbumSummaries = (albumSummaries, filePath) => {
  const stream = fs.createWriteStream(filePath);
  stream.once('open', () => {
    const columns = ['feature', 'albumName', 'value'];
    stream.write(`${columns.join(',')}\n`);
    albumSummaries.forEach(albumSummary => {
      const values = columns.map(attribute => albumSummary[attribute]);
      stream.write(`${values.join(',')}\n`);
    })
    stream.end();
  });
}

module.exports = main;
