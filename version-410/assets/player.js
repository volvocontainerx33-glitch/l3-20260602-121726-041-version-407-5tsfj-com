(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function getHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    return Promise.resolve(null);
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));

    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var overlay = shell.querySelector('.player-overlay');
      var startButton = shell.querySelector('.player-start');
      var source = shell.getAttribute('data-source');
      var started = false;
      var hlsInstance = null;

      function hideOverlay() {
        if (overlay) {
          overlay.classList.add('hidden');
        }
      }

      function loadNative() {
        video.src = source;
        video.load();
        return Promise.resolve();
      }

      function loadHls() {
        return getHls().then(function (HlsClass) {
          if (HlsClass && HlsClass.isSupported()) {
            hlsInstance = new HlsClass({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            return new Promise(function (resolve) {
              video.addEventListener('loadedmetadata', resolve, { once: true });
              setTimeout(resolve, 1200);
            });
          }

          return loadNative();
        });
      }

      function start() {
        if (!video || !source) {
          return;
        }

        hideOverlay();
        video.controls = true;

        var loadPromise;
        if (!started) {
          started = true;
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            loadPromise = loadNative();
          } else {
            loadPromise = loadHls();
          }
        } else {
          loadPromise = Promise.resolve();
        }

        loadPromise.then(function () {
          video.play().catch(function () {});
        });
      }

      if (overlay) {
        overlay.addEventListener('click', start);
      }

      if (startButton) {
        startButton.addEventListener('click', function (event) {
          event.stopPropagation();
          start();
        });
      }

      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            start();
          }
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
