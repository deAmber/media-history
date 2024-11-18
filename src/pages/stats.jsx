import driveData from "../stores/driveData.js";
import mainStore from "../stores/mainStore.js";

/**
 * Calculates the total or average runtime from an array of durations.
 * @param {Array} timeArr - Array of duration strings.
 * @param {Boolean} average - Whether to average the results.
 * @returns {string}
 */
const runtimes = (timeArr, average = false) => {
  if (timeArr.length === 0) {
    return '-';
  }
  //Total all minutes and hours
  let total = timeArr.reduce((prev, curr) => {
    let split = curr.split(':').map(v => parseInt(v));
    return [prev[0] + split[0], prev[1] + split[1]];
  }, [0, 0]);
  //Convert overflow minutes to hours
  total[0] = total[0] + Math.floor(total[1] / 60);
  total[1] = Math.floor(total[1] % 60);
  //Average both scores and resettle minutes to hours
  if (average) {
    let hr = total[0] / timeArr.length;
    let min = total[1] / timeArr.length;
    min += (hr % 1) * 60;
    hr = Math.floor(hr) + Math.floor(min/60);
    min = Math.floor(min % 60);
    total[0] = hr;
    total[1] = min;
  }
  //Return duration string
  return total[0] + `:${total[1] < 10 ? '0' : ""}${total[1]}`;
}

const Stats = ({}) => {
  const { meta } = driveData();
  const { type, year } = mainStore();

  if (!year?.value) {
    return <></>
  }

  const metaOverall = meta[type.value].overall;
  const metaYear = meta[type.value][year.value] || false;
  const metaPreviousYear = meta[type.value][year.value - 1] || false;

  //TODO: tooltips for average score relating to written value.

  return <div id={'statPage'}>
    <div className={'p-datatable'}>
      <table>
        <thead>
          <tr>
            <th></th>
            {metaYear && <th>{ year.label }</th>}
            {metaPreviousYear && <th>{ year.value - 1 }</th>}
            <th>Overall</th>
          </tr>
        </thead>
        <tbody>
        <tr>
          <td>Total {type.label}</td>
          {metaYear && <td>{metaYear.total}</td>}
          {metaPreviousYear && <td>{metaPreviousYear.total}</td>}
          <td>{metaOverall.total}</td>
        </tr>
        <tr>
          <td>New Releases</td>
          {metaYear && <td>{metaYear.release.new}</td>}
          {metaPreviousYear && <td>{metaPreviousYear.release.new}</td>}
          <td>{metaOverall.release.new}</td>
        </tr>
        <tr>
          <td>Old Releases</td>
          {metaYear && <td>{metaYear.release.old}</td>}
          {metaPreviousYear && <td>{metaPreviousYear.release.old}</td>}
          <td>{metaOverall.release.old}</td>
        </tr>
        <tr>
          <td>Average Score (/10)</td>
          {metaYear && <td>{metaYear.scores.length === 0 ? 0 : (metaYear.scores.reduce((prev, curr) => prev + curr) / metaYear.scores.length).toFixed(2)}</td>}
          {metaPreviousYear && <td>{metaPreviousYear.scores.length === 0 ? 0 : (metaPreviousYear.scores.reduce((prev, curr) => prev + curr) / metaPreviousYear.scores.length).toFixed(2)}</td>}
          <td>{metaOverall.scores.length === 0 ? 0 : (metaOverall.scores.reduce((prev, curr) => prev + curr) / metaOverall.scores.length).toFixed(2)}</td>
        </tr>
        {type.value !== 'book' && <>
          <tr>
            <td>Total {type.value === 'game' ? 'Playtime' : 'Runtime'}</td>
            {metaYear && <td>{runtimes(metaYear.runtimes)}</td>}
            {metaPreviousYear && <td>{runtimes(metaPreviousYear.runtimes)}</td>}
            <td>{runtimes(metaOverall.runtimes)}</td>
          </tr>
          <tr>
            <td>Average {type.value === 'game' ? 'Playtime' : 'Runtime'} per {type.value.substring(0, type.value.length)}</td>
            {metaYear && <td>{runtimes(metaYear.runtimes, true)}</td>}
            {metaPreviousYear && <td>{runtimes(metaPreviousYear.runtimes, true)}</td>}
            <td>{runtimes(metaOverall.runtimes, true)}</td>
          </tr>
        </>}
        {type.value === 'movie' && <>
          <tr>
            <td>Movies seen alone</td>
            {metaYear && <td>{metaYear.people.alone}</td>}
            {metaPreviousYear && <td>{metaPreviousYear.people.alone}</td>}
            <td>{metaOverall.people.alone}</td>
          </tr>
          <tr>
            <td>Movies seen with people</td>
            {metaYear && <td>{metaYear.total - metaYear.people.alone}</td>}
            {metaPreviousYear && <td>{metaPreviousYear.total - metaPreviousYear.people.alone}</td>}
            <td>{metaOverall.total - metaOverall.people.alone}</td>
          </tr>
          <tr>
            <td>Total Cost</td>
            {metaYear &&
              <td>{metaYear.cost.length === 0 ? "-" : '$' + metaYear.cost.reduce((x, y) => x + y, 0).toFixed(2)}</td>}
            {metaPreviousYear &&
              <td>{metaPreviousYear.cost.length === 0 ? "-" : '$' + metaPreviousYear.cost.reduce((x, y) => x + y, 0).toFixed(2)}</td>}
            <td>{metaOverall.cost.length === 0 ? "-" : '$' + metaOverall.cost.reduce((x, y) => x + y, 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td>Average cost per movie</td>
            {metaYear && <td>{metaYear.cost.length === 0 ? "-" : '$' + (metaYear.cost.reduce((x, y) => x + y, 0)/metaYear.cost.length).toFixed(2)}</td>}
            {metaPreviousYear && <td>{metaPreviousYear.cost.length === 0 ? "-" : '$' + (metaPreviousYear.cost.reduce((x, y) => x + y, 0) / metaPreviousYear.cost.length).toFixed(2)}</td>}
            <td>{metaOverall.cost.length === 0 ? "-" : '$' + (metaOverall.cost.reduce((x, y) => x + y, 0) / metaOverall.cost.length).toFixed(2)}</td>
          </tr>
        </>}
        </tbody>
      </table>
    </div>
  </div>
}

export default Stats;