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
	var ingredientsChosen = []
	var recipeURL = []
	
	$("#add-button").click(add)
	// Initializing a function that takes the user inputs and add them to an array of ingredients to be searched
	function add(event) {
		event.preventDefault()
		ingredient = $(".input").val()
		// simply replacing the space in the search with %20 to be placed into the URL
		ingredient = ingredient.replace(" ", "%2C%20")
		ingredientsChosen.push(ingredient);
		console.log(ingredientsChosen)
		ingredientList();
	}
	
	// Initializing the search button
	$("#search-button").click(search)

	// Initializing search function that retrieves ingredient data and fetches the recipe API
	function search(event) {
		event.preventDefault()
		searchURL = "https://yummly2.p.rapidapi.com/feeds/search?start=0&maxResult=18&q=" + ingredientsChosen
		console.log(searchURL)
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
				// stores a link to an image that represents the finished dish for each recipe
				imageList = []
				for (var i = 0; i < recipeData.length; i++) {
					imageList.push(recipeData[i].content.details.images[0].hostedLargeUrl)
				}
				console.log(imageList)
				recipeURL = []
				for (var i = 0; i < recipeData.length; i++) {
					recipeURL.push(recipeData[i].content.details.directionsUrl)
				}
			})
			.then(populateRecipeList)
			.catch(err => console.error(err))
	}

	function ingredientList () {
		var ingredientsUl = document.getElementById('ingredients-list');
		var ingredientLi = document.createElement('li');
		var removeButton = document.createElement('button');
		removeButton.textContent = 'x';

		for (var i = 0; i < ingredientsChosen.length; i++) {
			console.log(ingredientsChosen[i]);
			ingredientLi.innerHTML = ingredientsChosen[i];
			ingredientsUl.appendChild(ingredientLi);
			ingredientLi.appendChild(removeButton);
		}
	};

	function populateRecipeList() {
		for (var i = 0; i < recipeList.length; i++) {
			$("#recipes-list").append($("<a href=" + recipeURL[i] + " target='_blank'><li><button class = \"fav-button\">❤</button><p>" + recipeList[i] + "</p><img src = " + imageList[i] + "></li></a>"))
		}
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


}); //CODE ABOVE THIS LINE