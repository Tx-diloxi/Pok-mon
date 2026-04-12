//class PokemonPartie2 pour la partie 2.
class PokemonPartie2 {
    //consigne fix 25 pokemons par page
    static MAX_POKEMON_PAR_PAGE = 25;

    constructor() {
        this.pageActuelle = 1; //demarre à la page 1
        this.nombrePages = 1;
        this.pokemonsNormaux = []; //tous les pokemons de forme normale
        this.pokemonsFiltres = []; //pokemons après application des filtres
        this.typesNormauxParId = {};
        this.mouvementsNormauxParId = {};

        //filtres actuels
        this.filtreTypeActuel = '';
        this.filtreAttaqueActuel = '';
        this.filtreNomActuel = '';
        this.tousLesTypesDisponibles = [];
        this.toutesLesAttaquesRapides = [];

        this.triActuel = {
            colonne: null, // ID de la colonne (ex: 'pokemon_id', 'pokemon_name')
            direction: 1   // 1 pour croissant, -1 pour décroissant
        };
    }

    //vu que pas de fichier generation.js on a decide de faire une methode statique 
    //dans la classe pour determiner la generation d'un pokemon a partir de son id
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

    //initialise les tableaux pour l'affichage et les données
    initialiser() {
        //recup tous les pokemons normaux et les trie par ID
        this.pokemonsNormaux = pokemons
            .filter(pokemon => pokemon.form == 'Normal')
            .sort((a, b) => a.pokemon_id - b.pokemon_id);

        //peuple les tableaux de types et mouvements pour chaque Pokémon
        this.pokemonsNormaux.forEach(pokemon => {
            const types = pokemon_types
                .find(p => p.pokemon_id == pokemon.pokemon_id && p.form == 'Normal');

            const mouvements = pokemon_moves
                .find(p => p.pokemon_id == pokemon.pokemon_id && p.form == 'Normal');
            
            if (types) {
                this.typesNormauxParId[pokemon.pokemon_id] = types.type;
            }
            if (mouvements) {
                this.mouvementsNormauxParId[pokemon.pokemon_id] = {
                    fast_moves: mouvements.fast_moves,
                    charged_moves: mouvements.charged_moves,
                    elite_fast_moves: mouvements.elite_fast_moves,
                    elite_charged_moves: mouvements.elite_charged_moves
                };
            }
        });

        //peuple les tableaux de types et attaques disponibles
        this.pokemonsNormaux.forEach(pokemon => {
            const types = this.typesNormauxParId[pokemon.pokemon_id];

            //ajout des types à la liste des types disponibles
            types.forEach(type => {
                if (!this.tousLesTypesDisponibles.includes(type)) {
                    this.tousLesTypesDisponibles.push(type);
                }
            });
            
            //ajout des attaques rapides à la liste des attaques disponibles
            const mouvements = this.mouvementsNormauxParId[pokemon.pokemon_id];
            if (mouvements.fast_moves) {
                mouvements.fast_moves.forEach(move => {
                    if (!this.toutesLesAttaquesRapides.includes(move)) {
                        this.toutesLesAttaquesRapides.push(move);
                    }
                });
            }
        });

        //initialise les filtres et l'affichage
        this.peuplerSelectType();
        this.peuplerSelectAttaque();
        this.appliquerFiltres();
        this.lierEvenementsPagination();
        this.lierEvenementsFermeture();
        this.lierEvenementsFiltre();
        this.allerAUnePage(1);

        this.lierEvenementsTri();
        this.allerAUnePage(1);
    }

    //methode pour lier les événements de tri sur les thead
    lierEvenementsTri() {
        const gestionnaire = this;
        const correspondanceColonnes = [
            'pokemon_id', 
            'pokemon_name', 
            'generation', 
            'types', 
            'base_stamina', 
            'base_attack', 
            'base_defense'
        ];

        //on lie l'événement de clic à tous les thead sauf le dernier (colonne image)
        $('#conteneurTableau thead th').not(':last-child').on('click', function() {
            const index = $(this).index();
            const critere = correspondanceColonnes[index];
            
            //effectue le tri selon le critère sélectionné
            gestionnaire.trier(critere);

            //retire le gras et la flèche de tous les headers
            const tousLesHeaders = $('#conteneurTableau thead th');
            tousLesHeaders.css('font-weight', 'normal').find('.fleche-tri').remove();
            
            //met en gras le header sélectionné
            $(this).css('font-weight', '900');
            
            //ajoute la flèche correspondante à la direction du tri
            const fleche = gestionnaire.triActuel.direction == 1 ? ' ▲' : ' ▼';
            
            //on ajoute la flèche à côté du texte du header
            $(this).append(`<span class="fleche-tri">${fleche}</span>`);
        });
    }

