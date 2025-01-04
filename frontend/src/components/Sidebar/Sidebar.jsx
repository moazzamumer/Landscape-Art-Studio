import React from "react";
import { SlPicture } from "react-icons/sl";
import image from "assets/images.svg";
import account from "assets/account.svg";
import help from "assets/help.svg";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { FiMenu } from "react-icons/fi";
import { useCreatePageContext } from "context/CreateContext";
import { CREATE_PAGE_ACTIONS } from "CONSTANTS";

const Sidebar = ({isOpen, setIsOpen}) => {
  const { pathname: active } = useLocation();
  const { state, dispatch } = useCreatePageContext();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  return (
    <>
    {!isOpen &&
      <button
        className="lg:hidden fixed top-4 sm:left-4 left-3 z-20 p-2 bg-black text-white rounded-md"
        onClick={toggleSidebar}
      >
        <FiMenu size={24} />
      </button>
    }
      <div className={`bg-black h-full fixed z-10 transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 w-[250px]`}>
        <div className="pt-8 pr-6 pl-6">
          <div className="flex flex-col justify-start items-start gap-10 ml-2">
            <div className="flex justify-start items-center gap-3 pr-7">
              <img src="Logomark.png" alt="Landscape logo" />
              <h1 className="text-white text-[1.15rem] font-bold leading-[1.05rem] text-center">
                Landscape AI
              </h1>
            </div>
            <div className="flex justify-start flex-col w-[100%] gap-2">
              <Link
                to="/create"
                onClick={() => dispatch({ type: CREATE_PAGE_ACTIONS.STATE_REINITIAZED})}
                className={`flex flex-grow justify-start items-center gap-3 py-1.5 pl-3  ${
                  active === "/create"
                    ? "bg-white rounded-md text-[#136DF4]"
                    : "text-white"
                }`}
              >
                <SlPicture size={12} color="#6D6E70" />
                <p className="text-[0.9rem] font-normal leading-[1.05rem] text-center">
                  Create
                </p>
              </Link>
              <Link
                to="/my-images"
                className={`flex flex-grow justify-start items-center gap-3 py-1.5 pl-3  ${
                  active === "/my-images"
                    ? "bg-white rounded-md text-[#136DF4]"
                    : "text-white"
                }`}
              >
                <img src={image} width={12} height={12} />
                <p className="text-[0.9rem] font-normal leading-[1.05rem] text-center">
                  My Images
                </p>
              </Link>
              <Link
                to="#"
                className={`flex flex-grow justify-start items-center gap-3 py-1.5 pl-3  ${
                  active === "/help"
                    ? "bg-white rounded-md text-[#136DF4]"
                    : "text-white"
                }`}
                // onClick={()=>setActive('help')}
              >
                <img src={help} width={12} height={12} />
                <p className="text-[0.9rem] font-normal leading-[1.05rem] text-center">
                  Help
                </p>
              </Link>
              <Link
                to="#"
                className={`flex flex-grow justify-start items-center gap-3 py-1.5 pl-3  ${
                  active === "/account"
                    ? "bg-white rounded-md text-[#136DF4]"
                    : "text-white"
                }`}
                // onClick={()=>setActive('account')}
              >
                <img src={account} width={12} height={12} />
                <p className="text-[0.9rem] font-normal leading-[1.05rem] text-center">
                  Account
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
