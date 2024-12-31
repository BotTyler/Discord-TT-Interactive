export default function AudioBoxItem({ name, onClick, onDelete }: { name: string; image?: string; onClick: () => void; onDelete: () => void }) {
  return (
    <div className={`w-100 row p-0 g-0 justify-content-between`}>
      <div
        className="col-9"
        onClick={() => {
          onClick();
        }}
      >
        <div className="w-100 h-100">
          <p className="fs-6 user-select-none m-0">{name}</p>
        </div>
      </div>
      <div className="d-flex col-2 justify-content-end h-100" style={{ color: "black" }}>
        <button
          className="btn btn-danger rounded-circle"
          onClick={() => {
            onDelete();
          }}
        >
          <i className="bi bi-trash3 fs-5" />
        </button>
      </div>
    </div>
  );
}
