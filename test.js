'use strict';
/**
 * function to return rating for each movie as a whole number
 * @param {Array} ratings - Ratings Array in each movie from movies.json
 */
const getRating = (ratings) => {
    let total = 0;
    if (Array.isArray(ratings)) {
        ratings.forEach((rate) => {
            if (rate.Value.indexOf('/') !== -1) {
                const [left, right] = rate.Value.split('/');
                total += left / right;
            } else if (rate.Value.indexOf('%') !== -1) {
                total += parseInt(rate.Value) / 100
            }
        });
        return Math.floor(total / ratings.length * 5);
    } else {
        return null;
    }
};

const STARFILLED = `<img class="star" src="./star-filled.svg" />`;
const STAREMPTY = `<img class="star" src="./star-empty.svg" />`;
const MOVIEURL = "./movies.json";
const ALL_GENRES = 'All Genres';
const sortOptions = [{ name: "A-Z", value: "Title" },
{ name: "Year", value: "Year" },
{ name: "Rating", value: "imdbRating" },
{ name: "Box Office", value: "BoxOffice" },];

let MOVIES = [];
let tempMovieList = [];
start();
async function start() {
    const fetchJson = await fetch(MOVIEURL);
    const response = await fetchJson.json();
    MOVIES = customSort(response, "Title", 1); //default sort by title asce
    createHeader();
    createFilterBar(MOVIES); //filter bar
    showMovies(MOVIES);      //movie grid
    createPopUpModal()       // quick view popup
}
/* HEADER
*/

//home
function home() {
    event.preventDefault();
    document.querySelector('.movies').innerHTML = "";
    start();
}
//search
function findMovies() {
    const movieSearchBox = document.querySelector(".search");
    let searchTerm = (movieSearchBox.value).trim();
    if (searchTerm.length > 0) {
        const movies = MOVIES.filter(x => x.Title.toLowerCase().startsWith(searchTerm));
        document.querySelector('.movies-grid').innerHTML = generateMovieGrid(movies).join('');
        addQuickView();
    } else {
        document.querySelector('.movies-grid').innerHTML = generateMovieGrid(MOVIES).join('');
        addQuickView();
    }
}
function createHeader() {
    const navbar = document.createElement("div");
    navbar.setAttribute("class", "navbar");

    const homeBtn = document.createElement("div");
    homeBtn.classList.add("flex")
    const iHome = document.createElement("i");
    iHome.setAttribute("class", "fa fa-home");
    const homeText = document.createElement("p");
    homeText.style.padding = "5px"
    homeText.textContent = "Home";
    homeBtn.onclick = home;
    homeBtn.style.cursor = "pointer";
    homeBtn.appendChild(iHome);
    homeBtn.appendChild(homeText);

    const navbarActions = document.createElement("div");
    navbarActions.setAttribute("class", "navbar-actions");

    const form = document.createElement("form");
    navbarActions.setAttribute("id", "form");
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("id", "search");
    input.setAttribute("placeholder", "Search");
    input.setAttribute("class", "search");
    input.onkeyup = findMovies;
    input.onchange = findMovies;
    form.appendChild(input);

    const watchlist = document.createElement("div");
    watchlist.setAttribute("class", "flex ")
    watchlist.style.cursor = "pointer";
    const iwatchlist = document.createElement("i");
    iwatchlist.setAttribute("class", "fa fa-plus-square-o fa-lg");
    const iwatchlistTet = document.createElement("p");
    iwatchlistTet.style.padding = "5px"
    watchlist.style.paddingRight = "5px"

    iwatchlistTet.setAttribute("class", "watchlist")
    iwatchlistTet.textContent = " Watchlist";
    watchlist.onclick = showWatchList;
    watchlist.appendChild(iwatchlist);
    watchlist.appendChild(iwatchlistTet);

    const saved = document.createElement("div");
    saved.setAttribute("class", "flex")
    saved.style.cursor = "pointer";
    const isaved = document.createElement("i");
    isaved.setAttribute("class", "fa fa-bookmark fa-lg");
    const isavedTxt = document.createElement("p");
    isavedTxt.style.padding = "5px"
    isavedTxt.textContent = " Saved";
    isavedTxt.setAttribute("class", "saved")
    saved.onclick = showWatchList;
    saved.appendChild(isaved);
    saved.appendChild(isavedTxt);


    navbarActions.appendChild(form)
    navbarActions.appendChild(watchlist)
    navbarActions.appendChild(saved)
    navbar.appendChild(homeBtn);
    navbar.appendChild(navbarActions);

    const header = document.querySelector("header");
    header.innerHTML = "";
    header.appendChild(navbar)
}
//saved
function showSaved() {
    const saved = MOVIES.filter((movie) => { return movie.Saved.toLowerCase() == "true"; });
    document.querySelector('.movies-grid').innerHTML = generateMovieGrid(saved).join('');
    addQuickView();
}
//showWatchList
function showWatchList() {
    const watched = MOVIES.filter((movie) => { return movie.Watched.toLowerCase() == "true"; });
    document.querySelector('.movies-grid').innerHTML = generateMovieGrid(watched).join('');
    addQuickView();
}

