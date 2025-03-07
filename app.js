let ITEMS_LIST = {};
const LOCATIONS = [
  "Caerleon",
  "Bridgewatch",
  "FortSterling",
  "Lymhurst",
  "Martlock",
  "Thetford",
];
let ITEM_ID = "";
let UNIQUE_NAME = "";
let ITEM_PROPER = "";
let ITEM_STR = "";
let LOCATIONS_CONTAINER = document.getElementById("locs");
let LOCATION_STR = "";

// Fetch the JSON file to create search list
fetch("item_list.json")
  .then((response) => response.json())
  .then((data) => {
    console.log("You've entered the data portion of the fetch function...");
    // You can now use the JSON data in your application
    try {
      ITEMS_LIST = data;
      console.log("JSON data successfully stored in ITEMS_LIST:", ITEMS_LIST);
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
  })
  .catch((error) => {
    console.error("Error fetching JSON:", error);
  });

// Listen to seach input
document.getElementById("search").addEventListener("input", function () {
  let query = this.value.toLowerCase();
  let results = [];
  if (query !== null && query !== "") {
    results = ITEMS_LIST.filter(
      (item) =>
        item.LocalizedNames && item.LocalizedNames.toLowerCase().includes(query)
    );
  }
  const resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = "";
  results.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item.LocalizedNames;
    li.style.cursor = "pointer";
    li.addEventListener("click", () => {
      console.log(`You selected: ${item.LocalizedNames}`);
      document.getElementById("search").value = item.LocalizedNames;
      ITEM_ID = item.Index;
      UNIQUE_NAME = item.UniqueName;
      results = ITEMS_LIST.filter(
        (item) =>
          item.LocalizedNames &&
          item.LocalizedNames.toLowerCase().includes(query)
      );
      resultsContainer.innerHTML = "";
    });
    resultsContainer.appendChild(li);
  });
});

// Create checkboxes for each location
LOCATIONS.forEach((location) => {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.value = location;
  checkbox.id = location;

  const label = document.createElement("label");
  label.htmlFor = location;
  label.textContent = location;

  checkbox.addEventListener("change", () => {
    const checkedLocations = Array.from(
      LOCATIONS_CONTAINER.querySelectorAll("input[type=checkbox]:checked")
    ).map((checkbox) => checkbox.value);

    LOCATION_STR = checkedLocations.join(",");
    console.log("Updated LOCATION_STR:", LOCATION_STR);
  });

  const checkboxContainer = document.createElement("div");
  checkboxContainer.className = "checkbox--container";
  checkboxContainer.appendChild(checkbox);
  checkboxContainer.appendChild(label);
  LOCATIONS_CONTAINER.appendChild(checkboxContainer);
  LOCATIONS_CONTAINER.appendChild(document.createElement("br"));
});

// Select item from search results
document.getElementById("itemSelect").addEventListener("click", function () {
  const selectedId = ITEM_ID;
  const returnItem = ITEMS_LIST.find((item) => item.Index === selectedId);
  if (returnItem) {
    UNIQUE_NAME = returnItem.UniqueName;
    console.log(`Selected item UniqueName: ${UNIQUE_NAME}`);
    let sc = document.getElementById("searchCriteria");
    const itemDiv = document.createElement("div");
    itemDiv.className = "returnItem";
    itemDiv.innerHTML = `${returnItem.LocalizedNames} <span class="closeItem" style="cursor: pointer;">X</span>`;
    sc.appendChild(itemDiv);

    itemDiv.querySelector(".closeItem").addEventListener("click", function () {
      sc.removeChild(itemDiv);
    });
  } else {
    console.error("Item not found in ITEMS_LIST");
  }
  if (UNIQUE_NAME !== null && UNIQUE_NAME !== "") {
    addToItemStr(UNIQUE_NAME);
  }
});

function addToItemStr(uniqueName) {
  // TODO Find better way to handle ITEM_STR with @# suffix
  const atIndex = uniqueName.indexOf("@");
  if (atIndex !== -1) {
    uniqueName = uniqueName.substring(0, atIndex);
  }
  if (ITEM_STR !== null && ITEM_STR !== "") {
    ITEM_STR += "," + uniqueName;
  } else {
    ITEM_STR = uniqueName;
  }
  console.log("Updated ITEM_STR:", ITEM_STR);
}

// Return API call
document.getElementById("apiGet").addEventListener("click", function () {
  if (
    ITEMS_LIST.length === 0 ||
    ITEM_STR === null ||
    ITEM_STR === "" ||
    LOCATION_STR === null ||
    LOCATION_STR === ""
  ) {
    alert(
      "Please make sure you have assigned at least one search item and selected at least one city."
    );
    return;
  }

  const hostUrl = `https://west.albion-online-data.com/api/v2/stats/prices/${ITEM_STR}.json?locations=${LOCATION_STR}`;
  fetch(hostUrl)
    .then((response) => response.json())
    .then((data) => {
      console.log("You've entered the data portion of the fetch function...");
      let hasNoData = [];
      try {
        console.log("JSON data successfully stored in data:", data);
        let post = document.getElementById("apiPost");
        let postData = JSON.stringify(data);
        post.innerHTML = "";
        data.forEach((item) => {
          if (item.sell_price_min === 0 && item.sell_price_max === 0) {
            hasNoData.push(item);
          } else {
            const div = document.createElement("div");
            let foundItem = false;
            for (let itemList of ITEMS_LIST) {
              if (itemList.UniqueName === item.item_id) {
                ITEM_PROPER = itemList.LocalizedNames;
                foundItem = true;
                break;
              }
            }

            div.innerHTML = `<div class="card">
                                            <div class="card--title-holder">
                                                <span class="card--title">${ITEM_PROPER} | <span class="card--city">${item.city}</span><span class="card--quality">${item.quality}</span></span>
                                            </div>
                                            <div class="card--stats-holder">
                                                <div class="card--price">
                                                    Max Buy Price: <span class="card--price-amt">${item.buy_price_max}</span>
                                                </div>
                                                <div class="card--price">
                                                    Min Buy Price: <span class="card--price-amt">${item.buy_price_min}</span>
                                                </div>
                                                <div class="card--price">
                                                    Max Sell Price: <span class="card--price-amt">${item.sell_price_max}</span>
                                                </div>
                                                <div class="card--price">
                                                    Min Sell Price: <span class="card--price-amt">${item.sell_price_min}</span>
                                                </div>
                                            </div>
                                        </div>`;
            post.appendChild(div);
          }
        });
        if (hasNoData.length === data.length) {
          let post = document.getElementById("apiPost");
          post.innerHTML = "NO RETURNS FOUND";
        }
        console.log("JSON data successfully stored in postData:", postData);
      } catch (error) {
        let post = document.getElementById("apiPost");
        post.innerHTML = "NO RETURNS FOUND";
        console.error("Error parsing JSON:", error);
      }
    })
    .catch((error) => {
      console.error("Error fetching JSON:", error);
    });
});
