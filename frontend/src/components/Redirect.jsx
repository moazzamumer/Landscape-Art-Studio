import { useEffect } from "react";
import { useNavigate } from "react-router-dom"

export const Redirect = ()=>{
    const navigate = useNavigate();

    useEffect(()=>{
        navigate('/create')
    }, [])
    return <></>

}