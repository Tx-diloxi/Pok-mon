//classe PokemonPartie2 pour la partie 2.
class PokemonPartie2 {
    //consigne fix 25 pokemons par page
    static MAX_POKEMON_PAR_PAGE = 25;

    constructor() {
        this.pageActuelle = 1; //demarre à la page 1
        this.nombrePages = 1; //par défaut 1 page, calculé 
        this.pokemonsNormaux = []; //tous les pokemons de forme normale
        this.pokemonsFiltres = []; //pokemons après application des filtres
        this.typesNormauxParId = {}; //liste des types de chaque pokemon par son id pour un accès rapide
        this.mouvementsNormauxParId = {}; //liste des mouvements de chaque pokemon par son id pour un accès rapide

        //filtres actuels
        this.filtreTypeActuel = '';
        this.filtreAttaqueActuel = '';
        this.filtreNomActuel = '';

        //select
        this.tousLesTypesDisponibles = []; //tableau de tous les types disponibles parmi les pokemons normaux pour les select
        this.toutesLesAttaquesRapides = []; //tableau de toutes les attaques rapides disponibles parmi les pokemons normaux pour les select

        //object pour stocker l'état actuel du tri (colonne et direction)
        this.triActuel = {
            colonne: null, // ID de la colonne (ex: 'idPokemon', 'nom')
            direction: 1   // 1 pour croissant, -1 pour décroissant
        };
    }

    //vu que pas de fichier generation.js on a decide de faire une methode 
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

    //formate les types pour l'affichage
    static formaterTypes(types) {
        return types.join(' / ');
    }

    //normalise texte en supprimant les accents et en le mettant en minuscules pour faciliter les comparaisons
    static normaliserTexte(texte) {
        return texte
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    }

    //initialise les tableaux pour l'affichage et les données
    initialiser() {
        //recup et remplit pokemonsNormaux avec tous les pokemons de la classe Pokemon (partie 1)
        this.pokemonsNormaux = Object.values(Pokemon.all_pokemons);

        //remplit pokemonsFiltres avec tous les pokemons au départ (avant application des filtres)
        this.pokemonsNormaux.forEach(pokemon => {
            //recup les types  avec getTypes() de la classe Pokemon (partie 1) 
            const types = pokemon.getTypes().map(type => type.nom);

            //recup les mouvements rapides et chargés du pokemon dans la classe Pokemon (partie 1)
            const mouvements = {
                fast_moves: Array.isArray(pokemon.nomAttaqueRapides) ? pokemon.nomAttaqueRapides : [],
                charged_moves: Array.isArray(pokemon.nomAttaqueChargees) ? pokemon.nomAttaqueChargees : []
            };

            //stocke typesNormauxParId dans type pour un accès rapide par id de pokemon
            this.typesNormauxParId[pokemon.idPokemon] = types;
            //stocke mouvementsNormauxParId dans mouvement pour un accès rapide par id de pokemon
            this.mouvementsNormauxParId[pokemon.idPokemon] = mouvements;

            //ajoute les types du pokemon à la liste de tous les types disponibles s'ils n'y sont pas déjà
            types.forEach(type => {
                if (!this.tousLesTypesDisponibles.includes(type)) {
                    this.tousLesTypesDisponibles.push(type);
                }
            });

            //ajoute les attaques rapides du pokemon à la liste de toutes les attaques rapides disponibles s'ils n'y sont pas déjà
            mouvements.fast_moves.forEach(move => {
                if (!this.toutesLesAttaquesRapides.includes(move)) {
                    this.toutesLesAttaquesRapides.push(move);
                }
            });
        });

        //peuple le select des types avec les types disponibles
        this.peuplerSelectType();
        //peuple le select des attaques rapides avec les attaques disponibles
        this.peuplerSelectAttaque();

        //lie tous les événements utilisateur
        this.lierEvenementsPagination();
        this.lierEvenementsFermeture();
        this.lierEvenementsFiltre();
        this.lierEvenementsTri();

        //applique les filtres initiaux et affiche la première page
        this.appliquerFiltres();
        this.allerAUnePage(1);
    }

