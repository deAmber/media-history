import {useState} from "react";

const Switch = ({label, id, defaultChecked}) => {
  const [ checked, setChecked ] = useState(defaultChecked)
  return <div className={`switch`}>
    <input type="checkbox" name={id}
           onChange={() => {
             setChecked(!checked)
           }
           }
           className="visually-hidden" tabIndex="-1"
           id={id} checked={checked}
    />
    <label role="switch" aria-checked={checked}
           onKeyUp={(e) => {
             if ((e.key === 'Space' || e.key === 'Enter')) {
               setChecked(!checked);
             }
           }}
           onClick={(e) => {
             setChecked(!checked);
             e.preventDefault();
           }}
           tabIndex="0" htmlFor={id}
    >
        <span className="toggleWrap focusable">
          <span className="toggle"></span>
        </span>
      {label}
    </label>
  </div>

}

export default Switch;