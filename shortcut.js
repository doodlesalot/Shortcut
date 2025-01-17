/* 
- Initialize Variables
- Sanitize arrays (let groups = []) arrays of objects -> two arrays - 1 of labels + 1 of constructed button objects
- Run program 
- Initialize timer
*/

// Function to remove any shortcut buttons that exist
function removeShortcuts() {
  let shortcuts = document.querySelectorAll("#shortcut");

  for (let shortcut of shortcuts) {
    shortcut.parentNode.removeChild(shortcut);
  }
}

// Initialize arrays used in program
let labels = [];
let buttonsArray = [];

// Build admin links
function launchSearch(input) {
  window.open(`http://${input}.myshopify.com/admin`);
}

// Build admin links
function takeMeAway(input) {
  window.open(`${input}`);
}

/* 
- Create button objects + constructors  
  - type: enabled = button success style + working link + click listener
  - type: invalid = button failed style + update listener 
*/

class ShortcutButton {
  constructor(value, parent, type) {
    this.value = value;
    this.parent = parent;
    this.type = type;
  }
}

/* 
- Search for elements
- add all to array
- Validate variable inputs for type 1 or 2
- construct buttons objects and add to objects array
*/

function findLabels() {
  //Find all labels
  let labels = document.getElementsByTagName("LABEL");

  for (label of labels) {
    //Pick out Storefront URL labels
    labelTitle = label.innerText.toLowerCase();
    if (labelTitle === "storefront url") {
      //select it's input field
      let inputField = label.nextElementSibling;
      let inputFieldString = inputField.value.toString();

      //Validate whether shopURL is a "myshopify.com" URL
      if (inputFieldString.includes(".myshopify.com")) {
        let shopURL = sanitize(inputFieldString);

        function sanitize(string) {
          let data = string;
          let subdomain = data.search(".myshopify.com");
          let start = data.substring(0, subdomain);

          return start
            .replace(/^(?:https?:\/\/)?(?:www\.)?/i, "")
            .split(".")[0];
        }

        console.log(
          `%cShortcuts– Valid Storefront URL found: ${shopURL}`,
          "color:green;"
        );
        buttonsArray.push(
          new ShortcutButton(shopURL, inputField.parentElement, "success")
        );
      }
    } else if(label.nextElementSibling && label.nextElementSibling.tagName == "INPUT"){
      let inputField = label.nextElementSibling;
      let theContents = label.nextElementSibling.value;
      if (theContents.includes(".com") || theContents.includes(".ca")) {
        let theURL = theContents;
        buttonsArray.push(
          new ShortcutButton(theURL, inputField.parentElement, "regURL")
        );
      }
    }
  }
}

/* 
- For each object
--Create buttons
- Add event listeners to buttons 
  - type: enabled = button success style + working link + click listener
  - type: invalid = button failed style + update listener 
-- Append buttons to parent elements
*/

function buildButtons() {
  for (button of buttonsArray) {
    let value = button.value;
    let parent = button.parent;
    let type = button.type;

    function build(btnURL, btnParent, btnType) {
      let inputBox = parent.getElementsByTagName("INPUT")[0];
      let partnerButton = document.createElement("button");

      partnerButton.classList.add(`shortcut__button--${btnType}`);
      partnerButton.setAttribute("id", "shortcut");

      switch (btnType) {
        case "success": {
          console.log("log success case");
          // 1. Create the button
          partnerButton.innerHTML = "&#x1F50E;";
          partnerButton.title = "Click to search partner dashboard.";
          // 2. Append to parent
          parent.appendChild(partnerButton);
          // 3. Add event handler
          partnerButton.addEventListener("click", function () {
            launchSearch(value);
          });
          break;
        }
        case "regURL": {
          console.log("log reg url case");
          // 1. Create the button
          partnerButton.innerHTML = "&#128279;";
          partnerButton.title = "Click to follow the link.";
          // 2. Append to parent
          parent.appendChild(partnerButton);
          // 3. Add event handler
          partnerButton.addEventListener("click", function () {
            takeMeAway(value);
          });
          break;
        }
        case "failed": {
          // 1. Create the button
          partnerButton.innerHTML = "&#9432;";
          partnerButton.title =
            "Invalid link. Please enter a storename.myshopify.com instead.";
          parent.appendChild(partnerButton);
        }
      }
      // When input changes, run the program again
      inputBox.onchange = () => {
        //NOTE Could add input validation on this stage
        loadCheck();
      };
    }

    //Check whether there's already a button here and only add one if not.
    if (parent.childNodes.length <= 2) {
      build(value, parent, type);
    }
  }
}

/* set timer to check every second for valid labels that exist on the page, and then run the program */
function loadCheck() {
  // initialize arrays and remove previous buttons
  labels = [];
  buttonsArray = [];
  removeShortcuts();

  //check for new labels and build new buttons
  let checkForLabels = setInterval(function () {
    findLabels();
    buildButtons();

    // once labels are found, stop looking until loadCheck is called again
    if (buttonsArray.length > 0) {
      clearInterval(checkForLabels);
    }
  }, 1000);
}

// Run again any time that a "new page" message comes from the background script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message.includes("Tab:")) {
    console.log(`%cShortcuts– background: ${request.message}`, "color:white;");
    loadCheck();
  }
});

// Run for the first time
loadCheck();
