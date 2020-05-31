const spotify = require('spotify-web-sdk');
const writeAudioFeatures = require('./write-audio-features');
const _ = require('lodash');

const main = async (albums, spotifyToken, audioFeaturesFilePath, albumSummariesFilePath) => {
  let audioFeatures = [];
  let albumSummaries = [];
  for (const { name, tracks } of albums) {
    console.log(`Retrieving from album ${name}...`);
    const albumAudioFeatures = await getAlbumAudioFeatures(spotifyToken, tracks, name);
    audioFeatures = audioFeatures.concat(albumAudioFeatures);
    albumSummaries = albumSummaries.concat(getAlbumSummary(albumAudioFeatures, name));
  }
  writeAudioFeatures('tracks', audioFeatures, audioFeaturesFilePath);
  writeAudioFeatures('albums', albumSummaries, albumSummariesFilePath);
  return { audioFeatures, albumSummaries };
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

const median = (values) => {
  const sortedValues = values.sort();
  const length = sortedValues.length;
  if (length % 2 === 0) {
    return (sortedValues[length / 2] + sortedValues[(length / 2) - 1]) / 2;
  } else {
    return sortedValues[(length - 1) / 2];
  }
};

const getAlbumSummary = (albumAudioFeatures, albumName) => {
  const albumSummaryFeatures = [
    'acousticness', 'danceability', 'durationMs', 'energy', 'instrumentalness',
    'liveness', 'loudness', 'speechiness', 'tempo', 'valence'
  ];
  
  return albumSummaryFeatures.map(feature => ({
    feature,
    albumName,
    med: median(albumAudioFeatures.map(aF => aF[feature])),
    avg: _.sumBy(albumAudioFeatures, feature) / albumAudioFeatures.length,
    max: _.maxBy(albumAudioFeatures, feature)[feature],
    min: _.minBy(albumAudioFeatures, feature)[feature]
  }));
}

module.exports = { main, getAlbumSummary };
