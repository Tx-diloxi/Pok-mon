// Classe responsable de l'affichage et de la gestion des Pokémons
class PokemonManager {
    static MAX_POKEMON_PAGE = 25;

    constructor() {
        this.pageActuelle = 1;
        this.nombrePages = 1;
        this.pokemonsNormaux = [];
        this.pokemonsFiltres = [];
        this.typesNormauxParId = {};
        this.mouvementsNormauxParId = {};

        // Filtres actuels
        this.filtreTypeActuel = '';
        this.filtreAttaqueActuel = '';
        this.filtreNomActuel = '';
        this.tousLesTypesDisponibles = new Set();
        this.toutesLesAttaquesRapides = new Set();
    }

    // Détermine la génération à partir de l'ID du Pokémon
    static obtenirGeneration(idPokemon) {
        if (idPokemon <= 151) return 'Génération I';
        if (idPokemon <= 251) return 'Génération II';
        if (idPokemon <= 386) return 'Génération III';
        if (idPokemon <= 493) return 'Génération IV';
        if (idPokemon <= 649) return 'Génération V';
        if (idPokemon <= 721) return 'Génération VI';
        if (idPokemon <= 809) return 'Génération VII';
        if (idPokemon <= 898) return 'Génération VIII';
        return 'Génération IX+';
    }

    // Formate la liste de types pour l'affichage
    static formaterTypes(types) {
        return types.join(' / ');
    }

    // Normalise un texte pour la comparaison (sans casse, sans accents)
    static normaliserTexte(texte) {
        return texte
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    }

    // Initialise les tables utilisées pour l'affichage et les données
    initialiser() {
        // Récupère tous les Pokémons normaux et les trie par ID
        this.pokemonsNormaux = pokemons
            .filter(pokemon => pokemon.form === 'Normal')
            .sort((a, b) => a.pokemon_id - b.pokemon_id);

        // Remplit les tables de types et mouvements pour chaque Pokémon
        this.pokemonsNormaux.forEach(pokemon => {
            const types = pokemon_types
                .find(p => p.pokemon_id === pokemon.pokemon_id && p.form === 'Normal');
            const mouvements = pokemon_moves
                .find(p => p.pokemon_id === pokemon.pokemon_id && p.form === 'Normal');
            
            if (types) this.typesNormauxParId[pokemon.pokemon_id] = types.type;
            if (mouvements) {
                this.mouvementsNormauxParId[pokemon.pokemon_id] = {
                    fast_moves: mouvements.fast_moves,
                    charged_moves: mouvements.charged_moves,
                    elite_fast_moves: mouvements.elite_fast_moves,
                    elite_charged_moves: mouvements.elite_charged_moves
                };
            }
        });

        // Extrait les types et attaques disponibles
        this.pokemonsNormaux.forEach(pokemon => {
            const types = this.typesNormauxParId[pokemon.pokemon_id] || [];
            types.forEach(type => this.tousLesTypesDisponibles.add(type));
            
            const mouvements = this.mouvementsNormauxParId[pokemon.pokemon_id] || {};
            if (mouvements.fast_moves) {
                mouvements.fast_moves.forEach(move => this.toutesLesAttaquesRapides.add(move));
            }
        });

        // Initialise les dropdowns et l'affichage
        this.peuplerSelectType();
        this.peuplerSelectAttaque();
        this.appliquerFiltres();
        this.lierEvenementsPagination();
        this.lierEvenementsFermeture();
        this.lierEvenementsFiltre();
        this.allerAUnePage(1);
    }

    // Met à jour les contrôles et l'étiquette de pagination
    mettreAJourAffichagePagination() {
        const etiquette = `Page ${this.pageActuelle} / ${this.nombrePages}`;

        $('#infoPage').text(etiquette);
        $('#precedentHaut').prop('disabled', this.pageActuelle <= 1);
        $('#suivantHaut').prop('disabled', this.pageActuelle >= this.nombrePages);
    }

