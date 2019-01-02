import fs from 'fs';

let statsStats = [];

export function getChunks() {
  return statsStats;
}

function waitWatchFile({ path, onChange, timeout = 60000 } = {}) {
  console.log('>>>>>>>>>>>>>>>>> STATS.JS > waitWatchFile 11111 <<<<<<<<<<<<<<<<<');
  function watch(loaded, timeleft) {
    console.log('>>>>>>>>>>>>>>>>> STATS.JS > waitWatchFile 2222 <<<<<<<<<<<<<<<<<');
    return new Promise((resolve, reject) => {
      if (timeleft < 0) {
        loaded = true;
        return reject(new Error(`waitFile: timeout (${timeout}ms): ${path}`));
      }

      // Simple first read for production
      if (!loaded) {
        fs.access(path, fs.constants.R_OK, err => {
          if (!err && !loaded) {
            fs.readFile(path, 'utf8', (err2, data) => {
              if (err2) return reject(err2);
              loaded = true;
              resolve(data);
            });
          }
        });
      }

      if (!__DEVELOPMENT__) {
        return;
      }

      try {
        const watcher = fs.watch(path, 'utf8', eventType => {
          if (eventType !== 'change') return;
          fs.readFile(path, 'utf8', (err2, data) => {
            if (err2) return onChange(err2);
            loaded = true;
            onChange(null, data);
          });
        });

        setTimeout(() => {
          watcher.close();
          if (!loaded) {
            loaded = true;
            reject(new Error(`waitFile: timeout (${timeout}ms): ${path}`));
          }
        }, timeleft);
      } catch (err) {
        if (err.code === 'ENOENT') {
          return setTimeout(() => resolve(watch(loaded, timeleft - 100)), 100);
        }
        loaded = true;
        reject(err);
      }
    });
  }
  return watch(false, timeout);
}

function parse(json) {
  try {
    return JSON.parse(json);
  } catch (e) {
    return statsStats;
  }
}

export async function waitStats(statsPath, timeout) {
  const statsStatsJson = await waitWatchFile({
    path: statsPath,
    onChange(err, stats) {
      if (err) {
        throw new Error('Unable to load stats');
      }
      statsStats = parse(stats);
    },
    timeout
  });
  console.log('>>>>>>>>>>>>>>>>> STATS.JS > waitStats > statsStatsJson <<<<<<<<<<<<<<<<<');
  statsStats = parse(statsStatsJson);
  console.log('>>>>>>>>>>>>>>>>> STATS.JS > waitStats > statsStats <<<<<<<<<<<<<<<<<');
  return statsStats;
}
