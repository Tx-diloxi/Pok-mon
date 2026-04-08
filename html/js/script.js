const Class = window.Class || {
    pokemons: [],
    pokemon_types: [],
    getNormalPokemons: () => [],
    getNormalTypesById: () => ({})
};

const MAX_POKEMON_PAGE = 25;
let pageActuelle = 1;
let nombrePages = 1;
let pokemonsNormaux = [];
let typesNormauxParId = {};

const obtenirGenerationDepuisId = idPokemon => {
    if (idPokemon <= 151) return 'Génération I';
    if (idPokemon <= 251) return 'Génération II';
    if (idPokemon <= 386) return 'Génération III';
    if (idPokemon <= 493) return 'Génération IV';
    if (idPokemon <= 649) return 'Génération V';
    if (idPokemon <= 721) return 'Génération VI';
    if (idPokemon <= 809) return 'Génération VII';
    if (idPokemon <= 898) return 'Génération VIII';
    return 'Génération IX+';
};

const formaterTypes = types => types.join(' / ');

function initialiserDonnees() {
    typesNormauxParId = Class.getNormalTypesById();

    pokemonsNormaux = Class.getNormalPokemons()
        .sort((a, b) => a.pokemon_id - b.pokemon_id);

    nombrePages = Math.max(1, Math.ceil(pokemonsNormaux.length / MAX_POKEMON_PAGE));
}

function mettreAJourAffichagePagination() {
    const infoPage = document.getElementById('infoPage');
    const precedent = document.getElementById('precedentHaut');
    const suivant = document.getElementById('suivantHaut');
    const etiquette = `Page ${pageActuelle} / ${nombrePages}`;

    if (infoPage) infoPage.textContent = etiquette;
    if (precedent) precedent.disabled = pageActuelle <= 1;
    if (suivant) suivant.disabled = pageActuelle >= nombrePages;
}

function creerLignePokemon(pokemon) {
    const types = typesNormauxParId[pokemon.pokemon_id] || [];
    const idImage = String(pokemon.pokemon_id).padStart(3, '0');
    const sourceImage = `webp/images/${idImage}.webp`;
    const tr = document.createElement('tr');

    tr.innerHTML = `
        <td>${pokemon.pokemon_id}</td>
        <td>${pokemon.pokemon_name}</td>
        <td>${obtenirGenerationDepuisId(pokemon.pokemon_id)}</td>
        <td>${formaterTypes(types)}</td>
        <td>${pokemon.base_stamina}</td>
        <td>${pokemon.base_attack}</td>
        <td>${pokemon.base_defense}</td>
        <td><img src="${sourceImage}" alt="${pokemon.pokemon_name}" loading="lazy"></td>
    `;

    return tr;
}

function creerTableauPokemons() {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (pokemonsNormaux.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">Aucun Pokémon \"Normal\" trouvé dans les données.</td></tr>';
        return;
    }

    const indexDebut = (pageActuelle - 1) * MAX_POKEMON_PAGE;
    const pokemonsPage = pokemonsNormaux.slice(indexDebut, indexDebut + MAX_POKEMON_PAGE);

    pokemonsPage.forEach(pokemon => tbody.appendChild(creerLignePokemon(pokemon)));
}

function allerAUnePage(numeroPage) {
    pageActuelle = Math.min(Math.max(numeroPage, 1), nombrePages);
    creerTableauPokemons();
    mettreAJourAffichagePagination();
}

function lierEvenementsPagination() {
    const precedent = document.getElementById('precedentHaut');
    const suivant = document.getElementById('suivantHaut');

    if (precedent) precedent.addEventListener('click', () => allerAUnePage(pageActuelle - 1));
    if (suivant) suivant.addEventListener('click', () => allerAUnePage(pageActuelle + 1));
}

document.addEventListener('DOMContentLoaded', () => {
    initialiserDonnees();
    lierEvenementsPagination();
    allerAUnePage(1);
});

