let ITEMS_LIST = {};
const LOCATIONS = ["Caerleon", "Bridgewatch", "FortSterling", "Lymhurst", "Martlock", "Thetford"];
let ITEM_ID = "";
let UNIQUE_NAME = "";
let ITEM_PROPER = "";
let ITEM_STR = "";

// Sample URL to test JSON
// https://west.albion-online-data.com/api/v2/stats/prices/T4_BAG.json?locations=Bridgewatch,FortSterling

// Fetch the JSON file
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

document.getElementById("search").addEventListener("input", function () {
    let query = this.value.toLowerCase();

    //   console.log(query);

    let results = [];
    if (query !== null && query !== "") {
        results = ITEMS_LIST.filter((item) => item.LocalizedNames && item.LocalizedNames.toLowerCase().includes(query));
    }
    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = "";
    results.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item.LocalizedNames;
        li.style.cursor = "pointer";
        // li.addEventListener("hover", () => {
        //   li.style.backgroundColor = "lime";
        // });

        li.addEventListener("click", () => {
            console.log(`You selected: ${item.LocalizedNames}`);
            document.getElementById("search").value = item.LocalizedNames;
            ITEM_ID = item.Index;
            UNIQUE_NAME = item.UniqueName;
            results = ITEMS_LIST.filter(
                (item) => item.LocalizedNames && item.LocalizedNames.toLowerCase().includes(query)
            );
            resultsContainer.innerHTML = "";
            // You can add more actions here when an item is selected
        });
        resultsContainer.appendChild(li);
    });
});

const LOCATIONS_CONTAINER = document.getElementById("locs");
let LOCATION_STR = "";

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
        const checkedLocations = Array.from(LOCATIONS_CONTAINER.querySelectorAll("input[type=checkbox]:checked")).map(
            (checkbox) => checkbox.value
        );

        LOCATION_STR = checkedLocations.join(",");
        console.log("Updated LOCATION_STR:", LOCATION_STR);
    });

    LOCATIONS_CONTAINER.appendChild(checkbox);
    LOCATIONS_CONTAINER.appendChild(label);
    LOCATIONS_CONTAINER.appendChild(document.createElement("br"));
});

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

