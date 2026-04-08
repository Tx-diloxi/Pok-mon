const MAX_POKEMON_PAGE = 25;
let pageActuelle = 1;
let nombrePages = 1;
let pokemonsNormaux = [];
let typesNormauxParId = {};
let mouvementsNormauxParId = {};

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
    pokemon_types
        .filter(pokemon => pokemon.form === 'Normal')
        .forEach(pokemon => {
            typesNormauxParId[pokemon.pokemon_id] = pokemon.type;
        });

    pokemon_moves
        .filter(pokemon => pokemon.form === 'Normal')
        .forEach(pokemon => {
            mouvementsNormauxParId[pokemon.pokemon_id] = {
                fast_moves: pokemon.fast_moves,
                charged_moves: pokemon.charged_moves,
                elite_fast_moves: pokemon.elite_fast_moves,
                elite_charged_moves: pokemon.elite_charged_moves
            };
        });

    pokemonsNormaux = pokemons
        .filter(pokemon => pokemon.form === 'Normal')
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
    
    tr.dataset.pokemonId = pokemon.pokemon_id;

    tr.innerHTML = `
        <td>${pokemon.pokemon_id}</td>
        <td>${pokemon.pokemon_name}</td>
        <td>${obtenirGenerationDepuisId(pokemon.pokemon_id)}</td>
        <td>${formaterTypes(types)}</td>
        <td>${pokemon.base_stamina}</td>
        <td>${pokemon.base_attack}</td>
        <td>${pokemon.base_defense}</td>
        <td><img src="${sourceImage}" alt="${pokemon.pokemon_name}" loading="lazy" class="pokemonThumbnail" data-pokemon-id="${pokemon.pokemon_id}" data-pokemon-name="${pokemon.pokemon_name}"></td>
    `;

    // Événement clic sur la ligne pour ouvrir le popup de détails
    tr.addEventListener('click', () => afficherPopupDetails(pokemon));

    // Événements sur la miniature pour l'aperçu
    const img = tr.querySelector('.pokemonThumbnail');
    img.addEventListener('mouseenter', (e) => afficherAperçuImage(e, sourceImage, pokemon.pokemon_name));
    img.addEventListener('mouseleave', () => masquerAperçuImage());

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

function afficherPopupDetails(pokemon) {
    const types = typesNormauxParId[pokemon.pokemon_id] || [];
    const mouvements = mouvementsNormauxParId[pokemon.pokemon_id] || {};
    
    let contenuMovements = '';
    
    if (mouvements.fast_moves && mouvements.fast_moves.length > 0) {
        contenuMovements += `
            <div class="detailSection">
                <h3>Attaques rapides</h3>
                <div class="movesList">
                    ${mouvements.fast_moves.map(move => `<span class="moveBadge">${move}</span>`).join('')}
                </div>
            </div>
        `;
    }
    
    if (mouvements.charged_moves && mouvements.charged_moves.length > 0) {
        contenuMovements += `
            <div class="detailSection">
                <h3>Attaques chargées</h3>
                <div class="movesList">
                    ${mouvements.charged_moves.map(move => `<span class="moveBadge">${move}</span>`).join('')}
                </div>
            </div>
        `;
    }

    if (mouvements.elite_fast_moves && mouvements.elite_fast_moves.length > 0) {
        contenuMovements += `
            <div class="detailSection">
                <h3>Attaques élites rapides</h3>
                <div class="movesList">
                    ${mouvements.elite_fast_moves.map(move => `<span class="moveBadge">${move}</span>`).join('')}
                </div>
            </div>
        `;
    }

    if (mouvements.elite_charged_moves && mouvements.elite_charged_moves.length > 0) {
        contenuMovements += `
            <div class="detailSection">
                <h3>Attaques élites chargées</h3>
                <div class="movesList">
                    ${mouvements.elite_charged_moves.map(move => `<span class="moveBadge">${move}</span>`).join('')}
                </div>
            </div>
        `;
    }

    const htmlPopup = `
        <h2>${pokemon.pokemon_name}</h2>
        <div class="detailSection">
            <div class="detailRow">
                <strong>ID:</strong>
                <span>${pokemon.pokemon_id}</span>
            </div>
            <div class="detailRow">
                <strong>Génération:</strong>
                <span>${obtenirGenerationDepuisId(pokemon.pokemon_id)}</span>
            </div>
            <div class="detailRow">
                <strong>Types:</strong>
                <span>${formaterTypes(types)}</span>
            </div>
        </div>
        <div class="detailSection">
            <div class="detailRow">
                <strong>Endurance:</strong>
                <span>${pokemon.base_stamina}</span>
            </div>
            <div class="detailRow">
                <strong>Attaque de base:</strong>
                <span>${pokemon.base_attack}</span>
            </div>
            <div class="detailRow">
                <strong>Défense de base:</strong>
                <span>${pokemon.base_defense}</span>
            </div>
        </div>
        ${contenuMovements}
    `;

    const popupContent = document.getElementById('popupContent');
    if (popupContent) {
        popupContent.innerHTML = htmlPopup;
    }

    const popup = document.getElementById('pokemonDetailsPopup');
    if (popup) {
        popup.style.display = 'flex';
    }
}

function masquerPopupDetails() {
    const popup = document.getElementById('pokemonDetailsPopup');
    if (popup) {
        popup.style.display = 'none';
    }
}

function afficherAperçuImage(event, sourceImage, nomPokemon) {
    const preview = document.getElementById('imagePreviewPopup');
    const previewImg = document.getElementById('imagePreviewImg');
    
    if (!preview || !previewImg) return;
    
    previewImg.src = sourceImage;
    previewImg.alt = nomPokemon;
    
    const rect = event.target.getBoundingClientRect();
    preview.style.left = (rect.right + 10) + 'px';
    preview.style.top = (rect.top - 50) + 'px';
    preview.style.display = 'block';
}

function masquerAperçuImage() {
    const preview = document.getElementById('imagePreviewPopup');
    if (preview) {
        preview.style.display = 'none';
    }
}

function lierEvenementsFermeture() {
    const fermerBtn = document.getElementById('fermerPopup');
    const popup = document.getElementById('pokemonDetailsPopup');

    if (fermerBtn) {
        fermerBtn.addEventListener('click', masquerPopupDetails);
    }

    if (popup) {
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                masquerPopupDetails();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && popup && popup.style.display !== 'none') {
            masquerPopupDetails();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initialiserDonnees();
    lierEvenementsPagination();
    lierEvenementsFermeture();
    allerAUnePage(1);
});