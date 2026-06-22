import { useEffect, useState } from "react";
import { flowerData } from "../data/flowerData";
import "./Flower.css";

export default function Flower({ 
  breed = "sunflower", 
  stage = "sprout", 
  isRunning = false 
}) {
  if (!breed || breed === "no-flower") {
    return (
      <div className="flower-wrapper flower-no-flower">
        <div className="no-flower-placeholder">No flower</div>
      </div>
    );
  }

  const breedImages = flowerData[breed] || flowerData.sunflower;
  const imageSrc = breedImages[stage] || breedImages.sprout;

  return (
    <div className={`flower-wrapper flower-${breed} flower-${stage}`}>
      <img
        src={imageSrc}
        alt={`${breed} ${stage}`}
        className={`flower ${isRunning ? "flower-running" : ""}`}
      />
    </div>
  );
}
