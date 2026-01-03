export default function DeathComponent({ saveNumber, deathNumber, id, deathAdd, deathRemove, saveAdd, saveRemove }: { saveNumber: number; deathNumber: number; id: string; deathAdd: () => void; deathRemove: () => void; saveAdd: () => void; saveRemove: () => void }) {
  return (
    <div className="w-100 d-flex flex-column justify-content-center align-items-center py-2 gap-3">
      {/* Success Saving Throws */}
      <div className="w-auto d-flex gap-5">
        {[1, 2, 3].map((val) => {
          return (
            <div key={`SaveOption-${val}`}>
              <input
                type="radio"
                className="btn-check"
                id={`Save-${val}-${id}`}
                checked={val <= saveNumber}
                onChange={(e) => {
                  e.preventDefault();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  if (val > saveNumber) {
                    saveAdd();
                  } else {
                    saveRemove();
                  }
                }}
                readOnly
              />
              <label className="btn btn-outline-success" htmlFor={`Save-${val}-${id}`}>
                <i className="bi bi-heart"></i>
              </label>
            </div>
          );
        })}
      </div>
      {/* Death Saving Throws */}
      <div className="w-auto d-flex gap-5">
        {[1, 2, 3].map((val) => {
          return (
            <div key={`DeathSaveOption-${val}`}>
              <input
                type="radio"
                className="btn-check"
                id={`DeathSave-${val}-${id}`}
                checked={val <= deathNumber}
                onChange={(e) => {
                  e.preventDefault();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  if (val > deathNumber) {
                    deathAdd();
                  } else {
                    deathRemove();
                  }
                }}
                readOnly
              />
              <label className="btn btn-outline-danger" htmlFor={`DeathSave-${val}-${id}`}>
                <i className="bi bi-heartbreak"></i>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
