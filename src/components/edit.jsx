import mainStore from "../stores/mainStore.js";
import { updateFile } from "../utilities.js";
import driveData from "../stores/driveData.js";
import {useRef, useState} from "react";
import Select from "react-select";
import Loader from "./loader.jsx";
import CreatableSelect from "react-select/creatable";

const Edit = ({data = false, closeButton = () => {}, forceEditType = false}) => {
  const { type, setUpdateFlag } = mainStore();
  const { meta, setMeta , movies, setMovies, shows, setShows, games, setGames, books, setBooks } = driveData();
  const [ editType, setEditType ] = useState(forceEditType || type)
  const [ saving, setSaving ] = useState(false);
  const [ people, setPeople ] = useState(null);
  const [ consoles, setConsoles ] = useState(null);
  const [ author, setAuthor ] = useState(null);
  const [ bookSeries, setBookSeries ] = useState(null);
  const formRef = useRef();

  const getNowDate = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toJSON().slice(0,10)+"";
  }

  /**
   * Handles inserting the new entry into the array.
   * @param {Object} dataReference - Zustand store
   * @param {Number} year - Year the entry is for.
   * @param {String} date - Key for the date field to sort by.
   * @param {Object} data - Processed form data for new entry.
   * @returns {*} - Updated copy of the Zustand store.
   */
  const handleDataInsert = (dataReference, year, date, data) => {
    //Add entry to movie file
    let temp = dataReference;
    if (!temp[year]) {
      temp[year] = [data];
    } else {
      temp[year].push(data);
      //Sort new to old
      temp[year].sort((a, b) => {
        let aDates = a[date].split('-').map(v => {return parseInt(v)});
        let bDates = b[date].split('-').map(v => {return parseInt(v)});
        if (aDates[1] !== bDates[1]) {
          return bDates[1] - aDates[1];
        } else {
          return bDates[2] - aDates[2];
        }
      });
    }
    return temp;
  }

  /**
   * Process and formats any needed data, and then updates the Zustand store and data file.
   * @param {Object} data - Form Data.
   */
  const addEntry = (data) => {
    //TODO: ranking + updating all other entries with a higher rank
    const year = parseInt(data[editType.value === 'movie' ? 'dateWatched' : 'started'].split('-')[0]);
    let updateMeta = false;
    let tempMeta = meta;
    //Add year to support years list
    if (meta['years'].indexOf(year) === -1) {
      tempMeta['years'].push(year);
      tempMeta['years'].sort().reverse();
      updateMeta = true;
    }
    //Parse hours and minutes into a single time field
    if (editType.value !== 'book') {
      let hours = parseInt(data.hours || 0);
      let minutes = parseInt(data.minutes);
      if (minutes > 60) {
        hours = hours + parseInt(minutes / 60);
        minutes = minutes % 60;
      }
      data.time = `${hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
      delete data.hours;
      delete data.minutes;
    }
    //Update date in Zustand store
    if (editType.value === 'movie') {
      //Add seen with people
      if (people?.length > 0) {
        let existingPersons = tempMeta.people
        data.persons = people.map(v => {
          if (!existingPersons.includes(v.label)) {
            existingPersons.push(v.label);
            updateMeta = true;
          }
          return v.label
        });
        tempMeta.people = existingPersons;
      }
      //Add Location to meta package
      if (data.location && !meta.cinemas.includes(data.location)) {
        meta.cinemas.push(data.location);
        updateMeta = true;
      }
      //Parse cost to a float
      if (data.cost) {
        data.cost = parseFloat(data.cost);
      } else {
        data.cost = null;
      }
      //Add entry to movie file
      let temp = handleDataInsert(movies, year, 'dateWatched', data);
      setMovies(temp);
      setUpdateFlag();
      updateFile(meta.fileIds.movies, movies).then(() => {
        setSaving(false);
        closeButton();
      });
    } else if (editType.value === 'tv') {
      //TODO: Handling multiple seasons (i.e. 1-3)
      data.episodes = parseInt(data.episodes);
      //Add entry to TV file
      let temp = handleDataInsert(shows, year, 'started', data);
      setShows(temp);
      setUpdateFlag();
      updateFile(meta.fileIds.tv, shows).then(() => {
        setSaving(false);
        closeButton();
      });
    } else if (editType.value === 'game') {
      //Add console to meta list
      if (consoles) {
        data.consoles = consoles.label;
        if (!tempMeta.consoles.includes(consoles.label)) {
          tempMeta.consoles.push(consoles.label);
          updateMeta = true;
        }
      } else {
        data.consoles = false;
      }
      //Add entry to Game file
      let temp = handleDataInsert(games, year, 'started', data);
      setGames(temp);
      setUpdateFlag();
      updateFile(meta.fileIds.game, games).then(() => {
        setSaving(false);
        closeButton();
      });
    } else if (editType.value === 'book') {
      //Add author
      data.author = author.label;
      if (!tempMeta.authors.includes(author.label)) {
        tempMeta.authors.push(author.label);
        updateMeta = true;
      }
      //Add book series
      if (bookSeries) {
        data.series = bookSeries.label;
        if (!tempMeta.bookSeries.includes(bookSeries.label)) {
          tempMeta.bookSeries.push(bookSeries.label);
          updateMeta = true;
        }
      } else {
        data.series = null;
        data.seriesNo = null;
      }
      //TODO: progress updates
      //Add entry to Game file
      let temp = handleDataInsert(books, year, 'started', data);
      setBooks(temp);
      setUpdateFlag();
      updateFile(meta.fileIds.book, books).then(() => {
        setSaving(false);
        closeButton();
      });
    }
    //Update meta file (if required)
    if (updateMeta) {
      setMeta(tempMeta);
      updateFile(meta.fileIds.metaData, meta);
    }
  }

  return (
    <>
      {saving && <Loader message={`Saving new ${editType.label.substring(0, editType.label.length-1)}, please wait...`}/>}
      <div className={'title'}>
        <h2>{data ? 'Edit <name>' : "Add new media"}</h2>
      </div>
      <div className={'content'} id={'editModal-content'}>
        <div className={'inputWrapper required'}>
          <label>Media type</label>
          {!data && <Select unstyled classNamePrefix={'react-select'} options={[
            {value: "movie", label: "Movies"},
            {value: "tv", label: "TV Shows"},
            {value: "game", label: "Video Games"},
            {value: "book", label: "Books"},
          ]} value={editType} onChange={setEditType}/>}
        </div>
        <form id={'editForm'} ref={formRef} onSubmit={(e) => {
          //dont reload
          e.preventDefault();
          setSaving(true);
          const formData = Object.fromEntries(new FormData(document.getElementById('editForm')));
          console.log(formData)
          //Cleanup data types
          formData.score = parseFloat(formData.score);
          addEntry(formData);
        }}>
          <div className={'inputWrapper required'}>
            <label htmlFor={'title'}>{editType.label.substring(0, editType.label.length - 1)} Title</label>
            <input id={'title'} name={'title'} type={'text'} required/>
          </div>
          <div className={'inputWrapper required'}>
            <label htmlFor={'release'}>Release Date</label>
            <input id={'release'} name={'release'} type={'date'} defaultValue={getNowDate()} required/>
          </div>
          {editType.value === 'book' && <>
            <div className={'inputWrapper required'}>
              <label htmlFor={'author'}>Author</label>
              <CreatableSelect id={'author'} options={meta.authors.map(v => {
                return {value: v, label: v}
              })}
                value={author} onChange={setAuthor}
                menuPortalTarget={document.body}
                unstyled classNamePrefix={'react-select'} required/>
            </div>
            <fieldset className={'inputSplit'}>
              <legend>Series</legend>
              <div className={'inputWrapper'}>
                <label htmlFor={'series'}>Series</label>
                <CreatableSelect id={'series'} options={meta.bookSeries.map(v => {
                  return {value: v, label: v}
                })}
                  value={bookSeries} onChange={setBookSeries}
                  menuPortalTarget={document.body}
                  unstyled classNamePrefix={'react-select'} isClearable/>
              </div>
              <div className={'inputWrapper'}>
                <label htmlFor={'seriesNo'}>Number</label>
                <input id={'seriesNo'} name={'seriesNo'} type={'number'} min={0}/>
              </div>
            </fieldset>
          </>}
          {editType.value !== 'movie' && <fieldset className={'inputSplit'}>
            <legend>Timeline</legend>
            <div className={'inputWrapper required'}>
              <label htmlFor={'started'}>Date Started</label>
              <input id={'started'} name={'started'} type={'date'} defaultValue={getNowDate()} required/>
            </div>
            <div className={'inputWrapper'}>
              <label htmlFor={'finished'}>Date Finished</label>
              <input id={'finished'} name={'finished'} type={'date'}/>
            </div>
          </fieldset>}
          {editType.value === 'movie' && <>
            <div className={'inputWrapper required'}>
              <label htmlFor={'dateWatched'}>Date Watched</label>
              <input id={'dateWatched'} name={'dateWatched'} type={'date'} defaultValue={getNowDate()} required/>
            </div>
          </>}
          <div className={'inputWrapper required suffixed'}>
            <label htmlFor={'score'}>Score</label>
            <input id={'score'} name={'score'} type={'number'} min={1} max={10} step={1} required
                   placeholder={'Rating out of 10'}/>
          </div>
          <div className={'inputWrapper'}>
            <label htmlFor={'thoughts'}>Short Thoughts</label>
            <textarea id={'thoughts'} name={'thoughts'} rows={2}
                      placeholder={'Spoiler free thoughts, notes or impressions.'}/>
          </div>
          <div className={'inputWrapper'}>
            <label htmlFor={'review'}>Long Thoughts</label>
            <textarea id={'review'} name={'review'} rows={5}
                      placeholder={'Detailed opinions, praise, and criticisms.'}/>
          </div>
          {editType.value === 'movie' && <>
            <div className={'inputWrapper'}>
              <label htmlFor={'location'}>Location Seen</label>
              <input id={'location'} name={'location'} type={'text'} list={'locations'}
                     placeholder={'Name of Cinema, a persons house, your phone...'}/>
              <datalist id={'locations'}>
                {meta.cinemas.map((v, i) => {
                  return (<option key={i} label={v}>{v}</option>)
                })}
              </datalist>
            </div>
            <div className={'inputWrapper prefixed'}>
              <label htmlFor={'cost'}>Cost</label>
              <input id={'cost'} name={'cost'} type={'number'} min={0} step={0.01} defaultValue={0.00}/>
            </div>
            <div className={'inputWrapper'}>
              <label htmlFor={'seenWith'}>Seen with</label>
              <CreatableSelect id={'seenWith'} isMulti options={meta.people.map(v => {
                return {value: v, label: v}
              })}
                               value={people} onChange={setPeople}
                               menuPortalTarget={document.body} placeholder={'Anyone you watched the movie with'}
                               unstyled classNamePrefix={'react-select'} classNames={{
                multiValue: () => {
                  return 'chip'
                }
              }}/>
            </div>
          </>}
          {editType.value === 'tv' && <fieldset className={'inputSplit'}>
            <legend>Show Length</legend>
            <div className={'inputWrapper required'}>
              <label htmlFor={'seasons'}>Seasons</label>
              <input id={'seasons'} name={'seasons'} type={'text'} required/>
            </div>
            <div className={'inputWrapper required'}>
              <label htmlFor={'episodes'}>Total Episodes</label>
              <input id={'episodes'} name={'episodes'} type={'number'} step={1} min={0} required/>
            </div>
          </fieldset>}
          {editType.value === 'game' && <>
            <div className={'inputWrapper'}>
              <label htmlFor={'console'}>Console</label>
              <CreatableSelect id={'console'} options={meta.consoles.map(v => {
                return {value: v, label: v}
              })}
                 value={consoles} onChange={setConsoles}
                 menuPortalTarget={document.body} placeholder={'PC, PS5, XBox One...'}
                 unstyled classNamePrefix={'react-select'} isClearable/>
            </div>
            <fieldset className={'inputSplit'}>
              <legend>Achievements</legend>
              <div className={'inputWrapper required'}>
                <label htmlFor={'achievementsGained'}>Gained</label>
                <input id={'achievementsGained'} name={'achievementsGained'} type={'number'} min={0} defaultValue={0}
                       step={1} required/>
              </div>
              <div className={'inputWrapper required'}>
                <label htmlFor={'achievementsTotal'}>Possible</label>
                <input id={'achievementsTotal'} name={'achievementsTotal'} type={'number'} step={1} min={0}
                       defaultValue={0} required/>
              </div>
            </fieldset>
          </>}
          {editType.value === 'book' && <>
            <fieldset className={'inputSplit'}>
              <legend>Length</legend>
              <div className={'inputWrapper'}>
                <label htmlFor={'pages'}>Pages</label>
                <input id={'pages'} name={'pages'} type={'number'} min={0} step={1}/>
              </div>
              <div className={'inputWrapper'}>
                <label htmlFor={'words'}>Words</label>
                <input id={'words'} name={'words'} type={'number'} min={0} step={1}/>
              </div>
            </fieldset>
            <fieldset className={'inputSplit'}>
              <legend>Media</legend>
              <div className={'inputWrapper'}>
                <label htmlFor={'format'}>Format</label>
                <select id={'format'} name={'format'} defaultValue={'Physical'}>
                  <option value={'Physical'}>Physical</option>
                  <option value={'eBook'}>eBook</option>
                  <option value={'Audio'}>Audio</option>
                </select>
              </div>
              <div className={'inputWrapper'}>
                <label htmlFor={'type'}>Type</label>
                <select id={'type'} name={'type'} defaultValue={'Novel'}>
                  <option value={'Novel'}>Novel</option>
                  <option value={'Novella'}>Novella</option>
                  <option value={'Comic'}>Comic</option>
                  <option value={'Short Story'}>Short Story</option>
                </select>
              </div>
            </fieldset>
          </>}
          {editType.value !== 'book' && <fieldset className={'inputSplit'}>
            <legend>Total {editType.value === 'game' ? "Playtime" : "Runtime"}</legend>
            <div className={'inputWrapper'}>
              <label htmlFor={'hours'}>Hours</label>
              <input id={'hours'} name={'hours'} type={'number'} min={0} step={1}/>
            </div>
            <div className={'inputWrapper required'}>
              <label htmlFor={'minutes'}>Minutes</label>
              <input id={'minutes'} name={'minutes'} type={'number'} min={0} step={1} required/>
            </div>
          </fieldset>}
          <div className={'inputWrapper'}>
            <label htmlFor={'notes'}>Notes</label>
            <input id={'notes'} name={'notes'} type={'text'}/>
          </div>
          </form>
            </div>
            <div className={'footer'}>
          <button onClick={closeButton} className={'danger'}>Cancel</button>
          <button type={"submit"} form={'editForm'} className={'primary'} onClick={() => {
            formRef.current.classList.add('submitted')
          }}>Save
          </button>
        </div>
    </>
  )
}

export default Edit;