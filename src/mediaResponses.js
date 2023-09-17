const fs = require('fs');
const path = require('path');

const getFile = (request, response, relPath, contentType) => {
  const file = path.resolve(__dirname, relPath);

  fs.stat(file, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        response.writeHead(404);
      }
      return response.end(err);
    }

    let { range } = request.headers;

    if (!range) {
      range = 'bytes=0-';
    }

    const positions = range.replace(/bytes=/, '').split('-');

    let start = parseInt(positions[0], 10);

    const total = stats.size;
    const end = positions[1] ? parseInt(positions[1], 10) : total - 1;

    if (start > end) {
      start = end - 1;
    }

    const chunksize = (end - start) + 1;

    response.writeHead(206, {
      'Content-Type': /* 'video/mp4' */contentType,
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
    });

    const stream = fs.createReadStream(file, { start, end });

    stream.on('open', () => {
      stream.pipe(response);
    });

    stream.on('error', (streamErr) => {
      response.end(streamErr);
    });

    return stream;
  });
};

const getParty = (request, response) => getFile(request, response, '../client/party.mp4', 'video/mp4');
const getBling = (request, response) => getFile(request, response, '../client/bling.mp3', 'audio/mpeg');
const getBird = (request, response) => getFile(request, response, '../client/bird.mp4', 'video/mp4');

module.exports = {
  getParty,
  getBling,
  getBird,
};
