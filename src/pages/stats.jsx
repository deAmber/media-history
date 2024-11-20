import driveData from "../stores/driveData.js";
import mainStore from "../stores/mainStore.js";
import { NewUserText } from "../components/utilities.jsx";

/**
 * Calculates the total or average runtime from an array of durations.
 * @param {Array} timeArr - Array of duration strings.
 * @param {Boolean} average - Whether to average the results.
 * @param {Number} [length] - Total to divide by, defaults to timeArr length.
 * @returns {string}
 */
const runtimes = (timeArr, average = false, length = false) => {
  if (timeArr.length === 0) {
    return '-';
  }
  if (!length) {
    length = timeArr.length
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
    let hr = total[0] / length;
    let min = total[1] / length;
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
  const {meta} = driveData();
  const {type, year} = mainStore();

  if (!year?.value) {
    return <NewUserText/>
  }

  const metaOverall = meta[type.value].overall;
  const metaYear = meta[type.value][year.value] || false;
  const metaPreviousYear = meta[type.value][year.value - 1] || false;

  //TODO: tooltips for average score relating to written value.
  const statTable = <div className={'p-datatable'}>
    <table>
      <thead>
      <tr>
        <th></th>
        {metaYear && <th>{year.label}</th>}
        {metaPreviousYear && <th>{year.value - 1}</th>}
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
        {metaYear &&
          <td>{metaYear.scores.length === 0 ? 0 : (metaYear.scores.reduce((prev, curr) => prev + curr) / metaYear.scores.length).toFixed(2)}</td>}
        {metaPreviousYear &&
          <td>{metaPreviousYear.scores.length === 0 ? 0 : (metaPreviousYear.scores.reduce((prev, curr) => prev + curr) / metaPreviousYear.scores.length).toFixed(2)}</td>}
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
          {metaYear &&
            <td>{metaYear.cost.length === 0 ? "-" : '$' + (metaYear.cost.reduce((x, y) => x + y, 0) / metaYear.cost.length).toFixed(2)}</td>}
          {metaPreviousYear &&
            <td>{metaPreviousYear.cost.length === 0 ? "-" : '$' + (metaPreviousYear.cost.reduce((x, y) => x + y, 0) / metaPreviousYear.cost.length).toFixed(2)}</td>}
          <td>{metaOverall.cost.length === 0 ? "-" : '$' + (metaOverall.cost.reduce((x, y) => x + y, 0) / metaOverall.cost.length).toFixed(2)}</td>
        </tr>
      </>}
      {type.value === 'tv' && <>
        <tr>
          <td>Total Seasons</td>
          {metaYear && <td>{metaYear.seasons || "-"}</td>}
          {metaPreviousYear && <td>{metaPreviousYear.seasons || "-"}</td>}
          <td>{metaOverall.seasons || '-'}</td>
        </tr>
        <tr>
          <td>Total Episodes</td>
          {metaYear && <td>{metaYear.episodes || "-"}</td>}
          {metaPreviousYear && <td>{metaPreviousYear.episodes || "-"}</td>}
          <td>{metaOverall.episodes || '-'}</td>
        </tr>
        <tr>
          <td>Average Episodes per Show</td>
          {metaYear && <td>{metaYear.episodes / metaYear.total}</td>}
          {metaPreviousYear && <td>{metaPreviousYear.episodes / metaPreviousYear.total}</td>}
          <td>{metaOverall.episodes / metaOverall.total}</td>
        </tr>
        <tr>
          <td>Average Episode Runtime</td>
          {metaYear && <td>{runtimes(metaYear.runtimes, true, metaYear.episodes)}</td>}
          {metaPreviousYear && <td>{runtimes(metaPreviousYear.runtimes, true, metaPreviousYear.episodes)}</td>}
          <td>{runtimes(metaOverall.runtimes, true, metaOverall.episodes)}</td>
        </tr>
      </>}
      {type.value === 'game' && <>
        <tr>
          <td>Achievements Gained</td>
          {metaYear && <td>{metaYear.achievements.gained === 0 ? "-" : metaYear.achievements.gained}</td>}
          {metaPreviousYear &&
            <td>{metaPreviousYear.achievements.gained === 0 ? "-" : metaPreviousYear.achievements.gained}</td>}
          <td>{metaOverall.achievements.gained === 0 ? "-" : metaOverall.achievements.gained}</td>
        </tr>
        <tr>
          <td>Achievements Total</td>
          {metaYear && <td>{metaYear.achievements.total === 0 ? "-" : metaYear.achievements.total}</td>}
          {metaPreviousYear &&
            <td>{metaPreviousYear.achievements.total === 0 ? "-" : metaPreviousYear.achievements.total}</td>}
          <td>{metaOverall.achievements.total === 0 ? "-" : metaOverall.achievements.total}</td>
        </tr>
        <tr>
          <td>Achievement Rate</td>
          {metaYear && <td>{metaYear.achievements.gained === 0 ? "-" : (metaYear.achievements.gained / metaYear.achievements.total * 100).toFixed('2')}%</td>}
          {metaPreviousYear &&
            <td>{metaPreviousYear.achievements.gained === 0 ? "-" : (metaPreviousYear.achievements.gained / metaPreviousYear.achievements.total * 100).toFixed("2")}%</td>}
          <td>{metaOverall.achievements.gained === 0 ? "-" : (metaOverall.achievements.gained / metaOverall.achievements.total * 100).toFixed("2")}%</td>
        </tr>
      </>}
      {type.value === 'book' && <>
        <tr>
          <td>Total Pages</td>
          {metaYear && <td>{metaYear.pages?.reduce((prev, curr) => prev + curr) || "-"}</td>}
          {metaPreviousYear && <td>{metaPreviousYear.pages?.reduce((prev, curr) => prev + curr) || "-"}</td>}
          <td>{metaOverall.pages?.reduce((prev, curr) => prev + curr) || "-"}</td>
        </tr>
        <tr>
          <td>Average Pages per book</td>
          {metaYear && <td>{metaYear.pages ? Math.round(metaYear.pages?.reduce((prev, curr) => prev + curr) / metaYear.total) : "-"}</td>}
          {metaPreviousYear &&
            <td>{metaPreviousYear.pages ? Math.round(metaPreviousYear.pages?.reduce((prev, curr) => prev + curr) / metaPreviousYear.total) : "-"}</td>}
          <td>{metaOverall.pages ? Math.round(metaOverall.pages?.reduce((prev, curr) => prev + curr) / metaOverall.total) : "-"}</td>
        </tr>
        <tr>
          <td>Total Words</td>
          {metaYear && <td>{metaYear.words?.reduce((prev, curr) => prev + curr) || "-"}</td>}
          {metaPreviousYear && <td>{metaPreviousYear.words?.reduce((prev, curr) => prev + curr) || "-"}</td>}
          <td>{metaOverall.words?.reduce((prev, curr) => prev + curr) || "-"}</td>
        </tr>
        <tr>
          <td>Average Words per book</td>
          {metaYear && <td>{metaYear.words ? Math.round(metaYear.words?.reduce((prev, curr) => prev + curr) / metaYear.total) : "-"}</td>}
          {metaPreviousYear && <td>{metaPreviousYear.words ? Math.round(metaPreviousYear.words?.reduce((prev, curr) => prev + curr) / metaPreviousYear.total) : "-"}</td>}
          <td>{metaOverall.words ? Math.round(metaOverall.words?.reduce((prev, curr) => prev + curr) / metaOverall.total) : "-"}</td>
        </tr>
      </>}
      </tbody>
    </table>
  </div>

  //TODO: second high and low table with highest and lowest ranked, length, etc individual items
  //Check previous wrapup to see the high/lows used there
  const highLowTable = <div className={'p-datatable'}>
    <table>
      <thead>
        <tr><th></th><th>Title</th><th>Value</th></tr>
      </thead>
      <tbody>
        {metaYear?.highLow.score?.high ? <tr>
          <td>Highest Score</td>
          <td>{metaYear && metaYear.highLow.score.high.val}</td>
          <td>{metaYear && metaYear.highLow.score.high.titles.join(', ')}</td>
        </tr> : <></>}
        {metaYear?.highLow.score?.low ? <tr>
          <td>Lowest Score</td>
          <td>{metaYear && metaYear.highLow.score.low.val}</td>
          <td>{metaYear && metaYear.highLow.score.low.titles.join(', ')}</td>
        </tr> : <></>}
        {type.value !== 'book' && <>
          {metaYear?.highLow.runtimes.high?.val ? <tr>
            <td>Highest Cost</td>
            <td>${metaYear && metaYear.highLow.runtimes.high.val}</td>
            <td>{metaYear && metaYear.highLow.runtimes.high.titles.join(', ')}</td>
          </tr> : <></>}
          {metaYear?.highLow.runtimes.low?.val ? <tr>
            <td>Lowest Cost</td>
            <td>${metaYear && metaYear.highLow.runtimes.low.val}</td>
            <td>{metaYear && metaYear.highLow.runtimes.low.titles.join(', ')}</td>
          </tr> : <></>}
        </>}
        {type.value === 'movie' && <>
          {metaYear?.highLow.cost.high?.val ? <tr>
            <td>Highest Cost</td>
            <td>${metaYear && metaYear.highLow.cost.high.val.toFixed(2)}</td>
            <td>{metaYear && metaYear.highLow.cost.high.titles.join(', ')}</td>
          </tr> : <></>}
          {metaYear?.highLow.cost.low?.val ? <tr>
            <td>Lowest Cost</td>
            <td>${metaYear && metaYear.highLow.cost.low.val.toFixed(2)}</td>
            <td>{metaYear && metaYear.highLow.cost.low.titles.join(', ')}</td>
          </tr> : <></>}
        </>}
      </tbody>
    </table>
  </div>

  return <div id={'statPage'}>
    {statTable}
    {highLowTable}
  </div>
}

export default Stats;