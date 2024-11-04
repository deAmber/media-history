import mainStore from "../stores/mainStore.js";

const Edit = ({data = false, closeButton = () => {}}) => {
  const { type, year } = mainStore();

  return (
    <>
      <h2>{data ? 'Edit <name>' : "Add new media"}</h2>
      Editing will occur here
      <div className={'buttons'}>
        <button onClick={closeButton}>Cancel</button>
        <button onClick={() => {
          //TODO: save logic
          closeButton();
        }}>Save</button>
      </div>
    </>
  )
}

export default Edit;