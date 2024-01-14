const pokedex = document.getElementById("pokedex");
const searchBar = document.getElementById("searchBar");
const nextPageButton = document.getElementById("nextPage");
const prevPageButton = document.getElementById("prevPage");
const currentPageSpan = document.getElementById("currentPage");
const navbar = document.querySelector(".navbar");

const pageSize = 10;
let currentPage = 1;

const changePage = (increment) => {
  currentPage = currentPage + increment;
  if (currentPage < 1) {
    currentPage = 1;
  }
  fetchPokemon();
};

const logout = () => {
  document.cookie =
    "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  redirectToLogin();
};

const redirectToLogin = () => {
  window.location.href = "http://127.0.0.1:5500/html/login.html";
};

const handleUnauthorized = () => {
  // Remove cards if present
  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => card.remove());

  displayUnauthorizedMessage();
  hideElements([
    navbar,
    searchBar,
    prevPageButton,
    nextPageButton,
    currentPageSpan,
  ]);
};

const hideElements = (elements) => {
  if (elements.length > 0) {
    elements.forEach((element) => {
      element.style.display = "none";
    });
  }
};

const showElement = (element) => {
  element.style.display = "block";
};

const fetchPokemon = async () => {
  try {
    const accessTokenCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("accessToken="));

    if (!accessTokenCookie) {
      throw new Error("Access token not found in cookies");
    }

    const token = accessTokenCookie.split("=")[1];

    const response = await fetch(
      `http://localhost:8080/api/pokemon?pageNo=${currentPage}&pageSize=${pageSize}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        console.log("401 coming");
        handleUnauthorized();
        return;
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log("Total elements: " + data.totalElements);

    if (data.totalElements === 0) {
      displayNoPokemonsMessage();
      hideElements([
        searchBar,
        prevPageButton,
        nextPageButton,
        currentPageSpan,
      ]);
      return;
    }

    const mapPokemonData = (pokemonData) => ({
      name: pokemonData.name,
      height: pokemonData.height,
      weight: pokemonData.weight,
      image: pokemonData.imageUrl,
      type: pokemonData.type,
      id: pokemonData.id,
    });

    const pokemons = data.content.map(mapPokemonData);
    displayPokemon(pokemons);

    console.log(data.last);
    if (data.last) {
      hideElements([nextPageButton]);
    }

    console.log("currentPage: " + currentPage);
    if (currentPage === 1) {
      hideElements([prevPageButton]);
    }
  } catch (error) {
    console.error("Error fetching Pokemons:", error.message);
  }
};

const displayUnauthorizedMessage = () => {
  const unauthorizedMessage = document.getElementById("unauthorized-message");
  unauthorizedMessage.innerHTML =
    "You are not authorized to access this content";

  const loginButton = document.createElement("button");
  loginButton.innerText = "LOGIN";
  loginButton.className = "login-btn";
  loginButton.onclick = redirectToLogin;

  unauthorizedMessage.appendChild(loginButton);
};

const displayNoPokemonsMessage = () => {
  const noPokemonsMessage = document.createElement("p");
  noPokemonsMessage.innerText =
    "Sorry, there are no Pokémon in the database right now.";
  noPokemonsMessage.style.textAlign = "center";
  noPokemonsMessage.style.fontSize = "24px";

  pokedex.innerHTML = "";
  pokedex.appendChild(noPokemonsMessage);
};

const displayPokemon = (pokemon) => {
  const filteredPokemon = pokemon.filter((p) =>
    p.name.toLowerCase().includes(searchBar.value.toLowerCase())
  );

  console.log("filteredPokemon length: " + filteredPokemon.length);
  if (filteredPokemon.length === 0) {
    displayNoPokemonsMessage();
    hideElements([prevPageButton, nextPageButton, currentPageSpan]);
    return;
  } else {
    showElement(currentPageSpan);
  }

  const pokemonHTMLString = filteredPokemon
    .map(
      (pokeman) => `
        <li class="card">
            <img class="card-image" src="${pokeman.image}"/>
            <h2 class="card-title">${pokeman.id}. ${pokeman.name}</h2>
            <p class="card-subtitle">Type: ${pokeman.type}</p>
            <p class="card-subtitle">Height: ${pokeman.height}</p>
            <p class="card-subtitle">Weight: ${pokeman.weight}</p>
        </li>
    `
    )
    .join("");

  pokedex.innerHTML = pokemonHTMLString;
  document.getElementById("currentPage").innerText = `Page ${currentPage}`;

  // Check if it's the first page
  if (currentPage === 1) {
    hideElements(prevPageButton);
  } else {
    showElement(prevPageButton);
  }

  // Assuming there are more pages, show next page button
  showElement(nextPageButton);
};

searchBar.addEventListener("input", fetchPokemon);

// Call fetchPokemon initially to load the first page
fetchPokemon();
