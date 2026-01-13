import { useEffect, useState } from "react";
import Modal from "../Modal/Modal";
import { BuffsArray, Conditions, DebufArray, GeneralConditionArray } from "../../shared/StatusTypes";

interface ConditionCheckboxInterface {
  condition: Conditions;
  isSelected: boolean;
}

export default function StatusDropdown(
  { selectedStatuses, onSubmit, onClose }:
    {
      selectedStatuses: string[],
      onSubmit: (result: string[]) => void,
      onClose: () => void
    }) {

  const contentList: { heading: string; statuses: string[] }[] = [
    { heading: "General Conditions", statuses: GeneralConditionArray },
    { heading: "Buffs", statuses: BuffsArray },
    { heading: "Debufs", statuses: DebufArray }
  ];

  const [result, setResult] = useState<{ [key: string]: string[] }>({});

  return (
    <Modal
      Title="Status"
      submitCallback={() => {
        const combined: string[] = [];
        Object.keys(result).forEach((key: string): void => {
          combined.push(...result[key]);
        });

        onSubmit(combined);
      }}
      closeCallback={() => {
        onClose();
      }}
    >
      <div className="w-100 h-100 overflow-auto">
        {contentList.map((section: { heading: string, statuses: string[] }, index: number) => {
          return (
            <div className="border-bottom border-1 border-secondary pb-2 mb-2" key={`StatusCategoryList-${section.heading}-${index}`}>
              <p className="h3">{section.heading}</p>
              <GridDisplayStatus init={section.statuses.map((status: string): ConditionCheckboxInterface => {
                const isSelected: boolean = selectedStatuses.find((element: string) => element === status) != undefined;
                return { condition: status, isSelected };
              })}
                onChange={(val: ConditionCheckboxInterface[]): void => {
                  setResult((prev) => {

                    const conditionStatus: string[] = val.filter((ele: ConditionCheckboxInterface): boolean => ele.isSelected)
                      .map((ele: ConditionCheckboxInterface): string => ele.condition);

                    return { ...prev, [`${section.heading}`]: conditionStatus };
                  })
                }}
              />
            </div>
          )
        })}
      </div>
    </Modal>
  )
}


function GridDisplayStatus({ init, onChange }: { init: ConditionCheckboxInterface[], onChange: (val: ConditionCheckboxInterface[]) => void }) {

  const [_items, setItems] = useState<ConditionCheckboxInterface[]>(init);

  // useEffect(() => {
  //   setItems(items);
  // }, [items]);

  useEffect(() => {
    onChange(_items);
  }, [_items]);

  return (
    <div className="w-100 row justify-content-start m-0">
      {_items.map((val: ConditionCheckboxInterface, index: number) => {
        return (
          <div
            className={`col-4  p-1`}
            style={{
              height: "50px",
              cursor: "pointer"
            }}
            key={`SubsectionElementMap-${val.condition}-${index}`}
            onClick={() => {
              setItems((prev) => {
                const changedValueArray: ConditionCheckboxInterface[] = prev.map((ele: ConditionCheckboxInterface) => {
                  if (ele.condition !== val.condition) return ele;
                  return { condition: ele.condition, isSelected: !ele.isSelected };
                })

                onChange(changedValueArray);

                return changedValueArray;
              })
            }}
          >
            <div
              className={`d-flex ${val.isSelected ? "bg-primary" : ""} w-100 h-100 rounded border border-1 border-secondary p-1`}
              style={{
                transition: "background-color 100ms ease-in"
              }}
            >
              <img
                className="img-fluid"
                src={`Assets/Conditions/${val.condition}.png`}
                draggable="false"
                style={{ userSelect: "none" }}
              />
              <div className="w-100 h-100 d-flex justify-content-center align-items-center">
                <p className="m-0 p-0" style={{ userSelect: "none" }}>{val.condition}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
