import { HashRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/header.jsx";
import Homepage from "./pages/homepage.jsx";
import Stats from "./pages/stats.jsx";
import ViewTable from "./pages/viewTable.jsx";
import Nav from "./components/nav.jsx";
import mainStore from "./stores/mainStore.js";
import Login from "./components/login.jsx";
import Loader from "./components/loader.jsx";

function App() {
  const { user, loaded } = mainStore();

  return (
    <Router basename={'/media-history'}>
      <Header/>
      <div role={'main'} id={'main'}>
        {user ? (<>
          {loaded ? <>
          <Nav/>
          <Routes>
            <Route path={'/'} element={<div className={'pageContent'}><Homepage/></div>}/>
              <Route path={'/stats'} element={<div className={'pageContent'}><Stats/></div>}/>
              <Route path={'/table'} element={<div className={'pageContent'}><ViewTable/></div>}/>
          </Routes>
          </> : <Loader/>}
        </>) : <Login/>}
      </div>
    </Router>
)
}

export default App
