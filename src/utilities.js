import {gapi} from "gapi-script";
import mainStore from "./stores/mainStore.js";
import driveData from "./stores/driveData.js";

/**
 * Updates a given file with the given content.
 * @param {String} fileID - ID of the file to update.
 * @param {*} rawContent - Raw data to send.
 * @returns {Promise<void>}
 */
export const updateFile = async (fileID, rawContent) => {
  try {
    const response = await gapi.client.request({
      path: '/upload/drive/v3/files/' + fileID,
      method: 'PATCH',
      params: {
        uploadType: 'media'
      },
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(rawContent)
    })

    console.log('File updated with ID:', response);
  } catch (error) {
    console.error('Error updating file content:', error);
  }
}

/**
 * Handles inserting the new entry into the store and updating meta stats.
 * @param {String} mediaType - Type of media being added.
 * @param {Object} store - Zustand store
 * @param {Number} year - Year the entry is for.
 * @param {Object} data - Processed form data for new entry.
 * @param {Object} meta - Zustand meta store copy to update.
 * @returns {*} - Updated copy of the Zustand stores.
 */
export const addEntry = (mediaType, store, year, data, meta) => {
  //Add entry to movie file
  let date = mediaType === 'movie' ? 'dateWatched': 'dateStarted';
  if (!store[year]) {
    store[year] = [data];
  } else {
    store[year].push(data);
    //Sort new to old
    store[year].sort((a, b) => {
      let aDates = a[date].split('-').map(v => {return parseInt(v)});
      let bDates = b[date].split('-').map(v => {return parseInt(v)});
      if (aDates[1] !== bDates[1]) {
        return bDates[1] - aDates[1];
      } else {
        return bDates[2] - aDates[2];
      }
    });
  }
  //TODO: calculate stats and inset into meta file
  return { store: store, tempMeta: meta };
}

/**
 * Updates the appropriate Zustand store and cloud file with new data.
 * @param {String} type - Media type.
 * @param {Object} newData - New data to insert into the store.
 * @param {Object} newMeta - Updated meta store.
 * @returns {Promise<unknown>}
 */
export const updateCloudAndStores = async (type, newData, newMeta) => {
  const { meta, setMeta , setMovies, setShows, setGames, setBooks } = driveData.getState();
  const { setUpdateFlag } = mainStore.getState();

  return new Promise((resolve, reject) => {
    let firstUpdated = false;

    //Resolves the function when both files have been updated.
    const postUpdate = () => {
      if (firstUpdated) {
        //Both files updates complete
        setUpdateFlag();
        resolve();
      } else {
        //Only one file finished updating
        firstUpdated = true;
      }

    }

    //Update date in Zustand store
    if (type === 'movie') {
      //Add entry to movie file
      setMovies(newData);
      updateFile(meta.fileIds.movies, newData).then(postUpdate);
    } else if (type === 'tv') {
      //Add entry to TV file
      setShows(newData);
      updateFile(meta.fileIds.tv, newData).then(postUpdate);
    } else if (type === 'game') {
      //Add entry to Game file
      setGames(newData);
      updateFile(meta.fileIds.game, newData).then(postUpdate);
    } else if (type === 'book') {
      //Add entry to Game file
      setBooks(newData);
      updateFile(meta.fileIds.book, newData).then(postUpdate);
    }
    //Update meta file
    setMeta(newMeta);
    updateFile(meta.fileIds.metaData, newMeta).then(postUpdate);
  });
}

/**
 * Returns a copy of the appropriate Zustand store.
 * @param {String} type - Media type.
 * @returns {{}} - Zustand data
 */
export const getStore = (type) => {
  const { movies, shows, games, books} = driveData.getState();
  if (type === 'movie') {
    return movies;
  } else if (type === 'tv') {
    return shows;
  } else if (type === 'game') {
    return games
  } else if (type === 'book') {
    return books;
  }
}

/**
 * Removes an entry from the given media type.
 * @param {String} mediaType - The type of media to remove from;
 * @param {Object} store - Zustand store to update.
 * @param {Number} entryId - ID of the media file.
 * @param {Number} year - Year of media consumption.
 * @param {Object} meta - Zustand metadata to update stats for.
 */
export const deleteEntry = (mediaType, store, entryId, year, meta) => {
  const val = store[year].filter(v => {return v.entryId === entryId});
  if (val.length === 1) {
    const i = store[year].indexOf(val[0]);
    switch (mediaType) {
      case 'movie':
        break;
      case 'tv':
        break;
      case 'game':
        break;
      case 'book':
        break;
    }
    store[year].splice(i, 1);
    //TODO calculate meta stats
    return { store: store, tempMeta: meta };
  } else {
    console.log(`Error: too many results returned for ${mediaType} with ID ${entryId}`);
  }
}

/**
 * Calculates if a watch date is in the new release window.
 * @param {String} release - Release date of the media.
 * @param {String} watch - Date watched/started watching.
 * @param {Object} type - Media type.
 * @param {Object} settings - User settings.
 * @returns {boolean} - If in new release window.
 */
export const calcNewRelease = (release, watch, type, settings) => {
  release = new Date(release);
  watch = new Date(watch);
  let monthDiff = watch.getMonth() - release.getMonth();
  const dayDiff = watch.getDay() - release.getDay();
  if (dayDiff < 0) {
    monthDiff = monthDiff - 1;
  }
  return monthDiff <= settings.newRelease[type.value]
}

/**
 * Stat collection options for each media type.
 */
export const statDefaults = {
  'movie': {
    'total': 0,
    'scores': [],
    'release': {
      'new': 0,
      'old': 0,
    },
    'locations': {},
    'people': {
      'alone': 0
    },
    'runtimes': [],
  },
  'tv': {
    'total': 0,
    'scores': [],
    'release': {
      'new': 0,
      'old': 0,
    },
    'episodes': 0,
    'runtimes': [],
  },
  'game': {
    'total': 0,
    'scores': [],
    'release': {
      'new': 0,
      'old': 0,
    },
    'runtimes': [],
    'consoles': {},
    'achievements': {
      'gained': 0,
      'total': 0,
      'average': 0,
    }
  },
  'book': {
    'total': 0,
    'scores': [],
    'release': {
      'new': 0,
      'old': 0,
    },
    'days': 0,
    'pages': 0,
    'format': {
      'eBook': 0,
      'Physical': 0,
      'Audio': 0,
    },
    'type': {
      'Novel': 0,
      'Novella': 0,
      'Comic': 0,
      'Short Story': 0,
      'Graphic Novel': 0,
      'Anthology': 0,
      'Flash Fiction': 0,
      'Biography': 0,
      'Autobiography': 0,
      'Memoir': 0,
      'Essay Collection': 0,
      'Self-Help': 0,
      'Poetry': 0,
      'Play/Script/Screenplay': 0,
      'Religious Book': 0,
      'Web Novel': 0,
      'Interactive': 0
    }
  }
}