import CreatableSelect from "react-select/creatable";
import Select from "react-select";

/**
 * Group wrapper for a standard html input.
 * @param {Boolean} required - Marks the input as required.
 * @param {String} id - Unique ID used for HTML ID and name.
 * @param {String} title - Title text for the input.
 * @param {String} [wrapperClass] - Extra classes for the wrapper.
 * @param otherProps - Other input properties.
 * @returns {JSX.Element}
 */
export const InputGroup = ({required, id, title, wrapperClass = "", ...otherProps}) => {
  return <div className={`inputWrapper ${required ? "required" : ""} ${wrapperClass}`}>
    <label htmlFor={id}>{title}</label>
    <input id={id} name={id} required={required} {...otherProps}/>
  </div>
}

/**
 * Group wrapper for a react select input.
 * @param {Boolean} required - Marks the input as required.
 * @param {String} id - Unique ID used for HTML ID and name.
 * @param {String} title - Title text for the input.
 * @param {String} [wrapperClass] - Extra classes for the wrapper.
 * @param value - Value of the select.
 * @param {Function} setValue - Function for when the value changes.
 * @param {Array} options - Select Options
 * @param otherProps - Other input properties.
 * @returns {JSX.Element}
 */
export const InputSelectGroup = ({required, id, title, wrapperClass = "", value, setValue, options, ...otherProps}) => {
  return <div className={`inputWrapper ${required ? "required" : ""} ${wrapperClass}`}>
    <label htmlFor={id}>{title}</label>
    <Select id={id} options={options.map(v => {return {label: v, value: v}})}
            required={required} value={value} menuPortalTarget={document.body} onChange={setValue}
            unstyled classNamePrefix={'react-select'} className={'react-select-wrapper'} {...otherProps}/>
  </div>
}

/**
 * Group wrapper for a creatable react-select group.
 * @param {Boolean} required - Marks the input as required.
 * @param {String} id - Unique ID used for HTML ID and name.
 * @param {String} title - Title text for the input.
 * @param {String} [wrapperClass] - Extra classes for the wrapper.
 * @param value - Value of the select.
 * @param {Function} setValue - Function for when the value changes.
 * @param {Array} options - Select Options
 * @param otherProps - Other input properties.
 * @returns {JSX.Element}
 */
export const InputCreateSelectGroup = ({required, id, title, wrapperClass = "", value, setValue, options, ...otherProps}) => {

  return <div className={`inputWrapper ${required ? "required" : ""} ${wrapperClass}`}>
    <label htmlFor={id}>{title}</label>
    <CreatableSelect id={id} options={options.map(v => {
      return {value: v, label: v}
    })}
                     value={value} onChange={setValue}
                     menuPortalTarget={document.body}
                     unstyled classNamePrefix={'react-select'} required={required} {...otherProps}/>
  </div>
}

export default InputGroup;