    //les tris
    trier(critere) {
        //reclique sur la même colonne, on tri s'inverse
        if (this.triActuel.colonne == critere) {
            this.triActuel.direction *= -1;
        } else {
            this.triActuel.colonne = critere;
            this.triActuel.direction = 1; //est croissant par défaut
        }

        //tri des pokemons filtrés selon le critère sélectionné
        this.pokemonsFiltres.sort((a, b) => {
            let valeurA, valeurB;

            //extraction des valeurs selon le critère
            if (critere == 'types') {
                valeurA = (this.typesNormauxParId[a.pokemon_id] || []).join('');
                valeurB = (this.typesNormauxParId[b.pokemon_id] || []).join('');
            } else if (critere == 'generation') {
                valeurA = PokemonPartie2.obtenirGeneration(a.pokemon_id);
                valeurB = PokemonPartie2.obtenirGeneration(b.pokemon_id);
            } else {
                valeurA = a[critere];
                valeurB = b[critere];
            }

            //comparaison des valeurs pour le tri
            if (valeurA < valeurB) return -1 * this.triActuel.direction;
            if (valeurA > valeurB) return 1 * this.triActuel.direction;

            //si egale, on trie par nom selon les consignes
            if (a.pokemon_name < b.pokemon_name) return -1;
            if (a.pokemon_name > b.pokemon_name) return 1;
            
            return 0;
        });

        this.pageActuelle = 1;//revient à la page 1 après le tri
        this.creerTableauPokemons();//maj l'affichage du tableau
        this.mettreAJourAffichagePagination();//maj l'affichage de pagination
    }

    //maj de numéro de page et état des boutons suiv/prec
    mettreAJourAffichagePagination() {
        //creer infosPages de page actuelle et du nombre total de pages
        const infosPages = `Page ${this.pageActuelle} / ${this.nombrePages}`;

        //maj du texte de avec infosPages
        $('#infoPage').text(infosPages);
        //pas de bouton prec si page = 1        
        $('#precedentHaut').prop('disabled', this.pageActuelle <= 1);
        //pas de bouton suiv si page = dernière
        $('#suivantHaut').prop('disabled', this.pageActuelle >= this.nombrePages);
    }

    //construit une ligne de tableau pour un pokemon donné
    creerLignePokemon(pokemon) {
        //recup les types du pokemon pour l'affichage
        const types = this.typesNormauxParId[pokemon.pokemon_id];
        //recup l'id du pokemon pour construire le chemin de l'image
        const idImage = String(pokemon.pokemon_id).padStart(3, '0');
        //construit le chemin de l'image avec idImage
        const sourceImage = `webp/images/${idImage}.webp`;
        
        //construit la ligne du tableau avec les données du pokemon et l'image
        const tr = $('<tr>')
            .data('pokemonId', pokemon.pokemon_id)
            .html(`
                <td>${pokemon.pokemon_id}</td>
                <td>${pokemon.pokemon_name}</td>
                <td>${PokemonPartie2.obtenirGeneration(pokemon.pokemon_id)}</td>
                <td>${PokemonPartie2.formaterTypes(types)}</td>
                <td>${pokemon.base_stamina}</td>
                <td>${pokemon.base_attack}</td>
                <td>${pokemon.base_defense}</td>
                <td><img src="${sourceImage}" alt="${pokemon.pokemon_name}" loading="lazy" class="pokemonThumbnail" data-pokemon-id="${pokemon.pokemon_id}" data-pokemon-name="${pokemon.pokemon_name}"></td>
            `);

        //si clique sur la ligne, affiche le popup du pokemon
        tr.on('click', () => this.afficherPopupDetails(pokemon));

        //si survole l'image, affiche un aperçu sur la miniature
        const img = tr.find('.pokemonThumbnail');
        img.on('mouseenter', (e) => this.afficherAperçuImage(e, sourceImage, pokemon.pokemon_name));
        img.on('mouseleave', () => this.masquerAperçuImage());

        return tr;
    }

    //peuple le tableau avec les pokemons filtrés et paginés pour la page actuelle
    creerTableauPokemons() {
        //recup le tbody du tableau
        const tbody = $('tbody');

        //vide le tbody
        tbody.empty();

        //si pas de pokemons après filtrage, affiche un message
        if (this.pokemonsFiltres.length == 0) {
            tbody.html('<tr><td colspan="8">Aucun Pokémon ne correspond aux filtres.</td></tr>');
            return;
        }

        //calcule indexDebut pour la page actuelle et récupère les pokemons à afficher
        const indexDebut = (this.pageActuelle - 1) * PokemonPartie2.MAX_POKEMON_PAR_PAGE;
        //affiche les 25 pokemons de la page actuelle à partir de indexDebut
        const pokemonsPage = this.pokemonsFiltres.slice(indexDebut, indexDebut + PokemonPartie2.MAX_POKEMON_PAR_PAGE);

        //pour chaque pokemon de la page, crée une ligne et l'ajoute au tbody
        pokemonsPage.forEach(pokemon => tbody.append(this.creerLignePokemon(pokemon)));
    }

