import "./styles.css";

import { tableData } from "./data";

//Получение данных таблицы из LocalStorage, если они есть.
//Если нет, то из файла data
let data = localStorage.dataOfTable
  ? JSON.parse(localStorage.dataOfTable)
  : tableData;

const root = document.getElementById("root");

//Создание таблицы
const table = document.createElement("table");
table.className = "table";
root.appendChild(table);

//Создание шапки таблицы
const tHead = document.createElement("thead");
table.appendChild(tHead);
const headRow = document.createElement("tr");
headRow.className = "table__row";
tHead.appendChild(headRow);
const headData = ["№ п/п", "ФИО", "Задача", "Дата"];
headData.map(item => {
  const cell = document.createElement("td");
  cell.className = `table__cell`;
  cell.innerHTML = item;
  headRow.appendChild(cell);
});

//Создание тела таблицы
const tBody = document.createElement("tbody");
tBody.className = "table__body";
tBody.id = "tableBody";
table.appendChild(tBody);

function tableBodyInit(data) {
  data.map((item, counter) => {
    const row = document.createElement("tr");
    row.className = "table__row droppable";
    row.id = item.id;
    row.addEventListener("mousedown", onMouseDown);
    tBody.appendChild(row);

    for (let key in item) {
      if (key !== "id") {
        const cell = document.createElement("td");
        cell.className = `table__cell table__cell_${key}`;
        cell.innerHTML = key === "npp" ? counter + 1 : item[key];
        row.appendChild(cell);
      }
    }
  });
}

tableBodyInit(data);

//Обработка событий при перемещении строки таблицы
function onMouseDown(event) {
  const { clientX, clientY } = event;
  const row = event.target.parentNode;

  let shiftX = clientX - row.getBoundingClientRect().left;
  let shiftY = clientY - row.getBoundingClientRect().top;

  row.style.position = "absolute";
  row.style.display = "block";
  row.style.left = "0px";

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);

  //
  let previousElement = null;
  let currentElement = null;

  function onMouseMove(event) {
    const { pageX, pageY, clientX, clientY } = event;

    row.style.left = `${pageX - shiftX}px`;
    row.style.top = `${pageY - shiftY}px`;

    //Определение строки таблицы, которая находится под перемещаемой строкой.
    row.hidden = true;

    for (let i = 0; i < row.childNodes.length; i++) {
      row.childNodes[i].hidden = true;
    }

    const elem = document.elementFromPoint(clientX, clientY);
    const elemParent = elem ? elem.parentNode : null;
    const elemBelow =
      elemParent.className === "table__row droppable" ||
      elemParent.className === "table__row droppable active"
        ? elemParent
        : null;

    row.hidden = false;

    for (let i = 0; i < row.childNodes.length; i++) {
      row.childNodes[i].hidden = false;
    }

    //Эффекты при перемещении строки над таблицей
    currentElement = elemBelow;

    if (currentElement) {
      enterDroppable(currentElement);
    }

    if (currentElement != previousElement) {
      if (previousElement) {
        leaveDroppable(previousElement);
      }
    }

    previousElement = currentElement;

    function enterDroppable(element) {
      element.className = "table__row droppable active";
    }

    function leaveDroppable(element) {
      element.className = "table__row droppable";
    }
  }

  function onMouseUp(event) {
    row.style.position = "static";
    row.style.display = "table-row";
    row.style.left = null;
    row.style.top = null;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);

    if (currentElement) {
      currentElement.className = "table__row droppable";

      const newPlace = currentElement.firstChild.innerHTML - 1;
      const oldPlace = row.firstChild.innerHTML - 1;

      //Переместить элемент массива на новое место
      data = swapArray(data, oldPlace, newPlace);

      //Перерисовать таблицу с новым порядком данных
      const tBody = document.getElementById("tableBody");
      tBody.innerHTML = "";
      tableBodyInit(data);

      //Запись измененных данных в localStorage
      localStorage.dataOfTable = JSON.stringify(data);
    }
  }
}

//Перемещение элемента массива на новое место
function swapArray(arr, oldPlace, newPlace) {
  if (
    Math.min(oldPlace, newPlace) < 0 ||
    Math.max(oldPlace, newPlace) >= arr.length
  ) {
    console.error("Out of range");
    return null;
  }
  const item = arr.splice(oldPlace, 1);
  arr.splice(newPlace > 0 ? newPlace : 0, 0, item[0]);
  return arr;
}
