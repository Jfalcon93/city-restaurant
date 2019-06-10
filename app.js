const searchInput = document.getElementById('searchText');
const searchForm = document.getElementById('search-form');
const cityContainer = document.getElementById('city-container');
const leftCity = document.getElementById('left-city');
const rightCity = document.getElementById('right-city');
const cuisineContainer = document.getElementById('cuisine-container');
const cuisineTitle = document.getElementById('cuisine-title');
const cuisinesList = document.getElementById('cuisines');
const restaurantContainer = document.getElementById('restaurant-container');

// Used to get City Header Pic
const getLocationPic = async (location) => {
    const api = (`https://pixabay.com/api/?key=${config.picKey}&q=${location}&image_type=photo&per_page=3&safesearch=true`);
    const response = await fetch (api)
    const json = await response.json();
    return json;
}

// Used to get City Location
const getCity = async (location) => {
    const api = (`https://developers.zomato.com/api/v2.1/locations?query=${location}`);
    const response = await fetch (api, {
        headers: {
            'user-key': config.zomatoKey
        }
    });
    const json = await response.json()
    return json;
}

// Used to get Location Information for a given city
const getLocation = async (id, type) => {
    const api = (`https://developers.zomato.com/api/v2.1/location_details?entity_id=${id}&entity_type=${type}`);
    const response = await fetch (api, {
        headers: {
            'user-key': config.zomatoKey
        }
    });
    const json = await response.json()
    return json;
}

// Used to get all information for a given city
const getLocationInfo = async (location) => {
    const city = await getCity(location);
    try {
        let locationInfo = await getLocation(city.location_suggestions[0].entity_id, city.location_suggestions[0].entity_type);
        return locationInfo;
    }
    catch (err) {
        console.log("Not a valid City");
        return "No City";
    }
}

// Main Search Form function
searchForm.addEventListener('submit', e => {
    e.preventDefault();
    
    // Clear Containers
    leftCity.innerHTML = '';
    rightCity.innerHTML = '';
    restaurantContainer.innerHTML = '';
    cuisineTitle.innerHTML = '';
    cuisinesList.innerHTML = '';
    
    // Search Bar
    const city = searchInput.value;
    searchInput.value = "";
    
    //Reset Search Bar if error on previous search
    searchInput.style.border = '2px solid #ccc';
    searchInput.style.width = '70px';
    searchInput.placeholder = 'Search...';
    
    // Set Container class names
    cityContainer.className = 'city-container';
    cuisineContainer.className = 'cuisine-container';
    
    // Handle and Load Picture
    getLocationPic(city)
    .then(results => {
        if (results.totalHits > 0) {
            const pic = results.hits[0].largeImageURL;
            const picElement = document.createElement('div');
            picElement.className = 'pic';
            rightCity.appendChild(picElement);
            picElement.style.background = `url('${pic}') center`;   
        } else {
            const noPic = document.createElement('div');
            noPic.innerHTML = `<h2>No Picture Available</h2>`;
            rightCity.appendChild(noPic);
        }
    });
    
    // Handle and Load all City Information
    getLocationInfo(city)
    .then(results => {
        if (results === "No City") {
            // Error message
            searchInput.style.border = '2px solid #ff5555';
            searchInput.style.width = '128px';
            searchInput.placeholder = 'Enter a Valid City Name';
        }
        else {
            // City Name
            const cityName = results.location.title;
            const cityNameEl = document.createElement('h1');
            cityNameEl.innerHTML = cityName.replace(/,.*/, "");
            leftCity.appendChild(cityNameEl);
            leftCity.innerHTML += '<hr>';

            // Popularity and Night Life Index
            const cityPop = results.popularity;
            const cityNight = results.nightlife_index;
            const cityPopEl = document.createElement('p');
            cityPopEl.innerHTML = `<span class="subhead">Popularity:</span>${starGenerator(cityPop)}<br><span class="subhead">Night Life: </span>${starGenerator(cityNight)}`;
            leftCity.appendChild(cityPopEl);

            //Total Restaurant Count
            const restaurants = results.num_restaurant;
            const totalRestaurantsEl = document.createElement('p');
            totalRestaurantsEl.innerHTML = `<span class="numbers">${restaurants}</span> Restaurants`;
            leftCity.appendChild(totalRestaurantsEl);

            // Top Cuisines
            const cuisines = results.top_cuisines;
            cuisineContainer.className = 'cuisine-container';
            //cuisineTitle.innerHTML = "Top Cuisine";
            for (let i = 0; i < cuisines.length; i++) {
                let cuisine = document.createElement('span');
                cuisine.innerHTML = cuisines[i];
                cuisinesList.appendChild(cuisine);
            }

            // Create Top Restaurant Cards
            for (let i = 0; i < 10; i++) {
                let restaurantName = results.best_rated_restaurant[i].restaurant.name;
                let cuisinesList = results.best_rated_restaurant[i].restaurant.cuisines;
                let costPerPerson = results.best_rated_restaurant[i].restaurant.average_cost_for_two / 2;
                let rating = results.best_rated_restaurant[i].restaurant.user_rating.aggregate_rating;
                let reviewCount = results.best_rated_restaurant[i].restaurant.user_rating.votes;
                let moreInfo = results.best_rated_restaurant[i].restaurant.url;
                let address = results.best_rated_restaurant[i].restaurant.location.address;
                let restaurantEl = `<div class="restaurants">
                                    <div class="cuisine-top">
                                        <h2>${restaurantName}</h2>
                                        <p>${cuisinesList}</p>
                                        <p class="address">${address}</p>
                                    </div>
                                    <div class="cuisine-bottom">
                                        <p><span class="numbers cost">$${costPerPerson}</span> per person</p>
                                        <p>${starGenerator(rating)} <span class="numbers">${reviewCount}</span> Reviews</p>
                                        <a class="visit-link" href="${moreInfo}">More Info</a>
                                    </div>
                                    </div>
                                    `;
                restaurantContainer.innerHTML += restaurantEl;
            }
        }
    })
})

