import React, { useEffect, useRef, useState } from 'react'
import Rooms from './Rooms';

const Landing = () => {

    const [name , setName] = useState('');
    const [localAudioTrack, setlocalAudioTrack] = useState(null);
    const [localVideoTrack, setlocalVideoTrack] = useState(null);
    const [isLandding, setIsLandding] = useState(false)
    const videoRef = useRef(null)

    const getCam = async () => {
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
    <Rooms name={name} localAudioTrack={localAudioTrack} localVideoTrack={localVideoTrack}/>
  ) :  ( <>
        {/* <div>Landing</div>
        <video ref={videoRef} width={400} height={400}/>
        <button onClick={() => setIsLandding(true)}>join</button> */}

          <div className="w-full h-screen ">
            <div className="px-10 py-20 flex w-full gap-10">
                <video ref={videoRef} width={400} height={400}/>
                <div className="w-fit ">
                  <h2 className='text-4xl font-semibold my-4'>Join</h2>
                  <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder='Enter your name' className='block border-gray-600 focus:outline-gray-800 border-[1px] px-2 py-1 rounded-xl '/>
                  <button className='w-full text-center bg-blue-500 px-4 py-1 text-semibold text-xl mt-2 rounded-xl' onClick={() => {name.length > 0 ? setIsLandding(true) : alert('Please provide a name')}}>Join</button>
                </div>
            </div>
          </div>
    </>
  )
}

export default Landing