document.getElementById("apiGet").addEventListener("click", function () {
    // https://west.albion-online-data.com/api/v2/stats/prices/T4_BAG,T5_BAG?locations=Caerleon,Bridgewatch&qualities=2

    //const hostUrl = `https://west.albion-online-data.com/api/v2/stats/prices/${ITEM_STR}.json?locations=${LOCATION_STR}`;

    const hostUrl = `https://west.albion-online-data.com/api/v2/stats/prices/${ITEM_STR}.json?locations=${LOCATION_STR}`;

    //const hostUrl = "C:\\Users\\shawn\\OneDrive\\Desktop\\ALBION\\Plain\\testreturn.json";

    //console.log(hostUrl);

    fetch(hostUrl)
        .then((response) => response.json())
        .then((data) => {
            console.log("You've entered the data portion of the fetch function...");
            // You can now use the JSON data in your application
            let hasNoData = [];
            try {
                console.log("JSON data successfully stored in data:", data);
                let post = document.getElementById("apiPost");
                let postData = JSON.stringify(data);
                //console.log(postData)
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
// .catch((error) => {
//     console.error("Error fetching JSON:", error);
// });
//});

function getTestReturn() {
    return [
        {
            item_id: "T4_BAG",
            city: "Bridgewatch",
            quality: 1,
            sell_price_min: 3148,
            sell_price_min_date: "2025-02-23T14:10:00",
            sell_price_max: 3148,
            sell_price_max_date: "2025-02-23T14:10:00",
            buy_price_min: 14,
            buy_price_min_date: "2025-02-23T17:15:00",
            buy_price_max: 2033,
            buy_price_max_date: "2025-02-23T17:15:00",
        },
        {
            item_id: "T4_BAG",
            city: "Bridgewatch",
            quality: 2,
            sell_price_min: 28984112,
            sell_price_min_date: "2025-02-23T17:15:00",
            sell_price_max: 29882799,
            sell_price_max_date: "2025-02-23T17:15:00",
            buy_price_min: 14,
            buy_price_min_date: "2025-02-23T17:15:00",
            buy_price_max: 2613,
            buy_price_max_date: "2025-02-23T17:15:00",
        },
        {
            item_id: "T4_BAG",
            city: "Bridgewatch",
            quality: 3,
            sell_price_min: 3200,
            sell_price_min_date: "2025-02-23T17:15:00",
            sell_price_max: 3224,
            sell_price_max_date: "2025-02-23T17:15:00",
            buy_price_min: 14,
            buy_price_min_date: "2025-02-23T17:15:00",
            buy_price_max: 2614,
            buy_price_max_date: "2025-02-23T17:15:00",
        },
        {
            item_id: "T4_BAG",
            city: "Bridgewatch",
            quality: 4,
            sell_price_min: 5298,
            sell_price_min_date: "2025-02-23T18:00:00",
            sell_price_max: 5298,
            sell_price_max_date: "2025-02-23T18:00:00",
            buy_price_min: 0,
            buy_price_min_date: "0001-01-01T00:00:00",
            buy_price_max: 0,
            buy_price_max_date: "0001-01-01T00:00:00",
        },
        {
            item_id: "T4_BAG",
            city: "Bridgewatch",
            quality: 5,
            sell_price_min: 0,
            sell_price_min_date: "0001-01-01T00:00:00",
            sell_price_max: 0,
            sell_price_max_date: "0001-01-01T00:00:00",
            buy_price_min: 0,
            buy_price_min_date: "0001-01-01T00:00:00",
            buy_price_max: 0,
            buy_price_max_date: "0001-01-01T00:00:00",
        },
        {
            item_id: "T4_BAG",
            city: "Caerleon",
            quality: 1,
            sell_price_min: 5499,
            sell_price_min_date: "2025-02-23T18:00:00",
            sell_price_max: 5987,
            sell_price_max_date: "2025-02-23T18:00:00",
            buy_price_min: 13,
            buy_price_min_date: "2025-02-23T17:15:00",
            buy_price_max: 3858,
            buy_price_max_date: "2025-02-23T17:15:00",
        },
        {
            item_id: "T4_BAG",
            city: "Caerleon",
            quality: 2,
            sell_price_min: 5496,
            sell_price_min_date: "2025-02-23T18:00:00",
            sell_price_max: 6353,
            sell_price_max_date: "2025-02-23T18:00:00",
            buy_price_min: 15,
            buy_price_min_date: "2025-02-23T17:15:00",
            buy_price_max: 3861,
            buy_price_max_date: "2025-02-23T17:15:00",
        },
        {
            item_id: "T4_BAG",
            city: "Caerleon",
            quality: 3,
            sell_price_min: 5990,
            sell_price_min_date: "2025-02-23T18:00:00",
            sell_price_max: 6300,
            sell_price_max_date: "2025-02-23T18:00:00",
            buy_price_min: 2858,
            buy_price_min_date: "2025-02-23T17:15:00",
            buy_price_max: 3851,
            buy_price_max_date: "2025-02-23T17:15:00",
        },
        {
            item_id: "T4_BAG",
            city: "Caerleon",
            quality: 4,
            sell_price_min: 6216,
            sell_price_min_date: "2025-02-23T18:00:00",
            sell_price_max: 6353,
            sell_price_max_date: "2025-02-23T18:00:00",
            buy_price_min: 0,
            buy_price_min_date: "0001-01-01T00:00:00",
            buy_price_max: 0,
            buy_price_max_date: "0001-01-01T00:00:00",
        },
        {
            item_id: "T4_BAG",
            city: "Caerleon",
            quality: 5,
            sell_price_min: 0,
            sell_price_min_date: "0001-01-01T00:00:00",
            sell_price_max: 0,
            sell_price_max_date: "0001-01-01T00:00:00",
            buy_price_min: 0,
            buy_price_min_date: "0001-01-01T00:00:00",
            buy_price_max: 0,
            buy_price_max_date: "0001-01-01T00:00:00",
        },
        {
            item_id: "T4_BAG",
            city: "Fort Sterling",
            quality: 1,
            sell_price_min: 3600,
            sell_price_min_date: "2025-02-23T18:25:00",
            sell_price_max: 3600,
            sell_price_max_date: "2025-02-23T18:25:00",
            buy_price_min: 2106,
            buy_price_min_date: "2025-02-23T15:40:00",
            buy_price_max: 2902,
            buy_price_max_date: "2025-02-23T15:40:00",
        },
        {
            item_id: "T4_BAG",
            city: "Fort Sterling",
            quality: 2,
            sell_price_min: 3600,
            sell_price_min_date: "2025-02-23T18:25:00",
            sell_price_max: 3760,
            sell_price_max_date: "2025-02-23T18:25:00",
            buy_price_min: 2230,
            buy_price_min_date: "2025-02-23T15:40:00",
            buy_price_max: 2947,
            buy_price_max_date: "2025-02-23T15:40:00",
        },
        {
            item_id: "T4_BAG",
            city: "Fort Sterling",
            quality: 3,
            sell_price_min: 3692,
            sell_price_min_date: "2025-02-23T18:25:00",
            sell_price_max: 3762,
            sell_price_max_date: "2025-02-23T18:25:00",
            buy_price_min: 2220,
            buy_price_min_date: "2025-02-23T15:40:00",
            buy_price_max: 2949,
            buy_price_max_date: "2025-02-23T15:40:00",
        },
        {
            item_id: "T4_BAG",
            city: "Fort Sterling",
            quality: 4,
            sell_price_min: 4494,
            sell_price_min_date: "2025-02-23T15:40:00",
            sell_price_max: 10564,
            sell_price_max_date: "2025-02-23T15:40:00",
            buy_price_min: 2849,
            buy_price_min_date: "2025-02-23T15:40:00",
            buy_price_max: 2949,
            buy_price_max_date: "2025-02-23T15:40:00",
        },
        {
            item_id: "T4_BAG",
            city: "Fort Sterling",
            quality: 5,
            sell_price_min: 0,
            sell_price_min_date: "0001-01-01T00:00:00",
            sell_price_max: 0,
            sell_price_max_date: "0001-01-01T00:00:00",
            buy_price_min: 0,
            buy_price_min_date: "0001-01-01T00:00:00",
            buy_price_max: 0,
            buy_price_max_date: "0001-01-01T00:00:00",
        },
        {
            item_id: "T4_BAG",
            city: "Lymhurst",
            quality: 1,
            sell_price_min: 3185,
            sell_price_min_date: "2025-02-23T16:55:00",
            sell_price_max: 3480,
            sell_price_max_date: "2025-02-23T16:55:00",
            buy_price_min: 6,
            buy_price_min_date: "2025-02-23T04:45:00",
            buy_price_max: 2181,
            buy_price_max_date: "2025-02-23T04:45:00",
        },
        {
            item_id: "T4_BAG",
            city: "Lymhurst",
            quality: 2,
            sell_price_min: 3187,
            sell_price_min_date: "2025-02-23T16:55:00",
            sell_price_max: 3481,
            sell_price_max_date: "2025-02-23T16:55:00",
            buy_price_min: 2160,
            buy_price_min_date: "2025-02-22T20:35:00",
            buy_price_max: 2370,
            buy_price_max_date: "2025-02-22T20:35:00",
        },
        {
            item_id: "T4_BAG",
            city: "Lymhurst",
            quality: 3,
            sell_price_min: 3190,
            sell_price_min_date: "2025-02-23T16:55:00",
            sell_price_max: 3200,
            sell_price_max_date: "2025-02-23T16:55:00",
            buy_price_min: 2163,
            buy_price_min_date: "2025-02-22T20:35:00",
            buy_price_max: 2371,
            buy_price_max_date: "2025-02-22T20:35:00",
        },
        {
            item_id: "T4_BAG",
            city: "Lymhurst",
            quality: 4,
            sell_price_min: 9430,
            sell_price_min_date: "2025-02-23T17:25:00",
            sell_price_max: 10474,
            sell_price_max_date: "2025-02-23T17:25:00",
            buy_price_min: 0,
            buy_price_min_date: "0001-01-01T00:00:00",
            buy_price_max: 0,
            buy_price_max_date: "0001-01-01T00:00:00",
        },
        {
            item_id: "T4_BAG",
            city: "Lymhurst",
            quality: 5,
            sell_price_min: 0,
            sell_price_min_date: "0001-01-01T00:00:00",
            sell_price_max: 0,
            sell_price_max_date: "0001-01-01T00:00:00",
            buy_price_min: 0,
            buy_price_min_date: "0001-01-01T00:00:00",
            buy_price_max: 0,
            buy_price_max_date: "0001-01-01T00:00:00",
        },
        {
            item_id: "T4_SILVERBAG_NONTRADABLE",
            city: "Bridgewatch",
            quality: 1,
            sell_price_min: 0,
            sell_price_min_date: "0001-01-01T00:00:00",
            sell_price_max: 0,
            sell_price_max_date: "0001-01-01T00:00:00",
            buy_price_min: 0,
            buy_price_min_date: "0001-01-01T00:00:00",
            buy_price_max: 0,
            buy_price_max_date: "0001-01-01T00:00:00",
        },
        {
            item_id: "T4_SILVERBAG_NONTRADABLE",
            city: "Bridgewatch",
            quality: 2,
            sell_price_min: 0,
            sell_price_min_date: "0001-01-01T00:00:00",
            sell_price_max: 0,
            sell_price_max_date: "0001-01-01T00:00:00",
            buy_price_min: 0,
            buy_price_min_date: "0001-01-01T00:00:00",
            buy_price_max: 0,
            buy_price_max_date: "0001-01-01T00:00:00",
        },
        {
            item_id: "T4_SILVERBAG_NONTRADABLE",
            city: "Bridgewatch",
            quality: 3,
            sell_price_min: 0,
            sell_price_min_date: "0001-01-01T00:00:00",
            sell_price_max: 0,
            sell_price_max_date: "0001-01-01T00:00:00",
            buy_price_min: 0,
            buy_price_min_date: "0001-01-01T00:00:00",
            buy_price_max: 0,
            buy_price_max_date: "0001-01-01T00:00:00",
        },
        {
            item_id: "T4_SILVERBAG_NONTRADABLE",
            city: "Bridgewatch",
            quality: 4,
            sell_price_min: 0,
            sell_price_min_date: "0001-01-01T00:00:00",
            sell_price_max: 0,
            sell_price_max_date: "0001-01-01T00:00:00",
            buy_price_min: 0,
            buy_price_min_date: "0001-01-01T00:00:00",
            buy_price_max: 0,
            buy_price_max_date: "0001-01-01T00:00:00",
        },
        {
            item_id: "T4_SILVERBAG_NONTRADABLE",
            city: "Bridgewatch",
            quality: 5,
            sell_price_min: 0,
            sell_price_min_date: "0001-01-01T00:00:00",
            sell_price_max: 0,
            sell_price_max_date: "0001-01-01T00:00:00",
            buy_price_min: 0,
            buy_price_min_date: "0001-01-01T00:00:00",
            buy_price_max: 0,
            buy_price_max_date: "0001-01-01T00:00:00",
        },
        {
            item_id: "T4_SILVERBAG_NONTRADABLE",
            city: "Caerleon",
            quality: 1,
            sell_price_min: 0,
            sell_price_min_date: "0001-01-01T00:00:00",
            sell_price_max: 0,
            sell_price_max_date: "0001-01-01T00:00:00",
            buy_price_min: 0,
            buy_price_min_date: "0001-01-01T00:00:00",
            buy_price_max: 0,
            buy_price_max_date: "0001-01-01T00:00:00",
        },
        {
            item_id: "T4_SILVERBAG_NONTRADABLE",
            city: "Caerleon",
            quality: 2,
            sell_price_min: 0,
            sell_price_min_date: "0001-01-01T00:00:00",
            sell_price_max: 0,
            sell_price_max_date: "0001-01-01T00:00:00",
            buy_price_min: 0,
            buy_price_min_date: "0001-01-01T00:00:00",
            buy_price_max: 0,
            buy_price_max_date: "0001-01-01T00:00:00",
        },
        {
            item_id: "T4_SILVERBAG_NONTRADABLE",
            city: "Caerleon",
            quality: 3,
            sell_price_min: 0,
            sell_price_min_date: "0001-01-01T00:00:00",
            sell_price_max: 0,
            sell_price_max_date: "0001-01-01T00:00:00",
            buy_price_min: 0,
            buy_price_min_date: "0001-01-01T00:00:00",
            buy_price_max: 0,
            buy_price_max_date: "0001-01-01T00:00:00",
        },
        {
            item_id: "T4_SILVERBAG_NONTRADABLE",
            city: "Caerleon",
            quality: 4,
            sell_price_min: 0,
            sell_price_min_date: "0001-01-01T00:00:00",
            sell_price_max: 0,
            sell_price_max_date: "0001-01-01T00:00:00",
            buy_price_min: 0,
            buy_price_min_date: "0001-01-01T00:00:00",
            buy_price_max: 0,
            buy_price_max_date: "0001-01-01T00:00:00",
        },
        {
            item_id: "T4_SILVERBAG_NONTRADABLE",
            city: "Caerleon",
            quality: 5,
            sell_price_min: 0,
            sell_price_min_date: "0001-01-01T00:00:00",
            sell_price_max: 0,
            sell_price_max_date: "0001-01-01T00:00:00",
            buy_price_min: 0,
            buy_price_min_date: "0001-01-01T00:00:00",
            buy_price_max: 0,
            buy_price_max_date: "0001-01-01T00:00:00",
        },
        {
            item_id: "T4_SILVERBAG_NONTRADABLE",
            city: "Fort Sterling",
            quality: 1,
            sell_price_min: 0,
            sell_price_min_date: "0001-01-01T00:00:00",
            sell_price_max: 0,
            sell_price_max_date: "0001-01-01T00:00:00",
            buy_price_min: 0,
            buy_price_min_date: "0001-01-01T00:00:00",
            buy_price_max: 0,
            buy_price_max_date: "0001-01-01T00:00:00",
        },
        {
            item_id: "T4_SILVERBAG_NONTRADABLE",
            city: "Fort Sterling",
            quality: 2,
            sell_price_min: 0,
            sell_price_min_date: "0001-01-01T00:00:00",
            sell_price_max: 0,
            sell_price_max_date: "0001-01-01T00:00:00",
            buy_price_min: 0,
            buy_price_min_date: "0001-01-01T00:00:00",
            buy_price_max: 0,
            buy_price_max_date: "0001-01-01T00:00:00",
        },
        {
            item_id: "T4_SILVERBAG_NONTRADABLE",
            city: "Fort Sterling",
            quality: 3,
            sell_price_min: 0,
            sell_price_min_date: "0001-01-01T00:00:00",
            sell_price_max: 0,
            sell_price_max_date: "0001-01-01T00:00:00",
            buy_price_min: 0,
            buy_price_min_date: "0001-01-01T00:00:00",
            buy_price_max: 0,
            buy_price_max_date: "0001-01-01T00:00:00",
        },
        {
            item_id: "T4_SILVERBAG_NONTRADABLE",
            city: "Fort Sterling",
            quality: 4,
            sell_price_min: 0,
            sell_price_min_date: "0001-01-01T00:00:00",
            sell_price_max: 0,
            sell_price_max_date: "0001-01-01T00:00:00",
            buy_price_min: 0,
            buy_price_min_date: "0001-01-01T00:00:00",
            buy_price_max: 0,
            buy_price_max_date: "0001-01-01T00:00:00",
        },
        {
            item_id: "T4_SILVERBAG_NONTRADABLE",
            city: "Fort Sterling",
            quality: 5,
            sell_price_min: 0,
            sell_price_min_date: "0001-01-01T00:00:00",
            sell_price_max: 0,
            sell_price_max_date: "0001-01-01T00:00:00",
            buy_price_min: 0,
            buy_price_min_date: "0001-01-01T00:00:00",
            buy_price_max: 0,
            buy_price_max_date: "0001-01-01T00:00:00",
        },
        {
            item_id: "T4_SILVERBAG_NONTRADABLE",
            city: "Lymhurst",
            quality: 1,
            sell_price_min: 0,
            sell_price_min_date: "0001-01-01T00:00:00",
            sell_price_max: 0,
            sell_price_max_date: "0001-01-01T00:00:00",
            buy_price_min: 0,
            buy_price_min_date: "0001-01-01T00:00:00",
            buy_price_max: 0,
            buy_price_max_date: "0001-01-01T00:00:00",
        },
        {
            item_id: "T4_SILVERBAG_NONTRADABLE",
            city: "Lymhurst",
            quality: 2,
            sell_price_min: 0,
            sell_price_min_date: "0001-01-01T00:00:00",
            sell_price_max: 0,
            sell_price_max_date: "0001-01-01T00:00:00",
            buy_price_min: 0,
            buy_price_min_date: "0001-01-01T00:00:00",
            buy_price_max: 0,
            buy_price_max_date: "0001-01-01T00:00:00",
        },
        {
            item_id: "T4_SILVERBAG_NONTRADABLE",
            city: "Lymhurst",
            quality: 3,
            sell_price_min: 0,
            sell_price_min_date: "0001-01-01T00:00:00",
            sell_price_max: 0,
            sell_price_max_date: "0001-01-01T00:00:00",
            buy_price_min: 0,
            buy_price_min_date: "0001-01-01T00:00:00",
            buy_price_max: 0,
            buy_price_max_date: "0001-01-01T00:00:00",
        },
        {
            item_id: "T4_SILVERBAG_NONTRADABLE",
            city: "Lymhurst",
            quality: 4,
            sell_price_min: 0,
            sell_price_min_date: "0001-01-01T00:00:00",
            sell_price_max: 0,
            sell_price_max_date: "0001-01-01T00:00:00",
            buy_price_min: 0,
            buy_price_min_date: "0001-01-01T00:00:00",
            buy_price_max: 0,
            buy_price_max_date: "0001-01-01T00:00:00",
        },
        {
            item_id: "T4_SILVERBAG_NONTRADABLE",
            city: "Lymhurst",
            quality: 5,
            sell_price_min: 0,
            sell_price_min_date: "0001-01-01T00:00:00",
            sell_price_max: 0,
            sell_price_max_date: "0001-01-01T00:00:00",
            buy_price_min: 0,
            buy_price_min_date: "0001-01-01T00:00:00",
            buy_price_max: 0,
            buy_price_max_date: "0001-01-01T00:00:00",
        },
    ];
}
