import mainStore from "../stores/mainStore.js";
import driveData from "../stores/driveData.js";

const Homepage = ({}) => {
  const { user, year } = mainStore();
  const { meta, movies } = driveData();

  //New user with no enties
  if (!year) {
    return <>
      <p>Hi {user}! Welcome to Media History, a simple app for tracking your watching, reading, and playing habits!</p>
      <p>It looks like you don't have any data at the moment, so there won't be much to see. Try adding a new media entry in by clicking the "Add new" button in the menu above.</p>
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