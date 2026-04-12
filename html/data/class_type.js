//console.table(type_effectiveness);
//console.log(type_effectiveness["Fire"]);

class Type {
    static all_types = {};

    constructor(nom) {
        this.nom = nom;
        this.efficacite = type_effectiveness[nom];
        
        Type.all_types[nom] = this;
    }

    toString() {
        let efficatiteCommun = [];
        let coeff = [];

        //on récupère tous les coefficients d'efficacité distincts
        for(let nomtype in this.efficacite) {
            if (!coeff.includes(this.efficacite[nomtype])) {
                coeff.push(this.efficacite[nomtype]);
            }
        }

        //on trie les coefficients par ordre décroissant
        coeff.sort(function(a, b){return b-a});

        //on associe à chaque coefficient les types correspondants
        for (let i = 0; i < coeff.length; i++) {
            let typeParCoeff = [];
            //on parcourt tous les types pour trouver ceux qui ont le coefficient d'efficacité actuel
            for (let nomtype in this.efficacite) {
                //on vérifie si le coefficient d'efficacité du type correspond au coefficient actuel
                if (this.efficacite[nomtype] == coeff[i]) {
                    //on ajoute le type à la liste des types correspondants à ce coefficient
                    typeParCoeff.push(nomtype);
                }
            }
            //on ajoute à la liste d'efficacité commune le coefficient et les types correspondants
            efficatiteCommun.push(coeff[i] + " = [" + typeParCoeff.join(", ") + "]");
        }
        return this.nom + " : " + efficatiteCommun.join(", ");
    }
}

//à partir de la source de données, crée des objets Type stockez dans all_types.
function fill_types() {
    for (let nomtype in type_effectiveness) {
        //cree un objet Type pour chaque type present dans les donnees
        new Type(nomtype);
    }
}
fill_types();

//test la fonction fill_types 
//console.table(Type.all_types);

//test la methode toString() avec un exemple de type
//console.log(new Type("Dark").toString());

