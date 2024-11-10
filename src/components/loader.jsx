const Loader = ({message = "Loading data, please wait..."}) => {
  return (
    <div className={'loaderContainer'}>
      <h4>{message}</h4>
      <div className={'spinner'}></div>
    </div>
  )
}

export default Loader;