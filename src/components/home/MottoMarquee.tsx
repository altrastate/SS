export function MottoMarquee() {
  const items = [
    "Knowledge Is Our Future Light",
    "Kawowo, Kapchorwa",
    "O-Level & A-Level",
    "Girls and boys",
    "Government-aided",
    "Knowledge · Leadership · Community",
  ];
  const line = [...items, ...items];
  return (
    <div className="jico-marquee" aria-hidden="true">
      <div className="track">
        {line.flatMap((item, index) => [
          <span key={`${item}-${index}`}>{item}</span>,
          <span key={`star-${index}`}>✦</span>,
        ])}
      </div>
    </div>
  );
}
