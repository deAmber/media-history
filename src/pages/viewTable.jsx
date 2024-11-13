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
  const { movies, shows, games, books } = driveData();
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

  //TODO: More columns
  //TODO: action column with view more and edit buttons
  //TODO: filtering?
  //TODO: Settings page can show/hide certain columns
  return <DataTable value={rowData} sortField={type.value === 'movie' ? 'dateWatched' : 'started'} emptyMessage={`No ${type.label} found for ${year.label}`}>
    <Column field={'title'} header={"Title"} sortable frozen/>
    <Column field={'release'} header={'Release Date'} body={formatDate} sortable/>
    {type.value === 'book' && <Column field={'author'} header={'Author'} sortable/>}
    {type.value === 'movie' && <Column field={'dateWatched'} header={'Date Watched'} body={formatDate} sortable/>}
    <Column field={'score'} header={'Score'} sortable/>
  </DataTable>
}

export default ViewTable;