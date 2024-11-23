import MicroModal from "react-micro-modal";
import {useEffect, useState} from "react";
import mainStore from "../stores/mainStore.js";
import driveData from "../stores/driveData.js";
import Switch from "./formElements/switch.jsx";
import { updateFile } from "../utilities.js";
import Loader from "./loader.jsx";
import { gapi } from "gapi-script";
import InputGroup from "./formElements/inputGroups.jsx";
import Description from "./description.jsx";

const Header = () => {
  const { user, setUser, setLoaded } = mainStore()
  const { settings, setSettings, meta } = driveData();
  const [ openSettings, setOpenSettings ] = useState(false);
  const [ openTab, setOpenTab ] = useState('generic');
  const [ tableTab, setTableTab ] = useState('movie');
  const [ saving, setSaving ] = useState(false);

  //Stops body scroll while modal is open
  useEffect(() => {
    if (openSettings) {
      document.getElementById('root').classList.add('modalOpen');
    } else {
      document.getElementById('root').classList.remove('modalOpen');
    }
  }, [openSettings]);

  const updateSettings = (data) => {
    let newSettings = settings;
    //Default open
    newSettings.defaultOpen = JSON.parse(data.defaultMedia);
    //Field Names
    newSettings.columnNames.shortDesc = data.shortDesc;
    newSettings.columnNames.longDesc = data.longDesc;
    //New releases
    //TODO: recalculate all on change
    newSettings.newRelease = {
      'movie': data['release-movie'],
      'tv': data['release-tv'],
      'book': data['release-game'],
      'game': data['release-book']
    }
    //Rating Descriptions
    Object.keys(data).filter(v => {return v.substring(0, 4) === 'name'}).forEach(v => {
      newSettings.ratingDescriptions[parseInt(v.split('-')[1])] = data[v];
    });
    //Table Columns
    Object.keys(settings.tableColumns).forEach(mediaType => {
      Object.keys(settings.tableColumns[mediaType]).forEach(key => {
        newSettings.tableColumns[mediaType][key] = data[`${mediaType}-${key}`] === "on"
      })
    });
    //Update save file
    setSettings(newSettings);
    updateFile(meta.fileIds.userSettings, newSettings).then(() => {
      setSaving(false);
      setOpenSettings(false);
    })
  }
//TODO: add reset to default button per fieldset
  return (
    <div role={'heading'} className={'header'}>
      <h1>Media History</h1>
      {user && <>
        <button className={'iconOnly primary md settings'} title={'Open settings'} onClick={() => {
          setOpenSettings(true)
        }}/>
        <button className={'iconOnly md logout'} title={'Log out'} onClick={() => {
          gapi.auth2.getAuthInstance().signOut().then(() => {
            //Sign out of Google
            gapi.auth2.getAuthInstance().signOut();
            setUser(false);
            setLoaded(false);
          });
        }}/>
      </>}
      <MicroModal open={openSettings} handleClose={() => {
          setOpenSettings(false)
        }}
        closeOnOverlayClick={false} children={(handleClose) => {
        return <>
          {saving && <Loader message={`Saving new settings, please wait...`}/>}
          <div className={'title'}>
            <h2>Settings</h2>
          </div>
          <div className={'content'}>
            <div role={'tablist'} id={'tabNav-settings'} className={'tabGroup'}>
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
              setSaving(true);
              const formData = Object.fromEntries(new FormData(document.getElementById('settingsForm')));
              //Change colour
              window.handleColourModeChange(formData.colourMode);
              //Update settings
              console.log(formData)
              updateSettings(formData);
            }}>
              <div id={'generic-pane'} role={'tabpanel'} aria-labelledby={'generic'}
                   className={openTab !== 'generic' ? 'd-none' : ''}>
                <div className={'inputWrapper'}>
                  <label htmlFor={'defaultMedia'}>Colour Mode</label>
                  <select name={'colourMode'} id={'colourMode'} defaultValue={window.siteColourMode.browserDefaultColour ? 'browserDefaultColour' : window.siteColourMode.lightMode ? 'lightMode' : 'darkMode'}
                          required>
                    <option value={'browserDefaultColour'}>Browser Default</option>
                    <option value={'lightMode'}>Light Mode</option>
                    <option value={'darkMode'}>Dark Mode</option>
                  </select>
                </div>
                <div className={'inputWrapper'}>
                  <label htmlFor={'defaultMedia'}>Default media type<Description text={'The selected media type selected on login'}/></label>
                  <select name={'defaultMedia'} id={'defaultMedia'} defaultValue={JSON.stringify(settings.defaultOpen)}
                          required>
                    <option value={JSON.stringify({value: 'movie', label: 'Movies'})}>Movies</option>
                    <option value={JSON.stringify({value: "tv", label: "TV Shows"})}>TV Shows</option>
                    <option value={JSON.stringify({value: "game", label: "Video Games"})}>Video Games</option>
                    <option value={JSON.stringify({value: "book", label: "Books"})}>Books</option>
                  </select>
                </div>
                <fieldset className={'inputSplit'}>
                  <legend>Alternative field names<Description text={'These text fields are mixed use, name them something closer to your use-case.'}/></legend>
                  <InputGroup id={'shortDesc'} title={'Short Thoughts'} required
                              defaultValue={settings.columnNames.shortDesc} type={'text'}/>
                  <InputGroup id={'longDesc'} title={'Long Thoughts'} required
                              defaultValue={settings.columnNames.longDesc} type={'text'}/>
                </fieldset>
                <fieldset className={'inputSplit'}>
                  <legend>New release cutoff<Description text={'The number of months before a something is no longer considered a "new" release.'}/></legend>
                  <InputGroup id={'release-movie'} title={'Movies'}
                              required defaultValue={settings.newRelease.movie} type={'number'} min={0}/>
                  <InputGroup id={'release-tv'} title={'TV Shows'}
                              required defaultValue={settings.newRelease.tv} type={'number'} min={0}/>
                  <InputGroup id={'release-game'} title={'Video Games'}
                              required defaultValue={settings.newRelease.game} type={'number'} min={0}/>
                  <InputGroup id={'release-book'} title={'Books'}
                              required defaultValue={settings.newRelease.book} type={'number'} min={0}/>
                </fieldset>
              </div>
              <div id={'ratings-pane'} role={'tabpanel'} aria-labelledby={'ratings'}
                   className={openTab !== 'ratings' ? 'd-none' : ''}>
                <fieldset>
                  <legend>Name your scores</legend>
                  <InputGroup id={'name-0'} title={'1'} required wrapperClass={'inline'}
                              defaultValue={settings.ratingDescriptions[0]} type={'text'}/>
                  <InputGroup id={'name-1'} title={'2'} required wrapperClass={'inline'}
                              defaultValue={settings.ratingDescriptions[1]} type={'text'}/>
                  <InputGroup id={'name-2'} title={'3'} required wrapperClass={'inline'}
                              defaultValue={settings.ratingDescriptions[2]} type={'text'}/>
                  <InputGroup id={'name-3'} title={'4'} required wrapperClass={'inline'}
                              defaultValue={settings.ratingDescriptions[3]} type={'text'}/>
                  <InputGroup id={'name-4'} title={'5'} required wrapperClass={'inline'}
                              defaultValue={settings.ratingDescriptions[4]} type={'text'}/>
                  <InputGroup id={'name-5'} title={'6'} required wrapperClass={'inline'}
                              defaultValue={settings.ratingDescriptions[5]} type={'text'}/>
                  <InputGroup id={'name-6'} title={'7'} required wrapperClass={'inline'}
                              defaultValue={settings.ratingDescriptions[6]} type={'text'}/>
                  <InputGroup id={'name-7'} title={'8'} required wrapperClass={'inline'}
                              defaultValue={settings.ratingDescriptions[7]} type={'text'}/>
                  <InputGroup id={'name-8'} title={'9'} required wrapperClass={'inline'}
                              defaultValue={settings.ratingDescriptions[8]} type={'text'}/>
                  <InputGroup id={'name-9'} title={'10'} required wrapperClass={'inline'}
                              defaultValue={settings.ratingDescriptions[9]} type={'text'}/>
                </fieldset>
              </div>
              <div id={'table-pane'} role={'tabpanel'} aria-labelledby={'table'}
                   className={openTab !== 'table' ? 'd-none' : ''}>
                <div role={'tablist'} id={'tableSettingsNav'} className={'tabGroup sm'}>
                  <button className={`tab ${tableTab === 'movie' && 'active'}`} id={'movie'}
                          aria-controls={'movie-pane'}
                          role={`tab`} type={"button"}
                          aria-selected={tableTab === 'movie'} onClick={() => {
                    setTableTab('movie')
                  }}>Movies
                  </button>
                  <button className={`tab ${tableTab === 'tv' && 'active'}`} id={'tv'}
                          aria-controls={'tv-pane'}
                          role={`tab`} type={"button"}
                          aria-selected={tableTab === 'tv'} onClick={() => {
                    setTableTab('tv')
                  }}>TV Shows
                  </button>
                  <button className={`tab ${tableTab === 'game' && 'active'}`} id={'game'}
                          aria-controls={'game-pane'}
                          role={`tab`} type={"button"}
                          aria-selected={tableTab === 'game'} onClick={() => {
                    setTableTab('game')
                  }}>Video Games
                  </button>
                  <button className={`tab ${tableTab === 'book' && 'active'}`} id={'book'}
                          aria-controls={'book-pane'}
                          role={`tab`} type={"button"}
                          aria-selected={tableTab === 'book'} onClick={() => {
                    setTableTab('book')
                  }}>Books
                  </button>
                </div>
                <div id={'movie-pane'} role={'tabpanel'} aria-labelledby={'movie'}
                     className={tableTab !== 'movie' ? 'd-none' : ''}>
                  <fieldset>
                    <legend>Table Columns</legend>
                    <Switch label={'Release date'} id={'movie-release'} defaultChecked={settings.tableColumns.movie.release}/>
                    <Switch label={'Date watched'} id={'movie-watched'} defaultChecked={settings.tableColumns.movie.watched}/>
                    <Switch label={'Score'} id={'movie-score'} defaultChecked={settings.tableColumns.movie.score}/>
                    <Switch label={settings.columnNames.shortDesc} id={'movie-thoughts'} defaultChecked={settings.tableColumns.movie.thoughts}/>
                    <Switch label={settings.columnNames.longDesc} id={'movie-review'} defaultChecked={settings.tableColumns.movie.review}/>
                    <Switch label={'Location'} id={'movie-location'} defaultChecked={settings.tableColumns.movie.location}/>
                    <Switch label={'Cost'} id={'movie-cost'} defaultChecked={settings.tableColumns.movie.cost}/>
                    <Switch label={'Seen with'} id={'movie-persons'} defaultChecked={settings.tableColumns.movie.persons}/>
                    <Switch label={'Total Runtime'} id={'movie-time'} defaultChecked={settings.tableColumns.movie.time}/>
                    <Switch label={'Notes'} id={'movie-notes'} defaultChecked={settings.tableColumns.movie.notes}/>
                  </fieldset>
                </div>
                <div id={'tv-pane'} role={'tabpanel'} aria-labelledby={'tv'}
                     className={tableTab !== 'tv' ? 'd-none' : ''}>
                  <fieldset>
                    <legend>Table Columns</legend>
                    <Switch label={'Release date'} id={'tv-release'}
                            defaultChecked={settings.tableColumns.tv.release}/>
                    <Switch label={'Date Started'} id={'tv-started'}
                            defaultChecked={settings.tableColumns.tv.started}/>
                    <Switch label={'Date Finished'} id={'tv-finished'}
                            defaultChecked={settings.tableColumns.tv.finished}/>
                    <Switch label={'Score'} id={'tv-score'}
                            defaultChecked={settings.tableColumns.tv.score}/>
                    <Switch label={settings.columnNames.shortDesc} id={'tv-thoughts'}
                            defaultChecked={settings.tableColumns.movie.thoughts}/>
                    <Switch label={settings.columnNames.longDesc} id={'tv-review'}
                            defaultChecked={settings.tableColumns.tv.review}/>
                    <Switch label={'Seasons'} id={'tv-seasons'}
                            defaultChecked={settings.tableColumns.tv.seasons}/>
                    <Switch label={'Episodes'} id={'tv-episodes'}
                            defaultChecked={settings.tableColumns.tv.episodes}/>
                    <Switch label={'Total Runtime'} id={'tv-time'}
                            defaultChecked={settings.tableColumns.tv.time}/>
                    <Switch label={'Notes'} id={'tv-notes'}
                            defaultChecked={settings.tableColumns.tv.notes}/>
                  </fieldset>
                </div>
                <div id={'game-pane'} role={'tabpanel'} aria-labelledby={'game'}
                     className={tableTab !== 'game' ? 'd-none' : ''}>
                  <fieldset>
                    <legend>Table Columns</legend>
                    <Switch label={'Release date'} id={'game-release'}
                            defaultChecked={settings.tableColumns.game.release}/>
                    <Switch label={'Date Started'} id={'game-started'}
                            defaultChecked={settings.tableColumns.game.started}/>
                    <Switch label={'Date Finished'} id={'game-finished'}
                            defaultChecked={settings.tableColumns.game.finished}/>
                    <Switch label={'Score'} id={'game-score'}
                            defaultChecked={settings.tableColumns.game.score}/>
                    <Switch label={settings.columnNames.shortDesc} id={'game-thoughts'}
                            defaultChecked={settings.tableColumns.game.thoughts}/>
                    <Switch label={settings.columnNames.longDesc} id={'game-review'}
                            defaultChecked={settings.tableColumns.game.review}/>
                    <Switch label={'Console'} id={'game-consoles'}
                            defaultChecked={settings.tableColumns.game.consoles}/>
                    <Switch label={'Achievements Gained'} id={'game-achievementsGained'}
                            defaultChecked={settings.tableColumns.game.achievementsGained}/>
                    <Switch label={'Achievements Total'} id={'game-achievementsTotal'}
                            defaultChecked={settings.tableColumns.game.achievementsTotal}/>
                    <Switch label={'Total Runtime'} id={'game-time'}
                            defaultChecked={settings.tableColumns.game.time}/>
                    <Switch label={'Notes'} id={'game-notes'}
                            defaultChecked={settings.tableColumns.game.notes}/>
                  </fieldset>
                </div>
                <div id={'book-pane'} role={'tabpanel'} aria-labelledby={'book'}
                     className={tableTab !== 'book' ? 'd-none' : ''}>
                  <fieldset>
                    <legend>Table Columns</legend>
                    <Switch label={'Release date'} id={'book-release'}
                            defaultChecked={settings.tableColumns.book.release}/>
                    <Switch label={'Author'} id={'book-author'}
                            defaultChecked={settings.tableColumns.book.author}/>
                    <Switch label={'Series'} id={'book-series'}
                            defaultChecked={settings.tableColumns.book.series}/>
                    <Switch label={'Date Started'} id={'book-started'}
                            defaultChecked={settings.tableColumns.book.started}/>
                    <Switch label={'Date Finished'} id={'book-finished'}
                            defaultChecked={settings.tableColumns.book.finished}/>
                    <Switch label={'Score'} id={'book-score'}
                            defaultChecked={settings.tableColumns.book.score}/>
                    <Switch label={settings.columnNames.shortDesc} id={'book-thoughts'}
                            defaultChecked={settings.tableColumns.book.thoughts}/>
                    <Switch label={settings.columnNames.longDesc} id={'book-review'}
                            defaultChecked={settings.tableColumns.book.review}/>
                    <Switch label={'Pages'} id={'book-pages'}
                            defaultChecked={settings.tableColumns.book.pages}/>
                    <Switch label={'Words'} id={'book-words'}
                            defaultChecked={settings.tableColumns.book.words}/>
                    <Switch label={'format'} id={'book-format'}
                            defaultChecked={settings.tableColumns.book.format}/>
                    <Switch label={'Type'} id={'book-type'}
                            defaultChecked={settings.tableColumns.book.type}/>
                    <Switch label={'Notes'} id={'book-notes'}
                            defaultChecked={settings.tableColumns.book.notes}/>
                  </fieldset>
                </div>
              </div>
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