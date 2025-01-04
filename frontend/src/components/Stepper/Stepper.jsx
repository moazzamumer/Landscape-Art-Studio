import React from 'react';
import { LuCircleDot } from "react-icons/lu";
import { FaRegCircle } from "react-icons/fa6";
import { FaCircle } from "react-icons/fa";
const STEPS = ['Upload', 'Crop', 'Style', 'Review']
const STEP_WIDTH=['w-[95px] md:w-[97px]', 'w-[89px] lg:w-[88px]', 'w-[82px] lg:w-[81px]', 'w-[92px] lg:w-[87px]']
export default function Stepper({ currentStep, numberOfSteps }) {
    const activeColor = (index) => currentStep >= index ? 'bg-blue-500' : 'bg-gray-400'
    const isFinalStep = (index) => index === numberOfSteps - 1
    const hasPassed = (index) => currentStep >= index;
    const isCurrent = (index)=> currentStep == index;
    const hasPassedText = (index) => currentStep > index;


    return (
        <div className="flex flex-col justify-center m-3 ml-0 p-3 pt-2 border border-gray-400 rounded-md w-fit h-fit">
            <div className='flex items-center'>

                {Array.from({ length: numberOfSteps }).map((_, index) => (

                    <h1 key={index} className={`bottom-10 ${hasPassedText(index) && 'text-[#95BDFA]'} ${!hasPassedText(index) && !isCurrent(index) && 'text-[#797A7F]'} ${isCurrent(index) && 'text-[#136DF4] font-bold'} ${!isFinalStep(index) && STEP_WIDTH[index]}`} >{STEPS[index]}</h1>

                ))}
            </div>
            <div className='flex items-center pl-[15px]'>
                {Array.from({ length: numberOfSteps }).map((_, index) => (
                    <React.Fragment key={index}>

                        {isCurrent(index) ? <LuCircleDot color={'#136DF4'} size={23} /> :
                        hasPassed(index) ?  <FaCircle color={'#136DF4'} size={23} /> :
                         <FaRegCircle color={ '#9BA3AF'} size={23} />
                        }
                       

                        {isFinalStep(index) ? null : <div className={`w-[65px] h-1 border-t-2 ${hasPassed(index +1) ?'border-[#136DF4]' : 'border-dotted border-gray-400'} `}></div>}
                    </React.Fragment>
                ))}
            </div>
        </div>
    )
}