import "./Sunflower.css";
import seed from "../assets/sunflower/sunflowerSeed.png";
import sprout from "../assets/sunflower/sunflowerSprout.png";
import bud from "../assets/sunflower/sunflowerBud.png";
import half from "../assets/sunflower/sunflowerHalf.png";
import full from "../assets/sunflower/sunflowerFull.png";

const stageImages = {
  seed,
  sprout,
  bud,
  half,
  full,
};

export default function Sunflower({ stage = "seed" }) {
  const imageSrc = stageImages[stage] || seed;

  return (
    <div className={`sunflower-wrapper sunflower-${stage}`}>
      <img src={imageSrc} alt={`sunflower ${stage}`} className="sunflower" />
    </div>
  );
}
