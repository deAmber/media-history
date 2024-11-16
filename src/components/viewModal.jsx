import { Tooltip } from 'react-tooltip';
import driveData from "../stores/driveData.js";
import { useState } from "react";
import MicroModal from "react-micro-modal";
import Loader from "../components/loader.jsx";
import Edit from "./edit.jsx";

/**
 * MicroModal view entry content
 * @param {Boolean} open - Sets modal open state.
 * @param handleClose - close modal function
 * @param {Object} data - Data entry for the modal.
 * @param type - Media type.
 * @returns {JSX.Element}
 */
const ViewModal = ({open, handleClose, data, type}) => {
  const { settings } = driveData();
  const [ del, setDel ] = useState(false);
  const [ edit, setEdit ]= useState(false);
  const [ saving, setSaving ] = useState(false);
  console.log(data)

  const handleDelete = () => {
    //TODO: me
    setDel(false);
    setSaving(true);
    handleClose();
    setSaving(false);
  }

  const DelContent = <>
    <div className={'title'}>
      <h2>Are you sure you want to delete {data.title}?</h2>
    </div>
    <div className={'content'} id={'deleteEntryModal'}>
      <p>This will remove the entry from the data files and update the statistics.</p>
      <p>This action cannot be undone and wil lbe permanent.</p>
    </div>
    <div className={'footer'}>
      <button onClick={() => {
        setDel(false)
      }}>Cancel</button>
      <button onClick={handleDelete} className={'danger'}>Delete</button>
    </div>
  </>

  const MainContent =  <>
    {saving && <Loader message={`Saving new settings, please wait...`}/>}
    <div className={'title'}>
      <h2>{data.title}</h2>
    </div>
    <div className={'content'} id={'viewEntryModal'}>
      <div><span className={'field'}>Date Released</span><span
        className={'value'}>{new Date(data.release).toLocaleDateString()}</span></div>
      {type.value === 'book' && <>
        {data.author && <div><span className={'field'}>Author</span><span className={'value'}>{data.author}</span></div>}
        {data.series && <div><span className={'field'}>Series</span><span className={'value'}>{data.series}</span></div>}
        {data.seriesNo && <div><span className={'field'}>Series Number</span><span className={'value'}>{data.seriesNo}</span></div>}
      </>}
      {type.value === 'movie' && <div><span className={'field'}>Date Watched</span><span className={'value'}>{new Date(data.dateWatched).toLocaleDateString()} {calcNewRelease(data.release, data.dateWatched, type, settings) && <><span className="chip success" data-tooltip-id={'tooltip-new'} data-tooltip-content={"New release"}>New</span><Tooltip className={'success'} id={'tooltip-new'}/></>}</span></div>}
      {type.value !== 'movie' && <>
        {data.started && <div><span className={'field'}>Date Started</span><span className={'value'}>{new Date(data.started).toLocaleDateString()}{calcNewRelease(data.release, data.started, type, settings) && <><span className="chip success" data-tooltip-id={'tooltip-new'} data-tooltip-content={"New release"}>New</span><Tooltip id={'tooltip-new'}/></>}</span></div>}
        {data.finished && <div><span className={'field'}>Date Finished</span><span className={'value'}>{new Date(data.finished).toLocaleDateString()}</span></div>}
        {(data.started && data.finished) && <div><span className={'field'}>Days to {type.value === 'book' ? 'read' : (type.value === 'game' ? 'play' : 'watch')}</span><span className={'value'}>{Math.floor(Math.abs(new Date(data.finished) - new Date(data.started)) / (1000 * 60 * 60 * 24)) + 1}</span></div>}
      </>}
      {data.score && <div><span className={'field'}>Score</span><span className={'value'} data-tooltip-id={'tooltip-score'} data-tooltip-content={settings.ratingDescriptions[parseInt(data.score)-1]}>{data.score}/10</span><Tooltip id={'tooltip-score'} className={data.score >= 7 ? "success" : data.score >= 3 ? "warning" : "danger"}/></div>}
      {data.thoughts && <div><span className={'field'}>{settings.columnNames.shortDesc}</span><span className={'value'}>{data.thoughts}</span></div>}
      {data.review && <div><span className={'field'}>{settings.columnNames.longDesc}</span><span className={'value'}>{data.review}</span></div>}
      {type.value === 'movie' && <>
        {data.location && <div><span className={'field'}>Location</span><span className={'value'}>{data.location}</span></div>}
        {(data.cost || data.cost === 0) && <div><span className={'field'}>Cost</span><span className={'value'}>{data.cost === 0 ? "$0.00" : `$${data.cost.toFixed(2)}`}</span></div>}
        {data.persons && <div><span className={'field'}>Seen with</span><span className={'value'}>{data.persons.join(", ")}</span></div>}
      </>}
      {type.value === 'tv' && <>
        {data.seasons && <div><span className={'field'}>Seasons</span><span className={'value'}>{data.seasons}</span></div>}
        {data.episodes && <div><span className={'field'}>Episodes</span><span className={'value'}>{data.episodes}</span></div>}
      </>}
      {type.value === 'game' && <>
        {data.consoles && <div><span className={'field'}>Console</span><span className={'value'}>{data.consoles}</span></div>}
        {data.achievementsGained && <div><span className={'field'}>Achievements Gained</span><span className={'value'}>{data.achievementsGained}</span></div>}
        {data.achievementsTotal && <div><span className={'field'}>Achievements Total</span><span className={'value'}>{data.achievementsTotal}</span></div>}
        {(data.achievementsTotal) && <div><span className={'field'}>Achievement Percentage</span><span className={'value'}>{!data.achievementsGained ? "0" : (data.achievementsTotal / data.achievementsGained) * 100}%</span></div>}
      </>}
      {type.value === 'book' && <>
        {data.pages && <div><span className={'field'}>Pages</span><span className={'value'}>{data.pages}</span></div>}
        {data.words && <div><span className={'field'}>Words</span><span className={'value'}>{data.words}</span></div>}
        {data.format && <div><span className={'field'}>Format</span><span className={'value'}>{data.format}</span></div>}
        {data.type && <div><span className={'field'}>Type</span><span className={'value'}>{data.type}</span></div>}
      </>}
      {(type.value !== 'book' && data.time) && <div><span className={'field'}>Total {type.value === 'game' ? "Playtime" : "Runtime"}</span><span className={'value'}>{data.time}</span></div>}
      {data.notes && <div><span className={'field'}>Notes</span><span className={'value'}>{data.notes}</span></div>}
    </div>
    <div className={'footer'}>
      <button onClick={() => {setDel(true)}} className={'danger'}>Delete</button>
      <button onClick={() => {setEdit(true)}} className={'secondary'}>Edit</button>
      <button onClick={handleClose} className={'primary'}>Close</button>
    </div>
  </>

  return <MicroModal open={open} handleClose={handleClose} closeOnOverlayClick={false} children={() => {
    if (del) {
      return DelContent
    }
    if (edit) {
      return <Edit closeButton={() => {setEdit(false)}} data={data} forceEditType={type}/>
    }
    return MainContent
  }}/>
}

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

export default ViewModal;