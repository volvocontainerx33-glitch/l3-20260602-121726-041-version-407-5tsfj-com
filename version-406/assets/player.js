(function () {
  function initMoviePlayer(source) {
    var video = document.getElementById('movie-player');
    var overlay = document.getElementById('play-overlay');
    var errorBox = document.getElementById('player-error');
    var attached = false;
    var attaching = false;
    var queue = [];
    var hlsInstance = null;

    if (!video || !overlay || !source) {
      return;
    }

    function showError(message) {
      if (errorBox) {
        errorBox.textContent = message || '播放加载失败，请稍后重试';
        errorBox.hidden = false;
      }
      overlay.classList.remove('is-hidden');
    }

    function flush(success) {
      var callbacks = queue.slice();
      queue = [];
      callbacks.forEach(function (item) {
        if (success) {
          item.done();
        } else {
          item.fail();
        }
      });
    }

    function loadHls(callback, fail) {
      if (window.Hls) {
        callback();
        return;
      }

      var existing = document.querySelector('script[data-hls-loader="true"]');

      if (existing) {
        existing.addEventListener('load', callback, { once: true });
        existing.addEventListener('error', fail, { once: true });
        return;
      }

      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
      script.async = true;
      script.setAttribute('data-hls-loader', 'true');
      script.addEventListener('load', callback, { once: true });
      script.addEventListener('error', fail, { once: true });
      document.head.appendChild(script);
    }

    function attachSource(done, fail) {
      if (attached) {
        done();
        return;
      }

      queue.push({
        done: done,
        fail: fail
      });

      if (attaching) {
        return;
      }

      attaching = true;

      function complete() {
        attached = true;
        attaching = false;
        flush(true);
      }

      function reject() {
        attached = false;
        attaching = false;
        flush(false);
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        complete();
        return;
      }

      loadHls(function () {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, complete);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              reject();
            }
          });
          return;
        }

        video.src = source;
        complete();
      }, reject);
    }

    function startPlay() {
      if (errorBox) {
        errorBox.hidden = true;
      }

      overlay.classList.add('is-hidden');

      attachSource(function () {
        var promise = video.play();

        if (promise && promise.catch) {
          promise.catch(function () {
            showError('播放加载失败，请稍后重试');
          });
        }
      }, function () {
        showError('播放加载失败，请稍后重试');
      });
    }

    overlay.addEventListener('click', startPlay);

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlay();
      }
    });

    attachSource(function () {}, function () {});

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
