import mainStore from "../stores/mainStore.js";

const Homepage = ({}) => {
  const { user } = mainStore();

  return <>
    <p>Welcome back {user}</p>
    {/*TODO: Most recent 3 entries for all 4 categories*/}
    {/*TODO: Show any ongoing/unfinished shows/books/games*/}
  </>
}

export default Homepage;