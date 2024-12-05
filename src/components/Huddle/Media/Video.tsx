import React, { useEffect, useRef, useState } from "react";
import { useStudioState } from "@/store/studioState";
import { Maximize } from "lucide-react";

interface VideoProps {
  stream: MediaStream | null;
  name: string;
}

const Video = ({ stream, name }: VideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isRecordVideo } = useStudioState();
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const videoObj = videoRef.current;

    if (videoObj && stream) {
      videoObj.srcObject = stream;
      videoObj.onloadedmetadata = async () => {
        try {
          videoObj.muted = true;
          await videoObj.play();
        } catch (error) {
          console.error(error);
        }
      };
    }
  }, [stream]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    const newZoom = Math.min(Math.max(zoom + delta, 1), 5);
    setZoom(newZoom);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newX = (x - position.x) * (1 - newZoom / zoom) + position.x;
      const newY = (y - position.y) * (1 - newZoom / zoom) + position.y;

      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPosition({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      const newX = e.clientX - startPosition.x;
      const newY = e.clientY - startPosition.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setStartPosition({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && zoom > 1 && e.touches.length === 1) {
      const touch = e.touches[0];
      const newX = touch.clientX - startPosition.x;
      const newY = touch.clientY - startPosition.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const resetZoomAndPosition = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const showResetButton = zoom !== 1 || position.x !== 0 || position.y !== 0;
  return (
    <>
      <div
        ref={containerRef}
        className=" rounded-lg overflow-hidden"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <video
          className="h-full w-full object-cover"
          ref={videoRef}
          autoPlay
          muted
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${
              position.y / zoom
            }px)`,
            transition: isDragging ? "none" : "transform 0.3s ease-out",
          }}
        />
        {showResetButton && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <button
              className="bg-[#0a0a0a] text-sm text-white px-3 py-2 flex justify-center items-center gap-1.5 rounded-md shadow-md hover:bg-[#131212] transition-colors"
              onClick={resetZoomAndPosition}
            >
              <Maximize size={16} />
              Original View
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Video;
