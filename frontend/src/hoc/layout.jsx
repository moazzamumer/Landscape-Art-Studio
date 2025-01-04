import Sidebar from 'components/Sidebar/Sidebar'
import React, { useState } from 'react'

const Layout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="">
      <div className="">
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen}/>
        <div 
          className='lg:ml-[250px] pt-24 lg:pt-0'
          onClick={() => {setIsOpen(false)}}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export default Layout