    //maj de la page actuelle + maj du tableau et de la pagination
    allerAUnePage(numeroPage) {
        this.pageActuelle = Math.min(Math.max(numeroPage, 1), this.nombrePages);
        this.creerTableauPokemons();
        this.mettreAJourAffichagePagination();
    }

    //lie les événements des boutons suiv/prec pour changer de page
    lierEvenementsPagination() {
        $('#precedentHaut').on('click', () => this.allerAUnePage(this.pageActuelle - 1));
        $('#suivantHaut').on('click', () => this.allerAUnePage(this.pageActuelle + 1));
    }

    //construit et affiche le popup de détails pour un pokemon donné
    afficherPopupDetails(pokemon) {
        //recup les types du pokemon
        const types = this.typesNormauxParId[pokemon.pokemon_id];
        //recup les mouvements du pokemon
        const mouvements = this.mouvementsNormauxParId[pokemon.pokemon_id];

        //cree le contenu pour les mouvements
        let contenuMouvements = '';
        
        //si le pokemon a des attaques rapides, ajoute une section pour les afficher
        if (mouvements.fast_moves && mouvements.fast_moves.length > 0) {
            //ajoute le contenu des attaques rapides avec des badges pour chaque attaque
            contenuMouvements += `
                <div class="detailSection">
                    <h3>Attaques rapides</h3>
                    <div class="listeMouvements">
                        ${mouvements.fast_moves.map(move => `<span class="badgeMouvement">${move}</span>`).join('')}
                    </div>
                </div>
            `;
        }
        
        //si le pokemon a des attaques chargées, ajoute une section pour les afficher
        if (mouvements.charged_moves && mouvements.charged_moves.length > 0) {
            //ajoute le contenu des attaques chargées avec des badges pour chaque attaque
            contenuMouvements += `
                <div class="detailSection">
                    <h3>Attaques chargées</h3>
                    <div class="listeMouvements">
                        ${mouvements.charged_moves.map(move => `<span class="badgeMouvement">${move}</span>`).join('')}
                    </div>
                </div>
            `;
        }

        //construit la popup avec les détails du pokemon, ses types, ses stats et ses mouvements
        const htmlPopup = `
            <h2>${pokemon.pokemon_name}</h2>
            <div class="detailSection">
                <div class="ligneDetail">
                    <strong>ID:</strong>
                    <span>${pokemon.pokemon_id}</span>
                </div>
                <div class="ligneDetail">
                    <strong>Génération:</strong>
                    <span>${PokemonPartie2.obtenirGeneration(pokemon.pokemon_id)}</span>
                </div>
                <div class="ligneDetail">
                    <strong>Types:</strong>
                    <span>${PokemonPartie2.formaterTypes(types)}</span>
                </div>
            </div>
            <div class="detailSection">
                <div class="ligneDetail">
                    <strong>Endurance:</strong>
                    <span>${pokemon.base_stamina}</span>
                </div>
                <div class="ligneDetail">
                    <strong>Attaque de base:</strong>
                    <span>${pokemon.base_attack}</span>
                </div>
                <div class="ligneDetail">
                    <strong>Défense de base:</strong>
                    <span>${pokemon.base_defense}</span>
                </div>
            </div>
            ${contenuMouvements}
        `;
        
        //affiche le contenu dans le popup
        $('#contenuPopup').html(htmlPopup);
        //affiche le popup
        $('#pokemonDetailsPopup').show();
    }

    //cache la popup
    masquerPopupDetails() {
        $('#pokemonDetailsPopup').hide();
    }

    //affiche l'aperçu d'image à côté de la miniature
    afficherAperçuImage(event, sourceImage, nomPokemon) {
        //recup le conteneur de l'aperçu
        const apercu = $('#popupApercuImage');
        //recup l'image de l'aperçu
        const imageApercu = $('#imageApercuImg');
        
        //si les éléments n'existent pas, on ne fait rien
        if (apercu.length == 0 || imageApercu.length == 0) {
            return;
        }

        //maj source et alt de l'image de l'aperçu
        imageApercu.attr('src', sourceImage).attr('alt', nomPokemon);
        
        //recup les coordonnées de la miniature pour positionner l'aperçu à côté
        const rect = event.target.getBoundingClientRect();
        //positionne l'apercu à côté de la miniature
        apercu
            .css('left', (rect.right - 300) + 'px')
            .css('top', (rect.top - 50) + 'px')
            .show();
    }

    //cache l'aperçu d'image
    masquerAperçuImage() {
        $('#popupApercuImage').hide();
    }

