let contentBox = document.getElementById("text-to-test-wrapper");
let fontSamples = document.getElementsByClassName("font-sample");



function getSelectedText() {
    let text = "";
    if (typeof window.getSelection != "undefined") {
        text = window.getSelection().toString().trim();
    } else if(typeof document.selection != "undefined" && document.selection.type == "Text") {
        text = document.selection.createRange().text;
    }
    return text;
}

function updateFontSamples() {
    let text = getSelectedText();
    for (let i = 0; i < fontSamples.length; i++) {
        fontSamples[i].innerText = text;
    }
}

contentBox.addEventListener("mouseup", () => {
  updateFontSamples();
  showSelectedFont();
}, false);

contentBox.addEventListener("keyup", () => {
  updateFontSamples();
  showSelectedFont();
}, false);

window.onload = function() {
  let searchBox = document.getElementById("font-search");
  let checkboxFilters = document.querySelectorAll('input[type=checkbox]');
  let checkboxText = document.getElementsByClassName('checkbox-container');

  for (let i = 0; i < checkboxText; i++) {
    addClass(checkboxText[i], 'font-checked-style');
  }

  searchBox.addEventListener("keyup", searchText, false);
  
  for (let i = 0; i < checkboxFilters.length; i++) {
    checkboxFilters[i].addEventListener('click', filterItems, false);
    checkboxText[i].addEventListener('click', () => {isChecked('font-checked-style')}, false);
    checkboxFilters[i].checked = true;
  }
}
// START attempted functional programming
function isChecked(paramClass) {
  if (this.checked) {
    addClass(this, paramClass);
  } else {
    removeClass(this, paramClass);
  }
}

function addClass(el, classToAdd) {
  el.classList.add(classToAdd);
}

function removeClass(el, classToRemove) {
  el.classList.remove(classToRemove);
}
// END attempted functional programming
apiUrl = "https://www.googleapis.com/webfonts/v1/webfonts?key=" + config.GFONTS_KEY;
 
 
var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
        var status = xhr.status;
        if (status === 200) {
        callback(null, xhr.response);
        } else {
        callback(status, xhr.response);
        }
    };
    xhr.send();
};

var families = [];

getJSON(apiUrl, function(err, data) {
  if (err !== null) {
    alert('Something went wrong: ' + err);
  } else {
    console.log(data);
    console.log(data.items[100].family);
    console.log("Items Length" + data.items.length);

    prepFonts(data);
  }
});

async function prepFonts(data) {
  let names = []
  names = getFontNames(data)
  category = getFontCategory(data);
  createFontElement(names, category);
  await loadFonts(names);
}

function getFontNames(data) {
  let fontNames = [];
  for (let i = 0; i < data.items.length; i++) {
    fontNames.push(data.items[i].family);
  }
  return fontNames;
}
function getFontCategory(data) {
  let fontCat = [];
  for (let i = 0; i < data.items.length; i++) {
    fontCat.push(data.items[i].category);
  }
  return fontCat;
}

async function loadFonts(familyNames) {
  WebFont.load({
    google: {
      families: familyNames
    }
  });
}

function createFontElement(fontName, fontCategory) {
  let container = document.getElementById('font-list');

  for (let i = 0; i < fontName.length; i++) {

    let outerElement = document.createElement('li');
    outerElement.classList.add('font-item-wrapper');
    outerElement.setAttribute('data-font-category', fontCategory[i])
    let element = `
        <h3>${fontName[i]}</h3>
        <i class="fas fa-plus-square" data-font-name='${fontName[i]}'></i>
        <p class="font-sample" style="font-family:'${fontName[i]}';" >FONT</p>
    `;
    outerElement.innerHTML = element
    container.appendChild(outerElement);
  }
  setUpBtnListener();
}

function setUpBtnListener() {
  let buttonClass = document.getElementsByClassName("fa-plus-square");
  for (let i = 0; i < buttonClass.length; i++) {
    buttonClass[i].addEventListener('click', applyFont, false);
  }
}

// applies font to selected text
function applyFont() {
  let fontName = this.dataset.fontName;
  let selText = window.getSelection();

  if (selText.rangeCount) {
    let element = document.createElement('span');
    element.style = 'font-family:' + fontName + ';';
    element.innerHTML = selText.toString();

    let range = selText.getRangeAt(0);
    range.deleteContents();
    range.insertNode(element);
  }
  
}

// function used to show current font of selected text - NOT WORKING
function showSelectedFont() {

  let outputElement = document.getElementById('selected-font');
  let selText = window.getSelection();
  // let selTextRange = selText.getRangeAt(0);
  // let selRangeChildLength = selTextRange.commonAncestorContainer.childNodes.length;
  let selFontFamily = selText.focusNode.parentElement.firstElementChild.style.FontFamily;

  // for (let i = 0; i < selRangeChildLength; i++) {
  //   try {
  //     if (selTextRange.commonAncestorContainer.childNodes[i].innerText.trim() === selText.toString().trim()) {
  //       selFontFamily = selTextRange.commonAncestorContainer.childNodes[i].style.fontFamily;
  //     }
  //   } catch (error) {
  //     console.log("This should be a TypeError - " + error);
  //   }
  // }

  let htmlString = '<span>' + selFontFamily + '</span>';

  outputElement.innerHTML = htmlString;
}

// function for searchbox
function searchText() {
  let searchBox, filter, fontList, fontItem, fontNameHeader, fontNameValue;
  searchBox = document.getElementById('font-search');
  filter = searchBox.value.toUpperCase();
  fontList = document.getElementById('font-list');
  fontItem = fontList.getElementsByTagName('li');

  for (let i = 0; i < fontItem.length; i++) {
    fontNameHeader = fontItem[i].getElementsByTagName('h3')[0];
    fontNameValue = fontNameHeader.textContent || fontNameHeader.innerText;
    if (fontNameValue.toUpperCase().indexOf(filter) > -1) {
      fontItem[i].style.display = "";
    } else {
      fontItem[i].style.display = "none";
    }
  }
}

// function to filter items using checkboxes
function filterItems(e) {
  let clickedItem = e.target;

  if (clickedItem.checked == true) {
    hideOrShowItems(clickedItem.value, true)
  } else if (clickedItem.checked == false) {
    hideOrShowItems(clickedItem.value, false)
  } else {

  }
}

// Hide/Show helper class for checkbox filters
function hideOrShowItems(fontCat, isChecked) {
  let itemsToFilter = document.querySelectorAll("#font-list li")

  for (let i = 0; i < itemsToFilter.length; i++) {
    let currentItem = itemsToFilter[i];

    if(currentItem.getAttribute('data-font-category') == fontCat){
      if (isChecked) {
        currentItem.style.display = "";
      } else if(!isChecked) {
        currentItem.style.display = "none";
      } else {

      }
    }

  }
}

// Prevent Newline in ContentEditable
document.getElementById('text-to-test-wrapper').addEventListener('keypress', (evt) => {
  if (evt.which === 13) {
    evt.preventDefault();
  }
});

