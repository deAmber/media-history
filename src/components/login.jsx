import { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';
import mainStore from "../stores/mainStore.js";
import driveData from "../stores/driveData.js";
import {statDefaults} from "../utilities.js";

const ClientId = "803994679308-qk0cpk827asnvoshdtegmuiq5igl8rbc.apps.googleusercontent.com";

//TODO: recreate media files for each app version update so that needed keys are always present.

const Login = () => {
  const { setUser, setYear, setLoaded, setType } = mainStore();
  const { setMeta, meta, setMovies, setShows, setGames, setBooks, setSettings } = driveData();
  const [ loginError, setLoginError ] = useState(false);
  let fileIDs = {};
  //Lists all needed files and their default starting values
  const files = [
    {
      name: 'userSettings',
      default: {
        columnNames: {
          'shortDesc': 'Short Thoughts',
          'longDesc': 'Long Thoughts'
        },
        tableColumns: {
          'movie': {
            'release': true,
            'watched': true,
            'score': true,
            'thoughts': true,
            'review': false,
            'location': true,
            'cost': true,
            'persons': true,
            'time': true,
            'notes': false,
          },
          'tv': {
            'release': true,
            'started': true,
            'finished': true,
            'score': true,
            'thoughts': true,
            'review': false,
            'seasons': true,
            'episodes': true,
            'time': true,
            'notes': false,
          },
          'book': {
            'release': true,
            'author': true,
            'series': true,
            'started': true,
            'finished': true,
            'score': true,
            'thoughts': true,
            'review': false,
            'pages': true,
            'words': true,
            'format': true,
            'type': true,
            'notes': false,
          },
          'game': {
            'release': true,
            'started': true,
            'finished': true,
            'score': true,
            'thoughts': true,
            'review': false,
            'consoles': true,
            'achievementsGained' : true,
            'achievementsTotal': true,
            'time': true,
            'notes': false,
          }
        },
        ratingDescriptions: [
          'Terrible',
          'Really Bad',
          'Bad',
          'Eh',
          'OK',
          'Good',
          'Really Good',
          'Great',
          'Amazing',
          'Almost Perfect'
        ],
        defaultOpen: {value: 'movie', label: 'Movies'},
        newRelease: {
          'movie': 3,
          'tv': 3,
          'book': 3,
          'game': 3
        }
      },
      store: setSettings
    },
    {
      name: 'metaData',
      default: {
        'people': [], 'cinemas': [], 'years': [], 'authors': [], 'bookSeries': [], 'consoles': [], entryId: 0, appVersion: "1.0",
        'movie': {
          'overall': statDefaults['movie']
        },
        'tv': {
          'overall': statDefaults['tv']
        },
        'game': {
          'overall': statDefaults['game']
        },
        'book': {
          'overall': statDefaults['book']
        },
      },
      store: setMeta
    },
    {
      name: 'movies',
      default: {},
      store: setMovies
    },
    {
      name: 'tv',
      default: {},
      store: setShows
    },
    {
      name: 'book',
      default: {},
      store: setBooks
    },
    {
      name: 'game',
      default: {},
      store: setGames
    },
  ];

  /**
   * Deletes a given list of Google Drive files.
   * @param list
   */
  const deleteFiles = (list) => {
    console.log(list)
    list.forEach(v => {
      gapi.client.drive.files.delete({
        fileId: v.id
      }).then(v => {
        console.log(v)
      });
    })
  }

  //TODO: temp function - delete me
  window.deleteAll = async () => {
    for (let i = 0; i < files.length; i++) {
      const response = await gapi.client.drive.files.list({
        q: `name='${files[i].name}' and 'appDataFolder' in parents`,
        spaces: 'appDataFolder',
        field: 'files(id, name)',
      });
      if (response?.result?.files?.length > 0) {
        deleteFiles(response.result.files);
      }
    }
  }

  useEffect(() => {
    const initClient = () => {
      gapi.client.init({
        clientId: ClientId,
        scope: 'https://www.googleapis.com/auth/drive.appdata',
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
      }).then(()=> {
        //Check if already signed in
        if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
          //Load all needed data
          dataSetup();

          //Set the user and show the app
          setUser(gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getName());
        }
      });
    };

    gapi.load('client:auth2', initClient);
  }, []);

  useEffect(() => {
    if (meta) {
      let temp = meta;
      if (!temp.fileIds || (JSON.stringify(temp.fileIds) !== JSON.stringify(fileIDs))) {
        temp['fileIds'] = fileIDs;
        setMeta(temp);
      }
    }
  }, [fileIDs, meta])

  //Creates needed data files in drive if they do now exist
  const dataSetup = () => {

    /**
     * Reads the contents of a Google Drive file.
     * @param {String} fileID - The ID of a file in Google Drive.
     * @returns {Promise<*>} - Resolves to the contents of the file.
     */
    const readFile = async (fileID) => {
      try {
        const response = await gapi.client.drive.files.get({
          fileId: fileID,
          alt: 'media'
        });
        // console.log('read response:', response)
        return JSON.parse(response.body);
      } catch (error) {
        console.log('Error reading file contents:', error)
      }
    }

    /**
     * Gets the contents of the given file in appData in Google Drive.
     * If the file does not exist, creates it with the given default value.
     * @param {String} fileName - Name of the file in Google Drive.
     * @param {*} defaultValue - Default contents of the file if it needs to be created.
     * @returns {Promise<*>}
     */
    const fetchFile = async (fileName, defaultValue) => {
      const response = await gapi.client.drive.files.list({
        q: `name='${fileName}' and 'appDataFolder' in parents`,
        spaces: 'appDataFolder',
        field: 'files(id, name)',
      });

      if (response?.result?.files?.length === 0) {
        //Create the file if it does not exist
        await gapi.client.request({
          path: '/upload/drive/v3/files',
          method: 'POST',
          params: {
            uploadType: 'multipart'
          },
          headers: {
            'Content-Type': 'multipart/related; boundary=foo_bar_baz'
          },
          body:
            `--foo_bar_baz\r\n` +
            `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
            `${JSON.stringify({ name: fileName, parents: ['appDataFolder'] })}\r\n` +
            `--foo_bar_baz\r\n` +
            `Content-Type: application/json\r\n\r\n` +
            `${JSON.stringify(defaultValue)}\r\n` +
            `--foo_bar_baz--`
        }).then((response) => {
          // console.log('create response:', response)
          //Saves the file ID
          fileIDs[fileName] = response.result.id;
        });
        return defaultValue;
      } else if (response?.result?.files?.length === 1) {
        fileIDs[fileName] = response.result.files[0].id;
        return await readFile(response.result.files[0].id);
      } else {
        console.log('Error: too many files');
        //TODO: comment me out
        deleteFiles(response.result.files);
        return false;
      }
    }

    let loadedFiles = 0;

    //Gets contents of files or creates them if they do not exist
    files.forEach(v => {
      console.log('Loading file', v.name)
      fetchFile(v.name, v.default).then(content => {
        console.log(content)
        if (content) {
          if (v.name === 'metaData') {
            content.fileIds = fileIDs;
            v.store(content);
            if (content['years'].length > 0) {
              setYear({label: content['years'][0], value: content['years'][0]});
            }
          } else {
            if (v.name === 'userSettings') {
              console.log(content.defaultOpen)
              setType(content.defaultOpen);
            }
            v.store(content);
          }
          loadedFiles++;
          if (loadedFiles === files.length) {
            setLoaded(true);
          }
        } else {
          setUser(false);
        }
      })
    })

  }

  /**
   * Opens a Google prompt to log in, and if successful saves the login stats and inits the data files.
   * @returns {Promise<void>}
   */
  const handleGoogleLogin = async () => {
    try {
      await gapi.auth2.getAuthInstance().signIn();
      //TODO: handle login token expiry
      // gapi.auth2.getAuthInstance().grantOfflineAccess({prompt: 'consent'}).then(code => {
      //   new Promise<{ code: string }>((res) => {
      //     gapi.auth2.getAuthInstance().isSignedIn.listen(() => res(code));
      //   })
      // }).then(
      //   ({ code }) => {
      //     const user = gapi.auth2.getAuthInstance().currentUser.get();
      //
      //     //Load all needed data
      //     dataSetup();
      //
      //     //Show the app
      //     setUser(user.getBasicProfile().getName());
      //     }
      //   );
      // await gapi.auth2.getAuthInstance().grantOfflineAccess()
      const user = gapi.auth2.getAuthInstance().currentUser.get();

      //Load all needed data
      dataSetup();

      //Show the app
      setUser(user.getBasicProfile().getName());
    } catch (error) {
      console.error('Login failed', error);
      setLoginError(true);
    }
  };

  if (loginError) {
    return (
      <>
        <h2>Login Error</h2>
        <p>We&#39;re sorry, there seems to have been some trouble logging you in.<br/>
          Please try again later, or if this issue persists, please contact us.
        </p>
      </>
    )
  }
//TODO welcome message, explain why google login, notify saved session data
  return <>
    <h2>Please log in to continue</h2>
    <button className={'primary'} onClick={handleGoogleLogin}>Login with Google</button>
  </>
}

export default Login;