const ANIMAL_TOPICS = ["minions", "secret life of pets", "hotel transylvania", 
                       "incredibles", "toy story", "inside out"];
const IMAGE_SELECTION = { still: "fixed_width_still", animated: "fixed_width" };
const LIMIT = 10;
const GIFS_PER_ROW = 4;
const GT = new GifTasticControl();

function documentReady() {
    $("#new-topic-button").click(newTopicCB);
    $("#accumulate-checkbox").click(accumulateCB);
    $("#clear-images-button").click(clearImagesCB);

    // 3-argument click handler, add handler to all existing AND NEW elements:
    // Parent Div    Event       CLass           Handler
    $(document).on("click", ".topic-button", topicButtonCB);
    $(document).on("click", ".gif-image", gifClickCB);
    $(document).on("click", ".add-to-fav-btn", addToFavCB);

    GT.initialize();
}

// Callbacks
function newTopicCB() {
    let topic = $("#new-topic-input").val();
    GT.addButtonElement(topic);
    $("#new-topic-input").val("");  // Clear the input
}
function accumulateCB() {
    let val = $("#accumulate-checkbox").is(":checked");
    GT.setAccumulateImages(val);
}
function clearImagesCB() {
    GT.clearAllImages();
}
function topicButtonCB() {
    let topic = $(this).text();
    GT.topicButtonClick(topic);
}
function gifClickCB() {
    GT.gifClick($(this));
}
function addToFavCB() {
    GT.addToFav($(this));
}

