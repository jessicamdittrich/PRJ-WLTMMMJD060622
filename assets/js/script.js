const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Host': 'yummly2.p.rapidapi.com',
		'X-RapidAPI-Key': '67eb59ab29msh40e600ec911fcb1p1f829fjsn39cb0c4650f1'
	}
};

var searchURL = "https://yummly2.p.rapidapi.com/feeds/search?start=0&maxResult=18&q=" = ingredient
var ingredient = 

fetch(searchURL, options)
	.then(response => response.json())
	.then(response => console.log(response))
	.catch(err => console.error(err));

    // Ingredient list found in feed[i].content.ingredientLines[i].ingredient