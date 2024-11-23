import {useEffect, useState} from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import driveData from "../stores/driveData.js";
import mainStore from "../stores/mainStore.js";
import { Tooltip } from 'react-tooltip';
import ViewModal from "../components/viewModal.jsx";
import { NewUserText } from "../components/utilities.jsx";
import { formatTime } from "../utilities.js";

/**
 * Renders a Datatable showing core columns for the selected data type and year.
 * @returns {JSX.Element}
 */
const ViewTable = () => {
  const { type, year, updateFlag, setSelectedEntry } = mainStore();
  const { movies, shows, games, books, settings } = driveData();
  const [ rowData, setRowData ] = useState(movies?.[year?.value]);
  const [ modalOpen, setModalOpen ] = useState(false);

  //Stops body scroll while modal is open
  useEffect(() => {
    if (modalOpen) {
      document.getElementById('root').classList.add('modalOpen');
    } else {
      document.getElementById('root').classList.remove('modalOpen');
    }
  }, [modalOpen]);

  //Updates the row date when the data changes (e.g. editing or adding an entry).
  useEffect(() => {
    if (year?.value) {
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
    return <>
      {formatDate(row, column)}  {row['newRelease'] && <span className="chip success" data-tooltip-id={'tooltip-new'} data-tooltip-content={"New release"}>New</span>}
      <Tooltip id={'tooltip-new'} className={'success'}/>
    </>
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
    if (column.field === 'score') {
      const colour = (raw >= 7 ? "success" : raw >= 3 ? "warning" : "danger");
      return <>
        <span className={`chip score ${colour}`} data-tooltip-id={`tooltip-score-${parseInt(raw)}`} data-tooltip-content={settings.ratingDescriptions[parseInt(raw)-1]}>{raw}</span>
        <Tooltip id={`tooltip-score-${parseInt(raw)}`} className={colour}/>
      </>
    } else if (column.field === 'minutes') {
      return formatTime(raw);
    }
    return raw;
  }

  //Gets the column visibility from settings
  const checkColVis = (column) => {
    return settings.tableColumns[type.value][column]
  }

  //New user with no data
  if (!year) {
    return <NewUserText/>
  }

  //TODO: filtering?
  //TODO: smart up sorting of watchtime column
  return <>
    <DataTable value={rowData} sortField={type.value === 'movie' ? 'dateWatched' : 'started'} sortOrder={-1} emptyMessage={`No ${type.label} found for ${year.label}`}>
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
      {(checkColVis('time') && type.value !== 'book') && <Column field={'minutes'} header={`Total ${type.value === 'game' ? "Playtime" : "Runtime"}`} body={handleEmptyCell} sortable/>}
      {checkColVis('notes') && <Column field={'notes'} header={'Notes'} body={handleEmptyCell}/>}
      <Column header={'View'} body={(v) => {return <button className={'view iconOnly primary'} onClick={() => {setSelectedEntry(v); setModalOpen(true)}} title={`View ${v.title}`}/>}}/>
    </DataTable>
    <ViewModal open={modalOpen} handleClose={() => {setModalOpen(false); setSelectedEntry(false);}}
               type={type}/>
  </>
}

export default ViewTable;