import {useEffect, useState} from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import driveData from "../stores/driveData.js";
import mainStore from "../stores/mainStore.js";
import MicroModal from "react-micro-modal";
import Loader from "../components/loader.jsx";

/**
 * Renders a Datatable showing core columns for the selected data type and year.
 * @returns {JSX.Element}
 */
const ViewTable = ({}) => {
  const { type, year, updateFlag } = mainStore();
  const { movies, shows, games, books, settings } = driveData();
  const [ rowData, setRowData ] = useState(movies[year.value]);
  const [ modalOpen, setModalOpen ] = useState(false);
  const [ editing, setEditing ] = useState(false);

  //Updates the row date when the data changes (e.g. editing or adding an entry).
  useEffect(() => {
    switch (type.value) {
      case 'book':
        setRowData(books[year.value]);
        break;
      case 'game':
        setRowData(games[year.value]);
        break;
      case 'tv':
        setRowData(shows[year.value]);
        break;
      case 'movie':
      default:
        setRowData(movies[year.value]);
    }
  }, [movies, year, shows, games, books, type, updateFlag]);

  /**
   * Formats a datatable date column to locale date.
   * @param {Object} row - Row date.
   * @param {Object} column - Column date from the datatable.
   * @returns {string} - Eiter '-' or the formatted date.
   */
  const formatDate = (row, column) => {
    const raw = row[column.field];
    if (!raw) {
      return '-';
    }
    const formattedDate = new Date(raw);
    if (!formattedDate) {
      return '-'
    }
    return formattedDate.toLocaleDateString();
  }

  const calcNewRelease = (release, watch) => {
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
   * Formats a date, but also checks for recent release and adds a chip if it's within that range.
   * @param {Object} row - Row date.
   * @param {Object} column - Column date from the datatable.
   * @returns {JSX.Element|string}
   */
  const dateWithFlag = (row, column) => {
    let raw = row[column.field];
    if (!raw) {
      return '-';
    }
    return <>{formatDate(row, column)}  {calcNewRelease(row['release'], raw) && <span className="chip success">New</span>}</>
  }

  /**
   * Shows "-" or the value if available.
   * @param {Object} row - Row date.
   * @param {Object} column - Column date from the datatable.
   * @returns {*|string}
   */
  const handleEmptyCell = (row, column) => {
    const raw = row[column.field];
    if (!raw) {
      return '-';
    }
    return raw;
  }

  //Gets the column visibility from settings
  const checkColVis = (column) => {
    return settings.tableColumns[type.value][column]
  }

  /**
   * Micromodal view entry content
   * @param handleClose - close modal function
   * @returns {JSX.Element}
   */
  const viewModal = (handleClose) => {
    console.log(modalOpen)

    return <>
      {/*{saving && <Loader message={`Saving new settings, please wait...`}/>}*/}
      <div className={'title'}>
        <h2>{modalOpen.title}</h2>
      </div>
      <div className={'content'} id={'viewEntryModal'}>
        <div><span className={'field'}>Date Released</span><span
          className={'value'}>{new Date(modalOpen.release).toLocaleDateString()}</span></div>
        {type.value === 'book' && <>
          {modalOpen.author && <div><span className={'field'}>Author</span><span className={'value'}>{modalOpen.author}</span></div>}
          {modalOpen.series && <div><span className={'field'}>Series</span><span className={'value'}>{modalOpen.series}</span></div>}
          {modalOpen.seriesNo && <div><span className={'field'}>Series Number</span><span className={'value'}>{modalOpen.seriesNo}</span></div>}
        </>}
        {type.value === 'movie' && <div><span className={'field'}>Date Watched</span><span className={'value'}>{new Date(modalOpen.dateWatched).toLocaleDateString()} {calcNewRelease(modalOpen.release, modalOpen.dateWatched) && <span className="chip success">New</span>}</span></div>}
        {type.value !== 'movie' && <>
          {modalOpen.started && <div><span className={'field'}>Date Started</span><span className={'value'}>{new Date(modalOpen.started).toLocaleDateString()}{calcNewRelease(modalOpen.release, modalOpen.started) && <span className="chip success">New</span>}</span></div>}
          {modalOpen.finished && <div><span className={'field'}>Date Started</span><span className={'value'}>{new Date(modalOpen.finished).toLocaleDateString()}</span></div>}
          {(modalOpen.started && modalOpen.finished) && <div><span className={'field'}>Days to {type.value === 'book' ? 'read' : (type.value === 'game' ? 'play' : 'watch')}</span><span className={'value'}>{Math.floor(Math.abs(new Date(modalOpen.finished) - new Date(modalOpen.started)) / (1000 * 60 * 60 * 24)) + 1}</span></div>}
        </>}
        {modalOpen.score && <div><span className={'field'}>Score</span><span className={'value'}>{modalOpen.score}/10</span></div>}
        {modalOpen.thoughts && <div><span className={'field'}>{settings.columnNames.shortDesc}</span><span className={'value'}>{modalOpen.thoughts}</span></div>}
        {modalOpen.review && <div><span className={'field'}>{settings.columnNames.longDesc}</span><span className={'value'}>{modalOpen.review}</span></div>}
        {type.value === 'movie' && <>
          {modalOpen.location && <div><span className={'field'}>Location</span><span className={'value'}>{modalOpen.location}</span></div>}
          {(modalOpen.cost || modalOpen.cost === 0) && <div><span className={'field'}>Cost</span><span className={'value'}>{modalOpen.cost === 0 ? "$0.00" : `$${modalOpen.cost.toFixed(2)}`}</span></div>}
          {modalOpen.persons && <div><span className={'field'}>Seen with</span><span className={'value'}>{modalOpen.persons.join(", ")}</span></div>}
        </>}
        {type.value === 'tv' && <>
          {modalOpen.seasons && <div><span className={'field'}>Seasons</span><span className={'value'}>{modalOpen.seasons}</span></div>}
          {modalOpen.episodes && <div><span className={'field'}>Episodes</span><span className={'value'}>{modalOpen.episodes}</span></div>}
        </>}
        {type.value === 'game' && <>
          {modalOpen.consoles && <div><span className={'field'}>Console</span><span className={'value'}>{modalOpen.consoles}</span></div>}
          {modalOpen.achievementsGained && <div><span className={'field'}>Achievements Gained</span><span className={'value'}>{modalOpen.achievementsGained}</span></div>}
          {modalOpen.achievementsTotal && <div><span className={'field'}>Achievements Total</span><span className={'value'}>{modalOpen.achievementsTotal}</span></div>}
          {(modalOpen.achievementsTotal) && <div><span className={'field'}>Achievement Percentage</span><span className={'value'}>{!modalOpen.achievementsGained ? "0" : (modalOpen.achievementsTotal / modalOpen.achievementsGained) * 100}%</span></div>}
          </>}
        {type.value === 'book' && <>
          {modalOpen.pages && <div><span className={'field'}>Pages</span><span className={'value'}>{modalOpen.pages}</span></div>}
          {modalOpen.words && <div><span className={'field'}>Words</span><span className={'value'}>{modalOpen.words}</span></div>}
          {modalOpen.format && <div><span className={'field'}>Format</span><span className={'value'}>{modalOpen.format}</span></div>}
          {modalOpen.type && <div><span className={'field'}>Type</span><span className={'value'}>{modalOpen.type}</span></div>}
        </>}
        {(type.value !== 'book' && modalOpen.time) && <div><span className={'field'}>Total {type.value === 'game' ? "Playtime" : "Runtime"}</span><span className={'value'}>{modalOpen.time}</span></div>}
        {modalOpen.notes && <div><span className={'field'}>Notes</span><span className={'value'}>{modalOpen.notes}</span></div>}
      </div>
      <div className={'footer'}>
        <button onClick={handleClose} className={'secondary'}>Edit</button>
        <button onClick={handleClose} className={'primary'}>Close</button>
      </div>
    </>
  }

  //TODO: action column with view more and edit buttons
  //TODO: filtering?
  //TODO: smart up sorting of watchtime column
  //TODO: tooltip or modal score
  return <>
    <DataTable value={rowData} sortField={type.value === 'movie' ? 'dateWatched' : 'started'} emptyMessage={`No ${type.label} found for ${year.label}`}>
      <Column field={'title'} header={"Title"} sortable frozen/>
      {checkColVis('release') && <Column field={'release'} header={'Release Date'} body={formatDate} sortable/>}
      {(checkColVis('author') && type.value === 'book') && <Column field={'author'} header={'Author'} body={handleEmptyCell} sortable/>}
      {(checkColVis('series') && type.value === 'book') && <Column field={'series'} header={'Series'} sortable body={(v) => {
          if (v.series) {
            return `${v.series} (${v.seriesNo})`;
          }
          return '-';
        }}/>}
      {(checkColVis('started') && type.value !== 'movie') && <Column field={'started'} header={'started'} sortable body={dateWithFlag}/>}
      {(checkColVis('finished') && type.value !== 'movie') && <Column field={'finished'} header={'finished'} sortable body={formatDate}/>}
      {(checkColVis('watched') && type.value === 'movie') && <Column field={'dateWatched'} header={'Date Watched'} body={dateWithFlag} sortable/>}
      {checkColVis('score') && <Column field={'score'} header={'Score'} body={handleEmptyCell} sortable/>}
      {checkColVis('thoughts') && <Column field={'thoughts'} header={settings.columnNames.shortDesc} body={handleEmptyCell}/>}
      {checkColVis('review') && <Column field={'review'} header={settings.columnNames.longDesc} body={handleEmptyCell}/>}
      {(checkColVis('location') && type.value === 'movie') && <Column field={'location'} header={'Location'} body={handleEmptyCell}/>}
      {(checkColVis('cost') && type.value === 'movie') && <Column field={'cost'} header={'Cost'} body={(r, c) => {
        const val = r[c.field];
        if (val === 0) {
          return '$0.00'
        }
        return r[c.field] ? `$${r[c.field].toFixed(2)}` : "-"}} sortable/>}
      {(checkColVis('persons') && type.value === 'movie') && <Column field={'persons'} header={'Seen With'} body={handleEmptyCell}/>}
      {(checkColVis('seasons') && type.value === 'tv') && <Column field={'seasons'} header={'Seasons'} body={handleEmptyCell} sortable/>}
      {(checkColVis('episodes') && type.value === 'tv') && <Column field={'episodes'} header={'Total Episodes'} body={handleEmptyCell} sortable/>}
      {(checkColVis('consoles') && type.value === 'game') && <Column field={'consoles'} header={'Console'} body={handleEmptyCell} sortable/>}
      {(checkColVis('achievementsGained') && type.value === 'game') && <Column field={'achievementsGained'} header={'Achievements Gained'} body={(r, c) => {
        const gained = r['achievementsGained'];
        if (r['achievementsTotal'] && gained) {
          return `${gained} (${r['achievementsTotal'] / gained * 100}%)`
        }
        return gained ? gained : "-";
      }} sortable/>}
      {(checkColVis('achievementsTotal') && type.value === 'game') && <Column field={'achievementsTotal'} header={'Achievements Total'} body={handleEmptyCell} sortable/>}
      {(checkColVis('pages') && type.value === 'book') && <Column field={'pages'} header={'Pages'} body={handleEmptyCell} sortable/>}
      {(checkColVis('words') && type.value === 'book') && <Column field={'words'} header={'Words'} body={handleEmptyCell} sortable/>}
      {(checkColVis('format') && type.value === 'book') && <Column field={'format'} header={'Format'} body={handleEmptyCell} sortable/>}
      {(checkColVis('type') && type.value === 'book') && <Column field={'type'} header={'Type'} body={handleEmptyCell} sortable/>}
      {(checkColVis('time') && type.value !== 'book') && <Column field={'time'} header={`Total ${type.value === 'game' ? "Playtime" : "Runtime"}`} body={handleEmptyCell} sortable/>}
      {checkColVis('notes') && <Column field={'notes'} header={'Notes'} body={handleEmptyCell}/>}
      <Column header={'View'} body={(v) => {return <button className={'view iconOnly primary'} onClick={() => {setModalOpen(v)}} title={`View ${v.title}`}/>}}/>
    </DataTable>
    <MicroModal open={modalOpen !== false} handleClose={() => {setModalOpen(false)}} closeOnOverlayClick={!editing}
                children={viewModal}/>
  </>
}

export default ViewTable;