// Star Generator for reviews
const starGenerator = (rating) => {
    if (rating > 4.7) {
        return `<i class="material-icons star">star</i>
                <i class="material-icons star">star</i>
                <i class="material-icons star">star</i>
                <i class="material-icons star">star</i>
                <i class="material-icons star">star</i>
                `;
    } else if (rating <= 4.7 && rating > 4) {
        return `<i class="material-icons star">star</i>
                <i class="material-icons star">star</i>
                <i class="material-icons star">star</i>
                <i class="material-icons star">star</i>
                <i class="material-icons star">star_half</i>
                `;
    } else if (rating <= 4 && rating > 3.5) {
        return `<i class="material-icons star">star</i>
                <i class="material-icons star">star</i>
                <i class="material-icons star">star</i>
                <i class="material-icons star">star</i>
                <i class="material-icons star">star_border</i>
                `;
    } else if (rating <= 3.5 && rating > 3) {
        return `<i class="material-icons star">star</i>
                <i class="material-icons star">star</i>
                <i class="material-icons star">star</i>
                <i class="material-icons star">star_half</i>
                <i class="material-icons star">star_border</i>
                `;
    } else if (rating <= 3 && rating > 2.5) {
        return `<i class="material-icons star">star</i>
                <i class="material-icons star">star</i>
                <i class="material-icons star">star</i>
                <i class="material-icons star">star_border</i>
                <i class="material-icons star">star_border</i>
                `;
    } else if (rating <= 2.5 && rating > 2) {
        return `<i class="material-icons star">star</i>
                <i class="material-icons star">star</i>
                <i class="material-icons star">star_half</i>
                <i class="material-icons star">star_border</i>
                <i class="material-icons star">star_border</i>
                `;
    } else if (rating <= 2 && rating > 1.5) {
        return `<i class="material-icons star">star</i>
                <i class="material-icons star">star</i>
                <i class="material-icons star">star_border</i>
                <i class="material-icons star">star_border</i>
                <i class="material-icons star">star_border</i>
                `;
    } else if (rating <= 1.5 && rating > 1) {
        return `<i class="material-icons star">star</i>
                <i class="material-icons star">star_half</i>
                <i class="material-icons star">star_border</i>
                <i class="material-icons star">star_border</i>
                <i class="material-icons star">star_border</i>
                `;
    } else if (rating <= 1 && rating > 0.5) {
        return `<i class="material-icons star">star</i>
                <i class="material-icons star">star_border</i>
                <i class="material-icons star">star_border</i>
                <i class="material-icons star">star_border</i>
                <i class="material-icons star">star_border</i>
                `;
    } else if (rating <= 0.5 && rating > 0) {
        return `<i class="material-icons star">star_half</i>
                <i class="material-icons star">star_border</i>
                <i class="material-icons star">star_border</i>
                <i class="material-icons star">star_border</i>
                <i class="material-icons star">star_border</i>
                `;
    } else {
        return `<i class="material-icons star">star_border</i>
                <i class="material-icons star">star_border</i>
                <i class="material-icons star">star_border</i>
                <i class="material-icons star">star_border</i>
                <i class="material-icons star">star_border</i>
                `;
    }
}

// Modal Code
const modal = document.getElementById('myModal');
const modalLink = document.getElementById('aboutButton');
const close = document.getElementById('close');

modalLink.onclick = function() {
    modal.style.display = 'block';
}

close.onclick = function () {
    modal.style.display = 'none';
}

window.onclick = function (e) {
    if (e.target == modal) {
        modal.style.display = 'none';
    }
}