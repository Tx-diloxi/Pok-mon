import Type from "./class_type.js";
import Attack from "./class_attack.js";

import pokemon_moves from "./Info Pokémons/pokemon_moves.js";
import pokemons from "./Info Pokémons/pokemons.js";

import pokemon_types from "./Info Pokémons/pokemon_types.js";

class Pokemon {
    static all_pokemons = {};

    constructor(nom) {

        let lesInfosDuPokemon = pokemons.find(p => p.pokemon_name == nom);
        let lesTypesDuPokemon = pokemon_types.find(p => p.pokemon_name == nom);
        let lesAttauquesDuPokemon = pokemon_moves.find(p => p.pokemon_name == nom);
        
        
        this.idPokemon = lesInfosDuPokemon.pokemon_id;
        this.nom = nom;
        this.stamina = lesInfosDuPokemon.base_stamina;
        this.base_attaque = lesInfosDuPokemon.base_attack;
        this.base_defense = lesInfosDuPokemon.base_defense;
        
        this.nomTypes = lesTypesDuPokemon.type.map(type => Type.all_types[type]);

        this.nomAttaqueRapides = lesAttauquesDuPokemon.fast_moves;
        this.nomAttaqueChargees = lesAttauquesDuPokemon.charged_moves;

        Pokemon.all_pokemons[this.idPokemon] = this;
    }

    toString() {
        return this.nom + " : #" + this.idPokemon + ", ["+ this.nomTypes.map(type => type.nom).join(", ") + "] , [STA: " + this.stamina + ", ATK: " + this.base_attaque + ", DEF: " + this.base_defense + "], Rapides = [" + this.nomAttaqueRapides.join(", ") + "], Chargées = [" + this.nomAttaqueChargees.join(", ") + "]";
    }

    getTypes() {
        return this.nomTypes;
    }

    getAttacks() {
        let attaques = this.nomAttaqueRapides.concat(this.nomAttaqueChargees);

        for (let i = 0; i < attaques.length; i++) {
            let nomAttaque = attaques[i];
            for (let attaque in Attack.all_attacks) {
                if (Attack.all_attacks[attaque].nom === nomAttaque) {
                    attaques[i] = Attack.all_attacks[attaque];
                }
            }
        }

        return attaques;
    }
}
//à partir de la source de données, crée des objets Pokemon que vous stockez dans all_pokemons.
function fill_pokemons() {
    //on parcourt la liste des pokémons pour créer des Pokemon et les stocker dans all_pokemons
    for (let i = 0; i < pokemons.length; i++) {
        new Pokemon(pokemons[i].pokemon_name);
    }   
}
fill_pokemons();

//console.table(Pokemon.all_pokemons);


// console.table(new Pokemon("Bulbasaur").toString());

// console.table(new Pokemon("Bulbasaur").getTypes());

// console.table(new Pokemon("Bulbasaur").getAttacks());