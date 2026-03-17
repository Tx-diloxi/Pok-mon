import pokemon_moves from "./Info Pokémons/pokemon_moves.js";

import fast_moves from "./Info Pokémons/fast_moves.js";

import charged_moves from "./Info Pokémons/charged_moves.js";

class Attack {
    constructor(nom, type, puissance, duree) {
        this.nom = nom;
        this.type = type;
        this.puissance = puissance;
        this.duree = duree;
    }
}