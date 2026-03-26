import Attack from "../data/class_attack.js";
import Pokemon from "../data/class_pokemon.js";
import Type from "../data/class_type.js";

//Q1. Fonction getPokemonsByType(typeName) affichant, dans la console, la liste des Pokémons pour un type donné (en argument).
function getPokemonsByType(typeName){

    let pokemonsDuType = [];
    for (let idPokemon in Pokemon.all_pokemons) {
        let lePokemon = Pokemon.all_pokemons[idPokemon];
        if (lePokemon.nomTypes.some(type => type.nom == typeName)) {
            pokemonsDuType.push(lePokemon);
        }
    }
    //affichage formaté
    console.log("Liste des " + pokemonsDuType.length + " Pokémons de type " + typeName + " :");
    pokemonsDuType.forEach(pokemon => {
        console.log(pokemon.toString());
    });
}
//getPokemonsByType("Fire");

//Q2. Fonction getPokemonsByAttack(attackName) affichant, dans la console, la liste des Pokémons pour une attaque donnée (en argument).
function getPokemonsByAttack(attackName){

    let pokemonsAvecAttaque = [];
    for (let idPokemon in Pokemon.all_pokemons) {
        let lePokemon = Pokemon.all_pokemons[idPokemon];
        let sesAttaques = lePokemon.getAttacks();
        if (sesAttaques.some(attaque => attaque.nom == attackName)) {
            pokemonsAvecAttaque.push(lePokemon);
        }
    }
    //affichage formaté
    console.log("Liste des " + pokemonsAvecAttaque.length + " Pokémons ayant l'attaque " + attackName + " :");
    pokemonsAvecAttaque.forEach(pokemon => {
        console.log(pokemon.toString());
    });
}

//getPokemonsByAttack("Wrap");

//Q3. Fonction getAttacksByType(typeName) affichant, dans la console, la liste des attaques pour un type donné (en argument).
function getAttacksByType(typeName){

    let attaquesDuType = [];
    for (let idAttaque in Attack.all_attacks) {
        let lAttaque = Attack.all_attacks[idAttaque];
        if (lAttaque.type == typeName) {
            attaquesDuType.push(lAttaque);
        }
    }
    //affichage formaté
    console.log("Liste des " + attaquesDuType.length + " attaques de type " + typeName + " :");
    attaquesDuType.forEach(attaque => {
        console.log(attaque.toString());
    });
}
//getAttacksByType("Fire");

//Q4. Fonction sortPokemonsByTypeThenName() affichant, dans la console, la liste des Pokémons triés par type puis par nom dans l’ordre alphabétique.
//Comme les Pokemons peuvent être de plusieurs types, vous devrez les comparer en triant, au préalable, les types de chacun par ordre alphabétique.
function sortPokemonsByTypeThenName(){
    //je recupère tous les pokémons dans un tableau
    let lesPokemons = [];    
    for (let idPokemon in Pokemon.all_pokemons) {
        lesPokemons.push(Pokemon.all_pokemons[idPokemon]);
    }

    //je trie les pokémons par type puis par nom
    lesPokemons.sort((pokemon1, pokemon2) => {
        //je trie les noms de types de chaque pokémon par ordre alphabétique
        let typesPokemon1 = pokemon1.nomTypes.map(type => type.nom).sort();
        let typesPokemon2 = pokemon2.nomTypes.map(type => type.nom).sort();
        //ex : ["c", "b"] -> ["b", "c"]

        //je compare les types des deux pokémons et retourne le plus long
        let maxLongeurTypes = typesPokemon1.length > typesPokemon2.length ? typesPokemon1.length : typesPokemon2.length;
        //je parcours le type le plus long et je compare les types des deux pokémons
        for (let i = 0; i < maxLongeurTypes; i++) {
            //si le pokemon1 est avant dans l'ordre alphabétique des types, je le retourne
            if (typesPokemon1[i] < typesPokemon2[i]){ 
                return -1;//-1 car pokemon1 est avant pokemon2 dans l'ordre alphabétique des types
            }
            //si le pokemon2 est avant dans l'ordre alphabétique des types, je le retourne
            if (typesPokemon1[i] > typesPokemon2[i]) {
                return 1;//1 car pokemon2 est avant pokemon1 dans l'ordre alphabétique des types
            }
        }

        //je compare mtn les noms
        if (pokemon1.nom < pokemon2.nom){
            return -1;//-1 car pokemon1 est avant pokemon2 dans l'ordre alphabétique des noms
        }
        if (pokemon1.nom > pokemon2.nom) {
            return 1;//1 car pokemon2 est avant pokemon1 dans l'ordre alphabétique des noms
        }
        return 0;
    });

    //affichage formaté
    console.log("Liste des " + lesPokemons.length + " Pokémons triés par type puis par nom :");
    lesPokemons.forEach(pokemon => {
        console.log(pokemon.toString());
    });

}

