export function MottoMarquee() {
  const items = [
    "Strive to Excel",
    "Est. 1946",
    "O' Level & A' Level",
    "Boys' Boarding",
    "Rubaga Hill, Jinja",
    "Godliness · Discipline · Excellence",
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
