# GifTastic
Displays GIFs from a few animated movies.<br>
User can add additional topics.<br>
Each movie/topic is controlled by its own button.<br>
There is also a Favorites button to save your favorite GIFS.<br>
Favorites is saved in localStorage to survive page refreshes.

### The project is deployed [here](https://philgraetz.github.io/GifTastic "Github deployment page")

### The source code is [here](https://github.com/philgraetz/GifTastic "Github source repo")

## Problem Description
+ Fetch GIFs from Giphy API
+ Buttons for each topic
+ Display the GIFS neatly on page
+ Display and save favorites

## How it was solved
- JQuery AJAX call to fetch list of GIFS from Giphy
- JQuery to dymically add new buttons, their callbacks, etc.
- localStorage to save favorites
- Bootstrap to arrange page
- Bootstraps row/col to track and arrange the GIF display
- Object Prototype to track "GifTastic" images, buttons, etc
- Responsive with Bootstrap


## Instructions to user
### Click a topic button on top to display 10 GIFs
### Click on the GIF to start/stop it
### Click "Add to Favorites" to save it
### Click "Remove from Favorites" to unsave it
### Favorites are persisted between page loads in localStorage
### Enter a new topic in "New Topic" input and press "Add" to add a new topic button
