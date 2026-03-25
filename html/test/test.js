import Attack from "../data/class_attack.js";
import Pokemon from "../data/class_pokemon.js";
import Type from "../data/class_type.js";

//Q1. Fonction getPokemonsByType(typeName) affichant, dans la console, la liste des Pokémons pour un type donné (en argument).
function getPokemonsByType(typeName){

    //recherche insensible à la casse
    const typeNameLower = typeName.toLowerCase();
    let pokemonsDuType = [];
    for (let idPokemon in Pokemon.all_pokemons) {
        let pokemon = Pokemon.all_pokemons[idPokemon];
        if (pokemon.nomTypes.some(type => type.nom.toLowerCase() == typeNameLower)) {
            pokemonsDuType.push(pokemon);
        }
    }
    //affichage formaté
    console.log(`Liste des ${pokemonsDuType.length} Pokémons :`);
    pokemonsDuType.forEach(pokemon => {
        console.log(`- ${pokemon.toString()}`);
    });
}

getPokemonsByType("Fire");