// =================================================
// Protype for buttons, forms, and arrays of gifs
// =================================================
function GifTasticControl() {
    // properties
    this.defaultTopics = [];
    this.accumulateImages = false;
    this.gifRow = 0;
    this.gifCol = 0;
    this.favoritesList = [];

    // Initialize
    this.initialize = function() {
        // Set up the list of default topics
        this.defaultTopics = ANIMAL_TOPICS;

        // Add the "favorites" button and all default buttons
        this.addButtonElement("favorites");
        for (let ii = 0; ii < this.defaultTopics.length; ii++) {
            this.addButtonElement(this.defaultTopics[ii]);
        }

        // Retrieve previous favorites from local storage
        let lsString = localStorage.getItem("favorites-list");
        if (lsString !== null) {
            this.favoritesList = JSON.parse(lsString);
        }
    };

    // Accumulate option (from checkbox)
    this.setAccumulateImages = function(val) {
        this.accumulateImages = val;
    };

    // Remove all images
    this.clearAllImages = function() {
        $("#gif-container").empty();
        this.gifRow = 0;
        this.gifCol = 0;
    };

    // A topic button was clicked...
    this.topicButtonClick = function(topic) {
        if (topic === "favorites") {
            if (!this.accumulateImages) {
                // Clear out existing images
                this.clearAllImages();
            }
            for (let i = 0; i < this.favoritesList.length; i++) {
                let newDiv = this.createImageDiv(this.favoritesList[i]);
                this.addGifDiv(newDiv);
            }
        }
        else {
            GT.callApi(topic);
        }     
    };

    // A GIF was clicked...
    this.gifClick = function(imgElt) {
        let newUrl = "";
        if (imgElt.data("state") === "still") {
            newUrl = imgElt.data("animated-url");
            imgElt.data("state", "animated");
        }
        else {
            newUrl = imgElt.data("still-url");
            imgElt.data("state", "still");
        }
        imgElt.attr("src", newUrl);
    };

    // Add to favorites list
    this.addToFavoritesList = function(imageObject) {
        this.favoritesList.push(imageObject);

        // Persist between screen refreshes
        localStorage.setItem("favorites-list", JSON.stringify(this.favoritesList));
    };

    // Remove from favorites list
    this.removeFromFavoritesList = function(imageObject) {
        let i = 0;
        for (i = 0; i < this.favoritesList.length; i++) {
            if (this.favoritesList[i].still_url === imageObject.still_url) {
                break;
            }
        }
        if (i < this.favoritesList.length) {
            this.favoritesList.splice(i, 1);
        }
    
        // Persist between screen refreshes
        localStorage.setItem("favorites-list", JSON.stringify(this.favoritesList));
    }

    // Add to favorites was clicked...
    this.addToFav = function(btnElt) {
        if (btnElt.data("enabled") != "yes") {
            return;
        }
        // The button has 'row' and 'col' data to match the image
        let imgId = `img-${btnElt.data("row")}-${btnElt.data("col")}`

        let imgElt = $("#" + imgId);
        let imageObject = {
            still_url    : imgElt.data("still-url"),
            animated_url : imgElt.data("animated-url"),
            title        : imgElt.data("title"),
            rating       : imgElt.data("rating"),
            favorite     : "yes",
        };
        if (btnElt.text() === "Add to Favorites") {
            if (!this.inFavorites(imageObject)) {
                this.addToFavoritesList(imageObject);
            }
            btnElt.text("Remove from Favorites");
        }
        else {
            if (this.inFavorites(imageObject)) {
                this.removeFromFavoritesList(imageObject);
            }
            btnElt.text("Add to Favorites");
        }
    };

    // Check to see if this image is already in favorites
    this.inFavorites = function(imageObject) {
        for (i = 0; i < this.favoritesList.length; i++) {
            if (this.favoritesList[i].still_url === imageObject.still_url) {
                return true;
            }
        }
        return false;
    };

    // Add button element
    this.addButtonElement = function(topic) {
        if (topic === "")
            return;
        let newButton = $("<button>");
        newButton.addClass("btn btn-primary topic-button m-1");
        newButton.text(topic);
        $("#topic-buttons-div").append(newButton);
    };

    // Create the query URL
    this.createUrl = function(topic, limit) {
        let searchType = "search"; // search random trending
        let rating = "";
    
        let apiKey = "XXXX"; // My key
        let pathHash = {
            search   : "/v1/gifs/search",
            trending : "/v1/gifs/trending",
            random   : "/v1/gifs/random",
        };
        let path = pathHash[searchType];
        let query = 
            (searchType === "search") ? "q=" + topic :
            (searchType === "random") ? "tag=" + topic :
            "";
    
        let queryURL = "https://api.giphy.com" + path + 
            "?" +
            query +
            "&api_key=" + apiKey + 
            "&limit=" + limit + 
            "&rating=" + rating;
        return queryURL;
    };

    // Call the API (AJAX)
    this.callApi = function(topic) {
        if (!this.accumulateImages) {
            // Clear out existing images
            this.clearAllImages();
        }
        queryURL = this.createUrl(topic, LIMIT);
        // console.log("queryURL: " + queryURL);
        // This is where the MAGIC happens...
        $.ajax({
            url: queryURL,
            method: "GET"
        })
    
        // ...and then we process the magic
        .then(function(response) {
            // console.log(response);
            let results = response.data;

            // Add each result (i.e., each image)
            if (Array.isArray(results)) {
                for (let ii = 0; ii < results.length; ii++ ) {
                    // Since this is a callback, 'this' is out of scope here.
                    GT.addResult(results[ii]);
                }
            }
            else {
                GT.addResult(results);
            }
        });
    };

    // Add an image from the result
    this.addResult = function(result) {
        // 'result' is the object for 1 image
        let imgSel = IMAGE_SELECTION;  // From constant
        let stillSel = imgSel.still;
        let animatedSel = imgSel.animated;
        let stillUrl = result.images[stillSel].url;
        let animatedUrl = result.images[animatedSel].url;

        let imageObject = {
            still_url    : stillUrl,
            animated_url : animatedUrl,
            title        : result.title,
            rating       : result.rating,
            favorite     : "no",
        };
        let newDiv = this.createImageDiv(imageObject);
        this.addGifDiv(newDiv);
    };

    // Create a new div with the image
    this.createImageDiv = function(imageObject) {
        // Add the image in a new div
        let newDiv = $("<div>");
        newDiv.addClass("gif-div");

        // Set still and animated data- values
        // Start out still
        let newImg = $("<img>");
        let imgId = `img-${this.gifRow}-${this.gifCol}`;
        newImg.attr("id", imgId);
        newImg.addClass("gif-image");
        newImg.attr("src", imageObject.still_url);
        newImg.data("state", "still");
        newImg.data("still-url", imageObject.still_url);
        newImg.data("animated-url", imageObject.animated_url);
        newImg.data("title", imageObject.title);
        newImg.data("rating", imageObject.rating);
        newImg.data("favorite", imageObject.favorite);

        // Append to the new div
        newDiv.append(newImg);
    
        // image name
        let newP = $("<p>");
        newP.addClass("image-text");
        newP.html(`${imageObject.title}<br>Rating ${imageObject.rating.toUpperCase()}`);
        newDiv.append(newP);

        // 'Add to favorites' button
        let newButton = $("<button>");
        newButton.addClass("btn");
        newButton.addClass("btn-primary");
        newButton.addClass("btn-xs");
        newButton.addClass("add-to-fav-btn");
        newButton.text("Add to Favorites");
        newButton.data("row", this.gifRow);
        newButton.data("col", this.gifCol);
        newButton.data("enabled", "yes");
        if (imageObject.favorite === "yes" || this.inFavorites(imageObject)) {
            // Already in favorites. Disable the button
            newButton.text("Remove from Favorites");
        }
        newDiv.append(newButton);

        return newDiv;
    };

    // Add the GIF div to row/col
    this.addGifDiv = function(gifDiv) {
        let rowId = "gif-row-" + this.gifRow;
        let colWidth = Math.floor(12/GIFS_PER_ROW);
        let colClass = "col-md-" + colWidth;
        let thisRow = null;

        // Get or create the row div
        if (this.gifCol === 0) {
            // Time to add a new row
            let rowId = "gif-row-" + this.gifRow;
            thisRow = $("<div>");
            thisRow.attr("id", rowId);
            thisRow.addClass("row");
            thisRow.addClass("row-div");
            thisRow.addClass("mt-2");
            $("#gif-container").append(thisRow);
        }
        else {
            thisRow = $("#" + rowId);
        }

        // Create the new column div
        let colDiv = $("<div>");
        colDiv.addClass(colClass);
        colDiv.addClass("col-div");
        colDiv.append(gifDiv);
        thisRow.append(colDiv);

        // Increment
        this.gifCol++;
        if (this.gifCol === GIFS_PER_ROW) {
            this.gifCol = 0;
            this.gifRow++;
        }
    };
}
