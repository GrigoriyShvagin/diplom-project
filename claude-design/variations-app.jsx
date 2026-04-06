/* global React, ReactDOM, Variations, DesignCanvas, DCSection, DCArtboard */
const { useEffect } = React;

function App() {
  useEffect(() => {
    document.documentElement.dataset.palette = "adventure";
    document.documentElement.dataset.typeset = "editorial";
    document.documentElement.dataset.density = "comfortable";
    document.documentElement.dataset.radius = "soft";
  }, []);

  const V = Variations;

  return (
    <DesignCanvas
      title="Friends Journey · Альтернативные направления"
      subtitle="Каждая строка — одна область сравнения. Кликните в карточку, чтобы открыть её на полный экран."
    >
      <DCSection id="hero" title="Hero · посадочная страница">
        <DCArtboard id="hero-editorial" label="Editorial · serif italic, layered diorama" width={1280} height={720}>
          <V.HeroEditorial />
        </DCArtboard>
        <DCArtboard id="hero-split" label="Split · color block + portrait" width={1280} height={720}>
          <V.HeroSplit />
        </DCArtboard>
        <DCArtboard id="hero-alpine" label="Alpine · dark mountain night" width={1280} height={720}>
          <V.HeroAlpine />
        </DCArtboard>
      </DCSection>

      <DCSection id="trip-cards" title="Карточка поездки · 3 направления">
        <DCArtboard id="card-a" label="A · Photo cover (как в прототипе)" width={460} height={520}>
          <V.TripCardA />
        </DCArtboard>
        <DCArtboard id="card-b" label="B · Type-led horizontal" width={580} height={300}>
          <V.TripCardB />
        </DCArtboard>
        <DCArtboard id="card-c" label="C · Itinerary peek" width={460} height={500}>
          <V.TripCardC />
        </DCArtboard>
      </DCSection>

      <DCSection id="features" title="Блок «Возможности» · 3 направления">
        <DCArtboard id="feat-a" label="A · Coloured 4-up grid" width={1100} height={300}>
          <V.FeatureRowA />
        </DCArtboard>
        <DCArtboard id="feat-b" label="B · Numbered list" width={1100} height={420}>
          <V.FeatureRowB />
        </DCArtboard>
        <DCArtboard id="feat-c" label="C · Hero + secondary stack" width={1100} height={420}>
          <V.FeatureRowC />
        </DCArtboard>
      </DCSection>

      <DCSection id="votes" title="Карточка голосования · 3 направления">
        <DCArtboard id="vote-a" label="A · Inline progress (как в прототипе)" width={460} height={400}>
          <V.VoteCardA />
        </DCArtboard>
        <DCArtboard id="vote-b" label="B · Stacked summary bar" width={460} height={400}>
          <V.VoteCardB />
        </DCArtboard>
        <DCArtboard id="vote-c" label="C · Avatar-led radio" width={460} height={400}>
          <V.VoteCardC />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
