import React from "react";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Mic, MicOff, PhoneOff, MessageSquare, Share } from "lucide-react";
import { motion } from "framer-motion";

export default function VideoControls({
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing,
  showChat,
  onToggleVideo,
  onToggleAudio,
  onToggleScreenShare,
  onToggleChat,
  onEndCall
}) {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="absolute bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur-sm border-t border-gray-700"
    >
      <div className="flex justify-center items-center gap-4 p-6">
        {/* Video Toggle */}
        <Button
          variant={isVideoEnabled ? "secondary" : "destructive"}
          size="lg"
          onClick={onToggleVideo}
          className="rounded-full w-14 h-14"
        >
          {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </Button>

        {/* Audio Toggle */}
        <Button
          variant={isAudioEnabled ? "secondary" : "destructive"}
          size="lg"
          onClick={onToggleAudio}
          className="rounded-full w-14 h-14"
        >
          {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </Button>

        {/* Screen Share */}
        <Button
          variant={isScreenSharing ? "default" : "secondary"}
          size="lg"
          onClick={onToggleScreenShare}
          className="rounded-full w-14 h-14"
        >
          <Share className="w-6 h-6" />
        </Button>

        {/* Chat Toggle */}
        <Button
          variant={showChat ? "default" : "secondary"}
          size="lg"
          onClick={onToggleChat}
          className="rounded-full w-14 h-14"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>

        {/* End Call */}
        <Button
          variant="destructive"
          size="lg"
          onClick={onEndCall}
          className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600"
        >
          <PhoneOff className="w-6 h-6" />
        </Button>
      </div>
    </motion.div>
  );
}