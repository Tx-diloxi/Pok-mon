import pokemon_moves from "./Info Pokémons/pokemon_moves.js";

import fast_moves from "./Info Pokémons/fast_moves.js";

import charged_moves from "./Info Pokémons/charged_moves.js";

class Attack {
    constructor(nom, idAttaque, type, puissance, duree) {
        this.nom = nom;
        this.idAttaque = idAttaque;
        this.type = type;
        this.puissance = puissance;
        this.duree = duree;
    }

    toString() {
        return this.nom + " : #" + this.idAttaque + ", " + this.type + ", " + this.puissance + ", " + this.duree + "ms";
    }
}


console.log(new Attack("Tackle", 221, "Normal", 5, 500).toString());