/* MOVIE GRID 
*/

function generateMovieGrid(movies) {
    tempMovieList = movies;
    const movieGrid = movies.map((movie) => {
        return `<div class="movie-card">
            <div class="card-head">
                <img src="${movie.Poster}"
                 alt="${movie.Title}" data-id="${movie.imdbID}"  
                 onerror="javascript:imageErrorHandler.call(this, event);"
                 class="card-img">
                 <div class="overlay"> 
                   ${getBookMarks(movie)}
                   <div
                   data-id="${movie.imdbID}"  
                   class="quick-view">QUICK VIEW</div>
                </div>
            </div>
            <div class="card-details">
            <p class="movie-title">${movie.Title}</p>
                 ${appendRatings(movie.Ratings)}
             </div>
        </div>`
    });
    return movieGrid
}
function imageErrorHandler() {
    this.parentNode.style.background = "grey";
    const imageNotFound = document.createElement("p");
    imageNotFound.setAttribute("class", "image-error")
    imageNotFound.textContent = `IMAGE NOT FOUND`;
    this.parentNode.appendChild(imageNotFound)
    this.parentNode.removeChild(this);
}
function showMovies(movies) {
    const movieGrid = document.createElement("div");
    movieGrid.classList.add("movies-grid");
    const generatedCards = generateMovieGrid(movies);
    movieGrid.innerHTML = generatedCards.join('')
    document.querySelector('.movies').appendChild(movieGrid);
    addQuickView();
}
function appendRatings(rating) {
    const calRatings = getRating(rating)
    const rateSection = document.createElement("div");
    rateSection.setAttribute("class", "rating-section");
    for (let i = 1; i < 6; i++) {
        rateSection.innerHTML += calRatings >= i ? STARFILLED : STAREMPTY;
    }
    return rateSection.outerHTML
}
function getBookMarks(movie) {
    let bookMarks = '';
    movie.Saved.toLowerCase() == "true"
        ? bookMarks += `<div class="bookmark"><i class="fa fa-bookmark" aria-hidden="true"></i></div>`
        : bookMarks += `<div class="bookmark"><i class="fa fa-bookmark-o" aria-hidden="true"></i></div>`;
    movie.Watched.toLowerCase() == "true"
        ? bookMarks += `<div class="bookmark"><i class="fa fa-eye" aria-hidden="true"></i></div>`
        : bookMarks += `<div class="bookmark"><i class="fa fa-eye-slash" aria-hidden="true"></i></div>`;
    return bookMarks
}

/* FILTER BAR
*/