//sortPokemonsByTypeThenName();

//Q5. Méthode getWeakestEnemies(attackName) de la classe Pokemon, affichant, dans la console, la liste des Pokémons pour 
// lesquels l’attaque choisie est la plus efficace. Le nom de l’attaque est une chaîne de caractères.

//Pokemon.getWeakestEnemies("Wrap");

// Q6. Méthode getBestFastAttacksForEnemy(print, pokemonName) affichant, dans la console et uniquement si le paramètre print vaut true, la liste des attaques
// (toString()) et de leurs dégâts (Puissance x Efficacité x (Base Attack A / BaseDefense B)) contre un Pokémon donné. Le Pokemon A est l’objet sur lequel on appelle la
// méthode et le Pokemon B est celui dont le nom est passé en paramètre (i.e.pokemonName)

// let pikachu = new Pokemon("Pikachu");
// pikachu.getBestFastAttacksForEnemy(true, "Bulbasaur");

//Q7. Fonction fastFight(pokemonNameA, pokemonNameB) affichant, dans la console, le déroulement d’un combat entre 2 pokemons. 
// Ici vous devez utiliser console.table(). Chaque attaque est déterminée par getBestFastAttackForEnemy(false,pokemonName).

function fastFight(pokemonNameA, pokemonNameB) {
    //recup les Pokemons à partir de leurs noms
    const pokemonA = Object.values(Pokemon.all_pokemons).find(p => p.nom === pokemonNameA);
    const pokemonB = Object.values(Pokemon.all_pokemons).find(p => p.nom === pokemonNameB);

    //verif que les deux pokemons existent
    if (!pokemonA || !pokemonB) {
        console.error("Un des Pokémon n'existe pas.");
        return;
    }

    //copie des points de vie pour ne pas altérer les données originales
    let hpA = pokemonA.stamina;
    let hpB = pokemonB.stamina;

    let tour = 0;
    let historique = []; //tableau pour stocker le déroulement du combat

    console.log("Début du combat : " + pokemonA.nom + " (PV: " + hpA + ") vs " + pokemonB.nom + " (PV: " + hpB + ")\n");

    while (hpA > 0 && hpB > 0) {
        const attaquant = tour % 2 === 0 ? pokemonA : pokemonB;
        const defenseur = tour % 2 === 0 ? pokemonB : pokemonA;

        // Meilleure attaque rapide de l'attaquant contre le défenseur
        const bestAttack = attaquant.getBestFastAttacksForEnemy(false, defenseur.nom);

        if (!bestAttack) {
            console.error("Le Pokémon " + attaquant.nom + " n'a pas d'attaque rapide utilisable.");
            break;
        }

        // Récupération des dégâts bruts et arrondi à l'unité supérieure
        let degats = bestAttack.degats;
        degats = Math.ceil(degats);

        // Application des dégâts
        if (tour % 2 === 0) {
            hpB = Math.max(0, hpB - degats);
        } else {
            hpA = Math.max(0, hpA - degats);
        }

        // Enregistrement du tour
        historique.push({
            Tour: tour + 1,
            Attaquant: attaquant.nom,
            ATK: bestAttack.attaque.nom,
            Défenseur: defenseur.nom,
            DEF: ,
            "Type attaque": bestAttack.attaque.type,
            Puissance: bestAttack.attaque.puissance,
            Efficacité: bestAttack.efficacite.toFixed(3),
            Dégâts: degats,
            [`PV ${pokemonA.nom}`]: hpA,
            [`PV ${pokemonB.nom}`]: hpB
        });

        tour++;
    }

    // Affichage du tableau complet du combat
    console.table(historique);

    // Annonce du vainqueur
    if (hpA <= 0 && hpB <= 0) {
        console.log("Match nul ! Les deux Pokémon sont KO en même temps.");
    } else if (hpA <= 0) {
        console.log("Le Pokémon " + pokemonB.nom + " remporte le combat !");
    } else {
        console.log("Le Pokémon " + pokemonA.nom + " remporte le combat !");
    }
}

fastFight("Bulbasaur", "Charmander");