    //methode pour lier les événements de tri sur les thead
    lierEvenementsTri() {
        const gestionnaire = this;
        const correspondanceColonnes = [
            'idPokemon', 
            'nom', 
            'generation', 
            'types', 
            'stamina', 
            'base_attaque', 
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
                valeurA = (this.typesNormauxParId[a.idPokemon] || []).join('');
                valeurB = (this.typesNormauxParId[b.idPokemon] || []).join('');
            } else if (critere == 'generation') {
                valeurA = PokemonPartie2.obtenirGeneration(a.idPokemon);
                valeurB = PokemonPartie2.obtenirGeneration(b.idPokemon);
            } else {
                valeurA = a[critere];
                valeurB = b[critere];
            }

            if (valeurA < valeurB) return -1 * this.triActuel.direction;
            if (valeurA > valeurB) return 1 * this.triActuel.direction;

            if (a.nom < b.nom) return -1;
            if (a.nom > b.nom) return 1;
            
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
        //recup les types associés au pokemon
        const types = this.typesNormauxParId[pokemon.idPokemon];
        //formate l'id du pokemon avec des zéros à gauche pour correspondre au format des images (ex: 001, 025, etc)
        const idImage = String(pokemon.idPokemon).padStart(3, '0');
        //construis le chemin vers l'image webp du pokemon
        const sourceImage = `webp/images/${idImage}.webp`;
        const tr = $('<tr>')
            .data('pokemonId', pokemon.idPokemon)
            .html(`
                <td>${pokemon.idPokemon}</td>
                <td>${pokemon.nom}</td>
                <td>${PokemonPartie2.obtenirGeneration(pokemon.idPokemon)}</td>
                <td>${PokemonPartie2.formaterTypes(types)}</td>
                <td>${pokemon.stamina}</td>
                <td>${pokemon.base_attaque}</td>
                <td>${pokemon.base_defense}</td>
                <td><img src="${sourceImage}" alt="${pokemon.nom}" loading="lazy" class="pokemonThumbnail" data-pokemon-id="${pokemon.idPokemon}" data-pokemon-name="${pokemon.nom}"></td>
            `);

        //si clique sur la ligne, affiche le popup du pokemon
        tr.on('click', () => this.afficherPopupDetails(pokemon));

        //si survole l'image, affiche un aperçu sur la miniature
        const img = tr.find('.pokemonThumbnail');
        img.on('mouseenter', (e) => this.afficherAperçuImage(e, sourceImage, pokemon.nom));
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

        //calcule indexDebut pour la page actuelle et recup les pokemons à afficher
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
        //quand clique sur précédent, décrémente le numéro de page
        $('#precedentHaut').on('click', () => this.allerAUnePage(this.pageActuelle - 1));
        //quand clique sur suivant, incrémente le numéro de page
        $('#suivantHaut').on('click', () => this.allerAUnePage(this.pageActuelle + 1));
    }