function createFilterBar(movies) {
    const filterBar = document.createElement("div");
    filterBar.classList.add("filter-bar");

    const filterDropdowns = document.createElement("div");
    filterDropdowns.classList.add("filter-dropdowns");
    // genres 
    const genreDpd = createGenres(movies);
    const sortByDpd = createSortBy();
    filterDropdowns.appendChild(genreDpd);
    filterDropdowns.appendChild(sortByDpd);

    filterBar.appendChild(filterDropdowns);
    document.querySelector('.movies').prepend(filterBar);
}
//sort by
function createSortBy() {
    const sortBySelect = document.createElement('select');
    const pSortBy = document.createElement("p");
    pSortBy.textContent = "Sort By";
    sortBySelect.onchange = changeSortBy;
    sortOptions.forEach(d => sortBySelect.add(new Option(d.name, d.value)));
    pSortBy.append(sortBySelect);
    const asce = document.createElement('i');
    asce.style.padding = "15px"
    asce.setAttribute("class", "sort-icon fa fa-arrow-up");
    asce.addEventListener("click", function () { changeDirection(); })
    pSortBy.append(asce);
    return pSortBy;
}
function changeDirection() {
    const sortIcon = document.querySelector(".sort-icon");
    if (sortIcon.classList.contains("fa-arrow-up")) {
        sortIcon.classList.remove("fa-arrow-up");
        sortIcon.classList.add("fa-arrow-down");
    } else {
        sortIcon.classList.remove("fa-arrow-down");
        sortIcon.classList.add("fa-arrow-up");
    }
    tempMovieList = tempMovieList.reverse()
    document.querySelector('.movies-grid').innerHTML = generateMovieGrid(tempMovieList).join('');
    addQuickView();
}
function changeSortBy(e) {
    const sortValue = e.target.value;
    const sorted = MOVIES.sort((a, b) => a[sortValue] > b[sortValue] ? 1 : -1);
    document.querySelector('.movies-grid').innerHTML = generateMovieGrid(sorted).join('');
    addQuickView();
    const sortIcon = document.querySelector(".sort-icon");
    sortIcon.classList.remove("fa-arrow-down");
    sortIcon.classList.add("fa-arrow-up");
}
//genre
function createGenres(movies) {
    const genreSelect = document.createElement('select');
    const ifilter = document.createElement("i");
    ifilter.setAttribute("class", "fa fa-filter");
    genreSelect.onchange = changeGenre;
    const allGeneres = getGeneres(movies);
    allGeneres.forEach(d => genreSelect.add(new Option(d.toUpperCase(), d)));
    ifilter.append(genreSelect);
    return ifilter;
}
function getGeneres(movies) {
    let genreArray = [ALL_GENRES];
    movies.forEach((movie) => {
        genreArray.push(...(movie.Genre.split(',')));
    });
    genreArray = genreArray.map((genre) => { return genre.toLowerCase().trim() });
    return new Set(genreArray);
}
function changeGenre(e) {
    const filterValue = e.target.value;
    let filtered = [];
    if (filterValue == ALL_GENRES.toLowerCase()) {
        filtered = MOVIES
    }
    else {
        filtered = MOVIES.filter((movie) => {
            return movie.Genre.toLowerCase().trim().includes(filterValue);
        });
    }
    document.querySelector('.movies-grid').innerHTML = generateMovieGrid(filtered).join('');
    const sortIcon = document.querySelector(".sort-icon");
    sortIcon.classList.remove("fa-arrow-down");
    sortIcon.classList.add("fa-arrow-up");
    addQuickView();
}

