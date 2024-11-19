import mainStore from "../stores/mainStore.js";
import driveData from "../stores/driveData.js";
import { NewUserText } from "../components/utilities.jsx";

const Homepage = ({}) => {
  const { user, year } = mainStore();
  const { meta, movies } = driveData();

  //New user with no enties
  if (!year) {
    return <>
      <p>Hi {user}! Welcome to Media History, a simple app for tracking your watching, reading, and playing habits!</p>
      <NewUserText/>
      <p>App Explination</p>
    </>
  }

  return <>
    <p>Welcome back {user}</p>
    <p>{JSON.stringify(meta)}</p>
    <p>{JSON.stringify(movies)}</p>
    {/*TODO: Most recent 3 entries for all 4 categories*/}
    {/*TODO: Show any ongoing/unfinished shows/books/games*/}
  </>
}

export default Homepage;