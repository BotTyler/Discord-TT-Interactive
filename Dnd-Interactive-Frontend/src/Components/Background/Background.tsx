export default function Background({ background }: { background: string }) {
  return (
    <div className="position-absolute w-100 h-100" style={{ zIndex: -1 }}>
      <div className="w-100 h-100 position-relative">
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: "rgba(50,50,50,.4)", zIndex: 0 }}></div>

        <img src={background} className="position-absolute top-0 start-0 w-100 h-100" alt="background" style={{ zIndex: -1 }} />
      </div>
    </div>
  );
}