/*
POPUP 
*/
function addQuickView() {
    const quickArray = document.querySelectorAll('.quick-view');
    quickArray.forEach((card) => {
        card.addEventListener("click", function (e) {
            loadModal(this)
        })
    })
}
function createPopUpModal() {
    const popUpWrapper = document.createElement("div");
    popUpWrapper.setAttribute("class", "popup-wrapper togglePopup");

    const popUpGrid = document.createElement("div");
    popUpGrid.setAttribute("class", "popup-grid");

    const closeButton = document.createElement("button");
    closeButton.setAttribute("id", "close-btn")
    closeButton.setAttribute("class", "flex");
    closeButton.innerHTML = `<i class = "fa fa-times"></i>`;
    closeButton.onclick = closeModal
    //TO DO
    //Image
    const popupImg = document.createElement("div");
    popupImg.classList.add("popup-card")
    const img = document.createElement("img");
    img.setAttribute("class", "popup-image");
    popupImg.appendChild(img);
    //details
    const detailsDiv = document.createElement("div");
    const title = document.createElement("div");
    title.setAttribute("class", "popup-info-title flex");
    const rating = document.createElement("div");
    rating.setAttribute("class", "popup-info-rating flex");
    const plot = document.createElement("div");
    plot.classList.add("popup-info-plot");
    const released = document.createElement("div");
    released.classList.add("popup-info-released");
    const runtime = document.createElement("div");
    runtime.classList.add("popup-info-runtime");
    const genre = document.createElement("div");
    genre.setAttribute("class", "popup-info-genre");
    const director = document.createElement("div");
    director.classList.add("popup-info-director");
    const writer = document.createElement("div");
    writer.classList.add("popup-info-writer");
    const actors = document.createElement("div");
    actors.classList.add("popup-info-actors");
    const language = document.createElement("div");
    language.classList.add("popup-info-main")
    const languageText = document.createElement("p");
    languageText.textContent = "Languages : "
    languageText.classList.add("popup-info-text-language");
    const languageContent = document.createElement("div");
    languageContent.classList.add("popup-info-language");
    language.appendChild(languageText);
    language.appendChild(languageContent);

    const country = document.createElement("div");
    country.classList.add("popup-info-country");
    const awards = document.createElement("div");
    awards.setAttribute("class", "popup-awards")
    awards.innerHTML += `<i class="fa fa-trophy" style="color:darkgoldenrod"></i>`
    const awardsDiv = document.createElement("div");
    awardsDiv.classList.add("popup-info-awards");
    awards.appendChild(awardsDiv)
    const imdbRating = document.createElement("div");
    imdbRating.classList.add("popup-info-imdbRating");
    const imdbVotes = document.createElement("div");
    imdbVotes.classList.add("popup-info-imdbVotes");
    const boxOffice = document.createElement("div");
    boxOffice.classList.add("popup-info-boxOffice");
    const production = document.createElement("div");
    production.classList.add("popup-info-production");
    const watched = document.createElement("div");
    watched.classList.add("popup-info-watched");
    const saved = document.createElement("div");
    saved.classList.add("popup-info-saved");


    [title, rating, genre, runtime, released, language, director, actors, country,
        //  imdbRating,
        imdbVotes, boxOffice, production, awards, watched, saved, plot, writer

    ].forEach(el => detailsDiv.appendChild(el));

    popUpGrid.appendChild(popupImg);
    popUpGrid.appendChild(detailsDiv);

    //
    popUpGrid.appendChild(closeButton);

    popUpWrapper.appendChild(popUpGrid);
    document.body.appendChild(popUpWrapper)

}
function closeModal() {
    const popupWrapper = document.querySelector('.popup-wrapper');
    popupWrapper.classList.add('togglePopup');
}
function openModal() {
    const popupWrapper = document.querySelector('.popup-wrapper');
    popupWrapper.classList.remove('togglePopup');
}
function loadModal(e) {
    const dataID = e.getAttribute('data-id');
    const movie = MOVIES.find(x => x.imdbID == dataID);
    console.log(movie)
    const [img, title, rating, released, runtime, genre, director, actors, language, country,
        plot, awards, imdbRating, boxOffice, production, writer
        //  watched, saved, 
    ] = [
            document.querySelector('.popup-image'),
            document.querySelector('.popup-info-title'),
            document.querySelector('.popup-info-rating'),
            document.querySelector('.popup-info-released'),
            document.querySelector('.popup-info-runtime'),
            document.querySelector('.popup-info-genre'),
            document.querySelector('.popup-info-director'),
            document.querySelector('.popup-info-actors'),
            document.querySelector('.popup-info-language'),
            document.querySelector('.popup-info-country'),
            document.querySelector('.popup-info-plot'),
            document.querySelector('.popup-info-awards'),
            document.querySelector('.popup-info-imdbRating'),
            document.querySelector('.popup-info-boxOffice'),
            document.querySelector('.popup-info-production'),
            document.querySelector('.popup-info-writer')
            // document.querySelector('.popup-info-watched'),
            // document.querySelector('.popup-info-saved'),
        ]

    const bookmarks = getBookMarks(movie);
    const ratings = appendRatings(movie.Ratings);
    img.src = movie.Poster;
    title.innerHTML = ''
    title.textContent = `${movie.Title + ' (' + movie.Year + ')'}`;
    rating.innerHTML = ratings;
    plot.innerHTML = `<b>Plot: </b>${movie.Plot}`;
    released.textContent = "Released On: " + movie.Released;
    runtime.innerHTML = ` <i class="fa fa-clock-o"></i> ${movie.Runtime}`;
    const genreArray = movie.Genre.split(', ');
    genre.innerHTML = '';
    genre.innerHTML = movie.Rated && movie.Rated != 'N/A' ? `<div class="movie-rated">${movie.Rated}</div>` : '';
    genreArray.forEach(x => { x != 'N/A' ? genre.innerHTML += `<div class="genre-item">${x}</div>` : '' });
    director.innerHTML = director.innerHTML ? `<b>Director : </b> <p style="font-weight:200"> ${movie.Director}</p>` : '';
    actors.innerHTML = `<b>Actors : </b> <p style="font-weight:200"> ${movie.Actors}</p>`;
    released.innerHTML = `<b>Released On : </b> <p style="font-weight:200"> ${movie.Released}</p>`;
    country.innerHTML = `<b>Countries : </b> <p style="font-weight:200"> ${movie.Country}</p>`;
    language.textContent = movie.Language;
    awards.innerHTML = movie.Awards;
    boxOffice.innerHTML = movie.BoxOffice ? `<b>Box Office  : </b> <p style="font-weight:200"> ${movie.BoxOffice}</p>` : '';
    production.innerHTML = production.innerHTML ? `<b>Production : </b> <p style="font-weight:200"> ${movie.Production}</p>` : '';
    writer.innerHTML = `<b>Writer(s)  </b> <p style="font-weight:200"> ${movie.Writer}</p>`;
    openModal();
}

/** CUSTOM SORT
 * function to returns the array based on attribute and sort direction  arguments.
 * @param {Array} arr   - Array to be sorted.
 * @param {String} attr - Attribute to be sorted. 
 * @param {Boolean} dir - Sorting order 0:ascending,1:descending.
 * */
const customSort = (arr, attr, dir) => arr.sort((a, b) => a[attr] > b[attr] ? (dir ? 1 : -1) : (dir ? -1 : 1));
