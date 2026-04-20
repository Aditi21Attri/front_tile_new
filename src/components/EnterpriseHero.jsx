export default function EnterpriseHero({ onRefresh }) {
  return (
    <section className="hero-banner" aria-label="TileDetect AI header">
      <div className="hero-banner__text">
        <p className="eyebrow hero-banner__eyebrow">TileDetect AI</p>
        <h1 className="hero-banner__title">
          TileDetect <span className="hero-banner__accent">AI</span>
        </h1>
        <p className="subhead hero-banner__subhead">
          Enterprise-grade tile detection and smart recommendations.
        </p>
      </div>
      <button className="cta hero-banner__cta" type="button" onClick={onRefresh}>
        Refresh Insights
      </button>
    </section>
  );
}

