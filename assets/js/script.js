$("document").ready(function() {
	// API key
	const options = {
		method: 'GET',
		headers: {
			'X-RapidAPI-Host': 'yummly2.p.rapidapi.com',
			'X-RapidAPI-Key': '67eb59ab29msh40e600ec911fcb1p1f829fjsn39cb0c4650f1'
		}
	};
	
	var searchURL
	var ingredient
	var recipeData = []
	var recipeList = []
	var ingredientData = []
	var imageList = []
	
	// Initializing the search button
	$(".button").click(search)
	
	// Initializing search function that retrieves ingredient data and fetches the recipe API
	function search(event) {
		event.preventDefault()
		ingredient = $(".input").val()
		// simply replacing the space in the search with %20 to be placed into the URL
		ingredient = ingredient.replace(" ", "%2C%20")
		searchURL = "https://yummly2.p.rapidapi.com/feeds/search?start=0&maxResult=18&q=" + ingredient
		fetch(searchURL, options)
			.then(function(response) {
				return response.json()
			})
			.then(function(data) {
				// stores the WHOLE data of every recipe
				recipeData = data.feed
				console.log(recipeData)
				// stores ONLY the recipe names into an array
				recipeList = []
				for (var i = 0; i < recipeData.length; i++) {
					recipeList.push(recipeData[i].content.details.name)
				}
				console.log(recipeList)
				// stores the WHOLE data of every ingredient in each recipe
				ingredientData = []
				for (var j = 0; j < recipeData.length; j++) {
					ingredientData.push(recipeData[j].content.ingredientLines)
				}
				console.log(ingredientData)
				// stores a link to an image that represents the finsihed dish for each recipe
				imageList = []
				for (var k = 0; k < recipeData.length; k++) {
					imageList.push(recipeData[k].content.details.images[0].hostedLargeUrl)
				}
				console.log(imageList)
			})
			.catch(err => console.error(err))
	}
    
    // API key
    const icons = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            Authorization: 'Bearer X0vjEUN6KRlxbp2DoUkyHeM0VOmxY91rA6BbU5j3Xu6wDodwS0McmilLPBWDUcJ1'
        }
    };
      
    fetch('https://api.iconfinder.com/v4/iconsets?count=10', icons)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));
})

