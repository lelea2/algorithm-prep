import React, { useState } from "react";
import "./App.css";

const ROWS = 10;
const COLUMNS = 10;

function extractCellReferences(formula: string): string[] {
  const regex = /[A-Z]+[0-9]+/g;
  return formula.match(regex) ?? [];
}

function getCellName(row: number, col: number) {
  const column = String.fromCharCode(65 + col);
  return `${column}${row + 1}`;
}

function App() {
  // Stores raw user input/formulas
  // Example:
  // {
  //   A1: "Hello",
  //   B1: "World",
  //   C1: "=CONCAT(A1,B1)"
  // }
  const [reference, setReference] = useState<Record<string, string>>({});

  // Stores displayed/computed values
  const [cells, setCells] = useState<string[][]>(() =>
    Array.from({ length: ROWS }, () =>
      Array(COLUMNS).fill("")
    )
  );

  const [editingCell, setEditingCell] = useState("");

  const handleOnChange = (
    row: number,
    col: number,
    value: string
  ) => {
    const cellName = getCellName(row, col);

    // Update displayed value while editing
    setCells((prev) => {
      const next = prev.map((r) => [...r]);
      next[row][col] = value;
      return next;
    });

    // Keep raw value/formula
    setReference((prev) => ({
      ...prev,
      [cellName]: value,
    }));
  };

  const handleOnBlur = (
    row: number,
    col: number,
    value: string
  ) => {
    const cellName = getCellName(row, col);

    setEditingCell("");

    if (!value.startsWith("=")) {
      return;
    }

    const references = extractCellReferences(value);

    let result = "";

    references.forEach((ref) => {
      result += reference[ref] ?? "";
    });

    setCells((prev) => {
      const next = prev.map((r) => [...r]);
      next[row][col] = result;
      return next;
    });

    // Important:
    // reference[cellName] remains the formula.
    //
    // C1:
    // reference["C1"] = "=CONCAT(A1,B1)"
    // cells[0][2] = "HelloWorld"
  };

  const handleFocus = (
    row: number,
    col: number
  ) => {
    const cellName = getCellName(row, col);
    setEditingCell(cellName);
  };

  const getColLabel = (col: number) => {
    return String.fromCharCode(65 + col);
  };

  return (
    <div className="bg-white">
      <table>
        <thead>
          <tr>
            <th />

            {Array.from({ length: COLUMNS }, (_, col) => (
              <th key={col}>
                {getColLabel(col)}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {cells.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <th>{rowIndex + 1}</th>

              {row.map((val, colIndex) => {
                const cellName = getCellName(
                  rowIndex,
                  colIndex
                );

                const displayValue =
                  editingCell === cellName
                    ? reference[cellName] ?? val
                    : val;

                return (
                  <td key={cellName}>
                    <input
                      value={displayValue}
                      onFocus={() =>
                        handleFocus(
                          rowIndex,
                          colIndex
                        )
                      }
                      onChange={(e) =>
                        handleOnChange(
                          rowIndex,
                          colIndex,
                          e.target.value
                        )
                      }
                      onBlur={(e) =>
                        handleOnBlur(
                          rowIndex,
                          colIndex,
                          e.target.value
                        )
                      }
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;