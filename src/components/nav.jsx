import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Select from "react-select";
import MicroModal from "react-micro-modal";
import mainStore from "../stores/mainStore.js";
import driveData from "../stores/driveData.js";
import Edit from "./edit.jsx";

const Nav = () => {
  const location = useLocation();
  const { type, setType, year, setYear } = mainStore();
  const { meta } = driveData();
  const [ addModal, setAddModal ] = useState(false);
  const [ mobile, setMobile ] = useState(false)

  useEffect(() => {

    //Checks if screen size is mobile
    const handleResize = () => {
      if (screen.width <= 768) {
        setMobile(true);
      } else if (screen.width > 768) {
        setMobile(false)
      }
    }

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, []);

  const selects = <><Select options={[
    {value: "movie", label: "Movies"},
    {value: "tv", label: "TV Shows"},
    {value: "game", label: "Video Games"},
    {value: "book", label: "Books"},
  ]} value={type} onChange={setType} menuPortalTarget={document.body}
                            unstyled isSearchable={false} classNamePrefix={'react-select'} className={'react-select-wrapper'}/>
    {meta['years'] && <Select options={meta['years'].map(v => {return {label: v, value: v}})} isSearchable={meta['years'].length > 5}
                              value={year} isDisabled={meta['years'].length === 0} menuPortalTarget={document.body}
                              onChange={setYear} unstyled classNamePrefix={'react-select'} className={'react-select-wrapper'}/>}
  </>

  return (<>
      <div role={'navigation'} id={'tabNav'} className={'tabGroup lg'}>
        <Link role={'link'} to={'/'} className={`tab ${location.pathname === '/' ? "active" : ""}`}>Home</Link>
        <Link role={'link'} to={'/table'} className={`tab ${location.pathname === '/table' ? "active" : ""}`}>Full Table</Link>
        <Link role={'link'} to={'/stats'} className={`tab ${location.pathname === '/stats' ? "active" : ""}`}>Statistics</Link>
        <button className={'tab'} onClick={() => {setAddModal(true)}}>Add new</button>
        <MicroModal open={addModal} handleClose={() => {setAddModal(false)}}
                    children={(handleClose) => <Edit closeButton={handleClose}/>}
                    closeOnOverlayClick={false}
        />
        {!mobile && selects}
      </div>
      {mobile && <div id={'mobileSelects'}>{selects}</div>}
    </>
  )
}

export default Nav;