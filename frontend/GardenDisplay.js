import React from "react";
import "./GardenDisplay.css";

const MAX_FLOWERS = 5;

function GardenDisplay({
  selectedFlowers,
  unlockedFlowers,
  onToggleFlower,
  onSaveGarden,
  isSaving,
  message,
}) {
  const gardenFlowers = selectedFlowers
    .map((species) =>
      unlockedFlowers.find((flower) => flower.species === species)
    )
    .filter(Boolean);

  return (
    <section className="garden-page-section">
      <div className="garden-title-area">
        <p className="garden-eyebrow">Your personal collection</p>
        <h2>My Display Garden</h2>
        <p>
          Choose up to {MAX_FLOWERS} flowers to decorate your garden.
        </p>
      </div>

      <div className="pixel-garden">
        <div className="garden-sun" aria-hidden="true" />
        <div className="garden-cloud cloud-one" aria-hidden="true" />
        <div className="garden-cloud cloud-two" aria-hidden="true" />

        <div className="garden-fence" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>

        <div className="garden-sign">
          <span>StudySprout</span>
          <small>Keep growing!</small>
        </div>

        <div className="garden-grass-back" />

        <div className="flower-display-area">
          {gardenFlowers.length === 0 ? (
            <div className="empty-garden-message">
              <div className="empty-garden-sprout">🌱</div>
              <h3>Your garden is waiting to bloom</h3>
              <p>
                Select flowers from your collection to display them here.
              </p>
            </div>
          ) : (
            gardenFlowers.map((flower, index) => (
              <button
                type="button"
                className={`display-flower display-flower-${index + 1}`}
                key={flower.species}
                onClick={() => onToggleFlower(flower.species)}
                aria-label={`Remove ${flower.species} from garden`}
                title="Click to remove"
              >
                <img
                  src={flower.image}
                  alt={`${flower.species} flower`}
                />

                <span className="display-flower-name">
                  {flower.species}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="garden-soil">
          <div className="garden-stone stone-one" />
          <div className="garden-stone stone-two" />
          <div className="garden-stone stone-three" />
        </div>

        <div className="garden-grass-front" />
      </div>

      <div className="garden-save-row">
        <p>
          <strong>{selectedFlowers.length}</strong> / {MAX_FLOWERS} flowers
          selected
        </p>

        <button
          type="button"
          className="save-garden-button"
          onClick={onSaveGarden}
          disabled={isSaving}
        >
          {isSaving ? "Saving Garden..." : "Save My Garden"}
        </button>
      </div>

      {message && (
        <p className="garden-feedback" role="status">
          {message}
        </p>
      )}

      <section className="flower-collection-section">
        <div className="collection-heading">
          <div>
            <p className="garden-eyebrow">Unlocked species</p>
            <h2>Flower Collection</h2>
          </div>

          <p>Click a flower to add or remove it from your display garden.</p>
        </div>

        {unlockedFlowers.length === 0 ? (
          <div className="collection-empty-state">
            <h3>No flowers unlocked yet</h3>
            <p>
              Complete your first focus session to begin growing your
              collection.
            </p>
          </div>
        ) : (
          <div className="flower-collection-grid">
            {unlockedFlowers.map((flower) => {
              const isSelected = selectedFlowers.includes(
                flower.species
              );

              return (
                <article
                  className={`collection-flower-card ${
                    isSelected ? "collection-flower-selected" : ""
                  }`}
                  key={flower.species}
                >
                  {isSelected && (
                    <span className="displayed-badge">
                      In Garden
                    </span>
                  )}

                  <div className="collection-flower-image">
                    <img
                      src={flower.image}
                      alt={`${flower.species} fully bloomed`}
                    />
                  </div>

                  <h3>{flower.species}</h3>

                  <span
                    className={`rarity-label rarity-${flower.rarity
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {flower.rarity}
                  </span>

                  <p className="flower-count">
                    Collected × {flower.count}
                  </p>

                  <button
                    type="button"
                    className={
                      isSelected
                        ? "remove-flower-button"
                        : "add-flower-button"
                    }
                    onClick={() => onToggleFlower(flower.species)}
                  >
                    {isSelected
                      ? "Remove from Garden"
                      : "Add to Garden"}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}

export default GardenDisplay;