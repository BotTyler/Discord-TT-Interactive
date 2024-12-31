export default function DeathComponent({ saveNumber, deathNumber, id, deathAdd, deathRemove, saveAdd, saveRemove }: { saveNumber: number; deathNumber: number; id: string; deathAdd: () => void; deathRemove: () => void; saveAdd: () => void; saveRemove: () => void }) {
  return (
    <div className="w-100">
      {/* Death Saving Throws */}
      <div className="w-100 row">
        <div className="col-2">
          <p>X</p>
        </div>
        <div className="col-10 row">
          {[1, 2, 3].map((val) => {
            return (
              <div key={`DeathSaveOption-${val}`} className="col-4">
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
                  Dead
                </label>
              </div>
            );
          })}
        </div>
      </div>
      {/* Success Saving Throws */}
      <div className="w-100 row">
        <div className="col-2">
          <p>C</p>
        </div>
        <div className="col-10 row">
          {[1, 2, 3].map((val) => {
            return (
              <div key={`SaveOption-${val}`} className="col-4">
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
                  Success
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
