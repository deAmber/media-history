import { Tooltip } from 'react-tooltip';
import driveData from "../stores/driveData.js";
import mainStore from "../stores/mainStore.js";
import { useState } from "react";
import MicroModal from "react-micro-modal";
import Loader from "../components/loader.jsx";
import Edit from "./edit.jsx";
import { getStore, deleteEntry, updateCloudAndStores } from "../utilities.js";

/**
 * MicroModal view entry content
 * @param {Boolean} open - Sets modal open state.
 * @param handleClose - close modal function
 * @param {Object} selectedEntry - selectedEntry entry for the modal.
 * @param type - Media type.
 * @returns {JSX.Element}
 */
const ViewModal = ({open, handleClose, type}) => {
  const { settings, meta } = driveData();
  const { selectedEntry, setSelectedEntry } = mainStore();
  const [ del, setDel ] = useState(false);
  const [ edit, setEdit ]= useState(false);
  const [ saving, setSaving ] = useState(false);
  console.log(selectedEntry)

  /**
   * Handles the delete button - removing the entry from Zustand and syncing the change with Google.
   */
  const handleDelete = () => {
    setSaving(true);
    //Get updates stores and meta.
    const { store, tempMeta } = deleteEntry(type.value, getStore(type.value), selectedEntry.entryId, selectedEntry.year, meta);
    updateCloudAndStores(type.value, store, tempMeta).then(() => {
      setSelectedEntry(false);
      handleClose();
      setSaving(false);
      setDel(false);
    });
  }

  const DelContent = <>
    {saving && <Loader message={`Deleting entry, please wait...`}/>}
    <div className={'title'}>
      <h2>Are you sure you want to delete {selectedEntry.title}?</h2>
    </div>
    <div className={'content'} id={'deleteEntryModal'}>
      <p>This will remove the entry from the selectedEntry files and update the statistics.</p>
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
    {!del && <>
      {saving && <Loader message={`Saving new settings, please wait...`}/>}
      <div className={'title'}>
        <h2>{selectedEntry.title}</h2>
      </div>
      <div key={saving ? 1 : 0} className={'content'} id={'viewEntryModal'}>
        <div><span className={'field'}>Date Released</span><span
          className={'value'}>{new Date(selectedEntry.release).toLocaleDateString()}</span></div>
        {type.value === 'book' && <>
          {selectedEntry.author && <div><span className={'field'}>Author</span><span className={'value'}>{selectedEntry.author}</span></div>}
          {selectedEntry.series && <div><span className={'field'}>Series</span><span className={'value'}>{selectedEntry.series}</span></div>}
          {selectedEntry.seriesNo && <div><span className={'field'}>Series Number</span><span className={'value'}>{selectedEntry.seriesNo}</span></div>}
        </>}
        {type.value === 'movie' && <div><span className={'field'}>Date Watched</span><span className={'value'}>{new Date(selectedEntry.dateWatched).toLocaleDateString()} {selectedEntry.newRelease && <><span className="chip success" data-tooltip-id={'tooltip-new'} data-tooltip-content={"New release"}>New</span><Tooltip className={'success'} id={'tooltip-new'}/></>}</span></div>}
        {type.value !== 'movie' && <>
          {selectedEntry.started && <div><span className={'field'}>Date Started</span><span className={'value'}>{new Date(selectedEntry.started).toLocaleDateString()}{selectedEntry.newRelease && <><span className="chip success" data-tooltip-id={'tooltip-new'} data-tooltip-content={"New release"}>New</span><Tooltip id={'tooltip-new'}/></>}</span></div>}
          {selectedEntry.finished && <div><span className={'field'}>Date Finished</span><span className={'value'}>{new Date(selectedEntry.finished).toLocaleDateString()}</span></div>}
          {(selectedEntry.started && selectedEntry.finished) && <div><span className={'field'}>Days to {type.value === 'book' ? 'read' : (type.value === 'game' ? 'play' : 'watch')}</span><span className={'value'}>{Math.floor(Math.abs(new Date(selectedEntry.finished) - new Date(selectedEntry.started)) / (1000 * 60 * 60 * 24)) + 1}</span></div>}
        </>}
        {selectedEntry.score && <div><span className={'field'}>Score</span><span className={'value'} data-tooltip-id={'tooltip-score'} data-tooltip-content={settings.ratingDescriptions[parseInt(selectedEntry.score)-1]}>{selectedEntry.score}/10</span><Tooltip id={'tooltip-score'} className={selectedEntry.score >= 7 ? "success" : selectedEntry.score >= 3 ? "warning" : "danger"}/></div>}
        {selectedEntry.thoughts && <div><span className={'field'}>{settings.columnNames.shortDesc}</span><span className={'value'}>{selectedEntry.thoughts}</span></div>}
        {selectedEntry.review && <div><span className={'field'}>{settings.columnNames.longDesc}</span><span className={'value'}>{selectedEntry.review}</span></div>}
        {type.value === 'movie' && <>
          {selectedEntry.location && <div><span className={'field'}>Location</span><span className={'value'}>{selectedEntry.location}</span></div>}
          {(selectedEntry.cost || selectedEntry.cost === 0) && <div><span className={'field'}>Cost</span><span className={'value'}>{selectedEntry.cost === 0 ? "$0.00" : `$${selectedEntry.cost.toFixed(2)}`}</span></div>}
          {selectedEntry.persons?.length > 0 && <div><span className={'field'}>Seen with</span><span className={'value'}>{selectedEntry.persons.join(", ")}</span></div>}
        </>}
        {type.value === 'tv' && <>
          {selectedEntry.seasons && <div><span className={'field'}>Seasons</span><span className={'value'}>{selectedEntry.seasons}</span></div>}
          {selectedEntry.episodes && <div><span className={'field'}>Episodes</span><span className={'value'}>{selectedEntry.episodes}</span></div>}
        </>}
        {type.value === 'game' && <>
          {selectedEntry.consoles && <div><span className={'field'}>Console</span><span className={'value'}>{selectedEntry.consoles}</span></div>}
          {selectedEntry.achievementsGained && <div><span className={'field'}>Achievements Gained</span><span className={'value'}>{selectedEntry.achievementsGained}</span></div>}
          {selectedEntry.achievementsTotal && <div><span className={'field'}>Achievements Total</span><span className={'value'}>{selectedEntry.achievementsTotal}</span></div>}
          {(selectedEntry.achievementPct) && <div><span className={'field'}>Achievement Percentage</span><span className={'value'}>{!selectedEntry.achievementPct ? "-" : (selectedEntry.achievementPct*100).toFixed(2)}%</span></div>}
        </>}
        {type.value === 'book' && <>
          {selectedEntry.pages && <div><span className={'field'}>Pages</span><span className={'value'}>{selectedEntry.pages}</span></div>}
          {selectedEntry.words && <div><span className={'field'}>Words</span><span className={'value'}>{selectedEntry.words}</span></div>}
          {selectedEntry.format && <div><span className={'field'}>Format</span><span className={'value'}>{selectedEntry.format}</span></div>}
          {selectedEntry.type && <div><span className={'field'}>Type</span><span className={'value'}>{selectedEntry.type}</span></div>}
        </>}
        {(type.value !== 'book' && selectedEntry.time) && <div><span className={'field'}>Total {type.value === 'game' ? "Playtime" : "Runtime"}</span><span className={'value'}>{selectedEntry.time}</span></div>}
        {selectedEntry.notes && <div><span className={'field'}>Notes</span><span className={'value'}>{selectedEntry.notes}</span></div>}
      </div>
      <div className={'footer'}>
        <button onClick={() => {setDel(true)}} className={'danger'}>Delete</button>
        <button onClick={() => {setEdit(true)}} className={'secondary'}>Edit</button>
        <button onClick={handleClose} className={'primary'}>Close</button>
      </div>
    </>}
  </>

  return <MicroModal open={open} handleClose={handleClose} closeOnOverlayClick={false} children={() => {
    if (del) {
      return DelContent
    }
    if (edit) {
      return <Edit closeButton={() => {setEdit(false)}} data={selectedEntry} forceEditType={type}/>
    }
    return MainContent
  }} overrides={{
    Dialog: {
      className: del ? "small" : "",
    },
  }}/>
}

export default ViewModal;