    // Crée une ligne de tableau HTML pour un Pokémon
    creerLignePokemon(pokemon) {
        const types = this.typesNormauxParId[pokemon.pokemon_id] || [];
        const idImage = String(pokemon.pokemon_id).padStart(3, '0');
        const sourceImage = `webp/images/${idImage}.webp`;
        
        const tr = $('<tr>')
            .data('pokemonId', pokemon.pokemon_id)
            .html(`
                <td>${pokemon.pokemon_id}</td>
                <td>${pokemon.pokemon_name}</td>
                <td>${PokemonManager.obtenirGeneration(pokemon.pokemon_id)}</td>
                <td>${PokemonManager.formaterTypes(types)}</td>
                <td>${pokemon.base_stamina}</td>
                <td>${pokemon.base_attack}</td>
                <td>${pokemon.base_defense}</td>
                <td><img src="${sourceImage}" alt="${pokemon.pokemon_name}" loading="lazy" class="pokemonThumbnail" data-pokemon-id="${pokemon.pokemon_id}" data-pokemon-name="${pokemon.pokemon_name}"></td>
            `);

        // Événement clic sur la ligne pour ouvrir le popup de détails
        tr.on('click', () => this.afficherPopupDetails(pokemon));

        // Événements sur la miniature pour l'aperçu
        const img = tr.find('.pokemonThumbnail');
        img.on('mouseenter', (e) => this.afficherAperçuImage(e, sourceImage, pokemon.pokemon_name));
        img.on('mouseleave', () => this.masquerAperçuImage());

        return tr;
    }

    // Remplit le tbody avec les Pokémons de la page courante (filtrés et paginés)
    creerTableauPokemons() {
        const tbody = $('tbody');

        tbody.empty();

        if (this.pokemonsFiltres.length === 0) {
            tbody.html('<tr><td colspan="8">Aucun Pokémon ne correspond aux filtres.</td></tr>');
            return;
        }

        const indexDebut = (this.pageActuelle - 1) * PokemonManager.MAX_POKEMON_PAGE;
        const pokemonsPage = this.pokemonsFiltres.slice(indexDebut, indexDebut + PokemonManager.MAX_POKEMON_PAGE);

        pokemonsPage.forEach(pokemon => tbody.append(this.creerLignePokemon(pokemon)));
    }

    // Change la page courante et met à jour l'affichage
    allerAUnePage(numeroPage) {
        this.pageActuelle = Math.min(Math.max(numeroPage, 1), this.nombrePages);
        this.creerTableauPokemons();
        this.mettreAJourAffichagePagination();
    }

    // Associe les boutons précédent/suivant aux actions de pagination
    lierEvenementsPagination() {
        $('#precedentHaut').on('click', () => this.allerAUnePage(this.pageActuelle - 1));
        $('#suivantHaut').on('click', () => this.allerAUnePage(this.pageActuelle + 1));
    }

