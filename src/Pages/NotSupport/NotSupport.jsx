import React from 'react'
import './notsupport.css'
function NotSupport() {
  return (
    <div className='notsupport_container'>
      <img src="/Commen/imgno.png" alt="notsupport" className='notsupport' />
      <p className='titlenot'>Mobile Not Supported</p>
      <p className='peranot'>This dashboard is optimized for larger screens. Please access it using a desktop or tablet device for the best experience.</p>
    </div>
  )
}

export default NotSupport
