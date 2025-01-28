import React, { useEffect, useRef, useState } from "react";
import { useStudioState } from "@/store/studioState";
import { Maximize } from "lucide-react";

interface VideoProps {
  stream: MediaStream | null;
  name: string;
  walletAddress?: string;
}

const Video = ({ stream, name, walletAddress }: VideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isRecordVideo } = useStudioState();
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [lastPinchDistance, setLastPinchDistance] = useState<number | null>(
    null
  );

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
    updateZoom(zoom + delta, e.clientX, e.clientY);
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
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setStartPosition({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y,
      });
    } else if (e.touches.length === 2) {
      // Start of pinch
      const distance = getPinchDistance(e.touches);
      setLastPinchDistance(distance);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && zoom > 1 && e.touches.length === 1) {
      const touch = e.touches[0];
      const newX = touch.clientX - startPosition.x;
      const newY = touch.clientY - startPosition.y;
      setPosition({ x: newX, y: newY });
    } else if (e.touches.length === 2) {
      // Pinch-to-zoom
      const distance = getPinchDistance(e.touches);
      if (lastPinchDistance !== null) {
        const delta = distance - lastPinchDistance;
        const newZoom = zoom + delta * 0.01;
        updateZoom(
          newZoom,
          (e.touches[0].clientX + e.touches[1].clientX) / 2,
          (e.touches[0].clientY + e.touches[1].clientY) / 2
        );
      }
      setLastPinchDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setLastPinchDistance(null);
  };

  const getPinchDistance = (touches: React.TouchList) => {
    return Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY
    );
  };

  const updateZoom = (newZoom: number, clientX: number, clientY: number) => {
    const clampedZoom = Math.min(Math.max(newZoom, 1), 5);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const newX = (x - position.x) * (1 - clampedZoom / zoom) + position.x;
      const newY = (y - position.y) * (1 - clampedZoom / zoom) + position.y;

      setZoom(clampedZoom);
      setPosition({ x: newX, y: newY });
    }
  };

  const resetZoomAndPosition = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const showResetButton = zoom !== 1 || position.x !== 0 || position.y !== 0;

  useEffect(() => {
    const preventDefaultTouchBehavior = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    document.addEventListener("touchmove", preventDefaultTouchBehavior, {
      passive: false,
    });

    return () => {
      document.removeEventListener("touchmove", preventDefaultTouchBehavior);
    };
  }, []);

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
