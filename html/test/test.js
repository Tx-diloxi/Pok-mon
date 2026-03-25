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
        if (lePokemon.nomAttaques.some(attaque => attaque.nom == attackName)) {
            pokemonsAvecAttaque.push(lePokemon);
        }
    }
    //affichage formaté
    console.log("Liste des " + pokemonsAvecAttaque.length + " Pokémons ayant l'attaque " + attackName + " :");
    pokemonsAvecAttaque.forEach(pokemon => {
        console.log(pokemon.toString());
    });
}

getPokemonsByAttack("Ember");