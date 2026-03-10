import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Video, ArrowLeft, Users, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function VideoChat() {
  const [roomName, setRoomName] = useState("");
  const [userName, setUserName] = useState("");
  const [isInCall, setIsInCall] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);

  useEffect(() => {
    // Check if script already exists
    if (document.querySelector('script[src="https://meet.jit.si/external_api.js"]')) {
      setScriptLoaded(true);
      return;
    }

    // Load Jitsi Meet API script
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
    };
  }, []);

  const startCall = () => {
    if (!roomName.trim()) {
      alert("Please enter a room name");
      return;
    }

    if (!scriptLoaded || !window.JitsiMeetExternalAPI) {
      alert("Video chat is still loading, please try again in a moment");
      return;
    }

    setIsInCall(true);
  };

  useEffect(() => {
    if (isInCall && jitsiContainerRef.current && scriptLoaded && window.JitsiMeetExternalAPI) {
      const domain = 'meet.jit.si';
      const options = {
        roomName: `HotelAssist-${roomName.trim().replace(/\s+/g, '-')}`,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: userName.trim() || 'Guest'
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'chat', 'recording',
            'settings', 'raisehand', 'videoquality', 'filmstrip',
            'feedback', 'stats', 'shortcuts', 'tileview', 'mute-everyone'
          ],
          SHOW_JITSI_WATERMARK: false,
        }
      };

      jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);
      
      jitsiApiRef.current.addEventListener('readyToClose', () => {
        endCall();
      });
    }
  }, [isInCall, scriptLoaded, roomName, userName]);

  const endCall = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.dispose();
      jitsiApiRef.current = null;
    }
    setIsInCall(false);
  };

  const copyRoomLink = () => {
    const link = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(roomName)}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    // Check if room name in URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomFromUrl = urlParams.get('room');
    if (roomFromUrl) {
      setRoomName(roomFromUrl);
    }
  }, []);

  if (!isInCall) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full"
        >
          <Link to={createPageUrl("GuestInterface")}>
            <Button variant="ghost" className="mb-4 text-white hover:bg-white/10 rounded-xl">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </Link>

          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardHeader className="text-center pb-6 bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-8">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                <Video className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold">
                Video Chat
              </CardTitle>
              <p className="text-blue-100 mt-2">
                Connect instantly with staff or create a room to share
              </p>
            </CardHeader>
            
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Your Name
                </label>
                <Input
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="text-lg py-3 rounded-xl border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Room Name
                </label>
                <Input
                  placeholder="e.g., Room-305 or FrontDesk"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="text-lg py-3 rounded-xl border-gray-300"
                />
                <p className="text-xs text-gray-500">
                  Create a unique room name or use an existing one to join
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Share this room</p>
                    <p className="text-blue-700">
                      Others can join the same room using the room name or by clicking the shareable link
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={startCall}
                disabled={!roomName.trim() || !scriptLoaded}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-6 text-lg font-semibold shadow-lg rounded-xl"
              >
                <Video className="w-5 h-5 mr-2" />
                {!scriptLoaded ? "Loading..." : "Join Video Call"}
              </Button>

              {roomName && (
                <Button
                  onClick={copyRoomLink}
                  variant="outline"
                  className="w-full py-6 text-base font-semibold rounded-xl border-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 mr-2 text-green-600" />
                      Link Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 mr-2" />
                      Copy Room Link
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 relative">
      <div className="absolute top-4 left-4 z-50">
        <Button
          onClick={endCall}
          variant="outline"
          className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 rounded-xl"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Leave Call
        </Button>
      </div>

      <div 
        ref={jitsiContainerRef} 
        className="w-full h-screen"
      />
    </div>
  );
}