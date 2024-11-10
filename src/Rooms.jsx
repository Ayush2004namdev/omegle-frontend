import React, { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const URL = 'http://localhost:3000'

const Rooms = ({name , localVideoTrack , localAudioTrack}) => {
    const [remoteVideoTrack, setremoteVideoTrack] = useState(null);
    const [remoteAudioTrack , setRemoteAudioTrack] = useState(null);
    const [sendingPc , setSendingPc] = useState(null);
    const [receivingPc, setReceivingPc] = useState(null)
    const [remoteMediaStream , setRemoteMediaStream] = useState(null) 
    const [socket, setsocket] = useState(null)
    const [lobby, setLobby] = useState(true)
    const [sendersName , setSendersName] = useState(null)
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);


    useEffect(() => {
        const socket = io(URL)
        socket.on('send-offer' , async ({roomId}) => {
            console.log('in send offer')
            const pc = new RTCPeerConnection();
            setSendingPc(pc)

            //set the onTrack function here 
            // pc.ontrack();

            if(localAudioTrack){
                pc.addTrack(localAudioTrack);
            }
            if(localVideoTrack){
                pc.addTrack(localVideoTrack);
            }

            pc.onicecandidate = async (e) => {
                if(e.candidate){
                    socket.emit('add-ice-candidate' , {
                        candidate:e.candidate,
                        type : "sender",
                        roomId
                    })
                }
            }

            pc.onnegotiationneeded = async () => {
                const sdp = await pc.createOffer();
                pc.setLocalDescription(sdp)
                socket.emit('offer' , {
                    sdp,
                    roomId
                })
            }
        })

        socket.on('offer' , async ({roomId , sdp:remoteSdp}) => {
            const pc = new RTCPeerConnection();

            const stream = new MediaStream();
            if(remoteVideoRef.current){
                remoteVideoRef.current.srcObject = stream
            }            

            pc.ontrack = (e) => {
                console.error("inside ontrack");
                const {track, type} = e;
                console.log({track , type})
                console.log(track.kind)
                if (type.kind == 'audio') {
                    setRemoteAudioTrack(track);
                    // @ts-ignore
                    remoteVideoRef?.current?.srcObject?.addTrack(track)
                } else {
                    setremoteVideoTrack(track);
                    // @ts-ignore
                    remoteVideoRef?.current?.srcObject?.addTrack(track)
                }
                //@ts-ignore
                remoteVideoRef.current.play();
            }

            pc.setRemoteDescription(remoteSdp);
            const sdp = await pc.createAnswer();
            pc.setLocalDescription(sdp);

            setRemoteMediaStream(stream)
            setReceivingPc(pc);

            pc.onicecandidate = e => {
                if(!e.candidate) return;

                socket.emit('add-ice-candidate' , {
                    candidate : e.candidate ,
                    roomId,
                    type:'receiver'
                })
            }

            

            socket.emit('answer' , {
                roomId,
                sdp : sdp
            })
    
            // setTimeout(() => {
            //     const track1 = pc.getTransceivers()[0].receiver.track
            //     const track2 = pc.getTransceivers()[1].receiver.track
            //     console.log(track1);
            //     if (track1.kind === "video") {
            //         setRemoteAudioTrack(track2)
            //         setremoteVideoTrack(track1)
            //     } else {
            //         setRemoteAudioTrack(track1)
            //         setremoteVideoTrack(track2)
            //     }
            //     //@ts-ignore
            //     remoteVideoRef?.current?.srcObject?.addTrack(track1)
            //     //@ts-ignore
            //     remoteVideoRef?.current?.srcObject?.addTrack(track2)
            //     //@ts-ignore
            //     remoteVideoRef?.current?.play();
            //     // if (type == 'audio') {
            //     //     // setRemoteAudioTrack(track);
            //     //     // @ts-ignore
            //     //     remoteVideoRef.current.srcObject.addTrack(track)
            //     // } else {
            //     //     // setRemoteVideoTrack(track);
            //     //     // @ts-ignore
            //     //     remoteVideoRef.current.srcObject.addTrack(track)
            //     // }
            //     // //@ts-ignore
            // }, 5000)

        })

        socket.on('answer' , async ({roomId , sdp : remoteSdp}) => {
            setLobby(false)
            setSendingPc(pc =>{
                pc.setRemoteDescription(remoteSdp)
                return pc;
            })
        })



        socket.on('lobby' , () => {
            setLobby(true)
        })

        socket.on('add-ice-candidate' , ({candidate , type}) => {
            if(type == 'sender'){
                setReceivingPc(pc => {
                    pc?.addIceCandidate(candidate);
                    return pc;
                })
            }else{
                setSendingPc(pc => {
                    pc?.addIceCandidate(candidate);
                    return pc;
                })
            }
        })


        setsocket(socket)

    },[name])

    useEffect(() => {
        if (localVideoRef.current) {
            if (localVideoTrack) {
                localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
                localVideoRef.current.play();
            }
        }
    }, [localVideoRef])

  return (
    <div className="px-10">
         <h2>Room Name : {name}</h2>
         <video autoPlay ref={localVideoRef} width={400} height={400} className='mb-10'/>
        {lobby && <h1>Waiting for other user to join</h1> }
        <video autoPlay ref={remoteVideoRef} src='https://i.gifer.com/3yDz.mp4' width={400} height={400} loop/>
         {/* <h2>both videos</h2> */}
         
    </div>
  )
}

export default Rooms