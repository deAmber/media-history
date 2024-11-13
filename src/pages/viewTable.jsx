import {useEffect, useState} from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import driveData from "../stores/driveData.js";
import mainStore from "../stores/mainStore.js";

/**
 * Renders a Datatable showing core columns for the selected data type and year.
 * @returns {JSX.Element}
 */
const ViewTable = ({}) => {
  const { type, year } = mainStore();
  const { movies, shows, games, books, settings } = driveData();
  const [rowData, setRowData] = useState(movies[year.value]);

  console.log(rowData, year, movies)

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
  }, [movies, year, shows, games, books, type]);

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

  //Gets
  const checkColVis = (column) => {
    return settings.tableColumns[type.value][column]
  }

  //TODO: action column with view more and edit buttons
  //TODO: filtering?
  //TODO: smart up sorting of watchtime column
  return <DataTable value={rowData} sortField={type.value === 'movie' ? 'dateWatched' : 'started'} emptyMessage={`No ${type.label} found for ${year.label}`}>
    <Column field={'title'} header={"Title"} sortable frozen/>
    {checkColVis('release') && <Column field={'release'} header={'Release Date'} body={formatDate} sortable/>}
    {(checkColVis('author') && type.value === 'book') && <Column field={'author'} header={'Author'} sortable/>}
    {(checkColVis('series') && type.value === 'book') && <Column field={'series'} header={'Series'} sortable body={(v) => {
        if (v.series) {
          return `${v.series} (${v.seriesNo})`;
        }
        return '-';
      }}/>}
    {(checkColVis('started') && type.value !== 'movie') && <Column field={'started'} header={'started'} sortable body={formatDate}/>}
    {(checkColVis('finished') && type.value !== 'movie') && <Column field={'finished'} header={'finished'} sortable body={formatDate}/>}
    {(checkColVis('watched') && type.value === 'movie') && <Column field={'dateWatched'} header={'Date Watched'} body={formatDate} sortable/>}
    {checkColVis('score') && <Column field={'score'} header={'Score'} sortable/>}
    {checkColVis('thoughts') && <Column field={'thoughts'} header={settings.columnNames.shortDesc}/>}
    {checkColVis('review') && <Column field={'review'} header={settings.columnNames.longDesc}/>}
    {(checkColVis('location') && type.value === 'movie') && <Column field={'location'} header={'Location'}/>}
    {(checkColVis('cost') && type.value === 'movie') && <Column field={'cost'} header={'Cost'} sortable/>}
    {(checkColVis('persons') && type.value === 'movie') && <Column field={'persons'} header={'Seen With'}/>}
    {(checkColVis('seasons') && type.value === 'tv') && <Column field={'seasons'} header={'Seasons'} sortable/>}
    {(checkColVis('episodes') && type.value === 'tv') && <Column field={'episodes'} header={'Total Episodes'} sortable/>}
    {(checkColVis('consoles') && type.value === 'game') && <Column field={'consoles'} header={'Console'} sortable/>}
    {(checkColVis('achievementsGained') && type.value === 'game') && <Column field={'achievementsGained'} header={'Achievements Gained'} sortable/>}
    {(checkColVis('achievementsTotal') && type.value === 'game') && <Column field={'achievementsTotal'} header={'Achievements Total'} sortable/>}
    {(checkColVis('pages') && type.value === 'book') && <Column field={'pages'} header={'Pages'} sortable/>}
    {(checkColVis('words') && type.value === 'book') && <Column field={'words'} header={'Words'} sortable/>}
    {(checkColVis('format') && type.value === 'book') && <Column field={'format'} header={'Format'} sortable/>}
    {(checkColVis('type') && type.value === 'book') && <Column field={'type'} header={'Type'} sortable/>}
    {(checkColVis('time') && type.value !== 'book') && <Column field={'time'} header={`Total ${type.value === 'game' ? "Playtime" : "Runtime"}`} sortable/>}
    {checkColVis('notes') && <Column field={'notes'} header={'Notes'}/>}
    <Column header={'Actions'} body={() => {return '-'}}/>
  </DataTable>
}

export default ViewTable;