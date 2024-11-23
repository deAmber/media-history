import { Tooltip } from 'react-tooltip';
import { useId } from "react";

/**
 * Creates a chip with help icon and tooltip.
 * @param {String} text - Text content of the tooltip.
 * @returns {JSX.Element}
 */
const Description = ({text = ""}) => {
  const id = useId();
  return <>
    <span className={'desc chip'} data-tooltip-id={id} data-tooltip-content={text}/>
    <Tooltip id={id} className={'content3'}/>
  </>
}

export default Description;