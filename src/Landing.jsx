import React, { useEffect, useRef, useState } from 'react'
import Rooms from './Rooms';

const Landing = () => {

    const [name , setName] = useState();
    const [localAudioTrack, setlocalAudioTrack] = useState(null);
    const [localVideoTrack, setlocalVideoTrack] = useState(null);
    const [isLandding, setIsLandding] = useState(false)
    const videoRef = useRef(null)

    const getCam = async () => {
        alert('getCam')
        const stream = await window.navigator.mediaDevices.getUserMedia({
            audio:true ,
            video:true
        })

        const audioTrack = stream.getAudioTracks()[0];
        const videoTrack = stream.getVideoTracks()[0];

        setlocalAudioTrack(audioTrack)
        setlocalVideoTrack(videoTrack)

        if(!videoRef.current) return;

        videoRef.current.srcObject = new MediaStream([videoTrack])
        videoRef.current.play();
    }

    useEffect(() => {
        getCam()
    }, [videoRef])
    

  return isLandding ? (
    <Rooms name='ayush' localAudioTrack={localAudioTrack} localVideoTrack={localVideoTrack}/>
  ) :  ( <>
        {/* <div>Landing</div>
        <video ref={videoRef} width={400} height={400}/>
        <button onClick={() => setIsLandding(true)}>join</button> */}

          <div className="w-full h-screen bg-slate-900">

          </div>

    </>
  )
}

export default Landing