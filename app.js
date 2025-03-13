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
      //addToItemStr(UNIQUE_NAME); // Add item to the items list
      resultsContainer.innerHTML = "";
    });
    resultsContainer.appendChild(li);
  });
});

// Clear search results
document.getElementById("search").addEventListener("focus", function () {
  this.select();
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
      let post = document.getElementById("apiPost");
      post.innerHTML = "";

      if (
        data.length === 0 ||
        data.every(
          (item) => item.sell_price_min === 0 && item.sell_price_max === 0
        )
      ) {
        post.innerHTML = "NO RETURNS FOUND";
        return;
      }

      try {
        data.forEach((item) => {
          let foundItem = false;
          for (let itemList of ITEMS_LIST) {
            if (itemList.UniqueName === item.item_id) {
              ITEM_PROPER = itemList.LocalizedNames;
              foundItem = true;
              break;
            }
          }

          if (
            item.sell_price_min === 0 &&
            item.sell_price_max === 0 &&
            item.buy_price_min === 0 &&
            item.buy_price_max === 0
          ) {
            return;
          }
          const formatDate = (dateString) => {
            const options = {
              year: "numeric",
              month: "short",
              day: "numeric",
            };
            return new Date(dateString).toLocaleDateString(undefined, options);
          };

          item.buy_price_max_date = formatDate(item.buy_price_max_date);
          item.buy_price_min_date = formatDate(item.buy_price_min_date);
          item.sell_price_max_date = formatDate(item.sell_price_max_date);
          item.sell_price_min_date = formatDate(item.sell_price_min_date);
          item.city = item.city.replace(/\s+/g, "").toLowerCase();

          const card = document.createElement("div");
          card.className = "card";

          const cityColors = {
            fortsterling: "#F2FAFF",
            bridgewatch: "#FFF267",
            lymhurst: "#13FF02",
            martlock: "#43EDFF",
            thetford: "#F617FF",
            caerleon: "#972A14",
          };

          item.city = item.city.replace(/\s+/g, "").toLowerCase();
          const cityColor = cityColors[item.city] || "#000"; // Default color if city not found

          // Create card image div
          const cardImage = document.createElement("div");
          cardImage.className = "card-image";
          cardImage.style.backgroundImage = `url('img/${item.city}.png')`;

          // Create card content div
          const cardContent = document.createElement("div");
          cardContent.className = "card-content";
          cardContent.style.borderColor = cityColor;

          // Create card title div
          const cardTitle = document.createElement("div");
          cardTitle.className = "card-title";
          cardTitle.style.color = cityColor;
          cardTitle.textContent = ITEM_PROPER;

          // Create card quality div
          const cardQuality = document.createElement("div");
          cardQuality.className = "card-quality";
          cardQuality.textContent = `Quality: ${item.quality}`;

          // Create buy price group div
          const buyGroup = document.createElement("div");
          buyGroup.className = "card-group";
          buyGroup.innerHTML = `
            <h3>BUY</h3>
            <p>Min: <span style="color: gold;">${item.buy_price_min}</span> Silver <span style="color: var(--secondary);text-transform: uppercase;">${item.sell_price_min_date}</span></p>
            <p>Max: <span style="color: gold;">${item.buy_price_max}</span> Silver <span style="color: var(--secondary);text-transform: uppercase;">${item.sell_price_min_date}</span></p>
          `;

          // Create sell price group div
          const sellGroup = document.createElement("div");
          sellGroup.className = "card-group";
          sellGroup.innerHTML = `
            <h3>SELL</h3>
            <p>Min: <span style="color: gold;">${item.sell_price_min}</span> Silver <span style="color: var(--secondary);text-transform: uppercase;">${item.sell_price_min_date}</span></p>
            <p>Max: <span style="color: gold;">${item.sell_price_max}</span> Silver <span style="color: var(--secondary);text-transform: uppercase;">${item.sell_price_min_date}</span></p>
          `;

          // Append all elements to card content
          cardContent.appendChild(cardTitle);
          cardContent.appendChild(cardQuality);
          cardContent.appendChild(buyGroup);
          cardContent.appendChild(sellGroup);

          // Append card image and card content to card
          card.appendChild(cardImage);
          card.appendChild(cardContent);

          // Append card to post
          post.appendChild(card);
        });
      } catch (error) {
        post.innerHTML = "NO RETURNS FOUND";
        console.error("Error parsing JSON:", error);
      }
    })
    .catch((error) => {
      console.error("Error fetching JSON:", error);
    });
});

const activateTester = document.getElementById("tester");
activateTester.addEventListener("click", () => {
  let post = document.getElementById("apiPost");
  post.innerHTML = "";
  data.forEach((item) => {
    const div = document.createElement("div");
    let foundItem = false;
    for (let itemList of ITEMS_LIST) {
      if (itemList.UniqueName === item.item_id) {
        ITEM_PROPER = itemList.LocalizedNames;
        foundItem = true;
        break;
      }
    }

    const formatDate = (dateString) => {
      const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    };

    item.buy_price_max_date = formatDate(item.buy_price_max_date);
    item.buy_price_min_date = formatDate(item.buy_price_min_date);
    item.sell_price_max_date = formatDate(item.sell_price_max_date);
    item.sell_price_min_date = formatDate(item.sell_price_min_date);
    item.city = item.city.replace(/\s+/g, "").toLowerCase();

    const card = document.createElement("div");
    card.className = "card";

    const cityColors = {
      fortsterling: "#F2FAFF",
      bridgewatch: "#FFF267",
      lymhurst: "#13FF02",
      martlock: "#43EDFF",
      thetford: "#F617FF",
      caerleon: "#972A14",
    };

    item.city = item.city.replace(/\s+/g, "").toLowerCase();
    const cityColor = cityColors[item.city] || "#000"; // Default color if city not found

    // Create card image div
    const cardImage = document.createElement("div");
    cardImage.className = "card-image";
    cardImage.style.backgroundImage = `url('img/${item.city}.png')`;

    // Create card content div
    const cardContent = document.createElement("div");
    cardContent.className = "card-content";
    cardContent.style.borderColor = cityColor;

    // Create card title div
    const cardTitle = document.createElement("div");
    cardTitle.className = "card-title";
    cardTitle.style.color = cityColor;
    cardTitle.textContent = ITEM_PROPER;

    // Create card quality div
    const cardQuality = document.createElement("div");
    cardQuality.className = "card-quality";
    cardQuality.textContent = `Quality: ${item.quality}`;

    // Create buy price group div
    const buyGroup = document.createElement("div");
    buyGroup.className = "card-group";
    buyGroup.innerHTML = `
      <h3>BUY</h3>
      <p>Min: ${item.buy_price_min} Silver</p>
      <p>Max: ${item.buy_price_max} Silver</p>
    `;

    // Create sell price group div
    const sellGroup = document.createElement("div");
    sellGroup.className = "card-group";
    sellGroup.innerHTML = `
      <h3>SELL</h3>
      <p>Min: ${item.sell_price_min} Silver</p>
      <p>Max: ${item.sell_price_max} Silver</p>
    `;

    // Append all elements to card content
    cardContent.appendChild(cardTitle);
    cardContent.appendChild(cardQuality);
    cardContent.appendChild(buyGroup);
    cardContent.appendChild(sellGroup);

    // Append card image and card content to card
    card.appendChild(cardImage);
    card.appendChild(cardContent);

    // Append card to post
    post.appendChild(card);
  });

  if (
    data.every((item) => item.sell_price_min === 0 && item.sell_price_max === 0)
  ) {
    post.innerHTML = "NO RETURNS FOUND";
  }
});
