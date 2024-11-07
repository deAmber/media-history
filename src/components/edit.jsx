import mainStore from "../stores/mainStore.js";
import { updateFile } from "../utilities.js";
import driveData from "../stores/driveData.js";
import {useState} from "react";
import Select from "react-select";

const Edit = ({data = false, closeButton = () => {}, forceEditType = false}) => {
  const { type, year } = mainStore();
  const { meta, setMeta , movies, setMovies } = driveData();
  const [ editType, setEditType ] = useState(forceEditType || type)

  const getNowDate = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toJSON().slice(0,10)+"";
  }

  //Updates
  const addEntry = (data) => {
    const year = parseInt(data.release.split('-')[0]);
    //Add year to support years list
    if (meta['years'].indexOf(year) === -1) {
      let temp = meta;
      temp['years'].push(year);
      temp['years'].sort().reverse();
      setMeta(temp);
      updateFile(meta.fileIds.metaData, meta);
    }
    //Update date in Zustand store
    if (editType.value === 'movie') {
      let temp = movies;
      if (!temp[year]) {
        temp[year] = [data];
      } else {
        temp[year].push(data);
      }
      setMovies(temp);
      updateFile(meta.fileIds.movies, movies).then(closeButton);
    }
    //TODO: other types
  }

  return (
    <>
      <h2>{data ? 'Edit <name>' : "Add new media"}</h2>
      <label>Media type</label>
      {!data && <Select unstyled classNamePrefix={'react-select'} options={[
        {value: "movie", label: "Movies"},
        {value: "tv", label: "TV Shows"},
        {value: "game", label: "Video Games"},
        {value: "book", label: "Books"},
      ]} value={editType} onChange={setEditType} />}
      <form id={'editForm'} onSubmit={(e) => {
        //dont reload
        e.preventDefault();
        //TODO: save logic
        const formData = Object.fromEntries(new FormData(document.getElementById('editForm')));
        console.log(formData)
        //Cleanup data types
        formData.score = parseFloat(formData.score);
        //TODO: show loading bar and disable input while files are updated
        addEntry(formData);
      }}>
        <label htmlFor={'title'}>{editType.label.substring(0, editType.label.length-1)} Title</label>
        <input id={'title'} name={'title'} type={'text'} required/>
        <label htmlFor={'release'}>Release Date</label>
        <input id={'release'} name={'release'} type={'date'} defaultValue={getNowDate()} required/>
        <label htmlFor={'score'}>Score</label>
        <input id={'score'} name={'score'} type={'number'} min={1} max={10} step={1} required/>
      </form>
      <div className={'buttons'}>
        <button onClick={closeButton}>Cancel</button>
        <button type={"submit"} form={'editForm'}>Save</button>
      </div>
    </>
  )
}

export default Edit;