    //construit et affiche le popup de détails pour un pokemon donné
    afficherPopupDetails(pokemon) {
        //recup les types du pokemon depuis la classe Pokemon (partie 1)
        const types = pokemon.getTypes().map(type => type.nom);
        //structure les mouvements rapides et chargés du pokemon
        const mouvements = {
            fast_moves: Array.isArray(pokemon.nomAttaqueRapides) ? pokemon.nomAttaqueRapides : [],
            charged_moves: Array.isArray(pokemon.nomAttaqueChargees) ? pokemon.nomAttaqueChargees : []
        };

        //initialise la chaîne de caractères pour les mouvements
        let contenuMouvements = '';
        
        //si le pokemon a des attaques rapides, on les ajoute au contenu
        if (mouvements.fast_moves.length > 0) {
            contenuMouvements += `
                <div class="detailSection">
                    <h3>Attaques rapides</h3>
                    <div class="listeMouvements">
                        ${mouvements.fast_moves.map(move => `<span class="badgeMouvement">${move}</span>`).join('')}
                    </div>
                </div>
            `;
        }
        
        //si le pokemon a des attaques chargées, on les ajoute au contenu
        if (mouvements.charged_moves.length > 0) {
            contenuMouvements += `
                <div class="detailSection">
                    <h3>Attaques chargées</h3>
                    <div class="listeMouvements">
                        ${mouvements.charged_moves.map(move => `<span class="badgeMouvement">${move}</span>`).join('')}
                    </div>
                </div>
            `;
        }

        //construit l'HTML de la popup avec toutes les informations du pokemon et ses mouvements
        const htmlPopup = `
            <h2>${pokemon.nom}</h2>
            <div class="detailSection">
                <div class="ligneDetail">
                    <strong>ID:</strong>
                    <span>${pokemon.idPokemon}</span>
                </div>
                <div class="ligneDetail">
                    <strong>Génération:</strong>
                    <span>${PokemonPartie2.obtenirGeneration(pokemon.idPokemon)}</span>
                </div>
                <div class="ligneDetail">
                    <strong>Types:</strong>
                    <span>${PokemonPartie2.formaterTypes(types)}</span>
                </div>
            </div>
            <div class="detailSection">
                <div class="ligneDetail">
                    <strong>Endurance:</strong>
                    <span>${pokemon.stamina}</span>
                </div>
                <div class="ligneDetail">
                    <strong>Attaque de base:</strong>
                    <span>${pokemon.base_attaque}</span>
                </div>
                <div class="ligneDetail">
                    <strong>Défense de base:</strong>
                    <span>${pokemon.base_defense}</span>
                </div>
            </div>
            ${contenuMouvements}
        `;
        
        //remplis le contenu du popup avec le HTML généré contenant tous les détails
        $('#contenuPopup').html(htmlPopup);
        //rend le popup visible pour afficher les détails au utilisateur
        $('#pokemonDetailsPopup').show();
    }

    //cache le popup de détails en le masquant
    masquerPopupDetails() {
        //masque le popup
        $('#pokemonDetailsPopup').hide();
    }

    //affiche l'aperçu d'image à côté de la miniature lors du survol
    afficherAperçuImage(event, sourceImage, nomPokemon) {
        //recup le conteneur de l'aperçu
        const apercu = $('#popupApercuImage');
        //recup l'image de l'aperçu
        const imageApercu = $('#imageApercuImg');
        
        //si les éléments n'existent pas, on ne fait rien
        if (apercu.length == 0 || imageApercu.length == 0) {
            return;
        }

        //maj source et alt de l'image de l'aperçu avec l'image du pokemon
        imageApercu.attr('src', sourceImage).attr('alt', nomPokemon);
        
        //recup les coordonnées de la miniature pour positionner l'aperçu à côté
        const rect = event.target.getBoundingClientRect();
        //positionne l'apercu à côté de la miniature en décalant de 300px à droite et 50px vers le haut
        apercu
            .css('left', (rect.right - 300) + 'px')
            .css('top', (rect.top - 50) + 'px')
            .show();
    }

    //cache l'aperçu d'image en le masquant
    masquerAperçuImage() {
        //masque l'aperçu d'image
        $('#popupApercuImage').hide();
    }

    //lie les événements pour fermer le popup de détails
    lierEvenementsFermeture() {
        //si clique sur le bouton de fermeture, masque le popup
        $('#fermerPopup').on('click', () => this.masquerPopupDetails());

        //si clique en dehors du contenu du popup (sur le fond semi-transparent), masque le popup
        $('#pokemonDetailsPopup').on('click', (e) => {
            //vérifie si on a cliqué sur l'overlay et non sur le contenu du popup
            if (e.target == e.currentTarget) {
                this.masquerPopupDetails();
            }
        });

        //si appuie sur la touche Echap et que le popup est visible, masque le popup
        $(document).on('keydown', (e) => {
            //vérifie que c'est bien la touche Echap et que le popup est actuellement visible
            if (e.key == 'Escape' && $('#pokemonDetailsPopup').is(':visible')) {
                this.masquerPopupDetails();
            }
        });
    }

    //peuple le select des types avec les types disponibles
    peuplerSelectType() {
        //recup l'élément select des types
        const selectType = $('#filtreType');
        //si l'élément n'existe pas, ne rien faire
        if (selectType.length == 0) return;
        
        //recup une copie des types disponibles et les trie alphabétiquement
        const types = this.tousLesTypesDisponibles.slice().sort();
        
        //pour chaque type, crée une option et l'ajoute au select
        types.forEach(type => {
            selectType.append($('<option>').val(type).text(type));
        });
    }