    // Construit et affiche le contenu du popup de détails
    afficherPopupDetails(pokemon) {
        const types = this.typesNormauxParId[pokemon.pokemon_id] || [];
        const mouvements = this.mouvementsNormauxParId[pokemon.pokemon_id] || {};
        
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

        const htmlPopup = `
            <h2>${pokemon.pokemon_name}</h2>
            <div class="detailSection">
                <div class="detailRow">
                    <strong>ID:</strong>
                    <span>${pokemon.pokemon_id}</span>
                </div>
                <div class="detailRow">
                    <strong>Génération:</strong>
                    <span>${PokemonManager.obtenirGeneration(pokemon.pokemon_id)}</span>
                </div>
                <div class="detailRow">
                    <strong>Types:</strong>
                    <span>${PokemonManager.formaterTypes(types)}</span>
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

        $('#popupContent').html(htmlPopup);
        $('#pokemonDetailsPopup').show();
    }

    // Cache le popup de détails
    masquerPopupDetails() {
        $('#pokemonDetailsPopup').hide();
    }

    // Affiche un aperçu d'image à côté de la miniature
    afficherAperçuImage(event, sourceImage, nomPokemon) {
        const preview = $('#imagePreviewPopup');
        const previewImg = $('#imagePreviewImg');
        
        if (preview.length === 0 || previewImg.length === 0) return;
        
        previewImg.attr('src', sourceImage).attr('alt', nomPokemon);
        
        const rect = event.target.getBoundingClientRect();
        preview
            .css('left', (rect.right - 300) + 'px')
            .css('top', (rect.top - 50) + 'px')
            .show();
    }

    // Cache l'aperçu d'image
    masquerAperçuImage() {
        $('#imagePreviewPopup').hide();
    }

    // Lie les événements pour fermer le popup (bouton, clic en dehors, Échap)
    lierEvenementsFermeture() {
        $('#fermerPopup').on('click', () => this.masquerPopupDetails());

        $('#pokemonDetailsPopup').on('click', (e) => {
            if (e.target === e.currentTarget) {
                this.masquerPopupDetails();
            }
        });

        $(document).on('keydown', (e) => {
            if (e.key === 'Escape' && $('#pokemonDetailsPopup').is(':visible')) {
                this.masquerPopupDetails();
            }
        });
    }

    // Remplit le select des types avec les types disponibles
    peuplerSelectType() {
        const selectType = $('#filtreType');
        if (selectType.length === 0) return;
        
        const types = Array.from(this.tousLesTypesDisponibles).sort();
        
        types.forEach(type => {
            selectType.append($('<option>').val(type).text(type));
        });
    }

    // Remplit le select des attaques rapides avec les attaques disponibles
    peuplerSelectAttaque() {
        const selectAttaque = $('#filtreAttaque');
        if (selectAttaque.length === 0) return;
        
        const attaques = Array.from(this.toutesLesAttaquesRapides).sort();
        
        attaques.forEach(attaque => {
            selectAttaque.append($('<option>').val(attaque).text(attaque));
        });
    }

    // Applique les filtres sélectionnés et met à jour la liste des Pokémons affichés
    appliquerFiltres() {
        this.pokemonsFiltres = this.pokemonsNormaux.filter(pokemon => {
            const types = this.typesNormauxParId[pokemon.pokemon_id] || [];
            const mouvements = this.mouvementsNormauxParId[pokemon.pokemon_id] || {};
            const attaquesRapides = mouvements.fast_moves || [];
            
            // Filtre Type
            if (this.filtreTypeActuel !== '' && !types.includes(this.filtreTypeActuel)) {
                return false;
            }
            
            // Filtre Attaques rapides
            if (this.filtreAttaqueActuel !== '' && !attaquesRapides.includes(this.filtreAttaqueActuel)) {
                return false;
            }
            
            // Filtre Nom (sans accents, sans casse)
            if (this.filtreNomActuel !== '') {
                const nomNormalise = PokemonManager.normaliserTexte(pokemon.pokemon_name);
                const rechercheNormalisee = PokemonManager.normaliserTexte(this.filtreNomActuel);
                if (!nomNormalise.includes(rechercheNormalisee)) {
                    return false;
                }
            }
            
            return true;
        });
        
        // Réinitialise la pagination à la page 1
        this.pageActuelle = 1;
        this.nombrePages = Math.max(1, Math.ceil(this.pokemonsFiltres.length / PokemonManager.MAX_POKEMON_PAGE));
        
        // Met à jour l'affichage
        this.creerTableauPokemons();
        this.mettreAJourAffichagePagination();
    }

    // Lie les événements pour les contrôles de filtrage
    lierEvenementsFiltre() {
        $('#filtreType').on('change', (e) => {
            this.filtreTypeActuel = $(e.target).val();
            this.appliquerFiltres();
        });
        
        $('#filtreAttaque').on('change', (e) => {
            this.filtreAttaqueActuel = $(e.target).val();
            this.appliquerFiltres();
        });
        
        $('#filtreNom').on('input', (e) => {
            this.filtreNomActuel = $(e.target).val();
            this.appliquerFiltres();
        });
    }
}

// Initialise l'application une fois le DOM chargé
$(document).ready(function() {
    const manager = new PokemonManager();
    manager.initialiser();
});