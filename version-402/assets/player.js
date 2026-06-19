import { H as Hls } from './hls-dru42stk.js';

function attachHls(video, sourceUrl) {
  if (!sourceUrl) {
    return Promise.reject(new Error('missing video source'));
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = sourceUrl;
    return Promise.resolve();
  }

  if (Hls && Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(sourceUrl);
    hls.attachMedia(video);
    video._hlsInstance = hls;
    return Promise.resolve();
  }

  video.src = sourceUrl;
  return Promise.resolve();
}

function setupPlayer(player) {
  var video = player.querySelector('video[data-src]');
  var trigger = player.querySelector('.play-trigger');

  if (!video || !trigger) {
    return;
  }

  trigger.addEventListener('click', function () {
    trigger.classList.add('is-hidden');

    attachHls(video, video.getAttribute('data-src'))
      .then(function () {
        return video.play();
      })
      .catch(function () {
        trigger.classList.remove('is-hidden');
        trigger.querySelector('strong').textContent = '播放失败，请重试';
      });
  });
}

document.querySelectorAll('[data-player]').forEach(setupPlayer);