    //peuple le select des attaques rapides avec les attaques disponibles
    peuplerSelectAttaque() {
        //recup l'élément select des attaques
        const selectAttaque = $('#filtreAttaque');
        //si l'élément n'existe pas, ne rien faire
        if (selectAttaque.length == 0) return;
        
        //recup une copie des attaques disponibles et les trie alphabétiquement
        const attaques = this.toutesLesAttaquesRapides.slice().sort();
        
        //pour chaque attaque, crée une option et l'ajoute au select
        attaques.forEach(attaque => {
            selectAttaque.append($('<option>').val(attaque).text(attaque));
        });
    }

    //applique les filtres sélectionnés et maj la liste des Pokémons affichés
    appliquerFiltres() {
        //filtre les pokemons en fonction des critères actuels
        this.pokemonsFiltres = this.pokemonsNormaux.filter(pokemon => {
            //recup les types et mouvements du pokemon
            const types = this.typesNormauxParId[pokemon.idPokemon] || [];
            const mouvements = this.mouvementsNormauxParId[pokemon.idPokemon] || { fast_moves: [], charged_moves: [] };
            const attaquesRapides = mouvements.fast_moves || [];
            
            //si un filtre de type est sélectionné et que le pokemon ne le possède pas, on l'exclut
            if (this.filtreTypeActuel !== '' && !types.includes(this.filtreTypeActuel)) {
                return false;
            }
            
            //si un filtre d'attaque est sélectionnée et que le pokemon ne la possède pas, on l'exclut
            if (this.filtreAttaqueActuel !== '' && !attaquesRapides.includes(this.filtreAttaqueActuel)) {
                return false;
            }
            
            //si un filtre de nom est entré et que le pokemon ne le contient pas, on l'exclut
            if (this.filtreNomActuel !== '') {
                //normalise le nom du pokemon et la recherche pour une comparaison sans accents et en minuscules
                const nomNormalise = PokemonPartie2.normaliserTexte(pokemon.nom);
                const rechercheNormalisee = PokemonPartie2.normaliserTexte(this.filtreNomActuel);
                if (!nomNormalise.includes(rechercheNormalisee)) {
                    return false;
                }
            }
            
            //le pokemon passe tous les filtres
            return true;
        });
        
        //réinitialise le numéro de page à 1 puisqu'on vient de changer les filtres
        this.pageActuelle = 1;
        //calcule le nombre total de pages après l'application des filtres
        this.nombrePages = Math.max(1, Math.ceil(this.pokemonsFiltres.length / PokemonPartie2.MAX_POKEMON_PAR_PAGE));
        
        //met à jour les affichages du tableau et de la pagination
        this.creerTableauPokemons();
        this.mettreAJourAffichagePagination();
    }

    //lie les événements de changement sur les filtres pour appliquer les filtres en temps réel
    lierEvenementsFiltre() {
        //quand le filtre de type change, on met à jour le filtre actuel et on applique les filtres
        $('#filtreType').on('change', (e) => {
            //recup la valeur sélectionnée
            this.filtreTypeActuel = $(e.target).val();
            //applique les filtres avec la nouvelle valeur
            this.appliquerFiltres();
        });
        
        //quand le filtre d'attaque rapide change, on met à jour le filtre actuel et on applique les filtres
        $('#filtreAttaque').on('change', (e) => {
            //recup la valeur sélectionnée
            this.filtreAttaqueActuel = $(e.target).val();
            //applique les filtres avec la nouvelle valeur
            this.appliquerFiltres();
        });
        
        //quand le filtre de nom change (en temps réel), on met à jour le filtre actuel et on applique les filtres
        $('#filtreNom').on('input', (e) => {
            //recup la valeur entrée par l'utilisateur
            this.filtreNomActuel = $(e.target).val();
            //applique les filtres avec la nouvelle recherche
            this.appliquerFiltres();
        });
    }
}

//quand le document est prêt, on crée une instance de PokemonPartie2 et on l'initialise pour afficher les données
$(document).ready(function() {
    const gestionnaire = new PokemonPartie2();
    gestionnaire.initialiser();
});