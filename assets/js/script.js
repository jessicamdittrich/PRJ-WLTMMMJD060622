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
	var recipeURL = []
	
	// Initializing the search button
	$("#search-button").click(search)
	
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
				for (var i = 0; i < recipeData.length; i++) {
					ingredientData.push(recipeData[i].content.ingredientLines)
				}
				console.log(ingredientData)
				// stores a link to an image that represents the finsihed dish for each recipe
				imageList = []
				for (var i = 0; i < recipeData.length; i++) {
					imageList.push(recipeData[i].content.details.images[0].hostedLargeUrl)
				}
				console.log(imageList)
				recipeURL = []
				for (var i = 0; i < recipeData.length; i++) {
					recipeURL.push(recipeData[i].content.details.directionsUrl)
				}
				console.log(recipeURL)
			})
			.catch(err => console.error(err))
	}

	$("#get-recipes-button").click(populateRecipeList)

	function populateRecipeList() {
		for (var i = 0; i < recipeList.length; i++) {
			$("#recipes-list").append($("<li><a href=" + recipeURL[i] + " target='_blank'>" + recipeList[i] + "<img src = " + imageList[i] + "></a></li>"))
		}
	}

})