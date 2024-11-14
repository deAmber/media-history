import MicroModal from "react-micro-modal";
import { useState } from "react";
import mainStore from "../stores/mainStore.js";
import driveData from "../stores/driveData.js";

const Header = () => {
    const { user } = mainStore()
    const { settings, setSettings } = driveData();
    const [ openSettings, setOpenSettings ] = useState();
    const [ openTab, setOpenTab ] = useState('generic');

    return (
        <div role={'heading'} className={'header'}>
            <h1>Media History</h1>
            {user && <button className={'iconOnly primary sm'} title={'Open settings'} onClick={() => {setOpenSettings(true)}}/>}
            <MicroModal open={openSettings} handleClose={() => {setOpenSettings(false)}}
                closeOnOverlayClick={false} children={(handleClose) => {
                    return <>
                        <div className={'title'}>
                            <h2>Settings</h2>
                        </div>
                        <div className={'content'}>
                            <div role={'tablist'} id={'tabNav'} className={'tabGroup sm'}>
                                <button className={`tab ${openTab === 'generic' && 'active'}`} id={'generic'} aria-controls={'generic-pane'}
                                        role={`tab`}
                                        aria-selected={openTab === 'generic'} onClick={() => {
                                    setOpenTab('generic')
                                }}>Generic Settings
                                </button>
                                <button className={`tab ${openTab === 'ratings' && 'active'}`} id={'ratings'} aria-controls={'ratings-pane'}
                                        role={`tab`}
                                        aria-selected={openTab === 'ratings'} onClick={() => {
                                    setOpenTab('ratings')
                                }}>Rating Descriptions
                                </button>
                                <button className={`tab ${openTab === 'table' && 'active'}`} id={'table'} aria-controls={'table-pane'}
                                        role={`tab`}
                                        aria-selected={openTab === 'table'} onClick={() => {
                                    setOpenTab('table')
                                }}>Table Columns
                                </button>
                                <button className={`tab ${openTab === 'data' && 'active'}`} id={'data'} aria-controls={'data-pane'}
                                        role={`tab`}
                                        aria-selected={openTab === 'data'} onClick={() => {
                                    setOpenTab('data')
                                }}>Manage Data
                                </button>
                            </div>
                            <form id={'settingsForm'} onSubmit={(e) => {
                                e.preventDefault();
                                const formData = Object.fromEntries(new FormData(document.getElementById('settingsForm')));
                                console.log(formData)
                                return;
                            }}>
                                <div id={'generic-pane'} role={'tabpanel'} aria-labelledby={'generic'}
                                     className={openTab !== 'generic' ? 'd-none' : ''}>
                                    <fieldset>
                                        <legend>Alternative field names</legend>
                                        <div className={'inputWrapper'}>
                                            <label
                                                htmlFor={'shortDesc'}>Short Thoughts</label>
                                            <input id={'shortDesc'} name={'shortDesc'} defaultValue={settings.columnNames.shortDesc} type={'text'} required/>
                                        </div>
                                        <div className={'inputWrapper'}>
                                            <label
                                                htmlFor={'longDesc'}>Long Thoughts</label>
                                            <input id={'longDesc'} name={'longDesc'} defaultValue={settings.columnNames.longDesc} type={'text'} required/>
                                        </div>
                                    </fieldset>
                                    <fieldset>
                                        <legend>New release cutoff</legend>
                                        <div className={'inputWrapper inline'}>
                                            <label
                                                htmlFor={'release-movie'}>Movies</label>
                                            <input id={'release-movie'} name={'release-movie'}
                                                   defaultValue={settings.newRelease.movie} type={'number'} min={0}
                                                   required/>
                                        </div>
                                        <div className={'inputWrapper inline'}>
                                            <label
                                                htmlFor={'release-tv'}>TV Shows</label>
                                            <input id={'release-tv'} name={'release-tv'}
                                                   defaultValue={settings.newRelease.tv} type={'number'} min={0}
                                                   required/>
                                        </div>
                                        <div className={'inputWrapper inline'}>
                                            <label
                                                htmlFor={'release-game'}>Video Games</label>
                                            <input id={'release-game'} name={'release-game'}
                                                   defaultValue={settings.newRelease.game} type={'number'} min={0}
                                                   required/>
                                        </div>
                                        <div className={'inputWrapper inline'}>
                                            <label
                                                htmlFor={'release-book'}>Books</label>
                                            <input id={'release-book'} name={'release-book'}
                                                   defaultValue={settings.newRelease.book} type={'number'} min={0}
                                                   required/>
                                        </div>
                                    </fieldset>
                                </div>
                                <div id={'ratings-pane'} role={'tabpanel'} aria-labelledby={'ratings'}
                                     className={openTab !== 'ratings' ? 'd-none' : ''}>
                                    <fieldset>
                                        <legend>Name your scores</legend>
                                        <div className={'inputWrapper inline'}>
                                            <label
                                                htmlFor={'name-0'}>1</label>
                                            <input id={'name-0'} name={'name-0'} defaultValue={settings.ratingDescriptions[0]} type={'text'} required/>
                                        </div>
                                        <div className={'inputWrapper inline'}>
                                            <label
                                                htmlFor={'name-1'}>2</label>
                                            <input id={'name-1'} name={'name-1'} defaultValue={settings.ratingDescriptions[1]} type={'text'} required/>
                                        </div>
                                        <div className={'inputWrapper inline'}>
                                            <label
                                                htmlFor={'name-2'}>3</label>
                                            <input id={'name-2'} name={'name-2'} defaultValue={settings.ratingDescriptions[2]} type={'text'} required/>
                                        </div>
                                        <div className={'inputWrapper inline'}>
                                            <label
                                                htmlFor={'name-3'}>4</label>
                                            <input id={'name-3'} name={'name-3'} defaultValue={settings.ratingDescriptions[3]} type={'text'} required/>
                                        </div>
                                        <div className={'inputWrapper inline'}>
                                            <label
                                                htmlFor={'name-4'}>5</label>
                                            <input id={'name-4'} name={'name-4'} defaultValue={settings.ratingDescriptions[4]} type={'text'} required/>
                                        </div>
                                        <div className={'inputWrapper inline'}>
                                            <label
                                                htmlFor={'name-5'}>6</label>
                                            <input id={'name-5'} name={'name-5'} defaultValue={settings.ratingDescriptions[5]} type={'text'} required/>
                                        </div>
                                        <div className={'inputWrapper inline'}>
                                            <label
                                                htmlFor={'name-6'}>7</label>
                                            <input id={'name-6'} name={'name-6'} defaultValue={settings.ratingDescriptions[6]} type={'text'} required/>
                                        </div>
                                        <div className={'inputWrapper inline'}>
                                            <label
                                                htmlFor={'name-7'}>8</label>
                                            <input id={'name-7'} name={'name-7'} defaultValue={settings.ratingDescriptions[7]} type={'text'} required/>
                                        </div>
                                        <div className={'inputWrapper inline'}>
                                            <label
                                                htmlFor={'name-8'}>9</label>
                                            <input id={'name-8'} name={'name-8'} defaultValue={settings.ratingDescriptions[8]} type={'text'} required/>
                                        </div>
                                        <div className={'inputWrapper inline'}>
                                            <label
                                                htmlFor={'name-9'}>10</label>
                                            <input id={'name-9'} name={'name-9'} defaultValue={settings.ratingDescriptions[9]} type={'text'} required/>
                                        </div>
                                    </fieldset>
                                </div>
                                <div id={'table-pane'} role={'tabpanel'} aria-labelledby={'table'}
                                     className={openTab !== 'table' ? 'd-none' : ''}></div>
                                <div id={'data-pane'} role={'tabpanel'} aria-labelledby={'data'}
                                     className={openTab !== 'data' ? 'd-none' : ''}></div>
                            </form>
                        </div>
                        <div className={'footer'}>
                            <button onClick={handleClose} className={'danger'}>Cancel</button>
                            <button form={'settingsForm'} type={'submit'} className={'primary'}>Save</button>
                        </div>
                    </>
                }}
            />
        </div>
    )
}

export default Header;