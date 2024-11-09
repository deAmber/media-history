import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Select from "react-select";
import MicroModal from "react-micro-modal";
import mainStore from "../stores/mainStore.js";
import driveData from "../stores/driveData.js";
import Edit from "./edit.jsx";
import { gapi } from "gapi-script";

const Nav = () => {
  const location = useLocation();
  const { type, setType, year, setYear, setUser } = mainStore();
  const { meta } = driveData();
  const [ addModal, setAddModal ] = useState(false);

  return (
    <div role={'tablist'} id={'tabNav'} className={'tabGroup lg'}>
      <Link to={'/'} className={`tab ${location.pathname === '/' ? "active" : ""}`}>Home</Link>
      <Link to={'/table'} className={`tab ${location.pathname === '/table' ? "active" : ""}`}>Full Table</Link>
      <Link to={'/stats'} className={`tab ${location.pathname === '/stats' ? "active" : ""}`}>Statistics</Link>
      <Link to={'/charts'} className={`tab ${location.pathname === '/charts' ? "active" : ""}`}>Visualisations</Link>
      <button className={'tab'} onClick={() => {setAddModal(true)}}>Add new</button>
      <MicroModal open={addModal} handleClose={() => {setAddModal(false)}}
                  children={(handleClose) => <Edit closeButton={handleClose}/>}
                  closeOnOverlayClick={false}
      />
      <button className={'tab'} onClick={() => {
        gapi.auth2.getAuthInstance().signOut().then(() => {
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('token');
          setUser(false);
        });
      }}>Log out</button>
      <Select options={[
        {value: "movie", label: "Movies"},
        {value: "tv", label: "TV Shows"},
        {value: "game", label: "Video Games"},
        {value: "book", label: "Books"},
      ]} value={type} onChange={setType} menuPortalTarget={document.body}
              unstyled classNamePrefix={'react-select'}/>
      {meta['years'] && <Select options={meta['years'].map(v => {return {label: v, value: v}})}
              value={year} isDisabled={meta['years'].length === 0} menuPortalTarget={document.body}
              onChange={setYear} unstyled classNamePrefix={'react-select'}/>}
    </div>
  )
}

export default Nav;