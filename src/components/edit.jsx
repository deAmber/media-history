import mainStore from "../stores/mainStore.js";
import {
  addEntry,
  calcNewRelease,
  deleteEntry,
  getStore,
  statDefaults,
  updateCloudAndStores,
} from "../utilities.js";
import driveData from "../stores/driveData.js";
import { useRef, useState } from "react";
import Select from "react-select";
import Loader from "./loader.jsx";
import InputGroup, {InputCreateSelectGroup, InputSelectGroup} from "./formElements/inputGroups.jsx";

/**
 * Contents of an add or edit modal - to add or edit a media entry.
 * @param {Object|false} data - Data for media entry.
 * @param {Function} closeButton - Function to close parent modal.
 * @param {Object} forceEditType - Media type open.
 * @returns {JSX.Element}
 */
const Edit = ({data = false, closeButton = () => {}, forceEditType = false}) => {
  const { type, setSelectedEntry } = mainStore();
  const { meta, settings } = driveData();
  const [ editType, setEditType ] = useState(forceEditType || type)
  const [ saving, setSaving ] = useState(false);
  const [ people, setPeople ] = useState(data?.persons ? data.persons.map(v => {return {label: v, value: v}}) : null);
  const [ consoles, setConsoles ] = useState(data?.consoles ? {label: data.consoles, value: data.consoles} : null);
  const [ author, setAuthor ] = useState(data?.author ? {label: data.author, value: data.author} : null);
  const [ bookSeries, setBookSeries ] = useState(data?.series ? {label: data.series, value: data.series} : null);
  const [ bookType, setBookType ] = useState(data?.type ? {label: data.type, value: data.type} : {label: 'Novel', value: 'Novel'});
  const [ tvSeasons, setTvSeasons ] = useState(data?.seasons ? data.seasons.map(v => {return {label: v, value: v}}) : []);
  const formRef = useRef();

  const getNowDate = (now = new Date()) => {
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toJSON().slice(0,10)+"";
  }

  console.log(data)

  /**
   * Processes the raw form data into the supported format
   * @param {Object} data - Form Data.
   */
  const processData = (data) => {
    //TODO: ranking + updating all other entries with a higher rank
    const year = parseInt(data[editType.value === 'movie' ? 'dateWatched' : 'started'].split('-')[0]);
    data.year = year;
    let tempMeta = meta;
    //Update entry ID if not present
    if (!data.entryId) {
      tempMeta.entryId++;
      data.entryId = tempMeta.entryId;
    }
    //Score
    if (data.score) {
      data.score = parseFloat(data.score);
    }
    //Add year to support years list
    if (meta['years'].indexOf(year) === -1) {
      tempMeta['years'].push(year);
      tempMeta['years'].sort().reverse();
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
    //TODO: days to watch/read
    if (editType.value !== 'movie') {
      data.days = null;
    }
    //Add new release flag
    data.newRelease = calcNewRelease(data.release, data[editType.value === 'movie' ? 'dateWatched' : 'started'], editType, settings);
    //Update date in Zustand store
    if (editType.value === 'movie') {
      //Add seen with people
      if (people?.length > 0) {
        let existingPersons = tempMeta.people
        data.persons = people.map(v => {
          if (!existingPersons.includes(v.label)) {
            existingPersons.push(v.label);
          }
          return v.label
        });
        tempMeta.people = existingPersons;
      } else {
        data.persons = [];
      }
      //Add Location to meta package
      if (data.location && !meta.cinemas.includes(data.location)) {
        meta.cinemas.push(data.location);
      }
      //Parse cost to a float
      if (data.cost) {
        data.cost = parseFloat(data.cost);
      } else {
        data.cost = null;
      }
    } else if (editType.value === 'tv') {
      //TODO: Handling multiple seasons (i.e. 1-3)
      data.seasons = tvSeasons.map(v => parseFloat(v.value));
      console.log(data.seasons)
      data.episodes = parseInt(data.episodes);
    } else if (editType.value === 'game') {
      //Add console to meta list
      if (consoles) {
        data.consoles = consoles.label;
        if (!tempMeta.consoles.includes(consoles.label)) {
          tempMeta.consoles.push(consoles.label)
        }
      } else {
        data.consoles = false;
      }
      //Format achievements
      data.achievementsGained = parseInt(data.achievementsGained);
      data.achievementsTotal = parseInt(data.achievementsTotal);
      data.achievementPct = data.achievementsGained / data.achievementsTotal;
    } else if (editType.value === 'book') {
      //Correct data types
      data.pages = data.pages ? parseInt(data.pages) : null;
      data.words = data.words ? parseInt(data.words) : null;
      //Add author
      data.author = author.label;
      if (!tempMeta.authors.includes(author.label)) {
        tempMeta.authors.push(author.label);
      }
      //Add book series
      if (bookSeries) {
        data.series = bookSeries.label;
        if (!tempMeta.bookSeries.includes(bookSeries.label)) {
          tempMeta.bookSeries.push(bookSeries.label);
        }
      } else {
        data.series = null;
        data.seriesNo = null;
      }
      //Book type
      data.type = bookType ? bookType.value : null;
      //TODO: progress updates
      //TODO: days to read
      data.progressUpdates = [];
    }
    return {processedData: data, year: year, tempMeta: tempMeta}
  }

  /**
   * Event listener for form submit - process data and handle add/update.
   * @param e
   */
  const formSubmit = (e) => {
    //dont reload
    e.preventDefault();
    setSaving(true);
    const formData = Object.fromEntries(new FormData(document.getElementById('editForm')));
    console.log(formData)
    //Cleanup data types
    let { processedData, year, tempMeta } = processData(formData);
    //Get appropriate store
    let store = getStore(editType.value);
    //Editing existing entry - re-calc stats and remove original
    if (data) {
      let { store: newStore, tempMeta: newMeta } = deleteEntry(editType.value, store, data.entryId, year, tempMeta);
      store = newStore;
      tempMeta = newMeta;
    }
    //Add new data
    let { store: finalStore, tempMeta: finalMeta } = addEntry(editType.value, store, year, processedData, tempMeta);
    //Update and close modal
    updateCloudAndStores(editType.value, finalStore, finalMeta).then(() => {
      setSaving(false);
      if (data) {
        //Update open view modal
        setSelectedEntry(processedData);
      }
      closeButton();
    })
  }

  return (
    <>
      {saving && <Loader message={`Saving new ${editType.label.substring(0, editType.label.length-1)}, please wait...`}/>}
      <div className={'title'}>
        <h2>{data ? `Edit ${data.title}` : "Add new media"}</h2>
      </div>
      <div className={`content ${data ? "editing" : ""}`} id={'editModal-content'}>
        {!data && <div className={'inputWrapper required'}>
          <label>Media type</label>
          {!data && <Select unstyled classNamePrefix={'react-select'} options={[
            {value: "movie", label: "Movies"},
            {value: "tv", label: "TV Shows"},
            {value: "game", label: "Video Games"},
            {value: "book", label: "Books"},
          ]} value={editType} onChange={setEditType}/>}
        </div>}
        <form id={'editForm'} ref={formRef} onSubmit={formSubmit}>
          <input className={'d-none'} type={'number'} defaultValue={data?.entryId ? data.entryId : null} name={'entryId'}/>
          <InputGroup required id={'title'} title={`${editType.label.substring(0, editType.label.length - 1)} Title`} type={"text"} defaultValue={data?.title || null}/>
          <InputGroup required id={'release'} title={'Release Data'} type={'date'} defaultValue={data ? getNowDate(new Date(data.release)) : getNowDate()}/>
          {editType.value === 'book' && <>
            <InputCreateSelectGroup id={'author'} title={'Author'} required
                                    value={author} setValue={setAuthor} options={meta.authors}/>
            <fieldset className={'inputSplit'}>
              <legend>Series</legend>
              <InputCreateSelectGroup id={'series'} title={'Series'} value={bookSeries}
                                      options={meta.bookSeries} isClearable setValue={setBookSeries}/>
              <InputGroup id={'seriesNo'} title={'Number'} type={'number'} min={0} defaultValue={data.seriesNo ? data.seriesNo : null}/>
            </fieldset>
          </>}
          {editType.value !== 'movie' && <fieldset className={'inputSplit'}>
            <legend>Timeline</legend>
            <InputGroup required id={'started'} title={'Date Started'} type={'date'} defaultValue={data ? getNowDate(new Date(data.started)) : getNowDate()}/>
            <InputGroup id={'finished'} title={'Date Finished'} type={'date'} defaultValue={data?.finished ? getNowDate(new Date(data.finished)) : null}/>
          </fieldset>}
          {editType.value === 'movie' && <InputGroup required id={'dateWatched'} title={'Date Watched'} type={'date'} defaultValue={data ? getNowDate(new Date(data.dateWatched)) : getNowDate()}/>}
          <InputGroup required={editType.value === 'movie'} wrapperClass={'suffixed'} title={'Score'} id={'score'}
                      type={'number'} min={1} max={10} step={1} placeholder={'Rating out of 10'} defaultValue={data?.score ? data.score : null}/>
          <div className={'inputWrapper'}>
            <label htmlFor={'thoughts'}>{settings.columnNames.shortDesc}</label>
            <textarea id={'thoughts'} name={'thoughts'} rows={2} defaultValue={data?.thoughts ? data.thoughts : null}
                      placeholder={'Spoiler free thoughts, notes or impressions.'}/>
          </div>
          <div className={'inputWrapper'}>
            <label htmlFor={'review'}>{settings.columnNames.longDesc}</label>
            <textarea id={'review'} name={'review'} rows={5} defaultValue={data?.review ? data.review : null}
                      placeholder={'Detailed opinions, praise, and criticisms.'}/>
          </div>
          {editType.value === 'movie' && <>
            <div className={'inputWrapper'}>
              <label htmlFor={'location'}>Location Seen</label>
              <input id={'location'} name={'location'} type={'text'} list={'locations'}
                     placeholder={'Name of Cinema, a persons house, your phone...'} defaultValue={data?.location ? data.location : null}/>
              <datalist id={'locations'}>
                {meta?.cinemas?.length && meta.cinemas.map((v, i) => {
                  return (<option key={i} label={v}>{v}</option>)
                })}
              </datalist>
            </div>
            <InputGroup wrapperClass={'prefixed'} id={'cost'} title={'Cost'} type={'number'} min={0} step={0.01} defaultValue={data?.cost ? data.cost : 0.00}/>
            <InputCreateSelectGroup id={'seenWith'} title={'Seen with'} options={meta.people} value={people} setValue={setPeople}
                                    isMulti={true} placeholder={'Anyone you watched the movie with'}/>
          </>}
          {editType.value === 'tv' && <fieldset className={'inputSplit'}>
            <legend>Show Length</legend>
            <InputCreateSelectGroup id={'seasons'} required title={"Seasons"} options={[]} isMulti noOptionsMessage={() => null}
                                    value={tvSeasons} setValue={setTvSeasons} isValidNewOption={(v) => {
                                      const regex = /^([0-9]+(\.[0-9]*)?)$/;
                                      return regex.test(v);
                                    }} formatCreateLabel={(num) => <>Add season <b>{num}</b></>}/>
            <InputGroup id={'episodes'} title={'Total Episodes'} type={'number'} step={1} min={0} required defaultValue={data?.episodes ? data.episodes : null}/>
          </fieldset>}
          {editType.value === 'game' && <>
            <InputCreateSelectGroup id={'console'} title={'Console'} options={meta.consoles}
                                    value={consoles} setValue={setConsoles} placeholder={'PC, PS5, XBox One...'} isClearable/>
            <fieldset className={'inputSplit'}>
              <legend>Achievements</legend>
              <InputGroup required id={'achievementsGained'} title={'Gained'} type={'number'} min={0}
                          defaultValue={data?.achievementsGained ? data.achievementsGained : 0} step={1}/>
              <InputGroup required id={'achievementsTotal'} title={'Possible'} type={'number'} step={1} min={0}
                          defaultValue={data?.achievementsTotal ? data.achievementsTotal : 0}/>
            </fieldset>
          </>}
          {editType.value === 'book' && <>
            <fieldset className={'inputSplit'}>
              <legend>Length</legend>
              <InputGroup id={'pages'} title={'Pages'} type={'number'} min={0} step={1} defaultValue={data?.pages ? data.pages : null}/>
              <InputGroup id={'words'} title={'Words'} type={'number'} min={0} step={1} defaultValue={data?.words ? data.words : null}/>
            </fieldset>
            <fieldset className={'inputSplit'}>
              <legend>Media</legend>
              <div className={'inputWrapper'}>
                <label htmlFor={'format'}>Format</label>
                <select id={'format'} name={'format'} defaultValue={data?.format ? data.format : 'Physical'}>
                  <option value={'Physical'}>Physical</option>
                  <option value={'eBook'}>eBook</option>
                  <option value={'Audio'}>Audio</option>
                </select>
              </div>
              <InputSelectGroup id={'type'} title={'Type'} value={bookType} setValue={setBookType} options={Object.keys(statDefaults.book.type)} isClearable/>
            </fieldset>
          </>}
          {editType.value !== 'book' && <fieldset className={'inputSplit'}>
            <legend>Total {editType.value === 'game' ? "Playtime" : "Runtime"}</legend>
            <InputGroup id={'hours'} title={'Hours'} type={'number'} min={0} step={1} defaultValue={data.time ? data.time.split(":")[0] : null}/>
            <InputGroup id={'minutes'} title={'Minutes'} required type={'number'} min={0} step={1} defaultValue={data.time ? data.time.split(":")[1] : null}/>
          </fieldset>}
          <InputGroup id={'notes'} title={'Notes'} type={"text"} defaultValue={data?.notes ? data.notes : null}/>
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