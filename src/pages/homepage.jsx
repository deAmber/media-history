import mainStore from "../stores/mainStore.js";
import driveData from "../stores/driveData.js";

const Homepage = ({}) => {
  const { user } = mainStore();
  const { meta, movies } = driveData();

  return <>
    <p>Welcome back {user}</p>
    <p>{JSON.stringify(meta)}</p>
    <p>{JSON.stringify(movies)}</p>
    {/*TODO: Most recent 3 entries for all 4 categories*/}
    {/*TODO: Show any ongoing/unfinished shows/books/games*/}
  </>
}

export default Homepage;