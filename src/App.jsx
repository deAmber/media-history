import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/header.jsx";
import Homepage from "./pages/homepage.jsx";
import Stats from "./pages/stats.jsx";
import Charts from "./pages/charts.jsx";
import ViewTable from "./pages/viewTable.jsx";
import Nav from "./components/nav.jsx";
import mainStore from "./stores/mainStore.js";
import Login from "./components/login.jsx";

function App() {
  const { user } = mainStore();

  return (
    <Router>
      <Header/>
      <div role={'main'} id={'main'}>
        {user ? (<>
          <Nav/>
          <Routes>
            <Route path={'/'} element={<Homepage/>}/>
            <Route path={'/stats'} element={<Stats/>}/>
            <Route path={'/charts'} element={<Charts/>}/>
            <Route path={'/table'} element={<ViewTable/>}/>
          </Routes>
        </>) : <Login/>}
      </div>
    </Router>
)
}

export default App
