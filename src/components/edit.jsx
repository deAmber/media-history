import mainStore from "../stores/mainStore.js";
import { updateFile } from "../utilities.js";
import driveData from "../stores/driveData.js";

const Edit = ({data = false, closeButton = () => {}}) => {
  const { type, year } = mainStore();
  const { meta } = driveData();

  return (
    <>
      <h2>{data ? 'Edit <name>' : "Add new media"}</h2>
      Editing will occur here
      <div className={'buttons'}>
        <button onClick={closeButton}>Cancel</button>
        <button onClick={() => {
          //TODO: save logic
          updateFile(meta.fileIds.movies, {'test': 1}).then(closeButton)
        }}>Save</button>
      </div>
    </>
  )
}

export default Edit;