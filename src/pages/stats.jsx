import driveData from "../stores/driveData.js";
import mainStore from "../stores/mainStore.js";

const Stats = ({}) => {
  const { meta } = driveData();
  const { type, year, updateFlag } = mainStore();
  //TODO: 2 tabs - one for all combined and one for selection
  return <>
    <table>
      <thead>
        <tr>
          <th>Stat</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
      <tr>
        <td>Total</td>
        <td>{meta[type.value].overall.total}</td>
      </tr>
      <tr>
        <td>New Releases</td>
        <td>{meta[type.value].overall.release.new}</td>
      </tr>
      <tr>
        <td>Old Releases</td>
        <td>{meta[type.value].overall.release.old}</td>
      </tr>
      <tr>
        <td>Average Score</td>
        <td>{(meta[type.value].overall.scores.reduce((prev, curr) => prev + curr) / meta[type.value].overall.scores.length).toFixed(2)}</td>
      </tr>
      </tbody>
    </table>
  </>
}

export default Stats;