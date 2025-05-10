import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3000;
const API_URL = "https://pokeapi.co/api/v2";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

//Get the home page
app.get("/", async(req,res)=>{
    res.render("index.ejs");
});

//Get the search page
app.get("/search", (req,res)=>{
    res.render("search.ejs");
});

//Display the searched pokemon
app.post("/search", async(req,res)=>{
    const pokemonSearch = req.body.pokemon.toLowerCase();
    try{
        const result = await axios.get(`${API_URL}/pokemon/${pokemonSearch}`);
        const data = result.data;
        const name = data.forms[0].name.charAt(0).toUpperCase() + data.forms[0].name.slice(1);
        const type = data.types.map(function(value){
            return value.type.name;
        });
        const ability = data.abilities.map(function(value){
            return{
                ability: value.ability.name,
                hidden: value.is_hidden,
            };
        });
        const height = parseFloat(data.height)/10 + " m";
        const weight = parseFloat(data.weight)/10 + " kg";
        const moves = data.moves.map(function(value){
            return {
                moveName: value.move.name,
                level: value.version_group_details[0].level_learned_at,
                method: value.version_group_details[0].move_learn_method.name,
            };
        }) ;

        moves.sort((a,b)=>{ return a.level - b.level});

        const level_up_moves = moves.filter(function(value){
            return value.method == "level-up";
        })

        const tutor_moves = moves.filter((value)=>{ return value.method=="tutor";});
        const machine_moves = moves.filter((value)=>{return value.method=="machine"});

        let totalStats=0;
        const stats = data.stats.map(function(value){
            totalStats = totalStats + parseInt(value.base_stat);
            return {
                statName: value.stat.name,
                statValue: parseInt(value.base_stat),
                statMultiply: parseInt(value.base_stat)/10,
            };
        });
        const pokemon = {
            name: name,
            type: type,
            ability: ability,
            height: height,
            weight: weight,
            level_up_moves: level_up_moves,
            tutor_moves: tutor_moves,
            machine_moves: machine_moves,
            stats: stats,
            total_stats: totalStats,
            sprite: data.sprites.other["official-artwork"].front_default,
        };
        res.render("pokemon.ejs",{pokemon: pokemon});
    }catch(error){
        res.status(404).render("error.ejs");
    }
});

//Get berries page
app.get("/berries",async(req,res)=>{
    let allBerries = [];
    try{
        let index = 126;
        for(let i=0;i<64;i++){
            const descriptionResult = await axios.get(`https://pokeapi.co/api/v2/item/${index++}/`);
            const descriData = descriptionResult.data;
            allBerries.push({
                name: descriData.name,
                description: descriData.effect_entries[0].short_effect,
                sprite: descriData.sprites.default,
            });
        }    
        res.render("berries.ejs",{berries:allBerries});
    }catch(error){
        res.status(404).render("error.ejs");
    }
});

//Get the random pokemon
app.get("/random",async(req,res)=>{
    const maxNumPokemon = 1025;
    const randomIndex = Math.floor(Math.random()*maxNumPokemon)+1;
    console.log(randomIndex);
    try{
        const result = await axios.get(API_URL + `/pokemon/${randomIndex}`);
        const data = result.data;
        const name = data.forms[0].name;
        const type = data.types.map(function(value){
            return value.type.name;
        });
        const ability = data.abilities.map(function(value){
            return{
                ability: value.ability.name,
                hidden: value.is_hidden,
            };
        });
        const height = parseFloat(data.height)/10 + " m";
        const weight = parseFloat(data.weight)/10 + " kg";
        const moves = data.moves.map(function(value){
            return {
                moveName: value.move.name,
                level: value.version_group_details[0].level_learned_at,
                method: value.version_group_details[0].move_learn_method.name,
            };
        }) ;

        moves.sort((a,b)=>{ return a.level - b.level});

        const level_up_moves = moves.filter(function(value){
            return value.method == "level-up";
        })

        const tutor_moves = moves.filter((value)=>{ return value.method=="tutor";});
        const machine_moves = moves.filter((value)=>{return value.method=="machine"});

        let totalStats=0;
        const stats = data.stats.map(function(value){
            totalStats = totalStats + parseInt(value.base_stat);
            return {
                statName: value.stat.name,
                statValue: value.base_stat,
            };
        });
        const pokemon = {
            name: name,
            type: type,
            ability: ability,
            height: height,
            weight: weight,
            level_up_moves: level_up_moves,
            tutor_moves: tutor_moves,
            machine_moves: machine_moves,
            stats: stats,
            total_stats: totalStats,
            sprite: data.sprites.other["official-artwork"].front_default,
        };
        //res.send(pokemon);
        res.render("pokemon.ejs",{pokemon:pokemon});
    }catch(error){
        res.status(404).render("error.ejs");
    }
});

app.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}`);
})