
import { useEffect, useState } from "react";
import { flowerData } from "../data/flowerData";
import "./Flower.css";

export default function Flower({ breed = "sunflower", stage = "sprout", isRunning = false }) {
  const [frameIndex, setFrameIndex] = useState(0);

  const breedFrames = flowerData[breed] || flowerData.sunflower;
  const frames = breedFrames[stage] || breedFrames.sprout;
  const imageSrc = frames[frameIndex % frames.length];

  useEffect(() => {
    setFrameIndex(0);
  }, [stage]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setFrameIndex((prev) => prev + 1);
    }, 180);

    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div className={`flower-wrapper flower-${breed} flower-${stage}`}>
      <img src={imageSrc} alt={`${breed} ${stage}`} className="flower" />
    </div>
  );
}