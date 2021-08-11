import ToDoList from "./todolist.js";
import ToDoItem from "./todoitem.js";

const toDoList = new ToDoList();

//ejecucion de la aplicacion
document.addEventListener("readystatechange", (e) => {
  if (e.target.readyState === "complete") {
    initApp();
  }
});

const initApp = () => {
  const itemEntryForm = document.getElementById("itemEntryForm");
  itemEntryForm.addEventListener("submit", (e) => {
    e.preventDefault();
    processSubmission();
  });

  const clearItems = document.getElementById("clearItems");
  clearItems.addEventListener("click", (e) => {
    const list = toDoList.getList();
    if (list.length) {
      swal({
        title: "¿Estas seguro?",
        text: "¿Estas seguro de querer limpiar toda la lista?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then((willDelete) => {
        if (willDelete) {
          toDoList.clearList();
          updatePersistentData(toDoList.getList());
          refreshThePage();
          swal("La lista ha sido limpiada con exito", {
            icon: "success",
          });
        } else {
          swal("La operación de eliminado ha sido cancelada", {
            icon: "success",
          });
        }
      });
    }
  });
  loadListObject();
  refreshThePage();
};

const loadListObject = () => {
  const storedList = localStorage.getItem("toDoListApp");
  if (typeof storedList !== "string") return;
  const parsedList = JSON.parse(storedList);
  parsedList.forEach((itemObj) => {
    const newToDoItem = createNewItem(itemObj._id, itemObj._item);
    toDoList.addItemToList(newToDoItem);
  });
};

const refreshThePage = () => {
  clearListDisplay();
  renderList();
  clearItemEntryField();
  setFocusOnItemEntry();
};

const clearListDisplay = () => {
  const parentsElement = document.getElementById("listItems");
  deleteContents(parentsElement);
};

const deleteContents = (parentsElement) => {
  let child = parentsElement.lastElementChild;
  while (child) {
    parentsElement.removeChild(child);
    child = parentsElement.lastElementChild;
  }
};

const renderList = () => {
  const list = toDoList.getList();
  list.forEach((item) => {
    buildListItem(item);
  });
};

const buildListItem = (item) => {
  const div = document.createElement("div");
  div.className = "item";
  const check = document.createElement("input");
  check.type = "checkbox";
  check.id = item.getId();
  check.tabIndex = 0;
  addClickListenerToCheckbox(check);
  const label = document.createElement("label");
  label.htmlFor = item.getId();
  label.textContent = item.getItem();
  div.appendChild(check);
  div.appendChild(label);
  const container = document.getElementById("listItems");
  container.appendChild(div);
};

const addClickListenerToCheckbox = (checkbox) => {
  checkbox.addEventListener("click", (e) => {
    toDoList.removeItemFromList(checkbox.id);
    updatePersistentData(toDoList.getList());
    const removedText = getLabelText(checkbox.id);
    updateScreenReaderConfirmation(removedText, "Fue removido de la lista");
    setTimeout(() => {
      refreshThePage();
    }, 1000);
  });
};

const getLabelText = (checkboxId) => {
  return document.getElementById(checkboxId).nextElementSibling.textContent;
};

const updatePersistentData = (listArray) => {
  localStorage.setItem("toDoListApp", JSON.stringify(listArray));
};

const clearItemEntryField = () => {
  document.getElementById("newItem").value = "";
};

const setFocusOnItemEntry = () => {
  document.getElementById("newItem").focus();
};

const processSubmission = () => {
  const newEntryText = getNewEntry();
  if (!newEntryText.length) return;
  const nextItemId = calcNextItemId();
  const toDoItem = createNewItem(nextItemId, newEntryText);
  toDoList.addItemToList(toDoItem);
  updatePersistentData(toDoList.getList());
  updateScreenReaderConfirmation(newEntryText, "Fue agregado a la lista");
  refreshThePage();
};

const getNewEntry = () => {
  return document.getElementById("newItem").value.trim();
};

const calcNextItemId = () => {
  let nextItemId = 1;
  const list = toDoList.getList();
  if (list.length > 0) {
    nextItemId = list[list.length - 1].getId() + 1;
  }
  return nextItemId;
};

const createNewItem = (itemId, itemText) => {
  const toDo = new ToDoItem();
  toDo.setId(itemId);
  toDo.setItem(itemText);
  return toDo;
};

const updateScreenReaderConfirmation = (newEntryText, actionVerb) => {
  document.getElementById(
    "confirmation"
  ).textContent = `${newEntryText} ${actionVerb}.`;
};