    //lie les événements pour fermer le popup de détails
    lierEvenementsFermeture() {
        //si clique sur le bouton de fermeture, masque le popup
        $('#fermerPopup').on('click', () => this.masquerPopupDetails());

        //si clique en dehors du contenu du popup, masque le popup
        $('#pokemonDetailsPopup').on('click', (e) => {
            if (e.target == e.currentTarget) {
                this.masquerPopupDetails();
            }
        });

        //si appuie sur la touche Echap et que le popup est visible, masque le popup
        $(document).on('keydown', (e) => {
            if (e.key == 'Escape' && $('#pokemonDetailsPopup').is(':visible')) {
                this.masquerPopupDetails();
            }
        });
    }

    //peuple le select des types avec les types disponibles
    peuplerSelectType() {
        const selectType = $('#filtreType');
        if (selectType.length == 0) return;
        
        const types = this.tousLesTypesDisponibles.slice().sort();
        
        types.forEach(type => {
            selectType.append($('<option>').val(type).text(type));
        });
    }

    //peuple le select des attaques rapides avec les attaques disponibles
    peuplerSelectAttaque() {
        const selectAttaque = $('#filtreAttaque');
        if (selectAttaque.length == 0) return;
        
        const attaques = this.toutesLesAttaquesRapides.slice().sort();
        
        attaques.forEach(attaque => {
            selectAttaque.append($('<option>').val(attaque).text(attaque));
        });
    }

    //applique les filtres sélectionnés et maj la liste des Pokémons affichés
    appliquerFiltres() {
        //filtre les pokemons normaux selon les critères
        this.pokemonsFiltres = this.pokemonsNormaux.filter(pokemon => {
            //recup les types pour appliquer les filtres
            const types = this.typesNormauxParId[pokemon.pokemon_id];
            //recup les mouvements pour appliquer les filtres
            const mouvements = this.mouvementsNormauxParId[pokemon.pokemon_id];
            //recup les attaques rapides pour appliquer les filtres
            const attaquesRapides = mouvements.fast_moves;
            
            //si le filtre de type est sélectionné et que le pokemon n'a pas ce type, on exclut le pokemon
            if (this.filtreTypeActuel !== '' && !types.includes(this.filtreTypeActuel)) {
                return false;
            }
            
            //si le filtre d'attaque rapide est sélectionné et que le pokemon n'a pas cette attaque rapide, on exclut le pokemon
            if (this.filtreAttaqueActuel !== '' && !attaquesRapides.includes(this.filtreAttaqueActuel)) {
                return false;
            }
            
            //si le filtre de nom est rempli et que le nom du pokemon ne contient pas le texte recherché, on exclut le pokemon
            if (this.filtreNomActuel !== '') {
                //normalise le nom du pokemon
                const nomNormalise = PokemonPartie2.normaliserTexte(pokemon.pokemon_name);
                //normalise le texte de recherche
                const rechercheNormalisee = PokemonPartie2.normaliserTexte(this.filtreNomActuel);
                //si le nom normalisé du pokemon ne contient pas le texte de recherche normalisé, on exclut le pokemon
                if (!nomNormalise.includes(rechercheNormalisee)) {
                    return false;
                }
            }
            
            return true;
        });
        
        //fix le numéro de page à 1
        this.pageActuelle = 1;
        //calcule le nombre de pages en fonction du nombre de pokemons après filtrage
        this.nombrePages = Math.max(1, Math.ceil(this.pokemonsFiltres.length / PokemonPartie2.MAX_POKEMON_PAR_PAGE));
        
        //maj l'affichage
        this.creerTableauPokemons();
        this.mettreAJourAffichagePagination();
    }

    //lie les événements de changement sur les filtres pour appliquer les filtres en temps réel
    lierEvenementsFiltre() {
        //quand le filtre de type change, on met à jour le filtre actuel et on applique les filtres
        $('#filtreType').on('change', (e) => {
            this.filtreTypeActuel = $(e.target).val();
            this.appliquerFiltres();
        });
        
        //quand le filtre d'attaque rapide change, on met à jour le filtre actuel et on applique les filtres
        $('#filtreAttaque').on('change', (e) => {
            this.filtreAttaqueActuel = $(e.target).val();
            this.appliquerFiltres();
        });
        
        //quand le filtre de nom change, on met à jour le filtre actuel et on applique les filtres
        $('#filtreNom').on('input', (e) => {
            this.filtreNomActuel = $(e.target).val();
            this.appliquerFiltres();
        });
    }
}

//quand le document est prêt, on crée une instance de PokemonPartie2 et on l'initialise pour afficher les données
$(document).ready(function() {
    const gestionnaire = new PokemonPartie2();
    gestionnaire.initialiser();
});