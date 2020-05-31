const fs = require('fs');

const trackColumns = [
  'name', 'trackNumber', 'albumName', 'id', 'acousticness', 'danceability',
  'durationMs', 'energy', 'instrumentalness', 'key', 'liveness', 'loudness',
  'mode', 'speechiness', 'tempo', 'timeSignature', 'valence'
];
const albumColumns = ['feature', 'albumName', 'med', 'avg', 'max', 'min'];

const escapeCommas = (value) => {
  if (typeof value === 'string' && value.includes(',')) {
    return `"${value}"`;
  } else {
    return value;
  }
}

const writeAudioFeatures = (type, audioFeatures, filePath) => {
  const stream = fs.createWriteStream(filePath);
  const attributes = type === 'tracks' ? trackColumns : albumColumns;
  stream.once('open', () => {
    stream.write(`${attributes.join(',')}\n`);
    audioFeatures.forEach(aF => {
      const values = attributes.map(attribute => aF[attribute]);
      stream.write(`${values.map(escapeCommas)}\n`);
    })
    stream.end();
  });
}

module.exports = writeAudioFeatures;
