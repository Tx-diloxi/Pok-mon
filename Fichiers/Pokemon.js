import Type from "./Type.js";
import Attack from "./Attack.js";

import pokemon_moves from "./Info Pokémons/pokemon_moves.js";
import pokemons from "./Info Pokémons/pokemons.js";

import pokemon_types from "./Info Pokémons/pokemon_types.js";

class Pokemon {
    static all_pokemons = {};

    constructor(nom) {
        this.nom = nom;
        const pokemonData = pokemons.find(p => p.pokemon_name === nom && p.form === "Normal") || pokemons.find(p => p.pokemon_name === nom);
        const pokemonTypeData = pokemon_types.find(p => p.pokemon_name === nom && p.form === "Normal") || pokemon_types.find(p => p.pokemon_name === nom);
        this.idPokemon = pokemonData.pokemon_id;
        this.base_attaque = pokemonData.base_attack;
        this.base_defense = pokemonData.base_defense;
        this.stamina = pokemonData.base_stamina;
        this.types = pokemonTypeData.type.map(type => Type.all_types[type]);
        
        const pokemonMovesData = pokemon_moves.find(p => p.pokemon_name === nom && p.form === "Normal") || pokemon_moves.find(p => p.pokemon_name === nom);
        this.attacks = (pokemonMovesData ? (pokemonMovesData.charged_moves.concat(pokemonMovesData.fast_moves)) : []).map(attack => new Attack(attack));
        
        Pokemon.all_pokemons[this.idPokemon] = this;
    }

    toString() {
        return this.nom + " : #" + this.idPokemon + ", " + this.base_attaque + ", " + this.base_defense + ", " + this.stamina;
    }
}

//console.table(Pokemon.all_pokemons);


console.log(new Pokemon("Bulbasaur").toString());