import { gapi } from "gapi-script";
import mainStore from "./stores/mainStore.js";
import driveData from "./stores/driveData.js";

/**
 * Converts minutes into a duration string (XX:XX).
 * @param {Number} minutes - Total number of minutes.
 * @returns {String}
 */
export const formatTime = (minutes) => {
  let hours = 0;
  if (minutes >= 60) {
    hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
  }
  const strNum = (num) => {
    if (num < 10) {
      return '0' + num;
    }
    return parseInt(num).toString();
  }
  return `${strNum(hours)}:${strNum(minutes)}`
}

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
  let date = mediaType === 'movie' ? 'dateWatched': 'started';
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
  //General stats
  //Create year entry if not present
  console.log(meta, mediaType, year)
  if (!meta[mediaType][year]) {
    meta[mediaType][year] = JSON.parse(JSON.stringify(statDefaults[mediaType]));
  }
  //Update total
  meta[mediaType].overall.total++;
  meta[mediaType][year].total++;
  //New release
  meta[mediaType][year].release[data.newRelease ? 'new' : 'old']++;
  meta[mediaType].overall.release[data.newRelease ? 'new' : 'old']++;
  //Score array
  if (data.score) {
    meta[mediaType].overall.scores.push(data.score);
    meta[mediaType][year].scores.push(data.score);
    //Score high-low
    meta[mediaType][year].highLow.score = setHighLow(meta[mediaType][year].highLow.score, data.score, data.title);
  }
  //runtime
  if (mediaType !== 'book') {
    meta[mediaType].overall.runtimes.push(data.minutes);
    meta[mediaType][year].runtimes.push(data.minutes);
    //Runtime High Low
    meta[mediaType][year].highLow.runtimes = setHighLow(meta[mediaType][year].highLow.runtimes, data.minutes, data.title);
  }
  //Movie specific stats
  if (mediaType === 'movie') {
    //Location
    if (data.location) {
      if (!meta['movie'].overall.locations[data.location]) {
        meta['movie'].overall.locations[data.location] = 1;
      } else {
        meta['movie'].overall.locations[data.location]++;
      }
      if (!meta['movie'][year].locations[data.location]) {
        meta['movie'][year].locations[data.location] = 1;
      } else {
        meta['movie'][year].locations[data.location]++;
      }
    }
    //People
    if (data.persons.length > 0) {
      data.persons.forEach(person => {
        if (!meta['movie'].overall.people[person]) {
          meta['movie'].overall.people[person] = 1;
        } else {
          meta['movie'].overall.people[person]++;
        }
        if (!meta['movie'][year].people[person]) {
          meta['movie'][year].people[person] = 1;
        } else {
          meta['movie'][year].people[person]++;
        }
      })
    } else {
      meta['movie'].overall.people.alone++;
      meta['movie'][year].people.alone++;
    }
    //Cost
    if (data.cost || data.cost === 0) {
      meta[mediaType].overall.cost.push(data.cost);
      meta[mediaType][year].cost.push(data.cost);
      //Score high-low
      meta[mediaType][year].highLow.cost = setHighLow(meta[mediaType][year].highLow.cost, data.cost, data.title);
    }
  } else if (mediaType === 'tv') {
    //TV Specific stats
    //Total seasons
    meta['tv'].overall.seasons += data.seasons.length;
    meta['tv'][year].seasons += data.seasons.length;
    //Total episodes
    meta['tv'].overall.episodes += data.episodes;
    meta['tv'][year].episodes += data.episodes;
    //TODO longest show by episodes and runtime stored as objects
    //When deleting will need to do some sorting to assign the values - too costly to do whenever showing stats page
  } else if (mediaType === 'game') {
    //Achievements
    meta['game'][year].achievements.gained += data.achievementsGained;
    meta['game'].overall.achievements.gained += data.achievementsGained;
    meta['game'][year].achievements.total += data.achievementsTotal;
    meta['game'].overall.achievements.total += data.achievementsTotal;
    //Consoles
    if (!meta['game'].overall.consoles[data.consoles]) {
      meta['game'].overall.consoles[data.consoles] = 1;
    } else {
      meta['game'].overall.consoles[data.consoles]++;
    }
    if (!meta['game'][year].consoles[data.consoles]) {
      meta['game'][year].consoles[data.consoles] = 1;
    } else {
      meta['game'][year].consoles[data.consoles]++;
    }
  } else if (mediaType === 'book') {
    //Format
    meta['book'][year].format[data.format]++;
    meta['book'].overall.format[data.format]++;
    //Type
    meta['book'][year].type[data.type]++;
    meta['book'].overall.type[data.type]++;
    //Pages
    if (data.pages) {
      meta['book'][year].pages.push(data.pages);
      meta['book'].overall.pages.push(data.pages);
    }
    //Words
    if (data.words) {
      meta['book'][year].words.push(data.words);
      meta['book'].overall.words.push(data.words);
    }
    //Authors
    if (!meta['book'][year].authors[data.author]) {
      meta['book'][year].authors[data.author] = 1;
    } else {
      meta['book'][year].authors[data.author]++;
    }
    if (!meta['book'].overall.authors[data.author]) {
      meta['book'].overall.authors[data.author] = 1;
    } else {
      meta['book'].overall.authors[data.author]++;
    }
  }
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
  const { setUpdateFlag, year, setYear } = mainStore.getState();

  return new Promise((resolve, reject) => {
    let firstUpdated = false;

    //Resolves the function when both files have been updated.
    const postUpdate = () => {
      if (firstUpdated) {
        //Both files updates complete
        setUpdateFlag();
        if (!year && meta?.years?.length === 1) {
          setYear({label: meta.years[0], value: meta.years[0]});
        }
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
 * Adds or sets the highLow stat if applicable to this entry.
 * @param {Object} entry - High-low entry.
 * @param {Number} value - Raw value for calculating high-low score.
 * @param {String} title - Title of the entry.
 * @returns {Object} Recalculate entry.
 */
const setHighLow = (entry, value, title) => {
  //High
  if (!Object.keys(entry.high).length || entry.high.val < value) {
    entry.high = {
      'val': value,
      'titles': [title]
    }
  } else if (entry.high.val === value) {
    entry.high.titles.push(title);
  }
  //Low
  if (!Object.keys(entry.low).length || entry.low.val > value) {
    entry.low = {
      'val': value,
      'titles': [title]
    }
  } else if (entry.low.val === value) {
    entry.low.titles.push(title);
  }
  return entry;
}

/**
 * Removes from highLow stat if applicable to this entry.
 * @param {Object} entry - High-low entry.
 * @param {Number} value - Raw value for calculating high-low score.
 * @param {String} title - Title of the entry.
 * @param {Object} allYear - All year stats - if removing the top or bottom used to find new highLow.
 * @returns {Object} Recalculate entry.
 */
const resetHighLow = (entry, value, title, allYear, dataPoint) => {
  //High
  if (entry.high.val === value) {
    if (entry.high.titles.length === 1) {
      //Calculate new high value(s)
      let val = 0, titles = [];
      allYear.forEach(v => {
        if (v[dataPoint] > val) {
          val = v[dataPoint];
          titles = [v.title]
        } else if (v[dataPoint] === val) {
          titles.push(v.title);
        }
      });
      entry.high = {val: val, titles: titles};
    } else {
      //Remove title from list
      entry.high.titles.splice(entry.high.titles.indexOf(title), 1);
    }
  }
  //Low
  if (entry.low.val === value) {
    if (entry.low.titles.length === 1) {
      //Calculate new low value(s)
      let val = Math.pow(10, 1000), titles = [];
      allYear.forEach(v => {
        if (v[dataPoint] < val) {
          val = v[dataPoint];
          titles = [v.title]
        } else if (v[dataPoint] === val) {
          titles.push(v.title);
        }
      });
      entry.low = {val: val, titles: titles};
    } else {
      //Remove title from list
      entry.high.titles.splice(entry.high.titles.indexOf(title), 1);
    }
  }
  return entry;
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
  let val = store[year].filter(v => {return v.entryId === entryId});
  if (val.length === 1) {
    val = val[0];
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
    //TODO calculate high-low stats
    //General stats
    //Update total
    meta[mediaType].overall.total--;
    meta[mediaType][year].total--;
    //New Release
    meta[mediaType][year].release[val.newRelease ? 'new' : 'old']--;
    meta[mediaType].overall.release[val.newRelease ? 'new' : 'old']--;
    //Score array
    if (val.score) {
      meta[mediaType][year].scores.splice(meta[mediaType][year].scores.indexOf(val.score), 1);
      meta[mediaType].overall.scores.splice(meta[mediaType].overall.scores.indexOf(val.score), 1);
      //Score high-low
      meta[mediaType][year].highLow.score = resetHighLow(meta[mediaType][year].highLow.score, val.score, val.title, store[year], 'score');
    }
    //Runtime
    if (mediaType !== 'book') {
      meta[mediaType][year].runtimes.splice(meta[mediaType][year].runtimes.indexOf(val.minutes), 1);
      meta[mediaType].overall.runtimes.splice(meta[mediaType].overall.runtimes.indexOf(val.minutes), 1);
      //Runtime High Low
      meta[mediaType][year].highLow.runtimes = resetHighLow(meta[mediaType][year].highLow.runtimes, val.minutes, val.title, store[year], 'minutes');
    }
    if (mediaType === 'movie') {
      //Location
      meta['movie'].overall.locations[val.location]--;
      meta['movie'][year].locations[val.location]--;
      //People
      if (val.persons.length > 0) {
        val.persons.forEach(person => {
          meta['movie'].overall.people[person]--;
          meta['movie'][year].people[person]--;
        });
      } else {
        meta['movie'].overall.people.alone--;
        meta['movie'][year].people.alone--;
      }
      //cost
      meta[mediaType][year].cost.splice(meta[mediaType][year].cost.indexOf(val.cost), 1);
      meta[mediaType].overall.cost.splice(meta[mediaType].overall.cost.indexOf(val.cost), 1);
      //Score high-low
      meta[mediaType][year].highLow.cost = resetHighLow(meta[mediaType][year].highLow.cost, val.cost, val.title, store[year], 'cost');
    } else if (mediaType === 'tv') {
      //Total seasons
      meta['tv'].overall.seasons -= val.seasons.length;
      meta['tv'][year].seasons -= val.seasons.length;
      //Total episodes
      meta['tv'].overall.episodes -= val.episodes;
      meta['tv'][year].episodes -= val.episodes;
    } else if (mediaType === 'game') {
      //Achievements
      meta['game'][year].achievements.gained -= val.achievementsGained;
      meta['game'].overall.achievements.gained -= val.achievementsGained;
      meta['game'][year].achievements.total -= val.achievementsTotal;
      meta['game'].overall.achievements.total -= val.achievementsTotal;
      //Consoles
      meta['game'].overall.consoles[val.consoles]--;
      meta['game'][year].consoles[val.consoles]--;
    } else if (mediaType === 'book') {
      //Format
      meta['book'][year].format[val.format]--;
      meta['book'].overall.format[val.format]--;
      //Type
      meta['book'][year].type[val.type]--;
      meta['book'].overall.type[val.type]--;
      //Pages
      if (val.pages) {
        meta['book'][year].pages.splice(meta['book'][year].pages.indexOf(val.pages), 1);
        meta['book'].overall.pages.splice(meta['book'].overall.pages.indexOf(val.pages), 1);
      }
      //Words
      if (val.words) {
        meta['book'][year].words.splice(meta['book'][year].words.indexOf(val.words), 1);
        meta['book'].overall.words.splice(meta['book'].overall.words.indexOf(val.words), 1);
      }
      //Authors
      meta['book'].overall.authors[val.author]--;
      meta['book'][year].authors[val.author]--;
    }

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

  // Calculate the difference in years and months
  let monthDiff = (watch.getFullYear() - release.getFullYear()) * 12 + (watch.getMonth() - release.getMonth());

  // Adjust for day difference
  if (watch.getDate() < release.getDate()) {
    monthDiff -= 1;
  }

  // Check if within the new release window
  return monthDiff <= settings.newRelease[type.value];
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
    'cost': [],
    'runtimes': [],
    'highLow': {
      'score': {
        'high': {},
        'low': {},
      },
      'cost': {
        'high': {},
        'low': {}
      },
      'runtimes': {
        'high': {},
        'low': {}
      },
      'rank': {
        'high': {},
        'low': {}
      }
    }
  },
  'tv': {
    'total': 0,
    'scores': [],
    'release': {
      'new': 0,
      'old': 0,
    },
    'episodes': 0,
    'seasons': 0,
    'runtimes': [],
    'highLow': {
      'score': {
        'high': {},
        'low': {},
      },
      'runtimes': {
        'high': {},
        'low': {}
      },
      'rank': {
        'high': {},
        'low': {}
      },
      'episodes': {
        'high': {},
        'low': {}
      },
      'seasons': {
        'high': {},
        'low': {}
      }
    }
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
    },
    'highLow': {
      'score': {
        'high': {},
        'low': {},
      },
      'runtimes': {
        'high': {},
        'low': {}
      },
      'rank': {
        'high': {},
        'low': {}
      },
      'achievements': {
        'high': {},
        'low': {}
      },
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
    'pages': [],
    'words': [],
    'authors': {},
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
    },
    'highLow': {
      'score': {
        'high': {},
        'low': {},
      },
      'runtimes': {
        'high': {},
        'low': {}
      },
      'rank': {
        'high': {},
        'low': {}
      },
      'pages': {
        'high': {},
        'low': {}
      },
      'words': {
        'high': {},
        'low': {}
      }
    }
  }
}